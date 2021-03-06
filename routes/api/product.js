const router = require("express").Router();
const auth = require("../../middlewares/auth");
const upload = require("../../utils/upload").single('image');
const Product = require("../../models/Product");

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
        return res.status(200).json(product);
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ errors: [{ msg: 'Product Not Found' }] });
        }
        return res.status(500).json({ errors: [{ msg: 'Internal Server Error' }] });
    }
})

//@Route    POST /products/create
//@desc     Create a Product
//@access   Private
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
        return res.status(400).json({ errors: [{ msg: 'Not Authorised' }] });
    }
})

//@Route    PATCH /products/update/:id
//@desc     Update a Product
//@access   Private
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


module.exports = router;