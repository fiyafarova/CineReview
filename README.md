## Project Description: ShopEasy - Online Store
ShopEasy is a full-stack  web application that implements a complete shopping flow - from browsing a product catalog to placing an order. The app is built with Angular on the frontend and Django REST Framework on the backend, connected via a JWT-authenticated REST API.

## Pages and Functionality
Authentication - /login and /register
Users can register and log in using forms built with [(ngModel)]. On login, the Django backend returns a JWT token which is stored in localStorage. An HTTP Interceptor automatically attaches the token to all subsequent requests. A Route Guard protects private pages and redirects unauthenticated users to /login. Logout clears the token and ends the session. Validation errors and failed login attempts are displayed as messages to the user.

## Product Catalog - /products
Displays all products as cards with name, image, price, and category, loaded from the backend via ProductService. Users can filter by category using a dropdown and search by name using a text input, both using [(ngModel)]. The product list is rendered with @for and @if handles the empty state when no results match.

## Product Detail Page - /products/:id
Shows the full product description, price, category, and image. A "Add to Cart" button sends the item to CartService. Errors from the API are shown as user-friendly messages.

## Shopping Cart - /cart
Lists all items in the cart using @for, with controls to increase, decrease, or remove each item via (click) events. The total price updates dynamically. An @if block shows an empty cart message when there are no items. A "Proceed to Checkout" button navigates to the checkout form.

## Checkout - /checkout
A delivery form with [(ngModel)] fields for full name, address, city, and phone number. On submission, OrderService sends a POST request to the backend, creating an order linked to the authenticated user. The cart is cleared and the user is redirected to order history.

## Order History - /orders
Shows all past orders for the logged-in user, fetched via OrderService and rendered with @for. Each entry displays the order date, items, quantities, and total.

## Architecture
All API communication goes through Angular services using HttpClient. The HTTP Interceptor injects the JWT token into every request. The Django backend exposes REST endpoints for auth, products, categories, and orders. CORS is configured with django-cors-headers for localhost:4200.Product and category management for staff users is available through the standard Django Admin panel at /admin
