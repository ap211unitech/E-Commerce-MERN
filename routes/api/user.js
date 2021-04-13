const router = require("express").Router();
const User = require("../../models/User");
const { check, validationResult } = require("express-validator");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const auth = require('../../middlewares/auth');

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
            user: newUser
        }
        jwt.sign(payload, config.get('JWT-Secret'), { expiresIn: '3600s' }, (err, token) => {
            if (err) throw err;
            return res.status(201).json({ token });
        });
    } catch (err) {
        await User.deleteOne({ email: req.body.email })
        return res.status(500).json({ errors: [{ msg: 'Internal Server Error' }] });
    }

})




// @Route   GET /users
// @desc    Get all users
// @access  Private/ADMIN
router.get('/users', auth, async (req, res) => {
    if (req.user.type === 'admin') {
        try {
            const users = await User.find();
            return res.status(200).json(users);
        } catch (err) {
            return res.status(500).json({ errors: [{ msg: 'Internal Server Error' }] });
        }
    }
    else {
        return res.status(401).json({ errors: [{ msg: 'Not Authorised' }] });
    }
})

// @Route   DELETE /user/:id
// @desc    Delete a user
// @access  Private/ADMIN
router.delete('/user/:id', auth, async (req, res) => {
    if (req.user.type === 'admin') {
        const user = await User.findById(req.params.id);
        if (user) {
            await user.remove();
            return res.status(200).json({ errors: [{ msg: 'User Deleted' }] });
        }
        else {
            return res.status(404).json({ errors: [{ msg: 'User Not Found' }] });
        }
    }
    else {
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ errors: [{ msg: 'User Not Found' }] });
        }
        return res.status(401).json({ errors: [{ msg: 'Not Authorised' }] });
    }
})

// @Route   GET /user/profile/:id
// @desc    Get user profile by ID
// @access  Private/ADMIN
router.get('/user/profile/:id', auth, async (req, res) => {
    if (req.user.type === 'admin') {
        try {
            const user = await User.findById(req.params.id).select('-__v');
            if (user) {
                return res.status(200).json(user)
            }
            return res.status(500).json({ errors: [{ msg: 'User Not Found' }] });
        } catch (err) {
            if (errr.kind === 'ObjectId') {
                return res.status(500).json({ errors: [{ msg: 'User Not Found' }] });
            }
            return res.status(500).json({ errors: [{ msg: 'Internal Server Error' }] });
        }
    }
    else {
        return res.status(401).json({ errors: [{ msg: 'Not Authorised' }] });
    }
})

// @Route   PUT /user/update/:id
// @desc    Update user profile by ID
// @access  Private/ADMIN
router.put('/user/update/:id', auth, async (req, res) => {
    if (req.user.type === 'admin') {
        try {
            const user = await User.findById(req.params.id);
            if (user) {
                user.name = req.body.name || user.name;
                user.email = req.body.email || user.email;
                user.isAdmin = req.body.isAdmin;
                const updatedUser = await user.save()
                return res.status(200).json({
                    _id: updatedUser._id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    isAdmin: updatedUser.isAdmin,
                });
            }
            return res.status(500).json({ errors: [{ msg: 'User Not Found' }] });
        } catch (err) {
            if (errr.kind === 'ObjectId') {
                return res.status(500).json({ errors: [{ msg: 'User Not Found' }] });
            }
            return res.status(500).json({ errors: [{ msg: 'Internal Server Error' }] });
        }
    }
    else {
        return res.status(401).json({ errors: [{ msg: 'Not Authorised' }] });
    }
})

module.exports = router;