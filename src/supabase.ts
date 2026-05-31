// Advanced client-side Supabase Adapter bridging directly to our server-side SQLite engine.
// All reads, writes, and profile checks are routed to SQLite on port 3000.

const tableListeners: Array<{ tableName: string; callback: (payload: any) => void }> = [];
const authListeners: Array<(event: string, session: any) => void> = [];

// Local session helpers
function getSessionUser(): any | null {
  const sessionStr = localStorage.getItem("session_user");
  if (!sessionStr) return null;
  try {
    return JSON.parse(sessionStr);
  } catch (e) {
    return null;
  }
}

function setSessionUser(user: any | null) {
  if (user) {
    localStorage.setItem("session_user", JSON.stringify(user));
  } else {
    localStorage.removeItem("session_user");
  }
}

// Chained Query Builder communicating with SQLite Express API on backend
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

  eq(field: string, val: any) {
    this.filters.push({ field, op: "==", val });
    return this;
  }

  neq(field: string, val: any) {
    this.filters.push({ field, op: "!=", val });
    return this;
  }

  in(field: string, list: any[]) {
    this.filters.push({ field, op: "in", val: list });
    return this;
  }

  like(field: string, pattern: string) {
    this.filters.push({ field, op: "like", val: pattern });
    return this;
  }

  is(field: string, val: any) {
    this.filters.push({ field, op: "is", val });
    return this;
  }

  order(field: string, { ascending = true } = {}) {
    this.orderField = field;
    this.orderAscending = ascending;
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  maybeSingle() {
    this.isMaybeSingle = true;
    return this;
  }

  // Thenable execution for seamless await/then pattern support
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
      const response = await fetch("/api/db", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          tableName: this.tableName,
          operation: this.operation,
          filters: this.filters,
          orderField: this.orderField,
          orderAscending: this.orderAscending,
          limitCount: this.limitCount,
          isSingle: this.isSingle,
          isMaybeSingle: this.isMaybeSingle,
          data: this.operation === "insert" ? this.insertData : (this.operation === "update" ? this.updateData : null)
        })
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`SQLite bridge returned: ${text}`);
      }

      const result = await response.json();

      // Trigger standard reactive real-time feedback loops locally on changes
      if (["insert", "update", "delete"].includes(this.operation) && result.data) {
        const payload = {
          eventType: this.operation.toUpperCase(),
          new: this.operation !== "delete" ? result.data : undefined,
          old: this.operation === "delete" ? result.data : undefined
        };
        tableListeners.forEach(listener => {
          if (listener.tableName === this.tableName) {
            try {
              listener.callback(payload);
            } catch (e) {
              console.error("[Realtime callback error]:", e);
            }
          }
        });
      }

      return result;
    } catch (err: any) {
      console.error(`[SQLite Bridge failure on table ${this.tableName}]:`, err);
      return { data: null, error: { message: err.message || String(err) } };
    }
  }
}

class SupabaseChannel {
  private tableName: string;
  private callback: (payload: any) => void = () => {};

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
    tableListeners.push({ tableName: this.tableName, callback: this.callback });
    return this;
  }

  unsubscribe() {
    const idx = tableListeners.findIndex(l => l.tableName === this.tableName && l.callback === this.callback);
    if (idx !== -1) {
      tableListeners.splice(idx, 1);
    }
  }
}

// Global Supabase Gateway
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
      const user = getSessionUser();
      if (!user) return { data: { session: null }, error: null };
      return {
        data: {
          session: {
            user,
            access_token: "local_token"
          }
        },
        error: null
      };
    },

    async getUser() {
      const user = getSessionUser();
      if (!user) return { data: { user: null }, error: null };
      return {
        data: { user },
        error: null
      };
    },

    onAuthStateChange(callback: (event: string, session: any) => void) {
      const user = getSessionUser();
      const initialSession = user ? { user, access_token: "local_token" } : null;

      setTimeout(() => {
        callback(user ? "SIGNED_IN" : "SIGNED_OUT", initialSession);
      }, 0);

      authListeners.push(callback);

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
        const checkRes = await supabase.from("profiles").select("*").eq("email", email).maybeSingle();
        if (checkRes?.data) {
          throw new Error("User email already registered!");
        }

        const userId = "usr_" + Math.random().toString(36).substring(2, 11);
        const user = {
          id: userId,
          uid: userId,
          email,
          user_metadata: options?.data || {
            full_name: email.split("@")[0],
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`
          },
          created_at: new Date().toISOString()
        };

        const defaultProfile = {
          id: userId,
          uid: userId,
          username: user.user_metadata.full_name || email.split("@")[0],
          email,
          bio: "Reading is life.",
          profilePicture: user.user_metadata.avatar_url,
          role: (email === "aynmluona@gmail.com" || email === "genz-manga@gmail.com") ? "admin" : "user",
          favorites: [],
          history: [],
          bookmarks: [],
          banned: false,
          coins: 1000
        };

        const insertRes = await supabase.from("profiles").insert(defaultProfile);
        if (insertRes.error) {
          throw new Error(insertRes.error.message);
        }

        setSessionUser(user);
        const session = { user, access_token: "local_token" };
        authListeners.forEach(listener => listener("SIGNED_IN", session));

        return { data: { user, session }, error: null };
      } catch (e: any) {
        return { data: null, error: { message: e.message || String(e) } };
      }
    },

    async signInWithPassword({ email, password }: any) {
      try {
        const checkRes = await supabase.from("profiles").select("*").eq("email", email).maybeSingle();
        let profile = checkRes?.data;

        const userId = profile ? profile.id : "usr_" + Math.random().toString(36).substring(2, 11);
        const user = {
          id: userId,
          uid: userId,
          email,
          user_metadata: {
            full_name: profile?.username || email.split("@")[0],
            avatar_url: profile?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`
          },
          created_at: new Date().toISOString()
        };

        if (!profile) {
          const defaultProfile = {
            id: userId,
            uid: userId,
            username: user.user_metadata.full_name,
            email,
            bio: "Reading is life.",
            profilePicture: user.user_metadata.avatar_url,
            role: (email === "aynmluona@gmail.com" || email === "genz-manga@gmail.com") ? "admin" : "user",
            favorites: [],
            history: [],
            bookmarks: [],
            banned: false,
            coins: 1000
          };
          const insertRes = await supabase.from("profiles").insert(defaultProfile);
          if (insertRes.error) {
            throw new Error(insertRes.error.message);
          }
        }

        setSessionUser(user);
        const session = { user, access_token: "local_token" };
        authListeners.forEach(listener => listener("SIGNED_IN", session));

        return { data: { user, session }, error: null };
      } catch (e: any) {
        return { data: null, error: { message: e.message || String(e) } };
      }
    },

    async signInWithOAuth({ provider }: any) {
      return this.signInWithPassword({ email: "g-user@gmail.com", password: "oauthpassword" });
    },

    async signOut() {
      setSessionUser(null);
      authListeners.forEach(listener => listener("SIGNED_OUT", null));
      return { error: null };
    }
  }
};
