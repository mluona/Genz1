import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

// Read config (we use readFileSync to avoid import assertion issues)
const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
let firebaseConfig: any = {};
if (fs.existsSync(configPath)) {
  firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const VALID_TABLES = new Set(["profiles", "series", "chapters", "pages", "coin_packages", "static_pages", "comments", "transactions"]);

export async function initDb() {
  console.log("[Firebase Init] Checking for required seeding...");
  try {
    const seriesSnap = await getDocs(collection(db, "series"));
    if (seriesSnap.empty) {
      console.log("[Firebase Seed] Database is empty. Seeding...");
      
      const seriesList = [
        {
          id: "sololeveling-id",
          title: "Solo Leveling",
          slug: "solo-leveling",
          description: "In a world where hunters must battle deadly monsters to protect mankind...",
          coverImage: "https://picsum.photos/seed/sololeveling/400/600",
          backgroundImage: "https://picsum.photos/seed/sololeveling-bg/1200/800",
          status: "Ongoing",
          type: "Manhwa",
          genres: ["Action", "Fantasy", "Adventure"],
          tags: ["Overpowered", "Leveling", "Gates"],
          author: "Chugong",
          artist: "DUBU (REDICE STUDIO)",
          releaseYear: 2018,
          rating: 4.9,
          ratingCount: 1420,
          views: 24500,
          dailyViews: 120,
          weeklyViews: 840,
          monthlyViews: 3200,
          lastUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString()
        }
      ];

      for (const s of seriesList) {
        await setDoc(doc(db, "series", s.id), s);
      }

      console.log("[Firebase Seed] Seed completed.");
    }
  } catch (err: any) {
    console.error("[Firebase Seed Error]", err.message);
  }
}

export async function executeQuery(
  tableName: string,
  operation: "select" | "insert" | "update" | "delete",
  filters: any[] = [],
  orderField: string | null = null,
  orderAscending: boolean = true,
  limitCount: number | null = null,
  isSingle: boolean = false,
  isMaybeSingle: boolean = false,
  payload: any = null
): Promise<{ data: any; error: any; count?: number }> {
  try {
    if (!VALID_TABLES.has(tableName)) {
      throw new Error(`Invalid table name: ${tableName}`);
    }

    const getAllDocs = async () => {
      const snap = await getDocs(collection(db, tableName));
      return snap.docs.map(d => d.data());
    };

    if (operation === "select") {
      let rows = await getAllDocs();

      for (const filter of filters) {
        const { field, op, val } = filter;
        rows = rows.filter(row => {
          const rowVal = row[field];
          
          if (field === "id" || field === "uid") {
            if (op === "==" || op === "=") return rowVal === val || row.uid === val || row.id === val;
          }
          
          switch (op) {
            case "==": 
            case "=": return rowVal === val;
            case "!=": return rowVal !== val;
            case "in": return Array.isArray(val) && val.includes(rowVal);
            case "like": return String(rowVal).toLowerCase().includes(String(val).toLowerCase());
            case "is": return rowVal === val;
            default: return true;
          }
        });
      }

      if (orderField) {
        rows.sort((a, b) => {
          const valA = a[orderField];
          const valB = b[orderField];
          if (valA < valB) return orderAscending ? -1 : 1;
          if (valA > valB) return orderAscending ? 1 : -1;
          return 0;
        });
      }
      
      const count = rows.length;

      if (limitCount !== null) {
        rows = rows.slice(0, limitCount);
      }

      if (isSingle) {
        if (rows.length === 0) return { data: null, error: { message: "Document not found" }, count: 0 };
        return { data: rows[0], error: null, count: 1 };
      }
      if (isMaybeSingle) {
        return { data: rows.length > 0 ? rows[0] : null, error: null, count: rows.length > 0 ? 1 : 0 };
      }
      return { data: rows, error: null, count };
    }

    if (operation === "insert") {
      const rows = Array.isArray(payload) ? payload : [payload];
      const inserted: any[] = [];
      for (const item of rows) {
        if (!item.id) item.id = "id_" + Math.random().toString(36).substring(2, 11);
        if (tableName === "profiles" && !item.uid) item.uid = item.id;

        await setDoc(doc(db, tableName, String(item.id)), item, { merge: true });
        inserted.push(item);
      }
      return { data: Array.isArray(payload) ? inserted : inserted[0], error: null };
    }

    if (operation === "update") {
      const { data: targets } = await executeQuery(tableName, "select", filters);
      const targetList = Array.isArray(targets) ? targets : (targets ? [targets] : []);
      if (targetList.length === 0) return { data: isSingle ? null : [], error: null };

      const updatedList: any[] = [];
      for (const target of targetList) {
        const docRef = doc(db, tableName, String(target.id));
        await setDoc(docRef, payload, { merge: true });
        
        const fresh = await getDoc(docRef);
        updatedList.push(fresh.data());
      }
      return { data: isSingle ? updatedList[0] : updatedList, error: null };
    }

    if (operation === "delete") {
      const { data: targets } = await executeQuery(tableName, "select", filters);
      const targetList = Array.isArray(targets) ? targets : (targets ? [targets] : []);
      if (targetList.length === 0) return { data: isSingle ? null : [], error: null };

      for (const target of targetList) {
        await deleteDoc(doc(db, tableName, String(target.id)));
      }
      return { data: targets, error: null };
    }

    throw new Error(`Unsupported operation: ${operation}`);
  } catch (err: any) {
    console.error("[Firebase Bridge REST Error]:", err);
    throw err;
  }
}
