# Snitch — Screen List

> Derived exclusively from [`design/api-map.md`](file:///Users/ankurprajapati/classes/kodr-4/0004-snitch/design/api-map.md).
> Every endpoint, field name, and enum value referenced below traces back to that document.
> Screens that require backend gaps are flagged with ⚠️.

---

## Buyer Storefront

### 1. Home / Landing

| | |
|---|---|
| **Route** | `/` |
| **Role** | Public |
| **Endpoints** | `GET /api/products?page=1` |
| **Data rendered** | Hero editorial imagery (static), featured products grid: `title`, `price.amount`, `price.currency`, `images[0].url`, `images[1].url` (hover swap), `categories` |
| **States** | Default (loaded), Loading (skeleton grid of product cards + skeleton hero), Error (API failure — full-width quiet message with retry) |
| **Notes** | No dedicated "featured" endpoint — frontend picks from page 1 of published products. Category sections ("T-Shirts", "Jackets", etc.) link to the product listing with a category pre-selected. ⚠️ Category filtering requires Gap #3. |

---

### 2. Product Listing (Category / Collection)

| | |
|---|---|
| **Route** | `/products` or `/products?category=T-Shirts` |
| **Role** | Public |
| **Endpoints** | `GET /api/products?page=N` |
| **Data rendered** | 4-up product grid: `title`, `price.amount`, `price.currency`, `images[0].url`, `images[1].url` (hover), `categories`. Page count from `totalPages`, `currentPage`. |
| **Filter controls** | ⚠️ Category multi-select (seed categories: Men, T-Shirts, Shirts, Jeans, Hoodies, Jackets, Joggers, Shorts, Sweatshirts, Polo Shirts) — **requires Gap #3**. ⚠️ Price range — **requires Gap #5**. Size filter (XS–XXL) — **requires backend support**. |
| **Sort controls** | ⚠️ Price low→high, high→low, newest — **requires Gap #4** |
| **States** | Default (loaded grid), Loading (skeleton grid), Empty (no products match — "No products found" with CTA to browse all), Error (API failure) |
| **Notes** | Design the filter/sort UI now; flag as non-functional until backend gaps are filled. Pagination via "Load more" or numbered pages using `totalPages`. |

---

### 3. Search Results

| | |
|---|---|
| **Route** | `/search?q=...` |
| **Role** | Public |
| **Endpoints** | ⚠️ **None — requires Gap #2** |
| **Data rendered** | Same grid as product listing: `title`, `price.amount`, `price.currency`, `images[0].url`. Query echoed in header. Result count. |
| **States** | Default (results), Loading (skeleton), Empty ("No results for '…'"), Error |
| **Notes** | Design the screen with the search input in the header. Until Gap #2 is built, frontend can only do naive client-side filtering of `GET /api/products`. |

---

### 4. Product Detail Page (PDP)

| | |
|---|---|
| **Route** | `/products/:id` |
| **Role** | Public |
| **Endpoints** | ⚠️ **`GET /api/products/:id` — requires Gap #1.** `POST /api/cart/add/product/:productId` (auth required) |
| **Data rendered** | `title`, `description`, `price.amount`, `price.currency`, `images[]` (gallery sorted by `order`), `categories`, `sizes[]` with `size` and `stock` per size, `isPublished` |
| **Interactive elements** | Image gallery (main + thumbnails), size selector (XS–XXL buttons, disabled when `stock === 0`), quantity stepper (capped at `stock` for selected size), "Add to Bag" button (calls cart endpoint) |
| **States** | Default (in stock), Out of Stock (all `sizes[].stock === 0` — "Add to Bag" disabled, "Out of Stock" label), Partial Stock (some sizes stock 0 — those size buttons disabled with strikethrough), Loading (skeleton for image + text areas), Error (product not found — 404 page), Unauthorised (click "Add to Bag" while logged out → prompt to sign in) |

---

### 5. Bag — Slide-Over Panel

| | |
|---|---|
| **Route** | Overlay on any page (triggered by bag icon click) |
| **Role** | Buyer (auth required) |
| **Endpoints** | `GET /api/cart`, `POST /api/cart/add/product/:productId` (quantity +1), `DELETE /api/cart/remove/product/:productId` (quantity −1 or remove) |
| **Data rendered** | Per item: `product.title`, `product.images[0].url`, `product.price.amount`, `product.price.currency`, `size`, `quantity`. Footer: `totalPrice`, "View Bag" link, "Checkout" CTA. |
| **States** | Default (items in bag), Empty ("Your bag is empty" with CTA to shop), Loading (skeleton lines), Error (API failure) |

---

### 6. Bag — Full Page

| | |
|---|---|
| **Route** | `/bag` |
| **Role** | Buyer (auth required) |
| **Endpoints** | `GET /api/cart`, `POST /api/cart/add/product/:productId`, `DELETE /api/cart/remove/product/:productId` |
| **Data rendered** | Same as slide-over but laid out as a table: product image, `product.title`, `product.price.amount`, `size`, quantity stepper, line total, remove button. Summary: subtotal (`totalPrice`), "Proceed to Checkout" CTA. |
| **States** | Default, Empty, Loading (skeleton table rows), Error, Insufficient Stock (shown inline when a cart item exceeds current `stock` — surfaced when cart is fetched and populated product data reveals stock changes) |

---

### 7. Checkout

| | |
|---|---|
| **Route** | `/checkout` |
| **Role** | Buyer (auth required) |
| **Endpoints** | `GET /api/cart` (pre-fill summary), `POST /api/orders` |
| **Data rendered** | **Address form**: `state`, `city`, `street`, `house`, `zip` (all required per validator). **Order summary**: line items from cart with `product.title`, `product.price.amount`, `quantity`, `size`, line total. Grand total from `totalPrice`. |
| **States** | Default (form + summary), Loading (submitting order), Validation Failure (inline errors on address fields — "State is required", "City is required", etc.), Error (API failure — "Cart is empty", "Some products are not published", stock/size errors with specific product flagged), Success (redirect to confirmation) |

---

### 8. Order Confirmation

| | |
|---|---|
| **Route** | `/orders/:id/confirmation` |
| **Role** | Buyer (auth required) |
| **Endpoints** | `GET /api/orders` (find the order by ID from the list) |
| **Data rendered** | `_id` (order ID), `status` ("PLACED"), `createdAt`, `address` (full), `products[]` — each with `product.title`, `product.image`, `product.price.amount`, `quantity`, `size`. `totalPrice.amount`, `totalPrice.currency`. |
| **States** | Default (order placed successfully — green `positive` confirmation), Loading, Error (order not found) |

---

### 9. Sign In

| | |
|---|---|
| **Route** | `/auth/login` |
| **Role** | Public |
| **Endpoints** | `POST /api/auth/login` |
| **Data rendered** | Form: `email`, `password`. Link to Create Account. ⚠️ Link to Forgot Password (Gap #7 — design link, leads to static page). |
| **States** | Default, Loading (submitting), Validation Failure (inline — "Email is required", "Email is not valid", "Password is required"), Error ("Invalid email or password"), Success (redirect to previous page or home) |

---

### 10. Create Account

| | |
|---|---|
| **Route** | `/auth/register` |
| **Role** | Public |
| **Endpoints** | `POST /api/auth/register` |
| **Data rendered** | Form: `name`, `email`, `password`. Link to Sign In. |
| **States** | Default, Loading (submitting), Validation Failure (inline — "Name is required", "Name must be at least 3 characters", "Email is required", "Email is not valid", "Password must be at least 6 characters"), Error ("User already exists" with `field: "email"` highlighted), Success (redirect) |

---

### 11. Forgot Password

| | |
|---|---|
| **Route** | `/auth/forgot-password` |
| **Role** | Public |
| **Endpoints** | ⚠️ **None — requires Gap #7** |
| **Data rendered** | Form: `email`. Informational copy. Link back to Sign In. |
| **States** | Default, Loading, Validation Failure, Success (confirmation message — "If an account exists…") |
| **Notes** | Design this screen. It will be non-functional until the backend endpoint is built. |

---

### 12. Account — Profile

| | |
|---|---|
| **Route** | `/account` |
| **Role** | Buyer (auth required) |
| **Endpoints** | `GET /api/auth/me` |
| **Data rendered** | `name`, `email`, `role`. ⚠️ Edit capability requires Gap #8. |
| **States** | Default (read-only display), Loading (skeleton), Unauthorised (redirect to sign in) |

---

### 13. Account — Order History

| | |
|---|---|
| **Route** | `/account/orders` |
| **Role** | Buyer (auth required) |
| **Endpoints** | `GET /api/orders` |
| **Data rendered** | Order list sorted by `createdAt` desc. Per order: `_id`, `status` (tag with status-appropriate colour — `positive` for DELIVERED, `critical` for CANCELLED, `sand` for PLACED/CONFIRMED/SHIPPED), `createdAt` (formatted date), `totalPrice.amount`, `products` count, first product `image`. |
| **States** | Default (orders list), Empty ("No orders yet" with CTA to shop), Loading (skeleton rows), Error |

---

### 14. Account — Order Detail

| | |
|---|---|
| **Route** | `/account/orders/:id` |
| **Role** | Buyer (auth required) |
| **Endpoints** | `GET /api/orders` (find by ID), `PATCH /api/orders/cancel/:orderid` |
| **Data rendered** | `_id`, `status`, `createdAt`, `updatedAt`, `address` (state, city, street, house, zip), `products[]` (title, image, price.amount, price.currency, quantity, size), `totalPrice.amount`, `totalPrice.currency`. "Cancel Order" button visible only when `status` is `PLACED` or `CONFIRMED`. |
| **States** | Default, Loading, Error (order not found), Status: PLACED (cancel button visible), Status: CONFIRMED (cancel button visible), Status: SHIPPED (cancel button hidden, shipping info), Status: DELIVERED (completed state), Status: CANCELLED (greyed out, cancelled label) |

---

### 15. Wishlist / Saved Items

| | |
|---|---|
| **Route** | `/account/wishlist` |
| **Role** | Buyer (auth required) |
| **Endpoints** | ⚠️ **None — requires Gap #10** |
| **Data rendered** | Product grid (same card as product listing): `title`, `price.amount`, `images[0].url`. "Move to Bag" and "Remove" actions per item. |
| **States** | Default, Empty ("No saved items" with CTA), Loading |
| **Notes** | Design this screen. It will be non-functional until the wishlist endpoints are built. |

---

### 16. Size Guide (Static)

| | |
|---|---|
| **Route** | `/size-guide` |
| **Role** | Public |
| **Endpoints** | None (static content) |
| **Data rendered** | Size chart table using the size enum: XS, S, M, L, XL, XXL with body measurements. |
| **States** | Default only |

---

### 17. Shipping & Returns (Static)

| | |
|---|---|
| **Route** | `/shipping-returns` |
| **Role** | Public |
| **Endpoints** | None (static content) |
| **Data rendered** | Shipping policy copy, return policy copy. Uses `address` field names for context (state, city, zip). |
| **States** | Default only |

---

### 18. Contact (Static)

| | |
|---|---|
| **Route** | `/contact` |
| **Role** | Public |
| **Endpoints** | None (static — no backend contact form endpoint) |
| **Data rendered** | Contact information, form (name, email, message — non-functional). |
| **States** | Default only |

---

## Seller Dashboard

### 19. Seller Overview / Dashboard

| | |
|---|---|
| **Route** | `/seller` |
| **Role** | Seller (auth required) |
| **Endpoints** | `GET /api/products/seller?page=1`, ⚠️ `GET /api/orders` (currently returns only buyer's own orders — **requires Gap #6** for seller orders), ⚠️ Aggregation metrics **require Gap #12** |
| **Data rendered** | Summary cards: total products (from `totalPages × 5`), published vs draft count (computed from `isPublished`). ⚠️ Revenue, order count, top products — need Gap #12. Recent products list. ⚠️ Recent orders — needs Gap #6. |
| **States** | Default, Loading (skeleton cards + skeleton list), Empty (new seller with no products — onboarding CTA), Unauthorised (non-seller user → redirect or 403 message), Error |

---

### 20. Seller — Product List

| | |
|---|---|
| **Route** | `/seller/products` |
| **Role** | Seller (auth required) |
| **Endpoints** | `GET /api/products/seller?page=N`, `PATCH /api/products/publish/:id` |
| **Data rendered** | Data table. Columns: product `images[0].url` (thumbnail), `title`, `price.amount` + `price.currency`, `categories` (tags), `isPublished` (toggle or status tag), total stock (sum of `sizes[].stock`), `createdAt`. Pagination from `totalPages`, `currentPage` (5 per page). |
| **Inline actions** | Toggle publish/unpublish per row, edit link, delete (⚠️ no delete product endpoint). |
| **States** | Default (table with data), Empty ("No products yet" with "Create Product" CTA), Loading (skeleton table rows), Error, Unauthorised (403) |

---

### 21. Seller — Create Product

| | |
|---|---|
| **Route** | `/seller/products/new` |
| **Role** | Seller (auth required) |
| **Endpoints** | `POST /api/products` |
| **Data rendered** | Form fields: `title` (text, 3–100 chars), `description` (textarea, 10–1000 chars), `price.amount` (number, min 0), `price.currency` (select: USD, EUR, CAD, INR — default INR), `categories` (multi-select or tag input — free-form strings), `sizes` (repeating row: `size` select from XS/S/M/L/XL/XXL + `stock` number input min 0), `images` (file upload, 1–5 images). |
| **States** | Default (empty form), Loading (submitting), Validation Failure (inline per field — all validator messages from `product.validate.js`), Error (403 not seller, image upload failure), Success (redirect to product list or product detail) |

---

### 22. Seller — Edit Product

| | |
|---|---|
| **Route** | `/seller/products/:id/edit` |
| **Role** | Seller (auth required, owner) |
| **Endpoints** | `GET /api/products/seller` (find product in list), `PATCH /api/products/update/:id`, `DELETE /api/products/image/:id/:imageId` |
| **Data rendered** | Same form as Create, pre-populated. Image gallery with delete buttons per image (calls `DELETE /api/products/image/:id/:imageId`). Image count indicator (current/5 max). |
| **States** | Default (pre-filled form), Loading (fetching product / submitting), Validation Failure (inline), Error (404 not found, 403 not owner, >5 images), Success (updated confirmation) |

---

### 23. Seller — Inventory & Stock

| | |
|---|---|
| **Route** | `/seller/inventory` |
| **Role** | Seller (auth required) |
| **Endpoints** | `GET /api/products/seller?page=N` |
| **Data rendered** | Table focused on stock: `title`, then one column per size (XS, S, M, L, XL, XXL) showing `stock` value for each. Total stock. `isPublished` status. Low-stock visual warning when any `sizes[].stock` ≤ 5. |
| **Editing** | ⚠️ Inline stock editing requires `PATCH /api/products/update/:id` — sends the full `sizes` array update. No dedicated stock endpoint (Gap #18). |
| **States** | Default, Loading (skeleton), Empty (no products), Error |

---

### 24. Seller — Orders List

| | |
|---|---|
| **Route** | `/seller/orders` |
| **Role** | Seller (auth required) |
| **Endpoints** | ⚠️ **`GET /api/orders` only returns buyer's own orders — requires Gap #6.** `PATCH /api/orders/status/:orderid` |
| **Data rendered** | Table: order `_id`, `createdAt`, buyer name (⚠️ not in order schema — only `user` ObjectId), `products[]` summary (count, titles), `totalPrice.amount`, `status` (tag coloured by status enum). |
| **Inline actions** | Status update dropdown: PLACED → SHIPPED → DELIVERED (per transition matrix). |
| **States** | Default, Empty (no orders), Loading, Error, Unauthorised |
| **Notes** | This screen is non-functional without Gap #6. Design it anyway with the data shape the endpoint should return. |

---

### 25. Seller — Order Detail

| | |
|---|---|
| **Route** | `/seller/orders/:id` |
| **Role** | Seller (auth required) |
| **Endpoints** | ⚠️ **Requires Gap #6.** `PATCH /api/orders/status/:orderid` |
| **Data rendered** | Full order: `_id`, `status`, `createdAt`, `updatedAt`, `address` (state, city, street, house, zip), `products[]` (title, image, price.amount, price.currency, quantity, size), `totalPrice`. Status update controls. |
| **States** | Default, Loading, Error (not found), Status-specific layouts (PLACED — confirm + ship actions, SHIPPED — mark delivered, DELIVERED — completed, CANCELLED — no actions) |

---

### 26. Seller — Profile / Store Settings

| | |
|---|---|
| **Route** | `/seller/settings` |
| **Role** | Seller (auth required) |
| **Endpoints** | `GET /api/auth/me` |
| **Data rendered** | `name`, `email`, `role`. ⚠️ Edit capability requires Gap #8. |
| **States** | Default (read-only), Loading, Unauthorised |

---

## Non-Happy State Summary

Every screen above includes its relevant non-happy states. Here is the consolidated list of states and which screens require them:

| State | Screens |
|---|---|
| **Loading (skeleton)** | All screens (1–26) |
| **Empty** | 2 (no products), 5 (empty bag), 6 (empty bag), 13 (no orders), 15 (no wishlist items), 19 (new seller), 20 (no products), 24 (no orders) |
| **Error (API failure)** | 1, 2, 3, 4, 5, 6, 7, 8, 13, 14, 19, 20, 22, 23, 24, 25 |
| **Unauthorised** | 4 (add to bag while logged out), 5, 6, 7, 12, 13, 14, 15, 19, 20, 21, 22, 23, 24, 25, 26 |
| **Validation failure** | 7 (checkout address), 9 (login), 10 (register), 11 (forgot password), 21 (create product), 22 (edit product) |
| **Out of stock** | 4 (PDP — all sizes 0), 6 (bag — stock changed since adding) |
| **Not found (404)** | 4 (invalid product ID), 8 (invalid order), 14 (invalid order), 22 (invalid product), 25 (invalid order) |
| **Order status variations** | 13 (history tags), 14 (detail — 5 status states), 24 (seller table tags), 25 (seller detail — 4 action states) |

---

## Screen Count Summary

| Group | Count |
|---|---|
| Buyer Storefront | 18 screens |
| Seller Dashboard | 8 screens |
| **Total** | **26 screens** |

---

> **⚠️ Screens blocked or partially blocked by backend gaps:**
> - Screen 2 (filters/sort): Gaps #3, #4, #5
> - Screen 3 (search): Gap #2
> - Screen 4 (PDP): Gap #1
> - Screen 11 (forgot password): Gap #7
> - Screen 12 (profile edit): Gap #8
> - Screen 15 (wishlist): Gap #10
> - Screen 19 (seller metrics): Gaps #6, #12
> - Screen 23 (inline stock edit): Gap #18
> - Screens 24, 25 (seller orders): Gap #6
>
> These screens should still be designed — the UI represents the target experience. The gaps list in `api-map.md` specifies exactly what the backend needs to add.
