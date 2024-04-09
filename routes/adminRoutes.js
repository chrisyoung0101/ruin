const express = require('express');
const Product = require('../models/productModel');
const { isAuthenticated } = require('./middleware/authMiddleware');
const router = express.Router();

// GET route for the administration page
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    console.log('Retrieving categories for admin page');
    res.render('admin', { categories });
  } catch (error) {
    console.error('Error retrieving categories for admin page:', error.message, error.stack);
    res.status(500).send('Error retrieving categories for admin page');
  }
});

// POST route for adding new products
router.post('/products', isAuthenticated, async (req, res) => {
  try {
    const { productName, description, price, category, images, availability } = req.body;
    const newProduct = new Product({
      productName,
      description,
      price,
      category,
      images: images.split(',').map(image => image.trim()), // Assuming images are submitted as a comma-separated string
      availability: availability === 'true'
    });
    await newProduct.save();
    console.log(`Product ${productName} added successfully`);
    res.redirect('/admin');
  } catch (error) {
    console.error('Error adding new product:', error.message, error.stack);
    res.status(500).send('Error adding new product');
  }
});

module.exports = router;