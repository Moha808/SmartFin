# NovaTrade Markets — Broker Website Implementation Plan

## Overview

Build a premium, high-converting broker website for **NovaTrade Markets** — a financial trading company. The site will rival top-tier brokers like Exness, Binance, Deriv, and Octa in visual quality, trustworthiness, and UX.

**Tech Stack:**
- **Framework:** React 18+ with TypeScript (Vite)
- **Styling:** TailwindCSS v4 + custom CSS for glassmorphism
- **Animations:** Framer Motion (motion/react)
- **Routing:** React Router v7
- **Charts:** Lightweight Charts (TradingView) + Recharts
- **Icons:** Lucide React
- **Fonts:** Inter, Poppins, Sora (Google Fonts)
- **Backend-ready:** Firebase (Auth + Firestore + Storage) — structure only, wired up in Phase 2

**Color Palette:**
| Token | Hex |
|-------|-----|
| `bg-primary` | `#0A0F1C` |
| `bg-secondary` | `#121B2B` |
| `accent-green` | `#00C896` |
| `accent-blue` | `#1E90FF` |
| `text-primary` | `#FFFFFF` |
| `text-secondary` | `#94A3B8` |

---

## Proposed Changes

### Phase 1 — Project Scaffolding & Design System

#### [NEW] Project initialization
- Create Vite React-TS project
- Install dependencies: `tailwindcss @tailwindcss/vite framer-motion react-router-dom lucide-react recharts lightweight-charts firebase`
- Configure TailwindCSS v4 with custom theme tokens
- Set up Google Fonts (Inter, Poppins, Sora)

#### [NEW] `src/index.css`
- TailwindCSS import + custom CSS variables for the color palette
- Glassmorphism utility classes
- Custom scrollbar styling
- Dark/light mode CSS variables
- Animation keyframes (glow, pulse, float, ticker scroll)

#### [NEW] `tailwind.config.ts` (if needed by v4)
- Extend theme with custom colors, fonts, spacing

#### [NEW] `src/App.tsx`
- React Router setup with all routes
- Layout wrapper with Navbar + Footer
- Dark/light mode context provider
- Cookie consent popup

---

### Phase 2 — Shared Components (`src/components/`)

#### [NEW] Layout Components
| File | Purpose |
|------|---------|
| `Navbar.tsx` | Sticky nav with logo, links, search, language dropdown, dark/light toggle, notification bell, auth buttons, responsive hamburger menu |
| `Footer.tsx` | Multi-column footer with quick links, social media icons, newsletter signup, legal links |
| `Sidebar.tsx` | Responsive sidebar for dashboard/admin pages |
| `DashboardLayout.tsx` | Layout wrapper for authenticated dashboard pages |
| `AdminLayout.tsx` | Layout wrapper for admin panel pages |

#### [NEW] UI Components
| File | Purpose |
|------|---------|
| `Button.tsx` | Reusable button with variants (primary, secondary, outline, ghost) |
| `Card.tsx` | Glass card component with hover effects |
| `AnimatedCounter.tsx` | Smooth number counter animation (for statistics) |
| `MarketTicker.tsx` | Horizontal scrolling live market ticker (BTC/USD, EUR/USD, Gold, NASDAQ) |
| `TestimonialCarousel.tsx` | Auto-playing testimonial slider |
| `FAQAccordion.tsx` | Expandable FAQ items |
| `TradingChart.tsx` | TradingView Lightweight Charts wrapper |
| `CandlestickChart.tsx` | Candlestick chart component |
| `MiniChart.tsx` | Small inline chart for market cards |
| `ProgressBar.tsx` | Animated progress bar |
| `Table.tsx` | Styled data table component |
| `Modal.tsx` | Reusable modal/dialog |
| `Input.tsx` | Form input with validation states |
| `SearchBar.tsx` | Global search component |
| `LanguageDropdown.tsx` | Multi-language selector |
| `NotificationDropdown.tsx` | Notification bell with dropdown panel |
| `CookieConsent.tsx` | GDPR cookie consent popup |
| `LoadingSpinner.tsx` | Loading animation component |
| `ScrollReveal.tsx` | Wrapper for scroll-triggered animations |
| `SectionHeading.tsx` | Consistent section title component |
| `StatCard.tsx` | Statistics card with animated counter |
| `MarketCard.tsx` | Trading pair card with mini chart |
| `PlatformShowcase.tsx` | Trading platform preview component |

---

### Phase 3 — Public Pages

#### [NEW] `src/pages/Home.tsx`
**Sections:**
1. **Hero** — Full-width gradient hero with headline "Trade Forex, Crypto & Stocks with Confidence", two CTA buttons ("Start Trading" green, "Open Demo Account" blue outline), animated trading dashboard mockup on the right
2. **Market Ticker** — Horizontal scrolling bar showing BTC/USD, EUR/USD, Gold, NASDAQ with live-style prices and % change
3. **Why Choose Us** — 4-card grid: Low Spreads, Fast Execution, 24/7 Support, Regulated Broker — each with icon, title, description
4. **Statistics** — Animated counters: 2M+ Active Traders, $5B+ Daily Volume, 150+ Countries
5. **Trading Platform Showcase** — Split section with platform screenshots/mockup + feature bullets
6. **Markets Overview** — Cards for Forex, Crypto, Commodities, Indices, Stocks
7. **Testimonials** — Carousel with trader reviews
8. **FAQ** — Accordion section
9. **CTA Banner** — "Ready to Start Trading?" with registration button

#### [NEW] `src/pages/About.tsx`
- Company overview with mission/vision cards
- Team section with avatar cards (generated images)
- Global presence map placeholder
- Licenses & regulations badges
- Company timeline/history

#### [NEW] `src/pages/Markets.tsx`
- Category tabs/filter (Forex, Crypto, Commodities, Indices, Stocks)
- Market cards with icon, description, spread info, mini chart, trade button
- Detailed spread comparison table

#### [NEW] `src/pages/TradingPlatform.tsx`
- Full trading dashboard preview with:
  - Candlestick chart (TradingView Lightweight Charts)
  - Buy/Sell panel
  - Market watch sidebar
  - Portfolio overview
  - Open positions table
- Mobile app showcase section
- Platform features grid
- Download CTA buttons

#### [NEW] `src/pages/Education.tsx`
- Trading tutorials cards
- Beginner/Intermediate/Advanced tabs
- Video section placeholders (thumbnail cards)
- Market news cards
- Trading strategies section

#### [NEW] `src/pages/Contact.tsx`
- Contact form (name, email, subject, message)
- Office locations with cards
- Interactive map placeholder (styled div)
- Email, phone, address info
- Live chat floating button

---

### Phase 4 — Authentication Pages

#### [NEW] `src/pages/Login.tsx`
- Modern dark login card with glassmorphism
- Email + password fields with validation
- Password visibility toggle
- "Remember me" checkbox
- Social login buttons (Google, Apple)
- "Forgot password?" link
- reCAPTCHA placeholder
- Link to signup

#### [NEW] `src/pages/Signup.tsx`
- Registration form: Full name, email, password, confirm password, phone
- Terms & conditions checkbox
- Social signup buttons
- Password strength indicator
- reCAPTCHA placeholder

#### [NEW] `src/pages/ForgotPassword.tsx`
- Email input for password reset
- Success state UI

#### [NEW] `src/pages/OTPVerification.tsx`
- 6-digit OTP input fields
- Resend OTP timer
- Verification success state

---

### Phase 5 — User Dashboard

#### [NEW] `src/pages/dashboard/Dashboard.tsx`
- Wallet balance cards (Total Balance, Available, In Trade)
- Profit/loss statistics with chart
- Quick action buttons (Deposit, Withdraw, Trade)
- Recent trades table
- Trading chart (Lightweight Charts)
- Notifications panel

#### [NEW] `src/pages/dashboard/DepositWithdraw.tsx`
- Payment method selection (Bank, Crypto, Card)
- Deposit form with amount input
- Withdrawal form with amount + wallet/bank details
- Transaction history table
- Success/error notification toasts

#### [NEW] `src/pages/dashboard/Profile.tsx`
- Profile information form
- KYC verification upload section (ID, Proof of Address)
- Security settings (2FA, password change)
- Notification preferences

#### [NEW] `src/pages/dashboard/Transactions.tsx`
- Full transaction history table with filters
- Export functionality placeholder

#### [NEW] `src/pages/dashboard/TradingView.tsx`
- Full trading interface
- Candlestick chart
- Order book
- Buy/Sell panel
- Open positions

---

### Phase 6 — Admin Panel

#### [NEW] `src/pages/admin/AdminDashboard.tsx`
- Overview cards (Total Users, Deposits Today, Withdrawals, Active Trades)
- Analytics charts (Recharts)
- Recent activity feed

#### [NEW] `src/pages/admin/UserManagement.tsx`
- Users table with search/filter
- User details modal
- Enable/disable user actions

#### [NEW] `src/pages/admin/DepositApproval.tsx`
- Pending deposits table
- Approve/reject actions
- Transaction details modal

#### [NEW] `src/pages/admin/WithdrawalApproval.tsx`
- Pending withdrawals table
- Approve/reject actions

#### [NEW] `src/pages/admin/KYCManagement.tsx`
- KYC submissions table
- Document preview
- Approve/reject actions

#### [NEW] `src/pages/admin/SupportTickets.tsx`
- Tickets table with status filters
- Ticket detail view with reply form

#### [NEW] `src/pages/admin/Analytics.tsx`
- Trading volume charts
- User growth charts
- Revenue analytics
- Geographic distribution

---

### Phase 7 — Advanced Features & Polish

#### [NEW] `src/context/ThemeContext.tsx`
- Dark/light mode toggle with localStorage persistence

#### [NEW] `src/context/AuthContext.tsx`
- Firebase auth state management (structure only)

#### [NEW] `src/hooks/useScrollReveal.ts`
- Intersection Observer hook for scroll animations

#### [NEW] `src/hooks/useAnimatedCounter.ts`
- Animated number counting hook

#### [NEW] `src/utils/constants.ts`
- Market data, navigation links, social links, FAQ data

#### [NEW] `src/utils/formatters.ts`
- Currency, number, date formatting utilities

#### [NEW] Firebase configuration
- `src/config/firebase.ts` — Firebase app initialization

---

## Project Structure

```
src/
├── assets/              # Images, icons, generated assets
├── components/
│   ├── layout/          # Navbar, Footer, Sidebar, DashboardLayout, AdminLayout
│   ├── ui/              # Button, Card, Input, Modal, Table, ProgressBar
│   ├── trading/         # TradingChart, CandlestickChart, MiniChart, MarketTicker
│   ├── home/            # Hero, WhyChooseUs, Statistics, Testimonials, FAQ
│   └── shared/          # ScrollReveal, AnimatedCounter, LoadingSpinner, CookieConsent
├── context/             # ThemeContext, AuthContext
├── hooks/               # Custom hooks
├── pages/
│   ├── Home.tsx
│   ├── About.tsx
│   ├── Markets.tsx
│   ├── TradingPlatform.tsx
│   ├── Education.tsx
│   ├── Contact.tsx
│   ├── Login.tsx
│   ├── Signup.tsx
│   ├── ForgotPassword.tsx
│   ├── OTPVerification.tsx
│   ├── dashboard/       # Dashboard, DepositWithdraw, Profile, Transactions, TradingView
│   └── admin/           # AdminDashboard, UserManagement, DepositApproval, etc.
├── utils/               # Constants, formatters, helpers
├── config/              # Firebase config
├── App.tsx
├── main.tsx
└── index.css
```

---

## Execution Order

Given the massive scope, I'll build in this priority order:

| Priority | Phase | Est. Components |
|----------|-------|-----------------|
| 🔴 1 | Scaffolding + Design System | ~5 files |
| 🔴 2 | Shared UI Components | ~20 files |
| 🔴 3 | Home Page (hero showcase) | ~8 sections |
| 🟡 4 | About, Markets, Platform, Education, Contact | ~5 pages |
| 🟡 5 | Auth Pages (Login, Signup, Forgot, OTP) | ~4 pages |
| 🟢 6 | User Dashboard | ~5 pages |
| 🟢 7 | Admin Panel | ~7 pages |
| 🟢 8 | Advanced features & polish | ~8 files |

> [!IMPORTANT]
> This is a very large project (~60+ files). I'll build it systematically, starting with the foundation and core pages, then expanding to dashboard and admin. Each phase will produce working, visually stunning results.

---

## Open Questions

> [!IMPORTANT]
> **Firebase Setup:** Should I set up actual Firebase authentication and Firestore now, or just create the structure/config files ready for backend integration later?

> [!NOTE]
> **Image Assets:** I'll generate key images (hero trading dashboard mockup, team member avatars, platform screenshots) using the image generation tool to avoid placeholders.

> [!NOTE]
> **TailwindCSS Version:** I'll use TailwindCSS v4 with the `@tailwindcss/vite` plugin (latest recommended approach). This uses `@import "tailwindcss"` instead of the older `@tailwind` directives.

---

## Verification Plan

### Automated Tests
- Run `npm run build` to verify no TypeScript/build errors
- Run `npm run dev` and test in browser

### Browser Testing
- Navigate through all pages and verify:
  - Responsive design at desktop (1440px), tablet (768px), mobile (375px)
  - Dark/light mode toggle
  - All animations render smoothly
  - Navigation works correctly
  - Forms have proper validation
  - Charts render properly
  - All interactive elements are functional

### Visual Verification
- Capture screenshots of key pages
- Verify premium look-and-feel matches the design spec
- Check color palette consistency
- Verify typography hierarchy
