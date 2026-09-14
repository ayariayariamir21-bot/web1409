# Digital Store

A frontend-only digital product marketplace built with React, TypeScript, Vite, Tailwind CSS and Wouter. The experience is powered entirely by realistic mock data and client-side state; no backend, real API, authentication server or payment gateway is required.

## Run locally

```bash
npm install
npm run dev
```

The project is also ready for a production build:

```bash
npm run check
npm run build
```

## Configuration

Copy `.env.example` to `.env` for local development. Server settings are
typed in `server/config.ts` and fail fast in production when required
variables are missing. Full reference: `docs/configuration.md`.

## Folder structure

```text
client/
  index.html
  src/
    App.tsx          # Application shell, routing, pages and reusable UI
    data.ts          # 44 mock products, categories and testimonials
    index.css        # Design system, typography, tokens and motion
    main.tsx         # React entry point
    components/      # Scaffolded shadcn/ui primitives
    contexts/        # Scaffolded theme context
    hooks/           # Scaffolded shared hooks
    lib/             # Shared utilities
server/              # Template compatibility placeholder (not used by the frontend)
shared/              # Template compatibility placeholder
```

## Included routes

- `/` — editorial home page with hero, category grid, featured products and testimonials
- `/shop` — searchable, filterable and sortable product catalogue with grid/list toggle
- `/shop/:category` — category-specific catalogue views
- `/product/:id` — product detail pages with gallery, ratings, tabs, related products and type-specific actions
- `/kids` — playful Kids Room with age filters
- `/courses` — Student Courses with level filters and course cards
- `/course/:id` — fake video player, curriculum accordion behavior, progress and notes actions
- `/cart` — persistent cart with quantity controls, promo code `DIGITAL10` and summary
- `/checkout` — multi-step mock checkout that adds purchases to the library
- `/library` — purchased/free items with download or continue actions
- `/wishlist` — saved product collection
- `/login`, `/register` — validation-ready mock authentication forms
- `/about`, `/contact` — static editorial and contact pages
- `/404` — custom not-found page

## Client-side behavior

Cart, wishlist, library and theme preference persist in `localStorage`. Open Source items are free and skip the cart. Product search is live, sorting supports featured/popular/rating/price orders, and toast feedback is provided for actions throughout the interface.

The selected visual direction is an editorial marketplace: Space Grotesk for display typography, DM Sans for interface copy, a deep indigo brand color, warm ivory surfaces, lime highlights and soft card depth. Images use remote Unsplash placeholders so no large local media assets are bundled into the project.
