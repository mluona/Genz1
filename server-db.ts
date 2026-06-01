import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { createClient } from "@libsql/client";

// Database storage location matching app configuration
const DB_PATH = process.env.VERCEL 
  ? path.join("/tmp", "manga_reader.db") 
  : path.join(process.cwd(), "manga_reader.db");

// Initialize Database
let dbInstance: Database.Database | null = null;
let tursoClientInstance: ReturnType<typeof createClient> | null = null;
let isTursoActive = true;

export function getTursoClient() {
  if (!process.env.TURSO_DATABASE_URL) return null;
  if (!isTursoActive) return null;

  const url = process.env.TURSO_DATABASE_URL;
  const token = process.env.TURSO_AUTH_TOKEN || "";

  // Safeguard: Check if we are still using placeholder configurations
  if (
    url.includes("your-database-name") ||
    url.includes("your_turso") ||
    token.includes("your-") ||
    token.includes("your_turso")
  ) {
    return null;
  }

  if (!tursoClientInstance) {
    tursoClientInstance = createClient({
      url: url,
      authToken: token,
    });
  }
  return tursoClientInstance;
}

export function getDb(): Database.Database {
  if (!dbInstance) {
    dbInstance = new Database(DB_PATH);
    // Enable performance optimizations with self-contained single-file storage
    dbInstance.pragma("journal_mode = DELETE");
    dbInstance.pragma("synchronous = NORMAL");
    dbInstance.pragma("foreign_keys = ON");
  }
  return dbInstance;
}

// Ensure database table structures exist and are seeded
export async function initDb() {
  const turso = getTursoClient();

  if (turso) {
    console.log(`[Turso Init] Checking database tables for Turso Cloud...`);
    try {
      // 1. Create tables using independent executions
      await turso.batch([
        `CREATE TABLE IF NOT EXISTS profiles (
          id TEXT PRIMARY KEY,
          uid TEXT,
          username TEXT,
          email TEXT,
          bio TEXT,
          profilePicture TEXT,
          role TEXT,
          favorites TEXT, -- JSON Array
          history TEXT,   -- JSON Array
          bookmarks TEXT, -- JSON Array
          banned INTEGER DEFAULT 0,
          coins INTEGER DEFAULT 1000,
          password_hash TEXT,
          google_id TEXT,
          discord_id TEXT
        )`,
        `CREATE TABLE IF NOT EXISTS series (
          id TEXT PRIMARY KEY,
          title TEXT,
          slug TEXT UNIQUE,
          description TEXT,
          coverImage TEXT,
          backgroundImage TEXT,
          status TEXT,
          type TEXT,
          genres TEXT, -- JSON
          tags TEXT,   -- JSON
          author TEXT,
          artist TEXT,
          releaseYear INTEGER,
          rating REAL,
          ratingCount INTEGER,
          views INTEGER,
          dailyViews INTEGER,
          weeklyViews INTEGER,
          monthlyViews INTEGER,
          lastUpdated TEXT,
          createdAt TEXT
        )`,
        `CREATE TABLE IF NOT EXISTS chapters (
          id TEXT PRIMARY KEY,
          seriesId TEXT,
          chapterNumber REAL,
          title TEXT,
          content TEXT, -- JSON List of page URLs
          pageCount INTEGER,
          publishDate TEXT,
          views INTEGER,
          createdAt TEXT
        )`,
        `CREATE TABLE IF NOT EXISTS pages (
          id TEXT PRIMARY KEY,
          chapterId TEXT,
          pageNumber INTEGER,
          content TEXT,
          createdAt TEXT
        )`,
        `CREATE TABLE IF NOT EXISTS coin_packages (
          id TEXT PRIMARY KEY,
          name TEXT,
          coins INTEGER,
          price REAL,
          currency TEXT,
          bonusCoins INTEGER,
          isActive INTEGER DEFAULT 1,
          createdAt TEXT
        )`,
        `CREATE TABLE IF NOT EXISTS static_pages (
          id TEXT PRIMARY KEY,
          title TEXT,
          slug TEXT UNIQUE,
          content TEXT,
          lastUpdated TEXT,
          createdAt TEXT
        )`,
        `CREATE TABLE IF NOT EXISTS comments (
          id TEXT PRIMARY KEY,
          chapterId TEXT,
          seriesId TEXT,
          userId TEXT,
          username TEXT,
          avatarUrl TEXT,
          content TEXT,
          likes INTEGER DEFAULT 0,
          dislikes INTEGER DEFAULT 0,
          reports INTEGER DEFAULT 0,
          isPinned INTEGER DEFAULT 0,
          isApproved INTEGER DEFAULT 1,
          createdAt TEXT
        )`,
        `CREATE TABLE IF NOT EXISTS transactions (
          id TEXT PRIMARY KEY,
          userId TEXT,
          packageId TEXT,
          amount REAL,
          coins INTEGER,
          status TEXT,
          gateway TEXT,
          referenceId TEXT,
          createdAt TEXT
        )`
      ], "write");

      // Indexes
      await turso.execute(`CREATE INDEX IF NOT EXISTS idx_series_slug ON series(slug)`);
      await turso.execute(`CREATE INDEX IF NOT EXISTS idx_chapters_series ON chapters(seriesId)`);
      await turso.execute(`CREATE INDEX IF NOT EXISTS idx_pages_chapter ON pages(chapterId)`);
      await turso.execute(`CREATE INDEX IF NOT EXISTS idx_comments_series ON comments(seriesId)`);
      await turso.execute(`CREATE INDEX IF NOT EXISTS idx_comments_chapter ON comments(chapterId)`);

      // Database Migrations to support Google, Discord, and Email logins
      try { await turso.execute(`ALTER TABLE profiles ADD COLUMN password_hash TEXT`); } catch (_) {}
      try { await turso.execute(`ALTER TABLE profiles ADD COLUMN google_id TEXT`); } catch (_) {}
      try { await turso.execute(`ALTER TABLE profiles ADD COLUMN discord_id TEXT`); } catch (_) {}

      // Check if seeding is needed
      const countRowRes = await turso.execute("SELECT COUNT(*) as count FROM series");
      const countRow = countRowRes.rows[0];
      const count = countRow ? Number(countRow.count) : 0;

      if (count === 0) {
        console.log("[Turso Seed] No series data found. Running database seeding...");

        // Seed Series
        const seriesList = [
          {
            id: "sololeveling-id",
            title: "Solo Leveling",
            slug: "solo-leveling",
            description: "In a world where hunters must battle deadly monsters to protect mankind, Sung Jin-Woo, weak and forgotten, discovers a mysterious system allowing him to grow without limits.",
            coverImage: "https://picsum.photos/seed/sololeveling/400/600",
            backgroundImage: "https://picsum.photos/seed/sololeveling-bg/1200/800",
            status: "Ongoing",
            type: "Manhwa",
            genres: JSON.stringify(["Action", "Fantasy", "Adventure"]),
            tags: JSON.stringify(["Overpowered", "Leveling", "Gates"]),
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
          },
          {
            id: "tbate-id",
            title: "The Beginning After The End",
            slug: "the-beginning-after-the-end",
            description: "King Grey has unrivaled strength, wealth, and prestige in a world governed by martial ability. However, solitude lingers closely behind those with great power. Reborn into a new world filled with magic and monsters, the king has a second chance to relive his life.",
            coverImage: "https://picsum.photos/seed/tbate/400/600",
            backgroundImage: "https://picsum.photos/seed/tbate-bg/1200/800",
            status: "Ongoing",
            type: "Manhwa",
            genres: JSON.stringify(["Action", "Fantasy", "Isekai"]),
            tags: JSON.stringify(["Reincarnation", "Magic", "Nobility"]),
            author: "TurtleMe",
            artist: "Fuyuki 23",
            releaseYear: 2018,
            rating: 4.8,
            ratingCount: 890,
            views: 18200,
            dailyViews: 90,
            weeklyViews: 610,
            monthlyViews: 2400,
            lastUpdated: new Date().toISOString(),
            createdAt: new Date().toISOString()
          },
          {
            id: "shadowhack-id",
            title: "Shadow Hack",
            slug: "shadow-hack",
            description: "When Li Yunmu discovers a secret shadow-producing system, he unlocks the capability to farm experience points, learn ancient martial skills, and hack his way to peak power offline.",
            coverImage: "https://picsum.photos/seed/shadowhack/400/600",
            backgroundImage: "https://picsum.photos/seed/shadowhack-bg/1200/800",
            status: "Completed",
            type: "Novel",
            genres: JSON.stringify(["Action", "Fantasy", "Martial Arts"]),
            tags: JSON.stringify(["System", "Farming", "Cultivation"]),
            author: "Water Ruined",
            artist: "N/A",
            releaseYear: 2017,
            rating: 4.5,
            ratingCount: 310,
            views: 19400,
            dailyViews: 30,
            weeklyViews: 210,
            monthlyViews: 850,
            lastUpdated: new Date().toISOString(),
            createdAt: new Date().toISOString()
          }
        ];

        for (const s of seriesList) {
          await turso.execute({
            sql: `INSERT INTO series (
              id, title, slug, description, coverImage, backgroundImage, status, type,
              genres, tags, author, artist, releaseYear, rating, ratingCount, views,
              dailyViews, weeklyViews, monthlyViews, lastUpdated, createdAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
              s.id, s.title, s.slug, s.description, s.coverImage, s.backgroundImage, s.status, s.type,
              s.genres, s.tags, s.author, s.artist, s.releaseYear, s.rating, s.ratingCount, s.views,
              s.dailyViews, s.weeklyViews, s.monthlyViews, s.lastUpdated, s.createdAt
            ]
          });
        }

        // Chapters List
        const chaptersList = [
          {
            id: "sl-chapter-1-id",
            seriesId: "sololeveling-id",
            chapterNumber: 1.0,
            title: "Chapter 1: The Weakest Hunter",
            content: JSON.stringify([
              "https://picsum.photos/seed/slch1-1/800/1200",
              "https://picsum.photos/seed/slch1-2/800/1200",
              "https://picsum.photos/seed/slch1-3/800/1200"
            ]),
            pageCount: 3,
            publishDate: new Date().toISOString(),
            views: 1205,
            createdAt: new Date().toISOString()
          },
          {
            id: "sl-chapter-2-id",
            seriesId: "sololeveling-id",
            chapterNumber: 2.0,
            title: "Chapter 2: Double Dungeon",
            content: JSON.stringify([
              "https://picsum.photos/seed/slch2-1/800/1200",
              "https://picsum.photos/seed/slch2-2/800/1200"
            ]),
            pageCount: 2,
            publishDate: new Date().toISOString(),
            views: 980,
            createdAt: new Date().toISOString()
          },
          {
            id: "tbate-chapter-1-id",
            seriesId: "tbate-id",
            chapterNumber: 1.0,
            title: "Chapter 1: Rebirth Of A King",
            content: JSON.stringify([
              "https://picsum.photos/seed/tbate1-1/800/1200",
              "https://picsum.photos/seed/tbate1-2/800/1200"
            ]),
            pageCount: 2,
            publishDate: new Date().toISOString(),
            views: 890,
            createdAt: new Date().toISOString()
          },
          {
            id: "sh-chapter-1-id",
            seriesId: "shadowhack-id",
            chapterNumber: 1.0,
            title: "Chapter 1: The Shadow Upgrade",
            content: JSON.stringify([
              "Li Yunmu sat looking out the window as the twilight set upon the city. He sighed deeply, clutching his archaic communication device in his hands. He was an ordinary youth from an ordinary family, struggling in a hyper-competitive post-apocalyptic earth. Little did he know that at this exact instant, a strange digital prompt was flashing in his field of view.",
              "Choose option [YES / NO] to activate offline shadow farming. A cold, synthetic voice murmured in his mind. Stunned, he tapped YES, initiating a cycle of destiny that would elevate him to a deity."
            ]),
            pageCount: 2,
            publishDate: new Date().toISOString(),
            views: 450,
            createdAt: new Date().toISOString()
          }
        ];

        for (const ch of chaptersList) {
          await turso.execute({
            sql: `INSERT INTO chapters (
              id, seriesId, chapterNumber, title, content, pageCount, publishDate, views, createdAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
              ch.id, ch.seriesId, ch.chapterNumber, ch.title, ch.content, ch.pageCount, ch.publishDate, ch.views, ch.createdAt
            ]
          });

          const loadedContent = JSON.parse(ch.content);
          for (let i = 0; i < loadedContent.length; i++) {
            const pageId = `${ch.id}_p_${i}`;
            await turso.execute({
              sql: `INSERT INTO pages (id, chapterId, pageNumber, content, createdAt) VALUES (?, ?, ?, ?, ?)`,
              args: [pageId, ch.id, i, loadedContent[i], new Date().toISOString()]
            });
          }
        }

        // Packages List
        const packagesList = [
          {
            id: "pkg-1",
            name: "Starter Pack",
            coins: 100,
            price: 0.99,
            currency: "USD",
            bonusCoins: 0,
            isActive: 1,
            createdAt: new Date().toISOString()
          },
          {
            id: "pkg-2",
            name: "Value Saver Pack",
            coins: 520,
            price: 4.99,
            currency: "USD",
            bonusCoins: 20,
            isActive: 1,
            createdAt: new Date().toISOString()
          },
          {
            id: "pkg-3",
            name: "Immortal Reader Pack",
            coins: 1150,
            price: 9.99,
            currency: "USD",
            bonusCoins: 150,
            isActive: 1,
            createdAt: new Date().toISOString()
          }
        ];

        for (const p of packagesList) {
          await turso.execute({
            sql: `INSERT INTO coin_packages (id, name, coins, price, currency, bonusCoins, isActive, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [p.id, p.name, p.coins, p.price, p.currency, p.bonusCoins, p.isActive, p.createdAt]
          });
        }

        // Static Pages
        const staticPages = [
          {
            id: "tos",
            title: "Terms of Service",
            slug: "terms",
            content: "# Terms of Service\n\nWelcome to our Reader. By using our service, you agree to these terms...",
            lastUpdated: new Date().toISOString(),
            createdAt: new Date().toISOString()
          },
          {
            id: "privacy",
            title: "Privacy Policy",
            slug: "privacy",
            content: "# Privacy Policy\n\nWe respect your digital privacy. Your user account data stays protected...",
            lastUpdated: new Date().toISOString(),
            createdAt: new Date().toISOString()
          }
        ];

        for (const sp of staticPages) {
          await turso.execute({
            sql: `INSERT INTO static_pages (id, title, slug, content, lastUpdated, createdAt) VALUES (?, ?, ?, ?, ?, ?)`,
            args: [sp.id, sp.title, sp.slug, sp.content, sp.lastUpdated, sp.createdAt]
          });
        }

        console.log("[Turso Seed] Seeding completed beautifully on Turso Cloud!");
      }
      return; // Return only if everything succeeded!
    } catch (err) {
      console.error("[Turso Init Error] Could not initialize Turso tables automatically:", err);
      console.log("[Turso Fallback] Turning off Turso Cloud due to connection/authorization error. Falling back to local SQLite database...");
      isTursoActive = false;
    }
  }

  const db = getDb();
  console.log(`[SQLite Init] Checking database tables at: ${DB_PATH}`);

  // Create tables using clean transactional blocks
  db.transaction(() => {
    // 1. Profiles Table
    db.prepare(`
      CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY,
        uid TEXT,
        username TEXT,
        email TEXT,
        bio TEXT,
        profilePicture TEXT,
        role TEXT,
        favorites TEXT, -- JSON Array
        history TEXT,   -- JSON Array
        bookmarks TEXT, -- JSON Array
        banned INTEGER DEFAULT 0,
        coins INTEGER DEFAULT 1000,
        password_hash TEXT,
        google_id TEXT,
        discord_id TEXT
      )
    `).run();

    // 2. Series Table
    db.prepare(`
      CREATE TABLE IF NOT EXISTS series (
        id TEXT PRIMARY KEY,
        title TEXT,
        slug TEXT UNIQUE,
        description TEXT,
        coverImage TEXT,
        backgroundImage TEXT,
        status TEXT,
        type TEXT,
        genres TEXT, -- JSON
        tags TEXT,   -- JSON
        author TEXT,
        artist TEXT,
        releaseYear INTEGER,
        rating REAL,
        ratingCount INTEGER,
        views INTEGER,
        dailyViews INTEGER,
        weeklyViews INTEGER,
        monthlyViews INTEGER,
        lastUpdated TEXT,
        createdAt TEXT
      )
    `).run();

    // 3. Chapters Table
    db.prepare(`
      CREATE TABLE IF NOT EXISTS chapters (
        id TEXT PRIMARY KEY,
        seriesId TEXT,
        chapterNumber REAL,
        title TEXT,
        content TEXT, -- JSON List of page URLs
        pageCount INTEGER,
        publishDate TEXT,
        views INTEGER,
        createdAt TEXT,
        FOREIGN KEY(seriesId) REFERENCES series(id) ON DELETE CASCADE
      )
    `).run();

    // 4. Pages Table (Individual optional Page records)
    db.prepare(`
      CREATE TABLE IF NOT EXISTS pages (
        id TEXT PRIMARY KEY,
        chapterId TEXT,
        pageNumber INTEGER,
        content TEXT,
        createdAt TEXT,
        FOREIGN KEY(chapterId) REFERENCES chapters(id) ON DELETE CASCADE
      )
    `).run();

    // 5. Coin Packages Table
    db.prepare(`
      CREATE TABLE IF NOT EXISTS coin_packages (
        id TEXT PRIMARY KEY,
        name TEXT,
        coins INTEGER,
        price REAL,
        currency TEXT,
        bonusCoins INTEGER,
        isActive INTEGER DEFAULT 1,
        createdAt TEXT
      )
    `).run();

    // 6. Static Pages (TOS & Privacy) Table
    db.prepare(`
      CREATE TABLE IF NOT EXISTS static_pages (
        id TEXT PRIMARY KEY,
        title TEXT,
        slug TEXT UNIQUE,
        content TEXT,
        lastUpdated TEXT,
        createdAt TEXT
      )
    `).run();

    // 7. Comments Table
    db.prepare(`
      CREATE TABLE IF NOT EXISTS comments (
        id TEXT PRIMARY KEY,
        chapterId TEXT,
        seriesId TEXT,
        userId TEXT,
        username TEXT,
        avatarUrl TEXT,
        content TEXT,
        likes INTEGER DEFAULT 0,
        dislikes INTEGER DEFAULT 0,
        reports INTEGER DEFAULT 0,
        isPinned INTEGER DEFAULT 0,
        isApproved INTEGER DEFAULT 1,
        createdAt TEXT,
        FOREIGN KEY(seriesId) REFERENCES series(id) ON DELETE CASCADE
      )
    `).run();

    // 8. Transactions Table
    db.prepare(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        userId TEXT,
        packageId TEXT,
        amount REAL,
        coins INTEGER,
        status TEXT,
        gateway TEXT,
        referenceId TEXT,
        createdAt TEXT
      )
    `).run();

    // Indexes for high-performance reading
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_series_slug ON series(slug)`).run();
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_chapters_series ON chapters(seriesId)`).run();
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_pages_chapter ON pages(chapterId)`).run();
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_comments_series ON comments(seriesId)`).run();
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_comments_chapter ON comments(chapterId)`).run();
  })();

  // Database Migrations to support Google, Discord, and Email logins for local SQLite
  try { db.prepare(`ALTER TABLE profiles ADD COLUMN password_hash TEXT`).run(); } catch (_) {}
  try { db.prepare(`ALTER TABLE profiles ADD COLUMN google_id TEXT`).run(); } catch (_) {}
  try { db.prepare(`ALTER TABLE profiles ADD COLUMN discord_id TEXT`).run(); } catch (_) {}

  // Seed default data if series is empty
  const countRow = db.prepare("SELECT COUNT(*) as count FROM series").get() as { count: number };
  if (countRow.count === 0) {
    console.log("[SQLite Seed] No series data found. Running database seeding...");
    db.transaction(() => {
      // 1. Seed Series
      const seriesList = [
        {
          id: "sololeveling-id",
          title: "Solo Leveling",
          slug: "solo-leveling",
          description: "In a world where hunters must battle deadly monsters to protect mankind, Sung Jin-Woo, weak and forgotten, discovers a mysterious system allowing him to grow without limits.",
          coverImage: "https://picsum.photos/seed/sololeveling/400/600",
          backgroundImage: "https://picsum.photos/seed/sololeveling-bg/1200/800",
          status: "Ongoing",
          type: "Manhwa",
          genres: JSON.stringify(["Action", "Fantasy", "Adventure"]),
          tags: JSON.stringify(["Overpowered", "Leveling", "Gates"]),
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
        },
        {
          id: "tbate-id",
          title: "The Beginning After The End",
          slug: "the-beginning-after-the-end",
          description: "King Grey has unrivaled strength, wealth, and prestige in a world governed by martial ability. However, solitude lingers closely behind those with great power. Reborn into a new world filled with magic and monsters, the king has a second chance to relive his life.",
          coverImage: "https://picsum.photos/seed/tbate/400/600",
          backgroundImage: "https://picsum.photos/seed/tbate-bg/1200/800",
          status: "Ongoing",
          type: "Manhwa",
          genres: JSON.stringify(["Action", "Fantasy", "Isekai"]),
          tags: JSON.stringify(["Reincarnation", "Magic", "Nobility"]),
          author: "TurtleMe",
          artist: "Fuyuki 23",
          releaseYear: 2018,
          rating: 4.8,
          ratingCount: 890,
          views: 18200,
          dailyViews: 90,
          weeklyViews: 610,
          monthlyViews: 2400,
          lastUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString()
        },
        {
          id: "shadowhack-id",
          title: "Shadow Hack",
          slug: "shadow-hack",
          description: "When Li Yunmu discovers a secret shadow-producing system, he unlocks the capability to farm experience points, learn ancient martial skills, and hack his way to peak power offline.",
          coverImage: "https://picsum.photos/seed/shadowhack/400/600",
          backgroundImage: "https://picsum.photos/seed/shadowhack-bg/1200/800",
          status: "Completed",
          type: "Novel",
          genres: JSON.stringify(["Action", "Fantasy", "Martial Arts"]),
          tags: JSON.stringify(["System", "Farming", "Cultivation"]),
          author: "Water Ruined",
          artist: "N/A",
          releaseYear: 2017,
          rating: 4.5,
          ratingCount: 310,
          views: 19400,
          dailyViews: 30,
          weeklyViews: 210,
          monthlyViews: 850,
          lastUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString()
        }
      ];

      const saveSeries = db.prepare(`
        INSERT INTO series (
          id, title, slug, description, coverImage, backgroundImage, status, type,
          genres, tags, author, artist, releaseYear, rating, ratingCount, views,
          dailyViews, weeklyViews, monthlyViews, lastUpdated, createdAt
        ) VALUES (
          @id, @title, @slug, @description, @coverImage, @backgroundImage, @status, @type,
          @genres, @tags, @author, @artist, @releaseYear, @rating, @ratingCount, @views,
          @dailyViews, @weeklyViews, @monthlyViews, @lastUpdated, @createdAt
        )
      `);

      for (const s of seriesList) {
        saveSeries.run(s);
      }

      // 2. Seed Chapters
      const chaptersList = [
        {
          id: "sl-chapter-1-id",
          seriesId: "sololeveling-id",
          chapterNumber: 1.0,
          title: "Chapter 1: The Weakest Hunter",
          content: JSON.stringify([
            "https://picsum.photos/seed/slch1-1/800/1200",
            "https://picsum.photos/seed/slch1-2/800/1200",
            "https://picsum.photos/seed/slch1-3/800/1200"
          ]),
          pageCount: 3,
          publishDate: new Date().toISOString(),
          views: 1205,
          createdAt: new Date().toISOString()
        },
        {
          id: "sl-chapter-2-id",
          seriesId: "sololeveling-id",
          chapterNumber: 2.0,
          title: "Chapter 2: Double Dungeon",
          content: JSON.stringify([
            "https://picsum.photos/seed/slch2-1/800/1200",
            "https://picsum.photos/seed/slch2-2/800/1200"
          ]),
          pageCount: 2,
          publishDate: new Date().toISOString(),
          views: 980,
          createdAt: new Date().toISOString()
        },
        {
          id: "tbate-chapter-1-id",
          seriesId: "tbate-id",
          chapterNumber: 1.0,
          title: "Chapter 1: Rebirth Of A King",
          content: JSON.stringify([
            "https://picsum.photos/seed/tbate1-1/800/1200",
            "https://picsum.photos/seed/tbate1-2/800/1200"
          ]),
          pageCount: 2,
          publishDate: new Date().toISOString(),
          views: 890,
          createdAt: new Date().toISOString()
        },
        {
          id: "sh-chapter-1-id",
          seriesId: "shadowhack-id",
          chapterNumber: 1.0,
          title: "Chapter 1: The Shadow Upgrade",
          content: JSON.stringify([
            "Li Yunmu sat looking out the window as the twilight set upon the city. He sighed deeply, clutching his archaic communication device in his hands. He was an ordinary youth from an ordinary family, struggling in a hyper-competitive post-apocalyptic earth. Little did he know that at this exact instant, a strange digital prompt was flashing in his field of view.",
            "Choose option [YES / NO] to activate offline shadow farming. A cold, synthetic voice murmured in his mind. Stunned, he tapped YES, initiating a cycle of destiny that would elevate him to a deity."
          ]),
          pageCount: 2,
          publishDate: new Date().toISOString(),
          views: 450,
          createdAt: new Date().toISOString()
        }
      ];

      const saveChapter = db.prepare(`
        INSERT INTO chapters (
          id, seriesId, chapterNumber, title, content, pageCount, publishDate, views, createdAt
        ) VALUES (
          @id, @seriesId, @chapterNumber, @title, @content, @pageCount, @publishDate, @views, @createdAt
        )
      `);

      const savePage = db.prepare(`
        INSERT INTO pages (id, chapterId, pageNumber, content, createdAt)
        VALUES (?, ?, ?, ?, ?)
      `);

      for (const ch of chaptersList) {
        saveChapter.run(ch);

        const loadedContent = JSON.parse(ch.content);
        for (let i = 0; i < loadedContent.length; i++) {
          const pageId = `${ch.id}_p_${i}`;
          savePage.run(pageId, ch.id, i, loadedContent[i], new Date().toISOString());
        }
      }

      // 3. Seed Coin Packages
      const packagesList = [
        {
          id: "pkg-1",
          name: "Starter Pack",
          coins: 100,
          price: 0.99,
          currency: "USD",
          bonusCoins: 0,
          isActive: 1,
          createdAt: new Date().toISOString()
        },
        {
          id: "pkg-2",
          name: "Value Saver Pack",
          coins: 520,
          price: 4.99,
          currency: "USD",
          bonusCoins: 20,
          isActive: 1,
          createdAt: new Date().toISOString()
        },
        {
          id: "pkg-3",
          name: "Immortal Reader Pack",
          coins: 1150,
          price: 9.99,
          currency: "USD",
          bonusCoins: 150,
          isActive: 1,
          createdAt: new Date().toISOString()
        }
      ];

      const savePackage = db.prepare(`
        INSERT INTO coin_packages (id, name, coins, price, currency, bonusCoins, isActive, createdAt)
        VALUES (@id, @name, @coins, @price, @currency, @bonusCoins, @isActive, @createdAt)
      `);

      for (const p of packagesList) {
        savePackage.run(p);
      }

      // 4. Seed Static Pages
      const staticPages = [
        {
          id: "tos",
          title: "Terms of Service",
          slug: "terms",
          content: "# Terms of Service\n\nWelcome to our Reader. By using our service, you agree to these terms...",
          lastUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString()
        },
        {
          id: "privacy",
          title: "Privacy Policy",
          slug: "privacy",
          content: "# Privacy Policy\n\nWe respect your digital privacy. Your user account data stays protected...",
          lastUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString()
        }
      ];

      const saveStaticPage = db.prepare(`
        INSERT INTO static_pages (id, title, slug, content, lastUpdated, createdAt)
        VALUES (@id, @title, @slug, @content, @lastUpdated, @createdAt)
      `);

      for (const sp of staticPages) {
        saveStaticPage.run(sp);
      }

      console.log("[SQLite Seed] Seeding completed beautifully!");
    });
  }
}

// Map column fields back/to javascript types
function parseRow(tableName: string, row: any) {
  if (!row) return row;
  const parsed = { ...row };

  if (tableName === "profiles") {
    if (parsed.banned !== undefined) parsed.banned = parsed.banned === 1;
    if (parsed.favorites) {
      try { parsed.favorites = JSON.parse(parsed.favorites); } catch (e) { parsed.favorites = []; }
    } else { parsed.favorites = []; }
    if (parsed.bookmarks) {
      try { parsed.bookmarks = JSON.parse(parsed.bookmarks); } catch (e) { parsed.bookmarks = []; }
    } else { parsed.bookmarks = []; }
    if (parsed.history) {
      try { parsed.history = JSON.parse(parsed.history); } catch (e) { parsed.history = []; }
    } else { parsed.history = []; }
  }
  if (tableName === "series") {
    if (parsed.genres) {
      try { parsed.genres = JSON.parse(parsed.genres); } catch (e) { parsed.genres = []; }
    } else { parsed.genres = []; }
    if (parsed.tags) {
      try { parsed.tags = JSON.parse(parsed.tags); } catch (e) { parsed.tags = []; }
    } else { parsed.tags = []; }
  }
  if (tableName === "chapters") {
    if (parsed.content) {
      try { parsed.content = JSON.parse(parsed.content); } catch (e) { parsed.content = []; }
    } else { parsed.content = []; }
  }
  if (tableName === "coin_packages") {
    if (parsed.isActive !== undefined) parsed.isActive = parsed.isActive === 1;
  }
  if (tableName === "comments") {
    if (parsed.isPinned !== undefined) parsed.isPinned = parsed.isPinned === 1;
    if (parsed.isApproved !== undefined) parsed.isApproved = parsed.isApproved === 1;
  }

  return parsed;
}

function serializeRow(tableName: string, obj: any) {
  if (!obj) return obj;
  const serialized = { ...obj };

  if (tableName === "profiles") {
    if (serialized.banned !== undefined) serialized.banned = serialized.banned ? 1 : 0;
    if (serialized.favorites !== undefined) serialized.favorites = JSON.stringify(serialized.favorites);
    if (serialized.bookmarks !== undefined) serialized.bookmarks = JSON.stringify(serialized.bookmarks);
    if (serialized.history !== undefined) serialized.history = JSON.stringify(serialized.history);
  }
  if (tableName === "series") {
    if (serialized.genres !== undefined) serialized.genres = JSON.stringify(serialized.genres);
    if (serialized.tags !== undefined) serialized.tags = JSON.stringify(serialized.tags);
  }
  if (tableName === "chapters") {
    if (serialized.content !== undefined) serialized.content = JSON.stringify(serialized.content);
  }
  if (tableName === "coin_packages") {
    if (serialized.isActive !== undefined) serialized.isActive = serialized.isActive ? 1 : 0;
  }
  if (tableName === "comments") {
    if (serialized.isPinned !== undefined) serialized.isPinned = serialized.isPinned ? 1 : 0;
    if (serialized.isApproved !== undefined) serialized.isApproved = serialized.isApproved ? 1 : 0;
  }

  return serialized;
}

// Main execution gateway for client calls
const VALID_TABLES = new Set(["profiles", "series", "chapters", "pages", "coin_packages", "static_pages", "comments", "transactions"]);
const isValidWord = (w: string) => /^[a-zA-Z0-9_]+$/.test(w);

// High-performance static schema column whitelist for database operations
const SCHEMA_COLUMNS: Record<string, string[]> = {
  profiles: ["id", "uid", "username", "email", "bio", "profilePicture", "role", "favorites", "history", "bookmarks", "banned", "coins", "password_hash", "google_id", "discord_id"],
  series: ["id", "title", "slug", "description", "coverImage", "backgroundImage", "status", "type", "genres", "tags", "author", "artist", "releaseYear", "rating", "ratingCount", "views", "dailyViews", "weeklyViews", "monthlyViews", "lastUpdated", "createdAt"],
  chapters: ["id", "seriesId", "chapterNumber", "title", "content", "pageCount", "publishDate", "views", "createdAt"],
  pages: ["id", "chapterId", "pageNumber", "content", "createdAt"],
  coin_packages: ["id", "name", "coins", "price", "currency", "bonusCoins", "isActive", "createdAt"],
  static_pages: ["id", "title", "slug", "content", "lastUpdated", "createdAt"],
  comments: ["id", "chapterId", "seriesId", "userId", "username", "avatarUrl", "content", "likes", "dislikes", "reports", "isPinned", "isApproved", "createdAt"],
  transactions: ["id", "userId", "packageId", "amount", "coins", "status", "gateway", "referenceId", "createdAt"]
};

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
    const turso = getTursoClient();

    if (!VALID_TABLES.has(tableName)) {
      throw new Error(`Invalid or unauthorized table name: ${tableName}`);
    }

    const allowedCols = SCHEMA_COLUMNS[tableName] || [];

    // --- TURSO CLIENT ROUTING ---
    if (turso) {
      if (operation === "select") {
        let sql = `SELECT * FROM ${tableName}`;
        const params: any[] = [];
        const clauses: string[] = [];

        for (const filter of filters) {
          const { field, op, val } = filter;
          if (!isValidWord(field)) throw new Error(`Invalid field name: ${field}`);

          if (field === "id" || field === "uid") {
            if (allowedCols.includes("uid")) {
              clauses.push(`(id = ? OR uid = ?)`);
              params.push(val, val);
            } else {
              clauses.push(`id = ?`);
              params.push(val);
            }
          } else if (op === "==" || op === "=") {
            clauses.push(`${field} = ?`);
            params.push(val);
          } else if (op === "!=") {
            clauses.push(`${field} != ?`);
            params.push(val);
          } else if (op === "in") {
            if (Array.isArray(val) && val.length > 0) {
              const placeholders = val.map(() => "?").join(",");
              clauses.push(`${field} IN (${placeholders})`);
              params.push(...val);
            } else {
              clauses.push(`1 = 0`);
            }
          } else if (op === "like") {
            clauses.push(`${field} LIKE ?`);
            params.push(`%${val.replace(/%/g, "")}%`);
          } else if (op === "is") {
            if (val === null) {
              clauses.push(`${field} IS NULL`);
            } else {
              clauses.push(`${field} = ?`);
              params.push(val);
            }
          }
        }

        if (clauses.length > 0) {
          sql += ` WHERE ` + clauses.join(" AND ");
        }

        // Get total count
        let count = 0;
        const countRes = await turso.execute({
          sql: `SELECT COUNT(*) as count FROM (${sql})`,
          args: params
        });
        if (countRes.rows.length > 0) {
          count = Number((countRes.rows[0] as any).count);
        }

        if (orderField) {
          if (!isValidWord(orderField)) throw new Error(`Invalid sorting field: ${orderField}`);
          sql += ` ORDER BY ${orderField} ${orderAscending ? "ASC" : "DESC"}`;
        }

        if (limitCount !== null) {
          sql += ` LIMIT ?`;
          params.push(limitCount);
        }

        const res = await turso.execute({ sql, args: params });
        const parsedRows = res.rows.map(r => parseRow(tableName, r));

        if (isSingle) {
          if (parsedRows.length === 0) {
            return { data: null, error: { message: "Document not found", code: "PGRST116" }, count: 0 };
          }
          return { data: parsedRows[0], error: null, count: 1 };
        }

        if (isMaybeSingle) {
          return { data: parsedRows.length > 0 ? parsedRows[0] : null, error: null, count: parsedRows.length > 0 ? 1 : 0 };
        }

        return { data: parsedRows, error: null, count };
      }

      if (operation === "insert") {
        const rows = Array.isArray(payload) ? payload : [payload];
        const inserted: any[] = [];

        for (const rawRow of rows) {
          const item = serializeRow(tableName, rawRow);
          if (!item.id) {
            item.id = "id_" + Math.random().toString(36).substring(2, 11);
          }
          if (tableName === "profiles" && !item.uid) {
            item.uid = item.id;
          }

          const columns: string[] = [];
          const values: any[] = [];
          for (const key of Object.keys(item)) {
            if (allowedCols.includes(key)) {
              columns.push(key);
              values.push(item[key]);
            }
          }

          if (columns.length === 0) continue;

          const placeholders = columns.map(() => "?").join(",");
          const sql = `INSERT OR REPLACE INTO ${tableName} (${columns.join(",")}) VALUES (${placeholders})`;
          await turso.execute({ sql, args: values });

          const cleanItem: any = {};
          for (const col of allowedCols) {
            if (col in item) {
              cleanItem[col] = item[col];
            } else {
              cleanItem[col] = null;
            }
          }
          inserted.push(parseRow(tableName, cleanItem));
        }

        return { data: Array.isArray(payload) ? inserted : inserted[0], error: null };
      }

      if (operation === "update") {
        const { data: targets } = await executeQuery(tableName, "select", filters);
        if (!targets || (Array.isArray(targets) && targets.length === 0)) {
          return { data: isSingle ? null : [], error: null };
        }

        const targetList = Array.isArray(targets) ? targets : [targets];
        const updatedList: any[] = [];
        const item = serializeRow(tableName, payload);

        const columns: string[] = [];
        const values: any[] = [];
        for (const key of Object.keys(item)) {
          if (key !== "id" && allowedCols.includes(key)) {
            columns.push(key);
            values.push(item[key]);
          }
        }

        if (columns.length === 0) {
          return { data: isSingle ? targetList[0] : targetList, error: null };
        }

        const setClauses = columns.map(col => `${col} = ?`).join(",");
        const sql = `UPDATE ${tableName} SET ${setClauses} WHERE id = ?`;

        for (const target of targetList) {
          await turso.execute({ sql, args: [...values, target.id] });
          const finalRowRes = await turso.execute({
            sql: `SELECT * FROM ${tableName} WHERE id = ?`,
            args: [target.id]
          });
          if (finalRowRes.rows.length > 0) {
            updatedList.push(parseRow(tableName, finalRowRes.rows[0]));
          }
        }

        return { data: isSingle ? updatedList[0] : updatedList, error: null };
      }

      if (operation === "delete") {
        const { data: targets } = await executeQuery(tableName, "select", filters);
        if (!targets || (Array.isArray(targets) && targets.length === 0)) {
          return { data: isSingle ? null : [], error: null };
        }

        const targetList = Array.isArray(targets) ? targets : [targets];
        for (const target of targetList) {
          await turso.execute({
            sql: `DELETE FROM ${tableName} WHERE id = ?`,
            args: [target.id]
          });
        }

        return { data: targets, error: null };
      }

      throw new Error(`Unsupported database operation: ${operation}`);
    }

    // --- LOCAL SQLite BACKEND ROUTING ---
    const db = getDb();

    if (operation === "select") {
      let sql = `SELECT * FROM ${tableName}`;
      const params: any[] = [];
      const clauses: string[] = [];

      for (const filter of filters) {
        const { field, op, val } = filter;
        if (!isValidWord(field)) throw new Error(`Invalid field name: ${field}`);

        if (field === "id" || field === "uid") {
          if (allowedCols.includes("uid")) {
            clauses.push(`(id = ? OR uid = ?)`);
            params.push(val, val);
          } else {
            clauses.push(`id = ?`);
            params.push(val);
          }
        } else if (op === "==" || op === "=") {
          clauses.push(`${field} = ?`);
          params.push(val);
        } else if (op === "!=") {
          clauses.push(`${field} != ?`);
          params.push(val);
        } else if (op === "in") {
          if (Array.isArray(val) && val.length > 0) {
            const placeholders = val.map(() => "?").join(",");
            clauses.push(`${field} IN (${placeholders})`);
            params.push(...val);
          } else {
            clauses.push(`1 = 0`); // impossible condition to return empty safely
          }
        } else if (op === "like") {
          clauses.push(`${field} LIKE ?`);
          params.push(`%${val.replace(/%/g, "")}%`);
        } else if (op === "is") {
          if (val === null) {
            clauses.push(`${field} IS NULL`);
          } else {
            clauses.push(`${field} = ?`);
            params.push(val);
          }
        }
      }

      if (clauses.length > 0) {
        sql += ` WHERE ` + clauses.join(" AND ");
      }

      // Order count helper
      let countSelect = `SELECT COUNT(*) as count FROM (${sql})`;
      const countStmt = db.prepare(countSelect);
      const { count } = countStmt.get(...params) as { count: number };

      if (orderField) {
        if (!isValidWord(orderField)) throw new Error(`Invalid sorting field: ${orderField}`);
        sql += ` ORDER BY ${orderField} ${orderAscending ? "ASC" : "DESC"}`;
      }

      if (limitCount !== null) {
        sql += ` LIMIT ?`;
        params.push(limitCount);
      }

      const stmt = db.prepare(sql);
      const rows = stmt.all(...params) as any[];
      const parsedRows = rows.map(r => parseRow(tableName, r));

      if (isSingle) {
        if (parsedRows.length === 0) {
          return { data: null, error: { message: "Document not found", code: "PGRST116" }, count: 0 };
        }
        return { data: parsedRows[0], error: null, count: 1 };
      }

      if (isMaybeSingle) {
        return { data: parsedRows.length > 0 ? parsedRows[0] : null, error: null, count: parsedRows.length > 0 ? 1 : 0 };
      }

      return { data: parsedRows, error: null, count };
    }

    if (operation === "insert") {
      const rows = Array.isArray(payload) ? payload : [payload];
      const inserted: any[] = [];

      db.transaction(() => {
        for (const rawRow of rows) {
          const item = serializeRow(tableName, rawRow);
          // Set primary key identifier
          if (!item.id) {
            item.id = "id_" + Math.random().toString(36).substring(2, 11);
          }
          if (tableName === "profiles" && !item.uid) {
            item.uid = item.id;
          }

          // Build INSERT only with columns valid for this table schema
          const columns: string[] = [];
          const values: any[] = [];
          for (const key of Object.keys(item)) {
            if (allowedCols.includes(key)) {
              columns.push(key);
              values.push(item[key]);
            }
          }

          if (columns.length === 0) {
            continue;
          }

          const placeholders = columns.map(() => "?").join(",");
          const sql = `INSERT OR REPLACE INTO ${tableName} (${columns.join(",")}) VALUES (${placeholders})`;
          db.prepare(sql).run(...values);

          // Return row cleaned up and conforming to the schema
          const cleanItem: any = {};
          for (const col of allowedCols) {
            if (col in item) {
              cleanItem[col] = item[col];
            } else {
              cleanItem[col] = null;
            }
          }
          inserted.push(parseRow(tableName, cleanItem));
        }
      })();

      return { data: Array.isArray(payload) ? inserted : inserted[0], error: null };
    }

    if (operation === "update") {
      // 1. Get targets to check which IDs match the filters
      const { data: targets } = await executeQuery(tableName, "select", filters);
      if (!targets || (Array.isArray(targets) && targets.length === 0)) {
        return { data: isSingle ? null : [], error: null };
      }

      const targetList = Array.isArray(targets) ? targets : [targets];
      const updatedList: any[] = [];
      const item = serializeRow(tableName, payload);
      
      const columns: string[] = [];
      const values: any[] = [];
      for (const key of Object.keys(item)) {
        if (key !== "id" && allowedCols.includes(key)) {
          columns.push(key);
          values.push(item[key]);
        }
      }

      if (columns.length === 0) {
        return { data: isSingle ? targetList[0] : targetList, error: null };
      }

      db.transaction(() => {
        const setClauses = columns.map(col => `${col} = ?`).join(",");
        const sql = `UPDATE ${tableName} SET ${setClauses} WHERE id = ?`;
        const stmt = db.prepare(sql);

        for (const target of targetList) {
          stmt.run(...values, target.id);
          // Retrieve final merged record
          const finalRow = db.prepare(`SELECT * FROM ${tableName} WHERE id = ?`).get(target.id);
          updatedList.push(parseRow(tableName, finalRow));
        }
      })();

      return { data: isSingle ? updatedList[0] : updatedList, error: null };
    }

    if (operation === "delete") {
      // 1. Get targets matching filters
      const { data: targets } = await executeQuery(tableName, "select", filters);
      if (!targets || (Array.isArray(targets) && targets.length === 0)) {
        return { data: isSingle ? null : [], error: null };
      }

      const targetList = Array.isArray(targets) ? targets : [targets];
      db.transaction(() => {
        const stmt = db.prepare(`DELETE FROM ${tableName} WHERE id = ?`);
        for (const target of targetList) {
          stmt.run(target.id);
        }
      })();

      return { data: targets, error: null };
    }

    throw new Error(`Unsupported database operation: ${operation}`);
  } catch (err: any) {
    console.error(`[Database Error] table "${tableName}" operation "${operation}":`, err);
    return { data: null, error: { message: err.message || String(err) } };
  }
}
