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

//@Route    GET /orders/orderID/:id
//@desc     Get a order by ID
//@access   Private
router.get("/orderID/:id", auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');
        return res.status(200).json(order);
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ errors: [{ msg: 'Order Not Found' }] });
        }
        return res.status(500).json({ errors: [{ msg: 'Internal Server Error' }] });
    }
})

// @desc    Update order to paid
// @route   GET /orders/:id/pay
// @access  Private
router.get('/:id/pay', auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            order.isPaid = true
            order.paidAt = Date.now()
            order.paymentResult = {
                id: req.body.id,
                status: req.body.status,
                update_time: req.body.update_time,
                email_address: req.body.payer.email_address,
            }
        }
        else {
            return res.status(404).json({ errors: [{ msg: 'Order Not Found' }] });
        }
        const updatedOrder = await order.save()
        return res.json(updatedOrder);
    } catch (err) {
        return res.status(500).json({ errors: [{ msg: 'Internal Server Error' }] });
    }
})

// @desc    Update order to delivered
// @route   GET /orders/:id/deliver
// @access  Private/ADMIN
router.get('/:id/deliver', auth, async (req, res) => {
    if (req.user.type === "admin") {
        try {
            const order = await Order.findById(req.params.id);
            if (order) {
                order.isDelivered = true
                order.deliveredAt = Date.now()
            }
            else {
                return res.status(404).json({ errors: [{ msg: 'Order Not Found' }] });
            }
            const updatedOrder = await order.save()
            return res.json(updatedOrder);
        } catch (err) {
            return res.status(500).json({ errors: [{ msg: 'Internal Server Error' }] });
        }
    }
    else {
        return res.status(401).json({ errors: [{ msg: 'Not Authorised' }] });
    }
})


//@Route    GET /orders/allorders
//@desc     Get all orders
//@access   Private/ADMIN
router.get("/allorders", auth, async (req, res) => {
    if (req.user.type === "admin") {
        try {
            const orders = await Order.find().populate('user', 'id name email');
            return res.status(200).json(orders);
        } catch (err) {
            return res.status(500).json({ errors: [{ msg: 'Internal Server Error' }] });
        }
    }
    else {
        return res.status(401).json({ errors: [{ msg: 'Not Authorised' }] });
    }
})

module.exports = router;