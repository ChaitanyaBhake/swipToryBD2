const express = require('express');
const app = express();

// Catch-all route middleware for handling 404 errors
app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;

    next(error);
});

// Error-handling middleware for handling all other errors
app.use((error, req, res, next) => {
    const status = error.status || 500;
    res.status(status).json({
        error: {
            status,
            message: error.message,
        },
    });
});
