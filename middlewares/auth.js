const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.auth = (req, res, next) => {
    //Extracting Token from headers
    const token = req.headers.authorization?.split(' ')[1];

    //if token is missing return no response
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Token is missing',
        });
    }

    // Verify token
    jwt.verify(token, process.env.JWT_SECRET, (error, user) => {
        // If token verification Fails
        if (error) {
            req.user = null;
            return res.status(403).json('Token is not valid!');
        }
        //Store decoded user data in request object
        req.user = user;

        //Proceed to Next middleware
        next();
    });
};


