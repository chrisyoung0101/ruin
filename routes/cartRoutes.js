const express = require('express');
const mongoose = require('mongoose');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel'); // Importing Product model to check if productId exists
const { isAuthenticated } = require('./middleware/authMiddleware');
const router = express.Router();

// Add an item to the cart
router.post('/', isAuthenticated, async (req, res) => {
  const { productId, quantity } = req.body;
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    console.error('Invalid product ID format:', productId);
    return res.status(400).send({ message: 'Invalid product ID format' });
  }
  try {
    const productExists = await Product.findById(productId);
    if (!productExists) {
      console.log('Product not found with ID:', productId);
      return res.status(404).send({ message: 'Product not found' });
    }
    let cart = await Cart.findOne({ userId: req.session.userId });
    if (cart) {
      // Check if product already exists in cart
      const itemIndex = cart.products.findIndex(p => p.productId.toString() === productExists._id.toString());
      if (itemIndex > -1) {
        // Update quantity
        cart.products[itemIndex].quantity += quantity;
      } else {
        // Add new product to cart
        cart.products.push({ productId: productExists._id, quantity });
      }
      cart = await cart.save();
      console.log(`Item ${productExists._id} added/updated in cart for user ${req.session.userId}`);
    } else {
      // Create new cart
      cart = await Cart.create({
        userId: req.session.userId,
        products: [{ productId: productExists._id, quantity }],
      });
      console.log(`New cart created for user ${req.session.userId} with item ${productExists._id}`);
    }
    res.status(201).send(cart);
  } catch (error) {
    console.error('Error adding item to cart:', error.message, error.stack);
    res.status(500).send({ message: 'Error adding item to cart', error: error.message });
  }
});

// Update item quantity in the cart
router.put('/', isAuthenticated, async (req, res) => {
  const { productId, quantity } = req.body;
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    console.error('Invalid product ID format:', productId);
    return res.status(400).send({ message: 'Invalid product ID format' });
  }
  try {
    const product = await Product.findById(productId);
    if (!product) {
      console.log('Product not found with ID:', productId);
      return res.status(404).send({ message: 'Product not found' });
    }
    const cart = await Cart.findOne({ userId: req.session.userId });
    if (!cart) {
      console.log('Cart not found for user:', req.session.userId);
      return res.status(404).send({ message: 'Cart not found' });
    }
    const itemIndex = cart.products.findIndex(p => p.productId.toString() === product._id.toString());
    if (itemIndex > -1) {
      cart.products[itemIndex].quantity = quantity;
      await cart.save();
      console.log(`Cart for user ${req.session.userId} updated with new quantity for item ${product._id}`);
      res.send(cart);
    } else {
      console.log('Item not found in cart:', productId);
      res.status(404).send({ message: 'Item not found in cart' });
    }
  } catch (error) {
    console.error('Error updating cart:', error.message, error.stack);
    res.status(500).send({ message: 'Error updating cart', error: error.message });
  }
});

// Remove an item from the cart
router.delete('/:productId', isAuthenticated, async (req, res) => {
  const { productId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    console.error('Invalid product ID format:', productId);
    return res.status(400).send({ message: 'Invalid product ID format' });
  }
  try {
    const product = await Product.findById(productId);
    if (!product) {
      console.log('Product not found with ID:', productId);
      return res.status(404).send({ message: 'Product not found' });
    }
    const cart = await Cart.findOne({ userId: req.session.userId });
    if (!cart) {
      console.log('Cart not found for user:', req.session.userId);
      return res.status(404).send({ message: 'Cart not found' });
    }
    const itemIndex = cart.products.findIndex(p => p.productId.toString() === product._id.toString());
    if (itemIndex > -1) {
      cart.products.splice(itemIndex, 1);
      await cart.save();
      console.log(`Item ${product._id} removed from cart for user ${req.session.userId}`);
      res.send(cart);
    } else {
      console.log('Item not found in cart:', productId);
      res.status(404).send({ message: 'Item not found in cart' });
    }
  } catch (error) {
    console.error('Error removing item from cart:', error.message, error.stack);
    res.status(500).send({ message: 'Error removing item from cart', error: error.message });
  }
});

// Retrieve the current state of the cart
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.session.userId }).populate('products.productId');
    if (!cart) {
      console.log('Cart not found for user:', req.session.userId);
      return res.status(404).send({ message: 'Cart not found' });
    }
    console.log(`Cart retrieved for user ${req.session.userId}`);
    res.send(cart);
  } catch (error) {
    console.error('Error retrieving cart:', error.message, error.stack);
    res.status(500).send({ message: 'Error retrieving cart', error: error.message });
  }
});

module.exports = router;