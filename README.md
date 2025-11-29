📦 Database-Free E-commerce Platform

This project implements a full-stack web application designed for simplicity and security, featuring a unique, database-free architecture. All application data, including user accounts and product information, is managed using structured, in-memory JavaScript tables. Critical data, such as passwords, is secured using AES encryption.

🌟 Features

Database-Free Architecture: All data is stored and managed entirely in structured in-memory tables, making the application fast and lightweight for a demo or small-scale proof-of-concept.

Secure Authentication: Includes a secure login and signup system where all passwords and sensitive data are encrypted using AES before being stored in memory.

Role-Based Access: Separate, protected dashboards for Admin and Regular Users.

User Dashboard: An interactive interface allowing users to browse products, manage their cart, and place orders.

Secure Data Handling: All sensitive operations, including user creation and authentication, involve encrypting and decrypting data using AES for security assurance.

Express Handlers: Robust Express.js handlers process all application logic: login, signup, admin operations, and user dashboard interactions.

📂 Project Structure

The architecture is split between a React frontend and a Node/Express backend. Data is managed in simple JavaScript arrays and objects that simulate database tables.

Tables / Data Structures (In-Memory)

All data is initialized and managed in memory on the backend server.

Table Name

Fields

Description

Security Note

User Table

id, username, email, role, password

Stores core user information.

Password is stored AES-encrypted.

Products Table

id, name, description, price, stock

List of available products.



Cart Table

id, user_id, product_id, quantity

Tracks items added to the user's cart.



Orders Table

id, user_id, products (JSON), status, date

Records completed order details.



Pages (React UI)

Page

Role

Purpose

Login Page

User/Admin

Secure form for credential validation.

Signup Page

User

Registration form to create a new user account.

Admin Dashboard

Admin

Manage all users, products, and view system statistics.

User Dashboard

User

Product browsing, cart management, and order placement.

Handlers (Express)

Handler

Functionality

Login Handler

Validates credentials by decrypting stored passwords and comparing them to the user input.

Signup Handler

Encrypts the user's password using AES before storing the user object in the in-memory User Table.

Admin Handler

Provides secure API endpoints for Admin-level operations (user and product management).

User Dashboard Handler

Processes requests for product lists, cart modifications, and finalizing orders.

💻 Technologies Used

Category

Technology

Purpose

Frontend

React.js

Interactive and component-based user interface.

Backend

Node.js with Express.js

Fast, minimal server-side logic and API routing.

Security

AES Encryption

Secure handling and storage of sensitive in-memory data.

Data Storage

In-memory Structures

Database-free persistence using structured JavaScript arrays/objects.

🚀 Installation

Follow these steps to get the project up and running on your local machine.

Prerequisites

Node.js (LTS version recommended)

npm (comes with Node.js)

Setup

Clone the repository:

git clone <repository-url>


Navigate to the project folder:

cd project-folder


Install backend dependencies:

npm install


Install frontend dependencies:

cd client
npm install
cd .. # Return to the root


Running the Application

Start the backend server (from the root directory):

npm start 
# The Express server runs on port 5000 (or specified in environment)


Start the React frontend (from the root directory):

npm run start 
# The React development server runs on port 3000


Open your browser and navigate to http://localhost:3000

🛠 Usage

Signup: Create a new account. The system will automatically assign you the user role. Your password will be encrypted immediately.

Login: Access your account using the registered email and password.

User Dashboard: Browse the available products, add items to your cart, and place a dummy order.

Admin Access (Example): For demonstration purposes, you can manually modify a user's role in the in-memory user table (on the backend) to admin to access the Admin Dashboard.

🔮 Future Improvements

While the database-free approach is great for learning and simplicity, these improvements would make the application ready for production:

Persistent Storage: Add a real, persistent database (e.g., MongoDB, PostgreSQL, or MySQL) to ensure data is not lost when the server restarts.

Authentication Upgrade: Implement JWT-based authentication for token security, session management, and better scalability.

Enhanced Frontend: Improve the design with more interactive components, animations, and a modern utility framework like Tailwind CSS.

Logging and Analytics: Add role-specific logging, notifications, and basic analytics reporting for the Admin dashboard.
