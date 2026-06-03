# 🌟 Hikari: Premium Manga, Manhwa, and Novel Platform

Hikari is a cutting-edge, high-fidelity, and pixel-perfect full-stack web application designed for reading manga, manhwa, and light novels. Operating on a smooth, immersive user interface with a real-time coin-based micro-economy, beautiful interactive readers, and administrative management portals, Hikari bridges the gap between premium content, rich visual aesthetics, and robust performance.

This project is fully **Open Source** and is built on a responsive desktop-first design with complete full-stack integration.

---

## ✨ Outstanding Features

### 📖 Immersive Content Readers
*   **Manga & Manhwa Mode**: Smooth vertical-scroll webtoon or page-by-page rendering options, high-speed image optimization, and full-screen reading experiences.
*   **Novel Mode**: Custom background styles (sepia, dark, cream), adjustable font sizing, line-spacing configuration, and immersive reading progress retention.
*   **Progress Tracking**: Automatic, client-side, and cloud-synchronized bookmarking that lets users pick up exactly where they left off.

### 🪙 Integrated Digital Economy (Coins & Wallet)
*   **Wallet Module**: A fully responsive virtual wallet showing credit balance, bonus points, and continuous transaction histories.
*   **Chapter Unlocking**: Secure, server-verified paywall mechanics with real-time coin reductions to unlock restricted premium chapters.
*   **PayPal Gateway Option**: Modular payment integrations to instantly top up coins using customizable coin packages.

### 🎭 Beautiful Profile Hub
*   **Live Multi-Tab Workspace**: Switch flawlessly between **Reading History**, **Interactive Favorites Carousel**, and the **Digital Wallet**.
*   **High-Fidelity Layout**: Designed on a premium Cosmic Slate theme utilizing generous negative space, high-contrast borders, and dynamic motion transitions.
*   **Instant Portrait Upload**: Complete with an active drag-or-select uploading engine storing pictures with persistent cloud-ready endpoints.

### 🛡️ Premium Administration Terminal
*   **Interactive Users Dashboard**: Quick search filters, role switching, user banning, and live database synchronizations.
*   **Intuitive Wallet Adjustments**: Administrators can grant relative custom coins (e.g., promotional allowances or compensation) or set absolute credit amounts directly.
*   **Content Seeding & Live Control**: Maintain chapters, edit page orderings, and manage comic structures through optimized databases.

---

## 🛠️ Built With (Tech Stack)

*   **Frontend**: React 18+ paired with **TypeScript** for absolute type safety.
*   **Animations**: Fluid transition states powered by `motion` (imported from `motion/react`).
*   **Styling**: High-craft utility utility classes via **Tailwind CSS** following strict visual consistency and gorgeous subtle dark background gradients.
*   **Control Vector Icons**: Pristine typography-driven layouts strictly importing SVG vector representations from `lucide-react`.
*   **Persistent Database Routing**: Flexible, highly performant SQLite query engines (`server-db.ts` utilizing Turso / LibSQL client interfaces).

---

## 🌎 Open Source

This project is proudly **Open Source**! 
Contributions, suggestions, and customization forks are highly welcome. Hikari is distributed under the MIT License, which grants everyone the ultimate freedom to modify, scale, host, and leverage the platform for personal hobbies, customized fan scanlations, or publishing startups.

---

## 🚀 Quick Local Development Setup

To get up and running locally, simple execute the standard commands inside your workspace terminal:

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Variables**:
    Create `.env` file based on `.env.example`:
    ```env
    PORT=3000
    # Any additional external provider keys...
    ```

3.  **Boot Up Dev Environment**:
    ```bash
    npm run dev
    ```
    Your full-stack container services will immediately run on host `0.0.0.0` port `3000`.

4.  **Production Compile**:
    ```bash
    npm run build
    npm start
    ```
