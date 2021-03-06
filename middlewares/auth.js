const config = require('config');
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    const token = req.headers['x-auth-token'];

    //Check if token is not avaliable
    if (!token) {
        return res.status(401).json({ errros: [{ msg: 'Not Authorised' }] })
    }

    //Verify token
    try {
        const decoded = jwt.verify(token, config.get('JWT-Secret'));
        req.user = decoded.user;
        next();
    } catch (error) {
        return res.status(403).json({ errors: [{ msg: "Invalid Token" }] });
    }
}

module.exports = auth;