const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const errorHandler = require('../middlewares/errorHandler');

exports.loadUser = async (req, res, next) => {
    // Extract username from request parameters
    const { username } = req.params;

    try {
        // Find the user by username in the database
        const user = await User.findOne({ username });

        // If user is found, respond with user information
        if (user) {
            res.json({
                success: true,
                username: username,
                userId: user._id,
                user,
            });
        } else {
            // If user is not found, respond with status 400 and error message
            res.status(400).json({
                success: false,
                message: 'User not found',
            });
        }
    } catch (error) {
        // If an error occurs during database operation, pass the error to the global error handler middleware
        next(new Error('Error getting user'));
    }
};

exports.registerUser = async (req, res, next) => {
    try {
        // Extract username and password from request body
        const { username, password } = req.body;

        ///Validation of the data
        if (!username || !password) {
            return res.status(403).json({
                success: false,
                message: 'All fields are required',
            });
        }

        //check if the same user registering again?
        const existedUser = await User.findOne({ username });

        //there can be multiple users with same username , which crete conflict
        // to resolve this conflict made username unique in user model
        if (existedUser) {
            return res.status(409).json({
                success: false,
                message: 'User already exists',
            });
        }

        // Hash the password before storing in the database
        const hashedPassword = await bcrypt.hashSync(password, 10);

        // Create a new user instance with hashed password and save in DB
        const user = new User({ username, password: hashedPassword });
        await user.save();

        // Generate JWT token
        const token = jwt.sign({ username: username }, process.env.JWT_SECRET, {
            expiresIn: '15d',
        });

        // Set the token in a cookie
        res.cookie('token', token, {
            httpOnly: true,
            strict: true,
            secure: true,
        });

        // Respond with success status and user information
        return res.status(201).json({
            success: true,
            message: 'User Registered Successfully',
            token,
            username: username,
            userId: user._id,
            user,
        });
    } catch (error) {
        // Pass the error to the global error handler middleware
        next(new Error('Error registering user'));
    }
};

exports.loginUser = async (req, res, next) => {
    try {
        // Extract username and password from request body
        const { username, password } = req.body;

        //Validation
        if (!username || !password) {
            return res.status(400).json(
               
                'Please provide username and password'
            )
        }

        //Find the user by username in the database
        const user = await User.findOne({ username });

        //Check if user exists
        if (!user) {
            res.status(400).json({
                
                message: 'Please provide valid username and password',
            });
        } else {
            // Compare the password provided with the hashed password stored in the database
            const comparePassword = await bcrypt.compare(
                password,
                user.password
            );

            //Compared Password Wrong?
            if (!comparePassword) {
                return res
                    .status(400)
                    .json({ success: false, message: 'Invalid credentials' });
            }

            // Generate JWT token for authentication
            const token = jwt.sign(
                { username: username },
                process.env.JWT_SECRET,
                {
                    expiresIn: '15d',
                }
            );
            // Set the token in a cookie for subsequent requests
            res.cookie('token', token, { httpOnly: true, secure: true });

            // Respond with success status and user information
            return res.status(200).json({
                success: true,
                message: 'Logged In Successfully',
                token,
                username: username,
                userId: user._id,
                user,
            });
        }
    } catch (error) {
        // Pass error to global handler
        next(new Error('Error logging in user'));
    }
};

exports.logoutUser = async (req, res, next) => {
    try {
        // Clear the JWT token cookie from the client's browser
        res.clearCookie('token');

        // Respond with a success status and message indicating successful logout
        return res.status(200).json({
            success: true,
            message: 'Logged out successfully',
        });
    } catch (error) {
        //Pass the error to global handler
        next(new Error('Error logging out user'));
    }
};
