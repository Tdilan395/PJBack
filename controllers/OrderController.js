const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');

const orderController = {};

orderController.createOrder = async (req, res) => {
    try {
        const userId = req.userId;
        const restaurantId = req.params.restaurantId;
        const { products } = req.body;
        const priceLookup = req.priceLookup;
        const orderCount = await Order.countDocuments({ restaurant: restaurantId });
        const totalAmount = products.reduce((acc, item) => {
            const productPrice = priceLookup[item.product];
            return acc + productPrice * item.quantity;
        }, 0);

        const newOrder = new Order({
            user: userId,
            restaurant: restaurantId,
            products: products.map(item => ({
                product: item.product,
                quantity: item.quantity,
            })),
            totalAmount
        });
        console.log(products);
        await newOrder.save();
        let rating;
        if (orderCount <= 10) {
            rating = 1;
        } else if (orderCount <= 50) {
            rating = 2;
        } else if (orderCount <= 100) {
            rating = 3;
        } else {
            rating = 4; // Puedes añadir más rangos según lo consideres necesario
        }

        await Restaurant.findByIdAndUpdate(restaurantId, { rating });

        res.json(newOrder);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error del servidor');
    }
};

orderController.getOrder = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const order = await Order.findById(orderId);

        res.json(order);

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error del servidor');
    }

}

orderController.getOrders = async (req, res) => {
    try {
        const { userId, restaurantId, startDate, endDate } = req.query;

        let queryObj = {};


        if (userId) queryObj.user = userId;
        if (restaurantId) queryObj.restaurant = restaurantId;
        if (startDate || endDate) {
            queryObj.createdAt = {};
            if (startDate) queryObj.createdAt.$gte = new Date(startDate);
            if (endDate) queryObj.createdAt.$lte = new Date(endDate);
        }

        const orders = await Order.find(queryObj);

        res.json(orders);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error del servidor');
    }
};

orderController.updateOrder = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const updatedFields = req.body;

        // Encuentra la orden por ID
        const order = await Order.findById(orderId);

        // Verifica que la orden no haya sido enviada
        if (order.status === 'Shipped' || order.status === 'Delivered') {
            return res.status(400).json({ message: 'No se puede modificar un pedido que ya ha sido enviado o entregado.' });
        }

        // Si se proporcionaron productos para actualizar
        if (updatedFields.products) {
            let totalAmount = 0;

            // Calcular el monto total nuevamente
            for (const productInfo of updatedFields.products) {
                const product = await Product.findById(productInfo.product);

                if (!product) {
                    return res.status(404).json({ message: `Producto con id ${productInfo.product} no encontrado` });
                }

                totalAmount += product.price * productInfo.quantity;
            }

            updatedFields.totalAmount = totalAmount;
        }

        // Actualizar la fecha de modificación
        updatedFields.updatedAt = Date.now();

        // Usar `updateOne` con `runValidators: true` para ejecutar validadores
        await Order.updateOne({ _id: orderId }, { $set: updatedFields }, { runValidators: true });

        return res.status(200).json({ message: 'Pedido actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar el pedido:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

orderController.inactivateOrder = async (req, res) => {
    try {
        const orderId = req.params.orderId;

        // Inhabilitar el usuario
        const order = await Order.findByIdAndUpdate(
            orderId,
            { $set: { isActive: false } },
            { new: true, runValidators: true }
        );

        if (!order) {
            return res.status(404).send('Order no encontrada');
        }

        res.json(order);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error del servidor');
    }
};


module.exports = orderController;