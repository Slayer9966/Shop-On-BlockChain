# 🚀 Database-Free E-commerce Platform with In-Memory Storage

A full-stack web application designed as a proof-of-concept for a **database-free architecture** utilizing structured **in-memory tables**. The application is built with a **React** frontend, a **Node.js/Express** backend, and incorporates **AES encryption** for secure data handling.

## ✨ Features

* **Database-Free Architecture:** All application data (users, products, carts, orders) is stored and managed entirely in **structured in-memory tables**.
* **Secure Authentication:** Robust login and signup system with all user passwords securely **encrypted** using **AES**.
* **Role-Based Access Control (RBAC):** Separate, protected dashboards for **admin** and **regular users**.
* **User Dashboard:** An interactive interface allowing users to **browse products**, **manage their cart**, and **place orders**.
* **Secure Data Handling:** All sensitive data, including passwords and potentially other PII, is securely **encrypted and decrypted using AES** before and after processing. 

[Image of AES encryption process]

* **Centralized Handlers:** **Express handlers** manage all core functionalities: login, signup, user dashboard operations, and admin tasks.

---

## 📂 Project Structure

### Tables / Data Structures

| Table Name | Key Fields | Purpose |
| :--- | :--- | :--- |
| **User Table** | `id`, `username`, `email`, `role`, **`encrypted password`** | Stores user profiles and authentication details. |
| **Products Table** | `id`, `name`, `description`, `price`, `stock` | Inventory management for all products. |
| **Cart Table** | `id`, `user_id`, `product_id`, `quantity` | Stores items currently in a user's shopping cart. |
| **Orders Table** | `id`, `user_id`, `product_id`, `quantity`, `order_date` | Records completed user orders. |

### Pages (React UI)

* **Login Page:** Handles user and admin login with form validation.
* **Signup Page:** Facilitates new user registration, securing passwords via encryption.
* **Admin Dashboard:** Comprehensive view for administrators to manage users, products, and system statistics.
* **User Dashboard:** Main interface for users to browse inventory, manage their cart, and process transactions.

### Handlers (Express)

| Handler | Functionality | Security Note |
| :--- | :--- | :--- |
| **Login Handler** | Validates credentials and **decrypts** the stored password for authentication. | Data is decrypted only for verification. |
| **Signup Handler** | **Encrypts** the user password before storing the new user data in-memory. | All new passwords are encrypted immediately. |
| **Admin Handler** | Manages user and product data, enforcing admin-only access. | Role-based checks. |
| **User Dashboard Handler** | Processes product viewing, cart modifications, and final order placements. | Handles linking operations to the authenticated user ID. |

---

## 🛠️ Technologies Used

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | **React.js** | Used for building the user interface and interactive components. |
| **Backend** | **Node.js** with **Express.js** | Provides the server environment and RESTful API endpoints. |
| **Security** | **AES Encryption/Decryption** | Utilized for securing all sensitive in-memory data. |
| **Data Storage** | **In-Memory Structured Tables** | Custom JavaScript data structures acting as a temporary, fast storage layer. |
| **Others** | JavaScript, HTML, CSS | Core web development languages. |

---

## ⚙️ Installation

To set up and run the project locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    ```

2.  **Navigate to the project folder:**
    ```bash
    cd project-folder
    ```

3.  **Install backend dependencies:**
    ```bash
    npm install
    ```

4.  **Install frontend dependencies:**
    ```bash
    cd client
    npm install
    ```

5.  **Start the backend server:**
    ```bash
    npm start
    ```

6.  **Start the React frontend:**
    (Open a new terminal session in the **client** directory)
    ```bash
    npm run start
    ```

7.  **Access the application:**
    Open your browser and navigate to `http://localhost:3000`.

---

## 💡 Usage

1.  **Signup:** Create a new account as a regular user using the signup page. Your password will be encrypted upon submission.
2.  **Login:** Access your account using your registered email and password.
3.  **User:**
    * Browse the product list.
    * Add items to your cart.
    * View your cart and place an order.
4.  **Admin:**
    * (Requires an admin-role account for access)
    * Manage the list of users and products.
    * View system statistics.

---

## 🔮 Future Improvements

* **Persistent Storage:** Integrate a traditional database (e.g., **MongoDB** or **MySQL**) to move beyond in-memory storage.
* **Enhanced Authentication:** Implement **JWT-based authentication** for token security and stateless session management.
* **Frontend Design:** Refine the user experience with modern UI/UX design principles and more interactive components.
* **Notifications and Analytics:** Add role-specific notifications (e.g., 'New Order' for Admin) and robust analytics.
