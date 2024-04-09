const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    console.log(`User ${req.session.userId} is authenticated`);
    return next(); // User is authenticated, proceed to the next middleware/route handler
  } else {
    console.error('User is not authenticated');
    console.error(`Session ID: ${req.sessionID}, Session: ${JSON.stringify(req.session)}`); // Log the session ID and the session object for debugging
    return res.status(401).send('You are not authenticated'); // User is not authenticated
  }
};

const isAdmin = (req, res, next) => {
  // Assuming there's a user role in the session to check if the user is an admin
  if (req.session && req.session.userRole && req.session.userRole === 'admin') {
    console.log(`Admin ${req.session.userId} is authenticated`);
    return next(); // User is an admin, proceed to the next middleware/route handler
  } else {
    console.error('User is not an admin or not authenticated');
    console.error(`Session ID: ${req.sessionID}, Session: ${JSON.stringify(req.session)}`); // Log the session ID and the session object for debugging
    return res.status(403).send('You are not authorized to view this page'); // User is not authorized
  }
};

module.exports = {
  isAuthenticated,
  isAdmin
};