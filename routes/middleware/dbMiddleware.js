const mongoose = require('mongoose');

const checkDbConnection = (req, res, next) => {
  const dbState = mongoose.connection.readyState;
  if (dbState !== 1) {
    console.error('Database connection error: MongoDB is not connected.');
    return res.status(503).send('Service Unavailable: Cannot connect to the database.');
  }
  console.log('Database connection check passed.');
  next();
};

module.exports = checkDbConnection;