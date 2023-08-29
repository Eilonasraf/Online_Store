const User = require('../models/userModel');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel'); 

exports.checkoutOrder = async (req, res) => {
    try {
        // Find the cart of the current user
        const cart = await Cart.findOne({ userId: req.session.user._id }).populate('products');

        if (!cart) {
            console.log('No cart found for the user');
            res.status(404).send('No cart found for the user');
            return;
        }

        console.log('Cart found: ', cart);

        // Calculate the total price
        let total = 0;
        for(let i=0; i<cart.products.length; i++){
            total += cart.products[i].price; // Assuming your product model has a price field
        }

        console.log('Total price calculated: ', total);

        // Create new Order
        const newOrder = new Order({
            user: req.session.user._id,
            products: cart.products,
            total: total
        });

        console.log('New order created: ', newOrder);

        // Save the order
        const savedOrder = await newOrder.save();

        console.log('Order saved: ', savedOrder);

        // Clear the cart
        cart.products = [];
        await cart.save();

        console.log('Cart cleared');

        res.send('Order processed successfully');

    } catch (error) {
        console.warn('Error: ', error);
        res.status(500).send('Error processing order');
    }
};

exports.getOrderHistory = async (req, res) => {
    try {
      const userId = req.session.user._id;
      const orders = await Order.find({ user: userId }).populate('products');
      res.render('orderHistory', { orders });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error retrieving order history');
    }
  };
  
  exports.getGroupedOrders = async (req, res) => {
    console.log("getGroupedOrders called!");  // <-- Add this
    try {
        const groupedOrders = await Order.aggregate([
            {
                $group: {
                    _id: "$user",
                    count: { $sum: 1 }
                }
            }
        ]);

        res.render('group', { groupedOrders: groupedOrders });
    } catch (error) {
        res.status(500).send(error);
    }
};
