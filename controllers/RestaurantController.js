const Restaurant = require('../models/Restaurant');
const User = require('../models/User');

const restaurantController = {};


restaurantController.register = async (req, res) => {
    try {

        const { name, address, category } = req.body;
        const userId = req.userId;


        const user = await User.findById(userId);
        if (!user || user.role !== 'Administrador') {
            return res.status(403).send('No autorizado');
        }


        let restaurant = await Restaurant.findOne({ name });
        if (restaurant) {
            return res.status(400).send('Ya existe un restaurante con ese nombre');
        }


        restaurant = new Restaurant({
            name,
            address,
            category,
            admin: userId
        });


        await restaurant.save();

        res.json(restaurant);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error del servidor');
    }
};

restaurantController.getRestaurant = async (req, res) => {
    try {

        const restaurantId = req.params.restaurantId;


        const restaurant = await Restaurant.findById(restaurantId);

        if (!restaurant) {

            return res.status(404).send('Restaurante no encontrado');
        }


        res.json(restaurant);
    } catch (error) {

        console.error(error.message);
        res.status(500).send('Error del servidor');
    }
};

restaurantController.searchRestaurants = async (req, res) => {
    try {
        const { category, name } = req.query;

        const matchStage = { isActive: true };
        if (category) {
            matchStage.category = category;
        }
        if (name) {
            matchStage.name = new RegExp(name, 'i');
        }

        const pipeline = [
            { $match: matchStage },
            {
                $project: {
                    restaurantData: { $concat: ["$name", " - ", "$category", " - ", "$address"] },
                    rating: 1
                }
            },
            { $sort: { rating: -1 } }
        ];

        const restaurants = await Restaurant.aggregate(pipeline);

        res.json(restaurants);

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};

restaurantController.updateRestaurant = async (req, res) => {
    try {
        const restaurantId = req.params.restaurantId;

        const updateData = req.body;

        // Actualiza el restaurante
        const updatedRestaurant = await Restaurant.findByIdAndUpdate(
            restaurantId,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        res.json(updatedRestaurant);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error del servidor');
    }
};

restaurantController.inactivateRestaurant = async (req, res) => {
    try {
        const restaurantId = req.params.restaurantId;

        const updatedRestaurant = await Restaurant.findByIdAndUpdate(
            restaurantId,
            { $set: { isActive: false } },
            { new: true, runValidators: true }
        );

        res.json(updatedRestaurant);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error del servidor');
    }
};

module.exports = restaurantController;


module.exports = restaurantController;
