# Backend Baseline — web1409 (read-only inventory)

> Analysis only. No business feature created, no technology replaced, no app file modified to produce this document.

## 0. Baseline identity

- Git hash: `6b710149f1aa274686bc6ea88e05d6e913e05aa6`
- Git branch: `main` (clean except untracked `docs/` created by this baseline; `git status --short` showed no modified tracked files at inspection time)
- Date of inspection: 2026-09-14 (UTC)
- Scope: `package.json`, `pnpm-lock.yaml` (presence + size only, not full content), `tsconfig*.json`, `vite.config.ts`, `README.md`, `template.json`, `client/src/App.tsx`, `client/src/data.ts`, `client/src/store/*`, `client/src/pages/*`, `client/src/pages/admin/*`, `server/index.ts`, `shared/*`, plus `.github`, `Dockerfile*`, `.env*`, `patches/`

## 1. Commands executed + results

| Command | Result |
|---|---|
| `git rev-parse HEAD` | `6b710149f1aa274686bc6ea88e05d6e913e05aa6` |
| `git status --short` | clean for tracked files (only untracked `docs/` after this file was staged for creation) |
| `node ./node_modules/.pnpm/typescript@5.6.3/node_modules/typescript/bin/tsc --noEmit` | exit `0`, no output |
| `node ./node_modules/.pnpm/vite@7.1.9_@types+node@24.7_61597552e415200265e44ff54b51c03e/node_modules/vite/bin/vite.js build` | success: `2643 modules transformed`; main `assets/index-xrrk_NAy.js 610.82 kB (gzip 171.04 kB)`; `Overview-DVSdJhBL.js 404.38 kB (gzip 110.64 kB)`; CSS `125.04 kB`; `index.html 367.37 kB (gzip 105.41 kB)`; `>500 kB` chunk-size warning |
| test script | BLOCKED — no `test` script in `package.json`; `vitest 2.1.4` is installed but no `*.test.*` / `*.spec.*` under `client/src` (only `node_modules` matches). Documented instead of running. |

Dependencies were already installed (`node_modules/` present). No install or env modification was performed.

## 2. Scripts (`package.json`)

- `dev`: `vite --host`
- `build`: `vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist`
- `start`: `NODE_ENV=production node dist/index.js`
- `preview`: `vite preview --host`
- `check`: `tsc --noEmit`
- `format`: `prettier --write .`
- Missing: `test`, `lint`, `typecheck` alias (only `check`), `db:*`, `seed`, `migrate`.

## 3. Versions (from `package.json`, `pnpm-lock.yaml` presence only)

- App: `digital-store-v2@1.0.0`, `type: module`, `license MIT`, `packageManager pnpm@10.4.1`
- Frontend: `react@19.2.1`, `react-dom@19.2.1`, `vite@7.1.7`, `typescript@5.6.3`, `tailwindcss@4.1.14`, `wouter@3.3.5` (patched `wouter@3.7.1` — see §10), `zustand@5.0.15`, `framer-motion@12.23.22`, `recharts@2.15.2`, `sonner@2.0.7`, `zod@4.1.12`, `react-hook-form@7.64.0`, Radix primitives, `axios@1.12.0` (no import found under `client/src`), `streamdown@1.4.0`, `next-themes@0.4.6`
- Backend runtime: `express@4.21.2`, `@types/express@4.17.21`, `@types/node@24.7.0`, `esbuild@0.25.0`, `tsx@4.19.1`
- Tooling: `@vitejs/plugin-react@5.0.4`, `@tailwindcss/vite@4.1.3`, `vite-plugin-manus-runtime@0.0.58`, `@builder.io/vite-plugin-jsx-loc@0.1.1`, `prettier@3.6.2`, `vitest@2.1.4`
- `pnpm-lock.yaml`: present in repo root (size/MTIME not recorded in this baseline; content not parsed). HYPOTHESIS (unlabeled use forbidden — marking as such): lockfile is assumed in sync because `tsc` + `vite build` succeed with installed `node_modules`.
- `pnpm` config: `patchedDependencies: wouter@3.7.1`, `overrides: tailwindcss>nanoid@3.3.7`.

## 4. TypeScript / Vite config

- `tsconfig.json`: `include: client/src/**/*, shared/**/*, server/**/*`; `exclude: node_modules, build, dist, **/*.test.ts`; `strict: true`; `noEmit: true`; `module: ESNext`; `moduleResolution: bundler`; `jsx: preserve`; `skipLibCheck: true`; `baseUrl: .`; `paths: @/* → ./client/src/*`, `@shared/* → ./shared/*`; `types: [node, vite/client]`.
- `tsconfig.node.json`: `include: [vite.config.ts]` only; `strict` + `noUnusedLocals` + `noUnusedParameters` + `noFallthroughCasesInSwitch`; `noEmit`.
- `vite.config.ts` (241 lines): plugins `react()`, `tailwindcss()`, `jsxLocPlugin()`, `vitePluginManusRuntime()`, `vitePluginManusDebugCollector()` (writes `.manus-logs/`, dev-only `transformIndexHtml` guard on `NODE_ENV=production`), `vitePluginStorageProxy()`; `resolve.alias @/@shared/@assets`; `envDir` repo root; `root: client/`; `build.outDir: dist/public, emptyOutDir: true`; `server: port 3000, strictPort false, host true`, `allowedHosts` includes `*.manus*.computer`, `localhost`, `127.0.0.1`; `fs.strict: true, deny: ["**/.*"]`.

## 5. Routes (`client/src/App.tsx`, wouter `Switch`, `AnimatedRoute` wrapper)

Public: `/`, `/shop`, `/shop/:category`, `/product/:id`, `/kids`, `/courses`, `/course/:id`, `/cart`, `/checkout`, `/checkout/success`, `/library`, `/wishlist`, `/login`, `/register`, `/about`, `/contact`, `/404` + fallback `NotFound`.
Admin (all except `/admin/login` wrapped in `<AdminGuard><AdminSuspense><AdminLayout>`): `/admin/login`, `/admin`, `/admin/products`, `/admin/products/new`, `/admin/products/:id/edit`, `/admin/orders`, `/admin/orders/:id`, `/admin/customers`, `/admin/customers/:id`, `/admin/downloads` (Placeholder), `/admin/reviews`, `/admin/coupons`, `/admin/analytics` (Placeholder), `/admin/payments` (Placeholder), `/admin/users` (Placeholder), `/admin/settings` (Placeholder).
Admin chunks are `React.lazy` + `Suspense` (`AdminLogin`, `AdminLayout`, `Overview`, `Products`, `ProductForm`, `Placeholder`, `Orders`, `OrderDetail`, `Customers`, `CustomerDetail`, `Coupons`, `Reviews`).

## 6. Stores (`client/src/store/*`, all Zustand + `persist`)

| Store | Persist key | Seed source | Mutations (from source grep) |
|---|---|---|---|
| `cartStore.ts` | `ds-cart-v2` (`items`, `appliedPromo`) | empty `[]` | `addItem` (blocks `isFree`/`open-source`/`price===0`), `removeItem`, `updateQty`, `clearCart`, `applyPromo` (via `validatePromoCode`), `removePromo`; selectors `useCartTotals`, `getCartTotals` (TAX 8%) |
| `wishlistStore.ts` | `ds-wishlist-v2` | `["sw-02","bk-04"]` | `toggle`, `has`, `add`, `remove`, `clear` |
| `libraryStore.ts` | `ds-library-v2` | `seedPurchases()` from `getProduct(["bk-01"])` + `(["co-08"])` | `addPurchase`, `hasPurchased`, `clear` |
| `productsStore.ts` | `ds-products-v1` | `seedProducts.map(p => ({...p, isActive ?? true}))` from `@/data` | `addProduct` (slugify + `genId` + picsum fallback), `updateProduct`, `deleteProduct` (no cascade — VERIFIED), `toggleActive`, `getProduct(id\|slug)`, `reset`; helper `getActiveProducts` (`isActive !== false`) |
| `ordersStore.ts` | `ds-orders-v1` | `generateMockOrders(products, 44)` or `([],44)` fallback | `updateStatus`, `refund` (status→`refunded` + timeline, no library touch), `resendDownload` (noop `() => {}`), `addNote`, `ensureSeed` |
| `customersStore.ts` | `ds-customers-v1` | `generateMockCustomers(orders)` | `toggleActive`, `ensureSeed` |
| `couponsStore.ts` | `ds-coupons-v1` | `DIGITAL10`/`KIDS20`/`FREE50` | `addCoupon`, `updateCoupon`, `deleteCoupon`, `toggleActive`, `incrementUse` (note: no call site found in `client/src` for `incrementUse` — dead mutation, VERIFIED by grep this session) |
| `reviewsStore.ts` | `ds-reviews-v1` | `generateMockReviews(products, 64)` or `([],64)` | `approve`, `reject`, `delete` (store method named `delete`), `reply` |

Types: store entity types mirror `Product` plus `isActive` (`AdminProduct`), `Order`/`OrderStatus` re-exported from `@/lib/mockOrders`, `Customer` from `@/lib/mockCustomers`, `Review` from `@/lib/mockReviews`, `Coupon` local.

## 7. Types (`client/src/data.ts`) + mocked data

- `ProductType`: `software | website | open-source | book | course | kids`.
- `Product`: `id, slug, title, type, category, price, oldPrice?, rating, reviewsCount, thumbnail, gallery[], description, features[], tags[], author, language, level?, ageRange?, pages?, duration?, lessons?, version?, stars?, forks?, license?, isFree, isFeatured?, createdAt, accent`. No `isActive` in `data.ts` (added only in `productsStore`).
- `products`: 44 items counted by `id: '` grep (`sw-*×7`, `web-*×5`, `os-*×6`, `bk-*×10`, `kd-*×8`, `co-*×8` per file comments). Thumbnails/galleries are `picsum.photos/seed/*` (remote, no local media).
- `categories` (6), `testimonials` (8), helpers `getProduct(id|slug)`, `getProductsByType`, `formatPrice` (`Free` if 0).
- `lib/mockOrders.ts`: `generateMockOrders(products, count=44)`, statuses `pending/paid/failed/refunded`, `paymentMethod card/paypal/apple-pay`, promo `DIGITAL10` 10% / `KIDS20` 15% (note: differs from `promoCodes` KIDS20 20% — inconsistency documented, not fixed).
- `lib/mockCustomers.ts`: derived from orders + 10 extras.
- `lib/mockReviews.ts`: 64 reviews, statuses `pending/approved/rejected`.
- `lib/promoCodes.ts`: static `PROMO_CODES` fallback + `couponToPromo()` reading `useCouponsStore.getState()` (active/dates/maxUses), `validatePromoCode`, `getEligibleSubtotal` (default lookup `getProduct` from `@/data`, NOT the store — VERIFIED `promoCodes.ts:88`), `calculateDiscount` (percent + `fixedValue` + `maxDiscount`).
- `lib/format.ts`: `Intl` currency/date, `formatOrderId DS-YYYY-XXXX` (`Math.random`), `generateLicenseKey`, `formatCardNumber`, `detectCardBrand`.
- `lib/motion.ts`: `useReducedMotion`; `lib/utils.ts`: `cn()`.

## 8. Admin mutations inventory (behavioral, from source)

- Products: create/edit/delete/toggleActive per §6; slug auto + unique check in `ProductForm`; `isActive=false` hides from public via `getActiveProducts` (Home/Shop/ProductDetail); delete has `ConfirmDialog`, no cascade to cart/wishlist/library (VERIFIED).
- Orders: status change, refund-to-`refunded`, resend download/receipt toasts only, mark-as-paid, internal note (`OrderDetail`). No library revocation on refund (matches `refund // marks refunded, restores nothing real`).
- Customers: block/unblock only; bulk block; CSV export is client-generated Blob (fake download); no delete mutation exists.
- Coupons: CRUD + toggle; modal uppercase/unique code; usage bar `usedCount/maxUses`; edits apply instantly at `/cart` because `validatePromoCode` reads the store (snapshot stored in cart afterwards — see §12 anomaly).
- Reviews: approve/reject/delete/reply; tabs Pending/Approved/Rejected/All; bulk approve/reject without confirm dialog (VERIFIED `Reviews.tsx:44-53`); sidebar amber badges for pending orders/reviews.
- Auth: `AdminLogin` hardcoded `admin@store.com / admin123` (source-verified), `localStorage ds-admin=true`, `AdminGuard` wouter `Redirect`; logout clears key.

## 9. Environment variables (names only, no values disclosed)

- `server/index.ts`: `NODE_ENV`, `PORT` (default 3000).
- `vite.config.ts`: `NODE_ENV` (dev-only HTML transform), `BUILT_IN_FORGE_API_URL`, `BUILT_IN_FORGE_API_KEY` (dev storage proxy only, server middleware).
- `client/index.html` (actual): no `%VITE_*%` references. NOTE: `template.json` (scaffold snapshot, not live config) shows placeholder `%VITE_ANALYTICS_ENDPOINT%` / `%VITE_ANALYTICS_WEBSITE_ID%` — historical template content, NOT active env requirements (labeled to avoid confusion).
- `.env*` files: none found in repo root (VERIFIED `Test-Path .env` false). `envDir` is repo root per `vite.config.ts`.

## 10. Tests + deployment files

- Tests: no `test` script; `vitest@2.1.4` installed; zero `*.test.*`/`*.spec.*` under `client/src` (VERIFIED); `tsconfig.json` excludes `**/*.test.ts`; `TESTING REQUIREMENTS` therefore documented as blocked (nothing to execute).
- Deployment: no `.github/` (VERIFIED false), no `Dockerfile*` (false), no `docker-compose`, no `fly`/`render`/`vercel`/`netlify`/`railway` configs found at root; `dist/` is committed build output (present); `server/index.ts` serves `dist/public` + SPA fallback `app.get("*")`; no `helmet`/`compression` middleware; `template.json: id web-static, capabilities [static]` confirms the scaffold was static-only.
- Patch: `patches/wouter@3.7.1.patch` (28 lines) appends `window.__WOUTER_ROUTES__` collection in `Switch`; wired via `package.json pnpm.patchedDependencies`; `overrides: tailwindcss>nanoid@3.3.7`.
- Prettier: `.prettierrc` exists; no ESLint config found (no `.eslintrc*` observed — labeled UNKNOWN/NOT VERIFIED whether lint is intentionally omitted; no `lint` script exists).

## 11. Relevant tree (abridged, VERIFIED via listing)

```text
web1409/
  package.json / pnpm-lock.yaml / tsconfig.json / tsconfig.node.json
  vite.config.ts / README.md / template.json / components.json
  patches/wouter@3.7.1.patch
  client/index.html / client/src/main.tsx / client/src/App.tsx (298 lines)
  client/src/data.ts (44 products) / client/src/index.css
  client/src/store/{cart,wishlist,library,products,orders,customers,coupons,reviews}Store.ts
  client/src/lib/{format,promoCodes,motion,mockOrders,mockCustomers,mockReviews,utils}.ts
  client/src/pages/{Cart,Checkout,CheckoutSuccess,Library,Wishlist,ProductDetail,Home(placeholder),NotFound}.tsx
  client/src/pages/admin/{AdminLogin,Overview,Products,ProductForm,Orders,OrderDetail,Customers,CustomerDetail,Coupons,Reviews,Placeholder}.tsx
  client/src/components/{AdminGuard,CartDrawer,QuantityStepper,PromoCodeInput,OrderSummary,Stepper,FakeReader,EmptyIllustration,ErrorBoundary,Map,ManusDialog}.tsx
  client/src/components/admin/{AdminLayout,Sidebar,Topbar,StatCard,DataTable,ConfirmDialog}.tsx
  client/src/components/ui/* (shadcn primitives) / client/src/{contexts,hooks,const}.ts
  server/index.ts (static + fallback only) / shared/const.ts (COOKIE_NAME, ONE_YEAR_MS — unused by app, VERIFIED no importer found this session beyond file itself)
  docs/backend-baseline.md (this file; docs/ did not exist before — created under explicit task permission)
```

## 12. Anomalies (factual, no fix applied)

1. `Checkout.tsx:95` calls `toast.error` during render before `return <Redirect>` — double-toast risk under StrictMode (VERIFIED by reading).
2. `CartItem` snapshots `{price,title,thumbnail}` (`cartStore.ts:63-69`); admin price edits do not propagate to existing carts (VERIFIED).
3. `deleteProduct` has no cascade to cart/wishlist (`productsStore.ts:91` vs `cartStore.ts:75` never called) — orphan IDs linger (VERIFIED).
4. `appliedPromo` snapshot in `ds-cart-v2` + `calculateDiscount` does not re-validate `isActive/expiry/maxUses` — disabled/deleted coupons keep discounting until removed (VERIFIED `cartStore.ts:98-122`, `promoCodes.ts:43-77`).
5. `couponsStore.incrementUse` has no call site in `client/src` (VERIFIED grep) — `usedCount` never increments; seeded `FREE50 maxUses:100` unenforceable in practice.
6. Mock promo math mismatch: `mockOrders.ts` KIDS20 = 15% vs `promoCodes.ts` KIDS20 = 20% (VERIFIED both files).
7. `promoCodes.getEligibleSubtotal` defaults to `getProduct` from `@/data` (static 44), not `productsStore` — admin-edited/new products mis-evaluated for promos (VERIFIED `promoCodes.ts:88`).
8. `ordersStore.resendDownload: () => {}` is a noop; UI toasts success anyway (VERIFIED).
9. `mockOrders/customers/reviews` use `Math.random()` — seeds are non-deterministic across fresh profiles (VERIFIED `Overview.tsx:9` also uses `Math.random` inline).
10. `data.ts` has no `isActive`; old `ds-products-v1` payloads without the field rely on `?? true` + `!== false` filter — works but unversioned persist (no migration), VERIFIED.
11. `template.json` ≠ live code: describes scaffold `App.tsx` (Toaster+Home+404 only) and `client/index.html` with analytics placeholders; live `client/index.html` has neither the max-scale viewport nor the umami script (VERIFIED both files). Do not treat `template.json` as current spec.

## 13. Classification demanded by SCOPE (no new functionality, no tech replacement)

- EXISTS (keep as-is for backend prompts): wouter routes (§5), 8 Zustand stores + persist keys (§6), `Product` type + 44 mocks + helpers (§7), admin mutations (§8), `format.ts` Intl helpers, `AdminGuard`/`AdminLayout`/`ConfirmDialog`/`StatCard`/`DataTable` shells, `server/index.ts` static+fallback skeleton, `shared/const.ts` constants.
- MISSING (backend must provide): real API (`/api/*` — none exists), real DB + migrations/seeds, server authN/Z (JWT/session + RBAC), server-side price/promo/order validation, payments + webhooks, emails, file storage, rate limiting, audit logs, `test`/`lint`/CI/Docker/`.env.example`.
- DEAD (keep untouched, flag for later cleanup, not this mission): `pages/Home.tsx` placeholder, `contexts/ThemeContext.tsx` (App uses its own theme state), `components/DataTable.tsx` thin wrapper, `ordersStore.resendDownload` noop, `couponsStore.incrementUse` uncalled, `shared/const.ts` unused, `axios`/`streamdown` et al. with no `client/src` importers (axios VERIFIED zero hits; others per prior audits, re-verify before removal).
- KEEP: `client/src/**`, `server/index.ts` shape (extend, don't rewrite), `package.json`/lockfiles, all mocks, `patches/wouter@3.7.1.patch`, `vite.config.ts` aliases (`@`, `@shared`, `@assets`).
- REPLACE: nothing in this baseline (explicitly out of scope).
- NEEDS API: auth (`AdminLogin` hardcoded → server sessions), products CRUD (validate slug unique, price ≥ 0 server-side), orders (create from cart snapshot, status transitions, refunds with ledger), customers (block semantics), coupons (validate + redeem + usage counters), reviews (moderation + replies), library/purchase history, checkout totals/tax.
- NEEDS DB: users/roles, products (+`isActive`, slug unique), orders + order_items + timeline/notes, customers, coupons (+usage), reviews (+replies), purchases/library grants. HYPOTHESIS, clearly labeled: relational data with 1:N (user→orders, order→items/timeline, product→reviews) fits the current mock shapes; no DB choice is made here per RULES.

## 14. Blocking decisions (open, no definitive stack per RULES)

1. Hosting/DB-managed-service target UNKNOWN — `template.json` says `web-static`; no Dockerfile/CI; `server/index.ts` assumes single-node `dist/` serve. Backend prompts must first fix: stay single-process Express or split API + static host.
2. Auth model UNKNOWN — `ds-admin` localStorage + hardcoded creds; no `.env.example`, no session infra; `shared/const.ts COOKIE_NAME` hints cookies but unused. Next prompt must define session vs JWT before touching `AdminGuard`.
3. `pnpm-lock.yaml` content not parsed in this baseline (presence only) — HYPOTHESIS of sync rests on passing `tsc`+`build`, not on lockfile diff. Verify before adding deps.
4. `Overview 404 kB` (recharts) dominates admin chunk — perf decision (keep/replace chart lib) deferred; do not bake into stack yet.
5. No `test`/`lint` scripts — backend prompts must add them before business logic; `tsconfig` excludes `**/*.test.ts`, so test placement needs a decision.

## 15. Exact files for next prompts (do not invent others)

- Auth: `client/src/pages/admin/AdminLogin.tsx`, `client/src/components/AdminGuard.tsx`, `server/index.ts`, `shared/const.ts`
- Products: `client/src/data.ts`, `client/src/store/productsStore.ts`, `client/src/pages/admin/Products.tsx`, `client/src/pages/admin/ProductForm.tsx`
- Orders: `client/src/lib/mockOrders.ts`, `client/src/store/ordersStore.ts`, `client/src/pages/admin/Orders.tsx`, `client/src/pages/admin/OrderDetail.tsx`
- Customers: `client/src/lib/mockCustomers.ts`, `client/src/store/customersStore.ts`, `client/src/pages/admin/Customers.tsx`, `client/src/pages/admin/CustomerDetail.tsx`
- Coupons/promos: `client/src/store/couponsStore.ts`, `client/src/lib/promoCodes.ts`, `client/src/store/cartStore.ts`, `client/src/pages/admin/Coupons.tsx`
- Reviews: `client/src/lib/mockReviews.ts`, `client/src/store/reviewsStore.ts`, `client/src/pages/admin/Reviews.tsx`
- Checkout/library: `client/src/pages/Checkout.tsx`, `client/src/pages/CheckoutSuccess.tsx`, `client/src/pages/Cart.tsx`, `client/src/store/libraryStore.ts`, `client/src/lib/format.ts`
- Routing/shell: `client/src/App.tsx`, `client/index.html`, `client/src/main.tsx`
- Config: `package.json`, `pnpm-lock.yaml`, `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, `patches/wouter@3.7.1.patch`, `template.json` (history only)
