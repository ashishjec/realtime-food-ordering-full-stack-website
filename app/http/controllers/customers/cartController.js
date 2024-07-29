function cartController() {
    return {
        index(req, res) {
            console.log(req.session)
            res.render('customers/cart', { user: req.user, session: req.session });
        },
        update(req, res) {
            if (!req.session.cart) {
                req.session.cart = {
                    items: {},
                    totalQty: 0,
                    totalPrice: 0
                }
            }
            let cart = req.session.cart;

            const itemId = req.body._id;
            const itemPrice = req.body.price;

            if (!cart.items[itemId]) {
                cart.items[itemId] = {
                    item: req.body,
                    qty: 1
                };
                cart.totalQty += 1; // Increase total quantity
                cart.totalPrice += itemPrice; // Add item price to total price
            } else {
                cart.items[itemId].qty += 1; // Increase quantity of existing item
                cart.totalQty += 1; // Increase total quantity
                cart.totalPrice += itemPrice; // Add item price to total price
            }

            return res.json({ totalQty: req.session.cart.totalQty });
        },
        remove(req, res) {
            const itemId = req.body._id;
            if (req.session.cart.items[itemId]) {
                const item = req.session.cart.items[itemId];
                req.session.cart.totalQty -= item.qty;
                req.session.cart.totalPrice -= item.item.price * item.qty;
                delete req.session.cart.items[itemId];
            }

            return res.json({ cart: req.session.cart });
        },
        increase(req, res) {
            const itemId = req.body._id;
            if (req.session.cart.items[itemId]) {
                const item = req.session.cart.items[itemId];
                item.qty += 1; // Increase quantity
                req.session.cart.totalQty += 1; // Increase total quantity
                req.session.cart.totalPrice += item.item.price; // Increase total price
            }
        
            return res.json({ cart: req.session.cart });
        },
        decrease(req, res) {
            const itemId = req.body._id;
            if (req.session.cart.items[itemId] && req.session.cart.items[itemId].qty > 1) {
                const item = req.session.cart.items[itemId];
                item.qty -= 1; // Decrease quantity of the item
                req.session.cart.totalQty -= 1; // Decrease total quantity
                req.session.cart.totalPrice -= item.item.price; // Subtract item price from total price
            }

            return res.json({ cart: req.session.cart });
        }
    };
}

module.exports = cartController;
