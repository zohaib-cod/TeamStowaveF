# 🚀 Team Stowave (Frontend)

<div align="center">

<img src="./public/stowave-logo-transparent.png" alt="Stowave Logo" width="220" />

### *Next-Gen Team Operations, Intelligence & Collaboration Platform*

[![Next.js](https://img.shields.io/badge/Next.js-16.4.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3.0-61dafb?style=for-the-badge&logo=react)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ecf8e?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](#license)

</div>

---

## 📌 Overview

**Team Stowave** is an enterprise-grade, high-performance team operations suite designed to unify task tracking, asynchronous daily standups, peer recognition, feedback surveys, and automation intelligence into a cohesive, beautifully engineered workspace.

Built with **Next.js 16 (App Router)** and **React 19**, the frontend delivers an ultra-responsive, accessible, and fluid user experience backed by **Supabase** for real-time data persistence and authentication.

---

## ✨ Core Features & Modules

| Module | Route | Highlights |
| :--- | :--- | :--- |
| **📊 Executive Dashboard** | `/` | Real-time workspace stats, active announcements, team velocity metrics, urgent deliverables, and quick workflow launchers. |
| **📋 Kanban Task Board** | `/tasks` | Multi-stage task lifecycle management (Backlog, In Progress, Review, Completed), priority tagging, assignee attribution, and interactive task modals. |
| **👥 Team Directory** | `/team` | Complete member roster with department filters, online presence badges, role indicators, and contact pathways. |
| **⏱️ Asynchronous Standups** | `/standups` | Structured daily standup submissions, blocker alerts, accomplishment logs, and productivity analytics. |
| **🏆 Recognition & Rewards** | `/recognition` | Peer-to-peer appreciation feed, customizable badge gifting, celebratory confetti animations (`canvas-confetti`), and reward point tracking. |
| **📝 Feedback & Pulse Surveys** | `/surveys` | Interactive employee sentiment surveys, question builders, anonymous responses, and satisfaction visualizations. |
| **📡 Social Command Center** | `/social` | Unified communication hub for team-wide announcements, channel interactions, and social feeds. |
| **🤖 Apify Intelligence Engine** | `/apify` | Lead extraction pipelines, competitor tracking, and automated web scrapers integrated directly into the workspace. |
| **💬 Embedded AI Assistant** | Drawer | Slide-over AI assistant drawer providing instant context summaries, task drafting, and operational guidance. |
| **🎯 Interactive Tour** | Global | Guided onboarding tour to help new team members familiarize themselves with Stowave's feature set. |

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server & Client Components)
- **UI Library**: [React 19](https://react.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Styling**: Modern Modular & Vanilla CSS with CSS Variables and Glassmorphism
- **Animations & Delight**: [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
- **Database & Auth**: [Supabase](https://supabase.com/) (`@supabase/ssr` & `@supabase/supabase-js`)
- **API Proxy**: Built-in Next.js rewrites proxying requests seamlessly to the Stowave backend service (`http://localhost:5001/api/*`)

---

## 📂 Project Architecture

```plaintext
frontend/
├── app/                          # Next.js App Router root
│   ├── apify/page.js             # Apify Intelligence & web scraping center
│   ├── recognition/page.js       # Peer recognition, kudos, and gifting
│   ├── settings/page.js          # Workspace & user preferences
│   ├── social/page.js            # Social command center
│   ├── standups/page.js          # Asynchronous standup submissions
│   ├── surveys/page.js           # Feedback surveys and pulse checks
│   ├── tasks/page.js             # Kanban task board view
│   ├── team/page.js              # Member directory & role management
│   ├── todos/page.tsx            # Supabase Realtime demo page
│   ├── globals.css               # Design system tokens and global styles
│   ├── layout.js                 # Global HTML shell & metadata
│   └── page.js                   # Executive Dashboard overview
├── components/                   # Reusable modular UI components
│   ├── AiAssistantDrawer.jsx     # Slide-over AI copilot
│   ├── ApifyIntelligence.jsx     # Automation & scraping interface
│   ├── CreateSurveyModal.jsx     # Modal for composing team surveys
│   ├── CreateTaskModal.jsx       # Modal for creating new tasks
│   ├── DashboardOverview.jsx     # Main overview widgets & charts
│   ├── FeedbackSurveys.jsx       # Pulse surveys engine
│   ├── InteractiveTour.jsx       # User walkthrough tour
│   ├── MainLayout.jsx            # Shared sidebar & navigation layout
│   ├── Navbar.jsx                # Top bar with notifications & profile
│   ├── RecognitionGifts.jsx      # Kudos & reward points system
│   ├── ReportsView.jsx           # Standup reports & work logs
│   ├── SocialCommandCenter.jsx   # Team engagement hub
│   ├── SupabaseTodosClient.tsx   # Supabase client-side realtime component
│   └── TaskBoard.jsx             # Drag & filter Kanban board
├── public/                       # Logos, brand assets, and icons
├── utils/                        # Utility modules
│   └── supabase/                 # Client, server, and middleware Supabase SDK
├── next.config.mjs               # Next.js configuration & API proxy rewrites
└── package.json                  # Dependencies and execution scripts
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: `v18.18.0` or higher (Node 20+ recommended)
- **Package Manager**: `npm`, `yarn`, `pnpm`, or `bun`

### 2. Clone the Repository

```bash
git clone https://github.com/zohaib-cod/TeamStowaveF.git
cd TeamStowaveF
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory (you can copy `.env.example`):

```bash
cp .env.example .env.local
```

Populate the required credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
NEXT_PUBLIC_SUPABASE_PROJECT_REF=your-project-ref
```

### 5. Launch the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser to view the application.

> **💡 Note on Backend API**: The frontend is pre-configured in `next.config.mjs` to proxy `/api/*` requests to the Stowave backend running locally on port `5001`. Ensure the backend service is running concurrently for full functionality.

---

## 📜 Available Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts the Next.js development server with Turbopack / Fast Refresh |
| `npm run build` | Compiles and optimizes the production build |
| `npm run start` | Boots the compiled Next.js production server |
| `npm run lint` | Runs ESLint checks across the codebase |

---

## 🔒 Security & Best Practices

- **Strict Environment Isolation**: All database connection strings and sensitive service tokens are excluded from version control via `.gitignore`.
- **Supabase SSR Compliance**: Supabase client initialization conforms to modern Server-Side Rendering (SSR) cookie guidelines using `@supabase/ssr`.
- **Component Hygiene**: Client components explicitly declare `'use client'` while retaining lightweight modular architecture.

---

## 🤝 Contributing

Contributions, feedback, and feature requests are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

<div align="center">
  <sub>Built with ❤️ by the Stowave Team</sub>
</div>
