const router = require("express").Router();
const User = require("../../models/User");
const { check, validationResult } = require("express-validator");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");

//@Route    POST /signup
//@desc     Register User
//@access   Public
router.post('/', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Email must be valid').isEmail(),
    check('password', 'Password should be at least 6 charcters long').isLength({ min: 6 }),
], async (req, res) => {
    const { name, email, password } = req.body;

    //Validate Data
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    try {
        //Find if user already exists
        const findUser = await User.findOne({ email });
        if (findUser) {
            return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
        }
        const newUser = new User({ name, email, password });

        // Hashing
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(newUser.password, salt);
        newUser.password = hashedPassword;
        await newUser.save();

        // Creating Token
        const payload = {
            user: {
                id: newUser._id
            }
        }
        jwt.sign(payload, config.get('JWT-Secret'), { expiresIn: '365d' }, (err, token) => {
            if (err) throw err;
            return res.status(201).json({ token });
        });
    } catch (err) {
        await User.deleteOne({ email: req.body.email })
        return res.status(500).json({ errors: [{ msg: 'Internal Server Error' }] });
    }

})

module.exports = router;