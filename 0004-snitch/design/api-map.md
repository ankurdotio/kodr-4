# Snitch — API Map

> Source of truth derived from a full read of every file in `server/src/`.
> Every field name, enum value, and constraint below comes directly from the code.

---

## 1. Auth Model

| Aspect | Detail |
|---|---|
| Token type | JWT (`jsonwebtoken`) |
| Token location | `Authorization: Bearer <token>` header — extracted via `req.headers.authorization?.split(" ")[1]` |
| Token payload | `{ id: user._id, role: user.role }` |
| Token expiry | **None set** — tokens never expire (no `expiresIn` option passed to `jwt.sign`) |
| Middleware | `authenticate` in [`auth.middleware.js`](file:///Users/ankurprajapati/classes/kodr-4/0004-snitch/server/src/middlewares/auth.middleware.js) — sets `req.user = decoded` |
| Roles | `"user"` (buyer), `"seller"` — enum on User schema, default `"user"` |
| Role enforcement | **No middleware-level role check.** Each controller function checks `req.user.role !== "seller"` inline and returns 403. |
| Registration | Does **not** accept a `role` field — all new accounts are `"user"` by default. Seller accounts must be seeded or promoted manually. |

---

## 2. Endpoint Table

### Auth — prefix `/api/auth`

| Method | Path | Auth | Role | Request Body | Query | Response (200/201) | Error Responses |
|---|---|---|---|---|---|---|---|
| POST | `/api/auth/register` | ✗ | any | `{ name: string, email: string, password: string }` | — | `{ message, user: { id, name, email }, token }` | 400 `{ message, errors: [{ message, field }] }` (duplicate email); 400 validation errors |
| POST | `/api/auth/login` | ✗ | any | `{ email: string, password: string }` | — | `{ message, user: { id, name, email }, token }` | 400 `{ message }` (invalid credentials) |
| GET | `/api/auth/me` | ✓ | any | — | — | `{ message, user: { id, name, email } }` | 401 `{ message }` |

### Products — prefix `/api/products`

| Method | Path | Auth | Role | Request Body | Query | Response | Error Responses |
|---|---|---|---|---|---|---|---|
| GET | `/api/products` | ✗ | any | — | `page` (int, default 1) | `{ message, data: { products: Product[], totalPages, currentPage } }` | — |
| POST | `/api/products` | ✓ | seller | `multipart/form-data` — `title`, `description`, `price` (JSON string: `{amount, currency}`), `categories` (JSON string: `string[]`), `sizes` (JSON string: `{size, stock}[]`), `images` (files, 1–5) | — | `{ message, data: { product: Product } }` | 403 not seller; 400 validation / no images |
| PATCH | `/api/products/update/:id` | ✓ | seller (owner) | `multipart/form-data` — same fields as create, all optional + new `images` files | — | `{ message, data: { product: Product } }` | 403 not seller / not owner; 404 not found; 400 >5 images total |
| DELETE | `/api/products/image/:id/:imageId` | ✓ | seller (owner) | — | — | `{ message }` | 403; 404 |
| PATCH | `/api/products/publish/:id` | ✓ | seller (owner) | — | — | `{ message, data: { product: { id, isPublished } } }` | 403; 404 |
| GET | `/api/products/seller` | ✓ | seller | — | `page` (int, default 1, 5 per page) | `{ message, data: { products: Product[], totalPages, currentPage } }` | 403 |

### Cart — prefix `/api/cart` (all routes auth-required)

| Method | Path | Auth | Role | Request Body | Query | Response | Error Responses |
|---|---|---|---|---|---|---|---|
| GET | `/api/cart` | ✓ | any | — | — | `{ message, data: { cart: Cart (populated), totalPrice: number } }` | — |
| POST | `/api/cart/add/product/:productId` | ✓ | any | `{ size: SizeEnum, quantity: int≥1 }` | — | `{ message }` | 404 product not found; 400 invalid size; 400 insufficient stock |
| DELETE | `/api/cart/remove/product/:productId` | ✓ | any | `{ size: SizeEnum, quantity: int≥1 }` | — | `{ message }` | 404 product not found; 400 cart empty; 404 product not in cart |

### Orders — prefix `/api/orders` (all routes auth-required)

| Method | Path | Auth | Role | Request Body | Query | Response | Error Responses |
|---|---|---|---|---|---|---|---|
| POST | `/api/orders` | ✓ | any (buyer) | `{ address: { state, city, street, house, zip } }` | — | `{ message, data: { order: Order } }` | 400 cart empty; 400 unpublished products; 400 size/stock errors |
| GET | `/api/orders` | ✓ | any | — | — | `{ message, data: { orders: Order[] } }` — sorted `createdAt desc` | — |
| PATCH | `/api/orders/cancel/:orderid` | ✓ | owner (buyer) | — | — | `{ message }` | 404; 403 not owner; 400 already cancelled; 400 shipped/delivered |
| PATCH | `/api/orders/status/:orderid` | ✓ | seller | `{ status: OrderStatusEnum }` | — | `{ message }` | 403 not seller; 400 invalid transition |

---

## 3. Schema Field Reference

### User — [`user.model.js`](file:///Users/ankurprajapati/classes/kodr-4/0004-snitch/server/src/models/user.model.js)

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `name` | String | required, minLength 3, maxLength 50 | |
| `email` | String | required, regex validated, maxLength 100 | Unique enforced in controller, not schema |
| `passwordHash` | String | required, `select: false` | Never returned in responses |
| `role` | String | required, enum `["user", "seller"]`, default `"user"` | |

### Product — [`product.model.js`](file:///Users/ankurprajapati/classes/kodr-4/0004-snitch/server/src/models/product.model.js)

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `title` | String | required, minLength 3, maxLength 100 | |
| `description` | String | required, minLength 10, maxLength 1000 | |
| `price.amount` | Number | required, min 0 | |
| `price.currency` | String | required, enum `["USD", "EUR", "CAD", "INR"]`, default `"INR"` | |
| `categories` | String[] | required | Free-form strings. Seed uses: `"Men"`, `"T-Shirts"`, `"Shirts"`, `"Jeans"`, `"Hoodies"`, `"Jackets"`, `"Joggers"`, `"Shorts"`, `"Sweatshirts"`, `"Polo Shirts"` |
| `images` | Array of `{ imagekitId, url, order }` | All required | Max 5 enforced in controller |
| `images[].imagekitId` | String | required | ImageKit file ID |
| `images[].url` | String | required | Public CDN URL |
| `images[].order` | Number | required | 1-based display order |
| `seller` | ObjectId | required | Ref to user |
| `sizes` | Array of `{ size, stock }` | | |
| `sizes[].size` | String | required, enum `["XS", "S", "M", "L", "XL", "XXL"]` | |
| `sizes[].stock` | Number | required, min 0 | Per-size inventory count |
| `isPublished` | Boolean | required, default `false` | Public listing gate |
| `createdAt` | Date | auto (timestamps: true) | |
| `updatedAt` | Date | auto (timestamps: true) | |

### Cart — [`cart.model.js`](file:///Users/ankurprajapati/classes/kodr-4/0004-snitch/server/src/models/cart.model.js)

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `user` | ObjectId | required | One cart per user (enforced by findOne) |
| `products` | Array of cart items | | |
| `products[].product` | ObjectId | required, ref `"products"` | Populated on GET /api/cart |
| `products[].quantity` | Number | required, min 1 | |
| `products[].size` | String | required, enum `["XS", "S", "M", "L", "XL", "XXL"]` | |

### Order — [`order.model.js`](file:///Users/ankurprajapati/classes/kodr-4/0004-snitch/server/src/models/order.model.js)

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `user` | ObjectId | required | |
| `address.state` | String | required | |
| `address.city` | String | required | |
| `address.street` | String | required | |
| `address.house` | String | required | |
| `address.zip` | String | required | |
| `products` | Array of order line items | | Snapshot at order time — not a ref |
| `products[].product.title` | String | required | |
| `products[].product.description` | String | required | |
| `products[].product.price.amount` | Number | required | |
| `products[].product.price.currency` | String | required | |
| `products[].product.image` | String | required | First image URL at order time |
| `products[].product.productId` | ObjectId | required | Original product ref |
| `products[].quantity` | Number | required | |
| `products[].size` | String | required | |
| `totalPrice.amount` | Number | required | Sum of (price.amount × quantity) |
| `totalPrice.currency` | String | required | Hardcoded `"INR"` on create |
| `status` | String | required, enum `["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"]`, default `"PLACED"` | |
| `createdAt` | Date | auto (timestamps: true) | |
| `updatedAt` | Date | auto (timestamps: true) | |

---

## 4. Enum Reference (UI State Drivers)

| Enum | Values | Used In |
|---|---|---|
| **User Role** | `user`, `seller` | User schema, JWT payload, controller auth checks |
| **Size** | `XS`, `S`, `M`, `L`, `XL`, `XXL` | Product sizes, cart items, order line items |
| **Currency** | `USD`, `EUR`, `CAD`, `INR` | Product price, order totalPrice |
| **Order Status** | `PLACED`, `CONFIRMED`, `SHIPPED`, `DELIVERED`, `CANCELLED` | Order schema, status transitions |
| **isPublished** | `true`, `false` | Product listing gate |

### Order Status Transitions (from `updateOrderStatus` controller)

| Current ↓ / Target → | PLACED | CONFIRMED | SHIPPED | DELIVERED | CANCELLED |
|---|---|---|---|---|---|
| PLACED | — | ✓ (implied) | ✓ | ✓ | ✓ (buyer only) |
| CONFIRMED | ✓ | — | ✓ | ✓ | ✓ (buyer only) |
| SHIPPED | ✗ | — | — | ✓ | ✗ |
| DELIVERED | ✗ | — | ✗ | — | ✗ |
| CANCELLED | ✗ | — | ✗ | ✗ | — |

> **Note:** The `updateOrderStatus` controller only handles `PLACED`, `SHIPPED`, and `DELIVERED` as target statuses. There is no explicit handler for setting status to `CONFIRMED`. The `cancelOrder` endpoint is the only way to set `CANCELLED` and is restricted to the order owner (buyer).

### Categories (from seed data)

`"Men"`, `"T-Shirts"`, `"Shirts"`, `"Jeans"`, `"Hoodies"`, `"Jackets"`, `"Joggers"`, `"Shorts"`, `"Sweatshirts"`, `"Polo Shirts"`

> Categories are free-form strings — no enum enforced at the schema level. The above are the only values present in seed data.

---

## 5. Role Matrix

| Endpoint | Public | Buyer (`user`) | Seller |
|---|---|---|---|
| POST `/api/auth/register` | ✓ | ✓ | ✓ |
| POST `/api/auth/login` | ✓ | ✓ | ✓ |
| GET `/api/auth/me` | — | ✓ | ✓ |
| GET `/api/products` | ✓ | ✓ | ✓ |
| POST `/api/products` | — | — | ✓ |
| PATCH `/api/products/update/:id` | — | — | ✓ (owner) |
| DELETE `/api/products/image/:id/:imageId` | — | — | ✓ (owner) |
| PATCH `/api/products/publish/:id` | — | — | ✓ (owner) |
| GET `/api/products/seller` | — | — | ✓ |
| GET `/api/cart` | — | ✓ | ✓ |
| POST `/api/cart/add/product/:productId` | — | ✓ | ✓ |
| DELETE `/api/cart/remove/product/:productId` | — | ✓ | ✓ |
| POST `/api/orders` | — | ✓ | ✓ |
| GET `/api/orders` | — | ✓ | ✓ |
| PATCH `/api/orders/cancel/:orderid` | — | ✓ (owner) | ✓ (owner) |
| PATCH `/api/orders/status/:orderid` | — | — | ✓ |

---

## 6. Pagination Summary

| Endpoint | Page Size | Default Page | Param |
|---|---|---|---|
| GET `/api/products` | 20 | 1 | `?page=N` |
| GET `/api/products/seller` | 5 | 1 | `?page=N` |
| GET `/api/orders` | **None** — returns all orders for the user | — | — |

---

## 7. Gaps — UI Needs the Backend Does Not Yet Support

### Critical (blocking core screens)

1. **GET single product** — No `GET /api/products/:id` endpoint. The PDP has no way to fetch a single product by ID.
2. **Search** — No search endpoint or query parameter. No `?search=`, `?q=`, or text-search capability.
3. **Category / collection filtering** — No filter query params on `GET /api/products`. No `?category=` or any filter mechanism.
4. **Sort** — No sort query parameter on `GET /api/products`. Products come in default DB insertion order.
5. **Price range filter** — No `?minPrice=` / `?maxPrice=` or similar.
6. **Seller-side order list** — `GET /api/orders` returns only orders belonging to `req.user.id` (the buyer). There is no endpoint for a seller to see orders containing their products.
7. **Forgot password / password reset** — No endpoint exists.
8. **User profile update** — No `PATCH /api/auth/me` or similar. Users cannot change their name or email.

### Important (needed for a complete product)

9. **Saved addresses** — No address model or CRUD. Addresses exist only as snapshots on orders.
10. **Wishlist** — No wishlist model or endpoint.
11. **Order pagination** — `GET /api/orders` returns all orders. Will need pagination for users with many orders.
12. **Seller dashboard metrics** — No aggregation endpoint for revenue, order counts, top products, etc.
13. **Cart clear / empty** — No endpoint to clear the entire cart. Must remove items one by one.
14. **Logout / token invalidation** — Tokens never expire and there's no revocation mechanism.
15. **Registration with role selection** — Cannot register as a seller. Role is hardcoded to `"user"`.

### Minor / Nice to Have

16. **Product detail: related products** — No endpoint to get similar or related products.
17. **Image reordering** — No endpoint to change image `order` values after upload.
18. **Stock update without full product edit** — No dedicated inventory/stock endpoint.
19. **Order status: CONFIRMED transition** — `updateOrderStatus` handler only processes `PLACED`, `SHIPPED`, `DELIVERED` as targets. No explicit `CONFIRMED` transition code.
20. **Bulk product actions** — No bulk publish/unpublish or delete endpoint.
