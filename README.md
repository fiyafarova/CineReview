# Project Description: ShopEasy - Online Store

ShopEasy is a full-stack web application that implements a complete shopping flow - from browsing a product catalog to placing an order. The app is built with **Angular** on the frontend and **Django REST Framework** on the backend, connected via a JWT-authenticated REST API.

---

## Pages and Functionality

### Authentication - `/login` and `/register`

Users can register and log in using forms built with `[(ngModel)]`. On login, the Django backend returns a JWT token which is stored in `localStorage`. An HTTP Interceptor automatically attaches the token to all subsequent requests. A Route Guard protects private pages and redirects unauthenticated users to `/login`. Logout clears the token and ends the session. Validation errors and failed login attempts are displayed as messages to the user.

---

### Product Catalog - `/products`

Displays all products as cards with name, image, price, and category, loaded from the backend via `ProductService`. Product data is real and comes from the Django `products` app with models `Category` and `Product` (fields: `name`, `description`, `price`, `image`, `category`, `stock`, `is_active`).

Users can:
- Filter by category using a dropdown
- Search by name using a text input
- Sort products (e.g. by price)

---

### Product Detail Page - `/products/:id`

Shows the full product description, price, category, stock, and image. A "Add to Cart" button sends the item to `CartService`. Errors from the API are shown as user-friendly messages.

The page also includes a **Reviews & Rating** section:
- Users can leave one review per product (model: `Review(user, product, rating, comment, created_at)`)
- Rating is 1–5 stars; the comment serves as the written review
- A unique constraint on `user + product` prevents duplicate reviews
- Average rating is displayed on the product detail page and card

---

### Shopping Cart - `/cart`

Lists all items in the cart using `@for`, with controls to increase, decrease, or remove each item via `(click)` events. The total price updates dynamically. An `@if` block shows an empty cart message when there are no items. A "Proceed to Checkout" button navigates to the checkout form.

---

### Checkout - `/checkout`

A delivery form with `[(ngModel)]` fields for full name, address, city, and phone number.

Additional checkout features:
- **Promo code field**: user enters a code, backend validates it against the `PromoCode` model (`code`, `discount_percent`, `min_total`, `is_active`, `expires_at`) and returns `discount_amount` and `final_total`
- **Order summary**: shows original total, discount applied, and final amount
- **Bonus accrual notice**: after a successful order, 1% of `final_total` is added to the user's `bonus_balance` (`Profile.bonus_balance`)

On submission, `OrderService` sends a POST request to the backend, creating an order linked to the authenticated user. The cart is cleared and the user is redirected to order history.

---

### Order History - `/orders`

Shows all past orders for the logged-in user, fetched via `OrderService` and rendered with `@for`. Each entry displays:
- Order date, items, quantities, and total
- **Order status**: `new` → `paid` → `shipped` → `delivered` (or `cancelled`)
- A **Cancel** button is shown only when the order status is `new`

Admins can update order statuses via the Django Admin panel.

---

### User Profile - `/profile`

A personal account page showing and allowing editing of the user's profile data.

Profile fields:
- `phone`
- `city`
- `address`
- `bonus_balance`

The page displays the accumulated bonus balance earned from previous purchases (1% per order).

---

### Wishlist - `/wishlist` 
Users can save products to a personal wishlist.

API:
- `GET /api/wishlist/` — view saved products
- `POST /api/wishlist/` — add a product
- `DELETE /api/wishlist/<product_id>/` — remove a product

On the frontend, product cards and the product detail page include an **"Add to Favorites"** button that toggles wishlist status.

---

## Navigation

The `Navbar` includes links to:
-  User Profile
- Wishlist 
- Products
- Cart
- Orders
- Login/Logout
---



### Django Admin

Product and category management for staff users is available at `/admin`:
- `Product` and `Category` registered with `list_display`, `search_fields`, `list_filter`
- `Order` status can be updated by admins
- `PromoCode` management

---

## Team Members and Responsibilities

| Name                       | Module |
|----------------------------|---|
| **Sofiya Safarova**         | Profile · Wishlist · Navigation · Auth UI |
| **Togzhan Sauytbay**       | Products · Categories · Admin · Search/Filter · Reviews |
| **Shynggyskhan Bassarbek** | Orders · Statuses · Checkout · Promo Codes · Bonus System |
