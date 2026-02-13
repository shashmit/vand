# ROVY

**The Ultimate Companion needed for the Modern Nomad.**

Rovy is a comprehensive social and utility platform designed specifically for
the **van-life community, vehicle dwellers, and digital nomads**. It connects
travelers on the road, helps them find essential services, and fosters a vibrant
community of like-minded explorers.

---

## 🚀 Key Features

### 🤝 Community & Connections

- **Co-Pilot Finder**: A matching feature to find travel buddies, partners, or
  friends. Filter by identity, relationship style, and travel preferences.
- **Vehicle Builds**: Showcase your rig conversion! Share photos and details of
  your setup, from solar systems to custom carpentry, and get inspired by
  others.
- **Events & Meetups**: Discover, host, and pin events happening near you. Never
  miss a gathering or workshop on the road.

### 🛠️ Road Utilities & Services

- **Garage Pros**: A directory of verified professionals specialized in vehicle
  conversions and maintenance. Find experts in:
  - Solar & Electrical
  - carpentry & Custom Builds
  - Mechanics & Repairs
- **Road News**: Stay updated with community-sourced alerts on traffic, road
  conditions, and important travel advisories.

### 📍 Location Intelligence

- **Interactive Map**: Visualize nearby users, events, and service providers.
- **Location Privacy**: Control your visibility while staying connected with the
  community.

---

## 🏗️ Tech Stack

### Mobile Frontend (`rovy_frontend`)

Built with **React Native** and **Expo**, ensuring a smooth cross-platform
experience (iOS & Android).

- **Framework**: [Expo SDK 54](https://expo.dev)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/)
  (with file-based routing)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/)
- **Data Fetching/Auth**:
  [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/) +
  [Zod](https://zod.dev/)
- **UI & Styling**:
  - `@expo/ui` & `react-native-svg`
  - `lucide-react-native` for icons
  - `react-native-reanimated` for smooth animations

### Backend API (`rovy_backend`)

A high-performance backend power by **Bun**.

- **Runtime**: [Bun](https://bun.sh/)
- **Framework**: [Hono](https://hono.dev/) (Fast, lightweight web framework)
- **Database ORM**: [Prisma](https://www.prisma.io/)
- **Database**: PostgreSQL (hosted on Supabase)
- **Validation**: Zod + Hono Validator

### Infrastructure

- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (for user avatars, rig photos)
- **Database Hosting**: Supabase

---

## 📂 Project Structure

```bash
.
├── rovy_frontend/      # Mobile application source code (Expo/React Native)
│   ├── app/            # Expo Router screens and layouts
│   ├── src/            # Reusable components, hooks, and utilities
│   └── ...
├── rovy_backend/       # Backend API source code
│   ├── src/            # API routes and controllers (Hono)
│   ├── prisma/         # Database schema and migrations
│   └── ...
└── supabase/           # Supabase configuration (if applicable)
```

---

## ⚡ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+)
- [Bun](https://bun.sh/) (for backend)
- [Expo Go](https://expo.dev/client) app on your mobile device (or iOS
  Simulator/Android Emulator)

### 1. Setup Backend

Navigate to the backend directory and install dependencies:

```bash
cd rovy_backend
bun install
```

Start the development server:

```bash
bun run dev
```

### 2. Setup Frontend

Navigate to the frontend directory and install dependencies:

```bash
cd rovy_frontend
npm install
# or
yarn install
```

Start the Expo development server:

```bash
npx expo start
```

Scan the QR code with Expo Go or press `i` to run on iOS Simulator.

---

## 📝 License

This project is private and proprietary.
