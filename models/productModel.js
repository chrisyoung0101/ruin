const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productName: { 
    type: String, 
    unique: true, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true, 
    validate: {
      validator: function(v) {
        return v > 0;
      },
      message: props => `${props.value} is not a valid price. Price must be a positive number.`
    }
  },
  category: { 
    type: String, 
    required: true, 
    enum: ['Sterling Silver Jewelry', 'Sculpture', 'Vessel']
  },
  images: [{ 
    type: String 
  }],
  availability: { 
    type: Boolean, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

productSchema.pre('save', function(next) {
  console.log(`Saving product: ${this.productName}`);
  next();
});

productSchema.post('save', function(doc) {
  console.log(`Product ${doc.productName} saved successfully.`);
});

productSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('Product name must be unique.'));
  } else {
    console.error(`Error saving product: ${error}`);
    console.error(error.stack);
    next(error);
  }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;