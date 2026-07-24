// Supabase-like adapter bridging directly to Firebase Firestore
import { db, auth } from "./firebase";
import { 
  collection, doc, query, where, orderBy, limit as firestoreLimit, getDocs, getDoc, setDoc, updateDoc, deleteDoc, writeBatch, onSnapshot 
} from "firebase/firestore";
import { 
  signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as fbSignOut, onAuthStateChanged, updateProfile 
} from "firebase/auth";

const tableListeners: Array<{ tableName: string; callback: (payload: any) => void; unsubscribe?: () => void }> = [];
const authListeners: Array<(event: string, session: any) => void> = [];

// Listen to firebase auth state
onAuthStateChanged(auth, (user) => {
  const session = user ? { user: { id: user.uid, email: user.email, user_metadata: { full_name: user.displayName } }, access_token: "firebase_token" } : null;
  authListeners.forEach(listener => {
    listener(user ? "SIGNED_IN" : "SIGNED_OUT", session);
  });
});

class SupabaseQueryBuilder {
  private tableName: string;
  private operation: "select" | "insert" | "update" | "delete" = "select";
  private insertData: any = null;
  private updateData: any = null;
  private filters: Array<{ field: string; op: string; val: any }> = [];
  private limitCount: number | null = null;
  private orderField: string | null = null;
  private orderAscending: boolean = true;
  private isSingle: boolean = false;
  private isMaybeSingle: boolean = false;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(fields: string = "*", options?: { count?: string; head?: boolean }) {
    if (this.operation === "insert" || this.operation === "update" || this.operation === "delete") {
      return this;
    }
    this.operation = "select";
    return this;
  }

  insert(data: any | any[]) {
    this.operation = "insert";
    this.insertData = data;
    return this;
  }

  update(data: any) {
    this.operation = "update";
    this.updateData = data;
    return this;
  }

  delete() {
    this.operation = "delete";
    return this;
  }

  eq(field: string, val: any) { this.filters.push({ field, op: "==", val }); return this; }
  neq(field: string, val: any) { this.filters.push({ field, op: "!=", val }); return this; }
  in(field: string, list: any[]) { this.filters.push({ field, op: "in", val: list }); return this; }
  like(field: string, pattern: string) { this.filters.push({ field, op: "like", val: pattern }); return this; }
  is(field: string, val: any) { this.filters.push({ field, op: "==", val }); return this; }
  
  order(field: string, { ascending = true } = {}) {
    this.orderField = field;
    this.orderAscending = ascending;
    return this;
  }

  limit(count: number) { this.limitCount = count; return this; }
  single() { this.isSingle = true; return this; }
  maybeSingle() { this.isMaybeSingle = true; return this; }

  async then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    try {
      const res = await this.execute();
      if (onfulfilled) return onfulfilled(res);
      return res;
    } catch (err) {
      if (onrejected) return onrejected(err);
      throw err;
    }
  }

  private async execute() {
    try {
      if (this.operation === "select") {
        let q: any = collection(db, this.tableName);
        
        for (const f of this.filters) {
          if (f.op === "==") q = query(q, where(f.field, "==", f.val));
          else if (f.op === "!=") q = query(q, where(f.field, "!=", f.val));
          else if (f.op === "in") {
            if (f.val && f.val.length > 0) q = query(q, where(f.field, "in", f.val));
          }
        }
        
        if (this.orderField) {
          q = query(q, orderBy(this.orderField, this.orderAscending ? 'asc' : 'desc'));
        }
        if (this.limitCount) {
          q = query(q, firestoreLimit(this.limitCount));
        }

        const snapshot = await getDocs(q);
        const resultData: any[] = [];
        snapshot.forEach(doc => {
          resultData.push({ id: doc.id, ...(doc.data() as any) });
        });

        if (this.isSingle) {
          if (resultData.length === 0) {
            return { data: null, error: { code: 'PGRST116', message: "No rows found" } };
          }
          return { data: resultData[0], error: null };
        }
        if (this.isMaybeSingle) {
          return { data: resultData.length > 0 ? resultData[0] : null, error: null };
        }
        return { data: resultData, error: null, count: resultData.length };
      } 
      else if (this.operation === "insert") {
        const isArray = Array.isArray(this.insertData);
        const dataArr = isArray ? this.insertData : [this.insertData];
        const batch = writeBatch(db);
        const resultData: any[] = [];
        
        for (const item of dataArr) {
          let docRef;
          if (item.id) {
            docRef = doc(db, this.tableName, item.id);
          } else {
            docRef = doc(collection(db, this.tableName));
            item.id = docRef.id;
          }
          batch.set(docRef, item);
          resultData.push(item);
        }
        await batch.commit();

        const ret = isArray ? resultData : resultData[0];
        tableListeners.forEach(l => {
          if (l.tableName === this.tableName) {
            isArray ? resultData.forEach(d => l.callback({ eventType: "INSERT", new: d })) : l.callback({ eventType: "INSERT", new: ret });
          }
        });

        if (this.isSingle || this.isMaybeSingle) return { data: resultData[0], error: null };
        return { data: resultData, error: null };
      }
      else if (this.operation === "update") {
         // Requires an ID filter to update
         const idFilter = this.filters.find(f => f.field === "id");
         if (!idFilter) throw new Error("Update requires an eq('id', val) filter");
         
         const docRef = doc(db, this.tableName, idFilter.val);
         await updateDoc(docRef, this.updateData);
         
         tableListeners.forEach(l => {
           if (l.tableName === this.tableName) l.callback({ eventType: "UPDATE", new: { id: idFilter.val, ...this.updateData } });
         });
         
         return { data: null, error: null };
      }
      else if (this.operation === "delete") {
         const idFilter = this.filters.find(f => f.field === "id");
         if (idFilter) {
           const docRef = doc(db, this.tableName, idFilter.val);
           await deleteDoc(docRef);
           tableListeners.forEach(l => {
             if (l.tableName === this.tableName) l.callback({ eventType: "DELETE", old: { id: idFilter.val } });
           });
         }
         return { data: null, error: null };
      }
      return { data: null, error: { message: "Unknown operation" } };
    } catch (err: any) {
      console.error(`[Firebase Bridge failure on table ${this.tableName}]:`, err);
      return { data: null, error: { message: err.message || String(err) } };
    }
  }
}

class SupabaseChannel {
  private tableName: string;
  private callback: (payload: any) => void = () => {};
  private unsubscribeFn?: () => void;

  constructor(channelName: string) {
    this.tableName = channelName.replace("_changes", "");
  }

  on(type: string, filter: any, callback: (payload: any) => void) {
    if (filter && filter.table) {
      this.tableName = filter.table;
    }
    this.callback = callback;
    return this;
  }

  subscribe() {
    const q = collection(db, this.tableName);
    this.unsubscribeFn = onSnapshot(q, (snapshot) => {
      // Very basic simulation of postgres_changes
      snapshot.docChanges().forEach((change) => {
         const payload = {
            eventType: change.type === "added" ? "INSERT" : change.type === "modified" ? "UPDATE" : "DELETE",
            new: change.type !== "removed" ? { id: change.doc.id, ...change.doc.data() } : undefined,
            old: change.type === "removed" ? { id: change.doc.id, ...change.doc.data() } : undefined
         };
         this.callback(payload);
      });
    });
    tableListeners.push({ tableName: this.tableName, callback: this.callback, unsubscribe: this.unsubscribeFn });
    return this;
  }

  unsubscribe() {
    if (this.unsubscribeFn) this.unsubscribeFn();
    const idx = tableListeners.findIndex(l => l.tableName === this.tableName && l.callback === this.callback);
    if (idx !== -1) {
      tableListeners.splice(idx, 1);
    }
  }
}

// Global Supabase Gateway mapped to Firebase
export const supabase = {
  from(tableName: string) {
    return new SupabaseQueryBuilder(tableName);
  },

  channel(channelName: string) {
    return new SupabaseChannel(channelName);
  },

  removeChannel(channel: any) {
    if (channel && typeof channel.unsubscribe === "function") {
      channel.unsubscribe();
    }
  },

  auth: {
    async getSession() {
      const u = auth.currentUser;
      if (!u) return { data: { session: null }, error: null };
      return {
        data: {
          session: {
             user: { id: u.uid, email: u.email, user_metadata: { full_name: u.displayName } },
             access_token: "firebase_token"
          }
        },
        error: null
      };
    },

    async getUser() {
      const u = auth.currentUser;
      if (!u) return { data: { user: null }, error: null };
      return {
        data: { user: { id: u.uid, email: u.email, user_metadata: { full_name: u.displayName } } },
        error: null
      };
    },

    onAuthStateChange(callback: (event: string, session: any) => void) {
      authListeners.push(callback);
      // Run once immediately if currentUser exists
      if (auth.currentUser) {
         const u = auth.currentUser;
         callback("SIGNED_IN", { user: { id: u.uid, email: u.email, user_metadata: { full_name: u.displayName } }, access_token: "firebase_token" });
      }
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              const idx = authListeners.indexOf(callback);
              if (idx !== -1) authListeners.splice(idx, 1);
            }
          }
        }
      };
    },

    async signUp({ email, password, options }: any) {
      try {
        const username = options?.data?.full_name || email.split("@")[0];
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: username });
        // Setup initial user profile in unified profiles table
        await setDoc(doc(db, "profiles", userCredential.user.uid), {
           id: userCredential.user.uid,
           email: email,
           username: username,
           role: 'user',
           coins: 100,
           createdAt: new Date().toISOString()
        });
        const session = { user: { id: userCredential.user.uid, email, user_metadata: { full_name: username } }, access_token: "firebase_token" };
        return { data: { user: session.user, session }, error: null };
      } catch (e: any) {
        return { data: null, error: { message: e.message || String(e) } };
      }
    },

    async signInWithPassword({ email, password }: any) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const session = { user: { id: userCredential.user.uid, email, user_metadata: { full_name: userCredential.user.displayName } }, access_token: "firebase_token" };
        return { data: { user: session.user, session }, error: null };
      } catch (e: any) {
        return { data: null, error: { message: "فشل تسجيل الدخول: " + e.message } };
      }
    },

    async signInWithOAuth({ provider }: any) {
      try {
        if (provider !== "google") {
          throw new Error("Only google is currently implemented for OAuth");
        }
        const googleProvider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup(auth, googleProvider);
        const user = userCredential.user;
        
        // Ensure user is in firestore profiles table
        const userDoc = await getDoc(doc(db, "profiles", user.uid));
        if (!userDoc.exists()) {
           await setDoc(doc(db, "profiles", user.uid), {
             id: user.uid,
             email: user.email,
             username: user.displayName || user.email?.split("@")[0],
             role: 'user',
             coins: 100,
             createdAt: new Date().toISOString(),
             avatarUrl: user.photoURL
           });
        }
        
        const session = { user: { id: user.uid, email: user.email, user_metadata: { full_name: user.displayName } }, access_token: "firebase_token" };
        return { data: { user: session.user, session }, error: null };
      } catch (e: any) {
        return { data: null, error: { message: e.message || String(e) } };
      }
    },

    async signOut() {
      await fbSignOut(auth);
      return { error: null };
    }
  }
};

