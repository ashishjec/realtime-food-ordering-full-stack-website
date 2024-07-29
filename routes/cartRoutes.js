// cartRoutes.js
const express = require('express');
const router = express.Router();
const path = require('path');
const cartController = require(path.join('D:/realtime-pizza/app/http/controllers/customers/cartController.js'));



// Assuming you have a single route for updating the cart
router.post('/update', cartController().update);

// Add routes for removing, increasing, and decreasing items in the cart
router.post('/remove', cartController().remove);
router.post('/increase', cartController().increase);
router.post('/decrease', cartController().decrease);

module.exports = router;
