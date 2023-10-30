const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Product = require('../models/Product');
const Order = require('../models/Order');
const hasPermission = {};

hasPermission.userId = async (req, res, next) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send('Usuario no encontrado');
        }

        if (!user.isActive) {
            return res.status(403).send('Usuario no está activo');
        }

        next();
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error del servidor');
    }
};

hasPermission.restaurantId = async (req, res, next) => {
    try {
        const restaurantId = req.params.restaurantId;
        const userId = req.userId;

        // Verificar que userId exista
        if (!userId) {
            return res.status(401).send('No autorizado');
        }

        const restaurant = await Restaurant.findById(restaurantId).populate('admin');

        if (!restaurant) {
            return res.status(404).send('Restaurante no encontrado');
        }

        if (!restaurant.isActive) {
            return res.status(403).send('Restaurante no está activo');
        }

        const user = restaurant.admin;

        if (!user.isActive) {
            return res.status(403).send('Usuario no está activo');
        }

        // Verificar que el usuario que realiza la solicitud es el mismo que el usuario asociado al restaurante
        if (user._id.toString() !== userId) {
            return res.status(403).send('No autorizado, este restaurante no pertenece a este usuario');
        }

        next();
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error del servidor');
    }
};


hasPermission.productId = async (req, res, next) => {
    try {
        const productId = req.params.productId;
        const userId = req.userId;

        // Encuentra el producto por ID y obtiene la información del restaurante
        const product = await Product.findById(productId).populate({
            path: 'restaurant',
            populate: { path: 'admin' }
        });

        if (!product) {
            return res.status(404).send('Producto no encontrado');
        }

        // Asegúrate de que estas propiedades existan en tus modelos
        if (!product.restaurant.isActive || !product.restaurant.admin.isActive) {
            return res.status(403).send('Restaurante o Usuario no está activo');
        }

        // Compara el userId con el adminId del restaurante
        if (product.restaurant.admin._id.toString() !== userId) {
            return res.status(403).send('No autorizado');
        }

        next();
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error del servidor');
    }
};

hasPermission.verifyProducts = async (req, res, next) => {
    try {
        const restaurantId = req.params.restaurantId;
        const { products } = req.body;

        // Obtener los productos y verificar que pertenecen al mismo restaurante y están activos
        const productData = await Product.find(
            { _id: { $in: products.map(item => item.product) } },
            { price: 1, _id: 1, restaurant: 1, isActive: 1 }
        ).lean();

        if (!productData.length) {
            return res.status(400).send('Productos no válidos');
        }

        const areAllProductsFromSameRestaurant = productData.every(product => product.restaurant.toString() === restaurantId);
        const areAllProductsActive = productData.every(product => product.isActive);

        if (!areAllProductsFromSameRestaurant) {
            return res.status(400).send('Todos los productos deben pertenecer al mismo restaurante');
        }

        if (!areAllProductsActive) {
            return res.status(400).send('Algunos productos están inactivos');
        }

        // Crear el objeto para acceder rápidamente a los precios por ID de producto
        const priceLookup = Object.fromEntries(productData.map(product => [product._id.toString(), product.price]));

        // Almacenar el objeto priceLookup en el objeto req para que esté disponible en el controlador
        req.priceLookup = priceLookup;

        next();
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error del servidor');
    }
};
hasPermission.verifyUserRole = (role) => async (req, res, next) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId);
        if (user.role !== role) {
            return res.status(403).send('No autorizado');
        }
        next();
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error del servidor');
    }
};

hasPermission.verifyOrderId = async (req, res, next) => {
    // Verificar que orderId exista
    try {
        const orderId = req.params.orderId;
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).send('Orden no encontrada');
        }
        next();
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error del servidor');
    }
};

hasPermission.verifyOrderState = async (req, res, next) => {
    // Verificar que orderId exista
    try {
        const orderId = req.params.orderId;
        const order = await Order.findById(orderId);

        if (order.status === 'Shipped' || order.status === 'Delivered') {
            return res.status(403).send('No se puede modificar un pedido que ya ha sido enviado o entregado');
        }

        next();
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error del servidor');
    }
};


module.exports = hasPermission;