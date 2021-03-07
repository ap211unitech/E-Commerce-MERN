const router = require('express').Router();
const Order = require('../../models/Order');
const auth = require('../../middlewares/auth');
const { check, validationResult } = require('express-validator');

//@Route    POST /orders/create
//@desc     Order a Product
//@access   Private
router.post("/create", [
    auth,
    check('orderItems', 'Order Items may not be empty').not().isEmpty(),
    check('orderItems', 'Order Items may not be empty').isLength({ min: 0 }),
], async (req, res) => {
    const {
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice
    } = req.body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const order = new Order({
        orderItems,
        user: req.user._id,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice
    });
    try {
        const newOrder = await order.save();
        return res.status(201).json(newOrder);
    } catch (err) {
        return res.status(500).json({ errors: [{ msg: 'Internal Server Error' }] });
    }
})

//@Route    GET /orders/getmyorders
//@desc     Get all Orders of a current user
//@access   Private
router.get("/getmyorders", auth, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id });
        return res.status(200).json(orders);
    } catch (err) {
        return res.status(500).json({ errors: [{ msg: 'Internal Server Error' }] });
    }
})

module.exports = router;