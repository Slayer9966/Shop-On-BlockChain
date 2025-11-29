// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

contract Electron {
    struct user {
        uint id;
        string username;      // Encrypted
        string email;         // Encrypted
        string role;
        string passwordHash;  // Encrypted
    }

    struct products {
        uint id;
        string name;          // Encrypted
        string description;   // Encrypted
        string price;         // Encrypted
        string stock;         // Encrypted
        string category;      // Encrypted
        string image;         // Encrypted (URL or base64)
        bool active;          // For soft delete
    }

    struct cart {
        uint id;
        uint user_id;
        string product_id;
        string quantity;
    }

    struct orders {
        uint id;
        uint user_id;
        string order_total;
        string status;
        string timestamp;
    }

    // Users
    uint nextUserId = 1;
    user[] private users;
    event useradded(string name, string email, string pass);

    // Products
    uint nextProductId = 1;
    products[] private productList;
    event ProductAdded(uint id, string name, string price);
    event ProductUpdated(uint id, string field, string newValue);
    event ProductDeleted(uint id);

    // Cart
    cart[] private cartList;
    uint nextCartId = 1;

    // Orders
    orders[] private orderList;
    uint nextOrderId = 1;

    // ---------- User functions ----------
    function addUser(
        string memory _name,
        string memory _email,
        string memory _pass,
        string memory role
    ) public returns (bool) {

        // --- UNIQUE EMAIL CHECK ---
        for (uint i = 0; i < users.length; i++) {
            require(
                keccak256(bytes(users[i].email)) != keccak256(bytes(_email)),
                "Email already registered"
            );
        }

        user memory newUser = user({
            id: nextUserId,
            username: _name,
            email: _email,
            role: role,
            passwordHash: _pass
        });

        users.push(newUser);
        emit useradded(_name, _email, _pass);
        nextUserId++;

        return true;
    }

    function getUsers() public view returns (user[] memory) {
        return users;
    }

    function checkUser(string memory username, string memory passwordHash) public view returns (bool) {
        for (uint i = 0; i < users.length; i++) {
            if (keccak256(bytes(users[i].username)) == keccak256(bytes(username))) {
                if (keccak256(bytes(users[i].passwordHash)) == keccak256(bytes(passwordHash))) {
                    return true;
                } else {
                    return false;
                }
            }
        }
        return false;
    }

    function getUserByUsername(string memory username) public view returns (user memory) {
        for (uint i = 0; i < users.length; i++) {
            if (keccak256(bytes(users[i].username)) == keccak256(bytes(username))) {
                return users[i];
            }
        }
        revert("User not found");
    }

    // ---------- Product functions ----------
    function addProduct(
        string memory _name,
        string memory _description,
        string memory _price,
        string memory _stock,
        string memory _category,
        string memory _image
    ) public returns (bool) {

        products memory newProduct = products({
            id: nextProductId,
            name: _name,
            description: _description,
            price: _price,
            stock: _stock,
            category: _category,
            image: _image,
            active: true
        });

        productList.push(newProduct);
        emit ProductAdded(nextProductId, _name, _price);
        nextProductId++;

        return true;
    }

    function getProducts() public view returns (products[] memory) {
        // Count active products
        uint activeCount = 0;
        for (uint i = 0; i < productList.length; i++) {
            if (productList[i].active) {
                activeCount++;
            }
        }

        // Create array of active products
        products[] memory activeProducts = new products[](activeCount);
        uint idx = 0;
        for (uint i = 0; i < productList.length; i++) {
            if (productList[i].active) {
                activeProducts[idx] = productList[i];
                idx++;
            }
        }

        return activeProducts;
    }

    function getProductById(uint _id) public view returns (products memory) {
        for (uint i = 0; i < productList.length; i++) {
            if (productList[i].id == _id && productList[i].active) {
                return productList[i];
            }
        }
        revert("Product not found");
    }

    function updateProductStock(uint _id, string memory _newStock) public returns (bool) {
        for (uint i = 0; i < productList.length; i++) {
            if (productList[i].id == _id && productList[i].active) {
                productList[i].stock = _newStock;
                emit ProductUpdated(_id, "stock", _newStock);
                return true;
            }
        }
        revert("Product not found");
    }

    function updateProductPrice(uint _id, string memory _newPrice) public returns (bool) {
        for (uint i = 0; i < productList.length; i++) {
            if (productList[i].id == _id && productList[i].active) {
                productList[i].price = _newPrice;
                emit ProductUpdated(_id, "price", _newPrice);
                return true;
            }
        }
        revert("Product not found");
    }

    function deleteProduct(uint _id) public returns (bool) {
        for (uint i = 0; i < productList.length; i++) {
            if (productList[i].id == _id) {
                productList[i].active = false; // Soft delete
                emit ProductDeleted(_id);
                return true;
            }
        }
        revert("Product not found");
    }

    // ---------- Cart functions ----------
    function addToCart(
        uint _user_id,
        string memory _product_id,
        string memory _quantity
    ) public returns (bool) {

        cart memory newCartItem = cart({
            id: nextCartId,
            user_id: _user_id,
            product_id: _product_id,
            quantity: _quantity
        });

        cartList.push(newCartItem);
        nextCartId++;

        return true;
    }

    function getCart() public view returns (cart[] memory) {
        return cartList;
    }

    function getUserCart(uint _user_id) public view returns (cart[] memory) {
        uint count = 0;
        for (uint i = 0; i < cartList.length; i++) {
            if (cartList[i].user_id == _user_id) {
                count++;
            }
        }

        cart[] memory result = new cart[](count);
        uint idx = 0;
        for (uint i = 0; i < cartList.length; i++) {
            if (cartList[i].user_id == _user_id) {
                result[idx] = cartList[i];
                idx++;
            }
        }
        return result;
    }

    function clearUserCart(uint _user_id) public returns (bool) {
        // Note: In a real scenario, you might want a more efficient approach
        // This is a simple implementation
        for (uint i = 0; i < cartList.length; i++) {
            if (cartList[i].user_id == _user_id) {
                // Mark as removed (you could also shift array elements)
                cartList[i].quantity = "0";
            }
        }
        return true;
    }

    // ---------- Order functions ----------
    function addOrder(
        uint _user_id,
        string memory _order_total,
        string memory _status,
        string memory _timestamp
    ) public returns (bool) {

        orders memory newOrder = orders({
            id: nextOrderId,
            user_id: _user_id,
            order_total: _order_total,
            status: _status,
            timestamp: _timestamp
        });

        orderList.push(newOrder);
        nextOrderId++;

        return true;
    }

    function getOrders() public view returns (orders[] memory) {
        return orderList;
    }

    function getUserOrders(uint _user_id) public view returns (orders[] memory) {
        uint count = 0;
        for (uint i = 0; i < orderList.length; i++) {
            if (orderList[i].user_id == _user_id) {
                count++;
            }
        }

        orders[] memory result = new orders[](count);
        uint idx = 0;
        for (uint i = 0; i < orderList.length; i++) {
            if (orderList[i].user_id == _user_id) {
                result[idx] = orderList[i];
                idx++;
            }
        }
        return result;
    }

    function updateOrderStatus(uint _order_id, string memory _status) public returns (bool) {
        for (uint i = 0; i < orderList.length; i++) {
            if (orderList[i].id == _order_id) {
                orderList[i].status = _status;
                return true;
            }
        }
        revert("Order not found");
    }
}