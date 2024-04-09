const express = require('express');
const Product = require('../models/productModel');
const { isAuthenticated } = require('./middleware/authMiddleware');
const router = express.Router();

// Create a new product
router.post('/products', isAuthenticated, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    console.log('Product created successfully:', product.productName);
    res.status(201).send({ message: 'Product created successfully', product });
  } catch (error) {
    console.error('Error creating product:', error.message, error.stack);
    res.status(400).send(error.message);
  }
});

// Retrieve all products
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find({});
    console.log('Retrieved all products');
    res.status(200).send(products);
  } catch (error) {
    console.error('Error retrieving all products:', error.message, error.stack);
    res.status(500).send(error.message);
  }
});

// Filter products based on query parameters (price, material, availability)
router.get('/products/filter', async (req, res) => {
  try {
    const { price, material, availability } = req.query;
    let queryObj = {};

    if (price) {
      // Assuming price is passed as "min,max"
      const [minPrice, maxPrice] = price.split(',');
      queryObj.price = { $gte: minPrice, $lte: maxPrice || Infinity };
    }

    if (material) {
      queryObj.category = material; // Assuming 'material' correlates directly with 'category'
    }

    if (availability) {
      queryObj.availability = availability === 'true'; // Convert query parameter to boolean
    }

    const products = await Product.find(queryObj).sort({ createdAt: -1 });
    if (products.length === 0) {
      return res.status(404).send({ message: 'No products found matching criteria' });
    }
    console.log('Filtered products based on criteria');
    res.status(200).send(products);
  } catch (error) {
    console.error('Error filtering products:', error.message, error.stack);
    res.status(500).send(error.message);
  }
});

// Retrieve a single product by ID
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      console.log('Product not found with ID:', req.params.id);
      return res.status(404).send('Product not found');
    }
    console.log('Retrieved product:', product.productName);
    res.status(200).send(product);
  } catch (error) {
    console.error('Error retrieving product by ID:', error.message, error.stack);
    res.status(500).send(error.message);
  }
});

// Update a product by ID
router.put('/products/:id', isAuthenticated, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) {
      console.log('Product not found with ID:', req.params.id);
      return res.status(404).send('Product not found');
    }
    console.log('Product updated successfully:', product.productName);
    res.status(200).send({ message: 'Product updated successfully', product });
  } catch (error) {
    console.error('Error updating product:', error.message, error.stack);
    res.status(400).send(error.message);
  }
});

// Delete a product by ID
router.delete('/products/:id', isAuthenticated, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      console.log('Product not found with ID:', req.params.id);
      return res.status(404).send('Product not found');
    }
    console.log('Product deleted successfully:', product.productName);
    res.status(200).send({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error.message, error.stack);
    res.status(500).send(error.message);
  }
});

// Retrieve products by category
router.get('/products/category/:category', async (req, res) => {
  try {
    const category = decodeURIComponent(req.params.category);
    const products = await Product.find({ category }).sort({ createdAt: -1 });
    if (products.length === 0) {
      res.render('categoryEmpty', { category });
    } else {
      console.log(`Retrieved products in category ${category}`);
      res.render('productCategory', { products, category }); // Ensure category is passed for dynamic rendering
    }
  } catch (error) {
    console.error('Error retrieving products by category:', error.message, error.stack);
    res.status(500).send(error.message);
  }
});

// Route for product detail page
router.get('/products/detail/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send('Product not found');
    }
    res.render('productDetail', { product });
  } catch (error) {
    console.error('Error retrieving product detail:', error.message);
    res.status(500).send(error.message);
  }
});

// Route for checking product availability
router.get('/products/availability/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send({ message: 'Product not found' });
    }
    res.send({ availability: product.availability });
  } catch (error) {
    console.error('Error checking product availability:', error.message);
    res.status(500).send({ message: error.message });
  }
});

module.exports = router;