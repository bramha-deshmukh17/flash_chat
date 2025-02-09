
const LoginCheck = (req, res) => {

    // If token is valid, return success message or user data
    if (req.user) {
        return res.status(200).json({ message: 'User is already logged in', user: req.user });
    } else {
        return res.status(401).json({ error: 'No valid session' });
    }
};

module.exports = { LoginCheck };