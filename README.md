# mazad-server
Project Overview

This server-side application serves as the core for managing auctions, allowing merchants to display products, set initial bid prices, and commence bidding processes. Users can participate in auctions, place bids, and receive notifications upon winning. The purchase process is completed through electronic payment services, and products are delivered to the winners within 48 hours.


Technologies Used

Node.js: A runtime environment for executing JavaScript code on the server side.

Express: A web application framework for Node.js that simplifies the development of robust APIs.

MongoDB: A NoSQL database for storing and retrieving data efficiently.

Socket.io: Enables real-time, bidirectional communication between clients and the server.

JWT (JSON Web Tokens): Used for secure authentication and authorization.

Stripe: A popular payment processing platform for handling electronic transactions.



Setup Instructions

git clone [repository-url]

cd [project-directory]

npm install

PORT=9000

MONGODB_URI=[your-mongodb-uri]

JWT_SECRET=[your-jwt-secret]

STRIPE_SECRET_KEY=[your-stripe-secret-key]

API Endpoints:



Product Management


[GET] /api/products: Retrieve a list of available products.

[GET] /api/products/:id: Retrieve details of a specific product.

[POST] /api/products: Create a new product for auction.

[POST] /api/v1/mazad/:mazad-id To add mazad on product

[PUT] /api/products/:id: Update details of a specific product.

[DELETE] /api/products/:id: Delete a specific product.



Authentication:

[POST] /api/v1/auth/signup: Create a new user account.

[POST] /api/v1/auth/login: Authenticate and log in a user.


Cart:

[POST] /api/v1/cart: Add a product to the user's shopping cart.

[GET] /api/v1/cart: Retrieve the content of the logged-in user's shopping cart.



Order Management

[GET] /api/v1/orders: Retrieve all orders for the logged-in user.

[GET] /api/v1/orders/:orderId: Retrieve details of a specific order.

[GET] /api/v1/orders/checkout-session/:orderId: Retrieve the checkout session for a specific order.






Thank you for using the Electronic Auction backend server! If you encounter issues or have suggestions for improvements, feel free to open an issue or submit a pull request.




