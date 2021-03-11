const router = require("express").Router();
const auth = require("../../middlewares/auth");
const upload = require("../../utils/upload").single('image');
const Product = require("../../models/Product");
const { check, validationResult } = require('express-validator');

//@Route    GET /products/get
//@desc     Get All Products
//@access   Public
router.get("/get", auth, async (req, res) => {
    try {
        const products = await Product.find();
        return res.status(200).json(products);
    } catch (err) {
        return res.status(500).json({ errors: [{ msg: 'Internal Server Error' }] });
    }
})

//@Route    GET /products/get/:id
//@desc     Get A Product By ID
//@access   Public
router.get("/get/:id", auth, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            return res.status(200).json(product);
        }
        else {
            return res.status(404).json({ errors: [{ msg: 'Product Not Found' }] });
        }
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ errors: [{ msg: 'Product Not Found' }] });
        }
        return res.status(500).json({ errors: [{ msg: 'Internal Server Error' }] });
    }
})

//@Route    POST /products/create
//@desc     Create a Product
//@access   Private/ADMIN
router.post("/create", auth, async (req, res) => {
    const user = req.user;
    if (user.type === "admin") {
        upload(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ errors: [{ msg: err }] });
            } else {
                if (req.file == undefined) {
                    return res.status(400).json({ errors: [{ msg: 'Error: No File Selected!' }] });
                } else {
                    try {
                        const { name, brand, category, description, price, countInStock } = req.body;
                        const newProduct = new Product({
                            user: req.user._id, name, brand, category, description, price, countInStock, image: req.file.path
                        })
                        await newProduct.save();
                        return res.status(201).json(newProduct);
                    } catch (err) {
                        return res.status(500).json({ errors: [{ msg: 'Internal Server Error' }] });
                    }
                }
            }
        });
    }
    else {
        return res.status(401).json({ errors: [{ msg: 'Not Authorised' }] });
    }
})

//@Route    PATCH /products/update/:id
//@desc     Update a Product
//@access   Private/ADMIN
router.patch("/update/:id", auth, async (req, res) => {
    const user = req.user;
    if (user.type === "admin") {
        upload(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ errors: [{ msg: err }] });
            } else {
                try {
                    const { name, brand, category, description, price, countInStock } = req.body;
                    const findProduct = await Product.findById(req.params.id);
                    if (findProduct) {
                        findProduct.name = name
                        findProduct.price = price
                        findProduct.description = description
                        findProduct.image = req.file ? req.file.path : findProduct.image
                        findProduct.brand = brand
                        findProduct.category = category
                        findProduct.countInStock = countInStock
                        await findProduct.save();
                        return res.status(201).json(findProduct);
                    }
                    else {
                        return res.status(500).json({ errors: [{ msg: 'Product Not Found' }] });
                    }
                } catch (err) {
                    if (err.kind === 'ObjectId') {
                        return res.status(404).json({ errors: [{ msg: 'Product Not Found' }] });
                    }
                    return res.status(500).json({ errors: [{ msg: 'Internal Server Error' }] });
                }
            }
        });
    }
    else {
        return res.status(400).json({ errors: [{ msg: 'Not Authorised' }] });
    }
})

//@Route    DELETE /products/delete/:id
//@desc     Delete a Product
//@access   Private/ADMIN
router.delete("/delete/:id", auth, async (req, res) => {
    const user = req.user;
    if (user.type === "admin") {
        try {
            const product = await Product.findById(req.params.id);
            if (product) {
                await Product.findByIdAndDelete(req.params.id);
                return res.status(200).json({ msg: 'Product Deleted' });
            }
            else {
                return res.status(404).json({ errors: [{ msg: 'Product Not Found' }] });
            }
        } catch (err) {
            if (err.kind === 'ObjectId') {
                return res.status(404).json({ errors: [{ msg: 'Product Not Found' }] });
            }
            return res.status(500).json({ errors: [{ msg: 'Internal Server Error' }] });
        }
    }
    else {
        return res.status(400).json({ errors: [{ msg: 'Not Authorised' }] });
    }
})

//@Route    PUT /products/review/:id
//@desc     Giving review to a product by ID
//@access   Private
router.put("/review/:id", [
    auth,
    check('comment', 'Comment is required').not().isEmpty(),
    check('rating', 'Rating is required').not().isEmpty(),
], async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            const reviews = product.reviews;
            const alreadyReviewed = reviews.find(r => r.user.toString() === req.user._id.toString());
            if (!alreadyReviewed) {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    return res.status(400).json({ errors: errors.array() })
                }
                const review = {
                    name: req.user.name,
                    rating: Number(req.body.rating),
                    comment: req.body.comment,
                    user: req.user._id
                }
                product.reviews.push(review);
                product.numReviews = product.reviews.length;
                product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;
                await product.save();
                return res.status(200).json({ msg: 'Review added' });
            }
            else {
                return res.status(404).json({ errors: [{ msg: 'Product Already Reviewed' }] });
            }
        }
        else {
            return res.status(404).json({ errors: [{ msg: 'Product Not Found' }] });
        }
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ errors: [{ msg: 'Product Not Found' }] });
        }
        return res.status(500).json({ errors: [{ msg: 'Internal Server Error' }] });
    }
})
module.exports = router;