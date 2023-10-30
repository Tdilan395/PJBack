const Product = require('../models/Product');

const productController = {};

productController.createProduct = async (req, res) => {
    try {
        const restaurantId = req.params.restaurantId;
        const { name, description, category, price } = req.body;

        const newProduct = new Product({
            name,
            description,
            category,
            price,
            restaurant: restaurantId,
        });

        await newProduct.save();

        res.json(newProduct);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error del servidor');
    }
};

productController.getProduct = async (req, res) => {
    try {
        const productId = req.params.productId;
        const product = await Product.findById(productId);


        res.json(product);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error del servidor');
    }
};

productController.searchProducts = async (req, res) => {
    try {
        const { restaurant, category } = req.query;

        const matchStage = { isActive: true };
        if (restaurant) {
            matchStage["restaurantData.name"] = new RegExp(restaurant, 'i');  // 'i' para búsqueda insensible a mayúsculas y minúsculas
        }
        if (category) {
            matchStage.category = new RegExp(category, 'i');  // 'i' para búsqueda insensible a mayúsculas y minúsculas
        }

        const lookupStage = {
            $lookup: {
                from: "restaurants",
                localField: "restaurant",
                foreignField: "_id",
                as: "restaurantData"
            }
        };

        const unwindStage = {
            $unwind: {
                path: "$restaurantData",
                preserveNullAndEmptyArrays: true
            }
        };

        const projectStage = {
            $project: {
                productData: {
                    $concat: [
                        "$name",
                        " - ",
                        { $ifNull: ["$restaurantData.name", "Desconocido"] },
                        " - ",
                        "$category",
                        " - $",
                        { $toString: "$price" }
                    ]
                }
            }
        };

        const pipeline = [
            lookupStage,
            unwindStage,
            { $match: matchStage },
            projectStage
        ];

        const products = await Product.aggregate(pipeline);

        res.json(products);

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error del servidor');
    }
};


productController.updateProduct = async (req, res) => {
    try {
        const productId = req.params.productId;
        const updateData = req.body;

        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        res.json(updatedProduct);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error del servidor');
    }
};

productController.deleteProduct = async (req, res) => {
    try {
        const productId = req.params.productId;

        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            { $set: { isActive: false } },
            { new: true, runValidators: true }
        );

        res.json(updatedProduct);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error del servidor');
    }
};

module.exports = productController;
