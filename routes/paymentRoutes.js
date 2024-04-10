const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Product = require('../models/productModel');
const { isAuthenticated } = require('./middleware/authMiddleware');

router.post('/create-checkout-session', isAuthenticated, async (req, res) => {
  const { productId } = req.body;
  try {
    const product = await Product.findById(productId);
    if (!product) {
      console.log('Product not found with ID:', productId);
      return res.status(404).json({ error: 'Product not found' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.productName,
            },
            unit_amount: product.price * 100, // Stripe expects price in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/payment/cancel`,
    });

    console.log('Stripe Checkout session created successfully:', session.id);
    res.json({ id: session.id });
  } catch (error) {
    console.error('Error creating Stripe Checkout session:', error.message);
    console.error(error.stack);
    res.status(500).json({ error: 'An error occurred' });
  }
});

router.get('/success', isAuthenticated, async (req, res) => {
  const { session_id } = req.query;
  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    const productId = session.client_reference_id;
    await Product.findByIdAndUpdate(productId, { availability: false });
    console.log(`Payment successful for session ${session_id}. Product ${productId} marked as sold out.`);
    res.render('paymentSuccess');
  } catch (error) {
    console.error('Error processing payment success:', error.message);
    console.error(error.stack);
    res.redirect('/payment/cancel');
  }
});

router.get('/cancel', isAuthenticated, (req, res) => {
  console.log('Payment cancelled');
  res.render('paymentCancel');
});

module.exports = router;