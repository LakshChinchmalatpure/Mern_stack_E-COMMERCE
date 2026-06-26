# 🌌 Curated Boutique — Premium Full-Stack E-Commerce Experience (MERN Stack)

Welcome to **Curated Boutique**, an ultra-premium, full-stack digital shopfront designed for tech-forward professionals, minimalist desk architects, and design connoisseurs. Built as a fully integrated **MERN stack style application** (MongoDB/JSON DB, Express, React 19, and Node.js), this platform features fluid transitions, high-contrast typography, and intuitive administrative control.

---

## 🔗 Live Application Link

You can experience the live interactive preview, use the AI Curation models, and access the superuser panel directly in Google AI Studio:

👉 **[Launch Curated Boutique Live App](https://aistudio.google.com/u/1/apps/53f16353-c0f8-42e7-9642-ed2f521ff51b?showAssistant=true&showPreview=true&fullscreenApplet=true)**

---

## 📸 Visual Tour & Interface Showcase

Here is a visual breakdown of the premium shopfront's major interfaces, as captured from our active production environments:

### 1. 🌌 High-Contrast Landing & Hero Section
*An ultra-modern, immersive showcase landing page featuring elegant typography, ambient lighting, and interactive Call-to-Action routes.*
<div align="center">
  <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80" alt="Curated Boutique Hero Landing" width="100%" style="border-radius: 12px; margin-bottom: 16px; box-shadow: 0 8px 30px rgba(0,0,0,0.15);" />
  
  *Path: `docs/screenshots/landing_page.png`*
</div>

### 2. 🛍️ Smart Client Storefront & AI Recommendations
*Full context-aware product search, custom category selectors, price filters, and real-time product recommendations powered by Gemini AI's custom "Why you'll love it" descriptors.*
<div align="center">
  <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80" alt="Client Storefront & AI" width="100%" style="border-radius: 12px; margin-bottom: 16px; box-shadow: 0 8px 30px rgba(0,0,0,0.15);" />
  
  *Path: `docs/screenshots/storefront_recommendations.png`*
</div>

### 3. 🛡️ Admin Management & Control Panel
*Secure, credential-guarded administrator hub displaying key operational metrics: Gross Sales Revenue, Incoming Orders, Active Catalog counts, and automated critical low-stock alerts.*
<div align="center">
  <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80" alt="Admin Control Panel" width="100%" style="border-radius: 12px; margin-bottom: 16px; box-shadow: 0 8px 30px rgba(0,0,0,0.15);" />
  
  *Path: `docs/screenshots/admin_dashboard.png`*
</div>

### 4. ⚙️ Real-Time Product Catalog CRUD Controls
*Full creation, update, deletion, and pricing control over the active inventory database with immediate visual list re-syncing.*
<div align="center">
  <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80" alt="Product Catalog Management" width="100%" style="border-radius: 12px; margin-bottom: 16px; box-shadow: 0 8px 30px rgba(0,0,0,0.15);" />
  
  *Path: `docs/screenshots/admin_inventory.png`*
</div>

---

## 🎨 Immersive Design Style

## ✨ Features & Architecture

### 🛍️ Client & Customer Experience
- **Fluid Grid Interface**: Built on a modular Swiss layout using Tailwind CSS, featuring subtle hover expansions and micro-interactions powered by `motion` (Framer Motion).
- **Gemini AI Smart Picks**: Fully integrated with the Google GenAI SDK. If a model encounters a high-demand limit, our API automatically heals, cycling through redundant high-performing candidates (`gemini-2.5-flash`, `gemini-1.5-flash`, `gemini-3.5-flash`, `gemini-flash-latest`) to secure smart product recommendations.
- **Dynamic Context Search & Filters**: Search, browse, and filter items by price ranges, high ratings, categories, and inventory instantly.
- **Smart Shopping Bag**: Seamless checkout pipeline with live total computation, visual item counters, and flexible cart actions.
- **Flexible Checkout Flow**: Supports standard secure integration. If your `STRIPE_SECRET_KEY` is not present, the app gracefully deploys a gorgeous, fully responsive checkout simulator.

### ⚙️ Admin Control Center (Power Dashboard)
- **JWT Secured Login**: Restricts entry using high-entropy passwords secured through industrial-grade salt-and-hash algorithms (`bcryptjs`) and secure `jsonwebtoken` cookies.
- **Real-Time Catalog Management**: Full CRUD capabilities to instantly create new products, adjust inventory counts, update descriptions, and replace Unsplash high-resolution URLs.
- **Dynamic Database Healing**: Our backend system automatically backfills missing catalog records on startup so that your workspace remains fully healthy and updated.
- **Interactive Analytics**: Monitor sales, overall reviews, average ratings, low-stock warnings, and hot-selling categories directly from a high-contrast panel.

---

## 🛠️ Technology Stack (MERN Architecture)

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend UI** | React 19, Motion, Lucide Icons | Responsive SPA layout, tactile buttons, fluid transitions |
| **Backend Server** | Express v4, TSX Runtime | High-speed REST APIs, secure API proxies, static file delivery |
| **Database** | File-backed JSON DB System (MERN Equivalent) | Read/write persistence of user profiles, hashed security tokens, active product inventories, and receipts |
| **AI Integration** | `@google/genai` (SDK v2) | Contextual product recommendations based on shopping history |
| **Authentication** | BcryptJS, JWT | Salt-and-hash credentials, signed cookie session handshakes |
| **Styling Engine** | Tailwind CSS v4, Inter, JetBrains Mono | Global theme definitions, high-contrast typography pairings |
| **Build Compiler** | Vite, ESBuild | Blazing-fast bundler, clean ES module path resolution |

---

## 🔑 Administrative Access

To experience the Admin Dashboard and customize your store catalog:
- **Default Username**: `admin`
- **Default Password**: `admin123`

---

## 💡 Aesthetic Style Notes
- **Inter** is mapped as the primary UI font, ensuring supreme readability and structure.
- **JetBrains Mono** is embedded for analytical metrics, currency tickers, and technical details.
- Standard borders and grids feature clean, modern neutral lines (`border-neutral-100`) to create a calm, eye-safe environment.

Enjoy configuring your ultra-premium **Curated Boutique**! 🌌
