const router = require('express').Router();
const User = require('../../models/User');
const auth = require("../../middlewares/auth");
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

//@Route    GET /user
//@desc     Get Current User Data
//@access   Private
router.get("/", auth, async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.user._id }).select('-password');
        return res.status(200).json(user);
    } catch (err) {
        return res.status(500).json({ errors: [{ msg: 'Internal Server Error' }] });
    }
})

//@Route    POST /user/login
//@desc     Login User
//@access   Public
router.post("/login", [
    check('email', 'Email must be valid').isEmail(),
    check('password', 'Password may not be empty').exists()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
        // Finding User of Given Email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ errors: [{ msg: 'Invalid Email' }] });
        }
        // Matching Password
        const matched = await bcryptjs.compare(password, user.password);
        if (!matched) {
            return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
        }
        //Creating Token
        const payload = { user };
        jwt.sign(payload, config.get('JWT-Secret'), { expiresIn: '3600s' }, (err, token) => {
            if (err) throw err;
            return res.status(200).json({ token });
        })
    } catch (err) {
        return res.status(500).json({ errors: [{ msg: 'Internal Server Error' }] });
    }
})

module.exports = router;