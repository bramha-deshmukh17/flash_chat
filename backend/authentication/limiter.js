const rateLimit = require('express-rate-limit');

// Define a rate limiter for login and registration
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Allow 5 requests per 15 minutes
    message: "Too many attempts. Please try again after 15 minutes."
});

module.exports = {limiter};
