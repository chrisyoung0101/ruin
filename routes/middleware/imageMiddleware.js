const fs = require('fs');
const path = require('path');

const imageMiddleware = (req, res, next) => {
  const imagesDirectory = path.join(__dirname, '../../public/images');

  fs.readdir(imagesDirectory, (err, files) => {
    if (err) {
      console.error('Error reading images directory:', err.message);
      console.error(err.stack);
      req.images = [];
    } else {
      req.images = files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));
      console.log('Images loaded successfully.');
    }
    next();
  });
};

module.exports = imageMiddleware;