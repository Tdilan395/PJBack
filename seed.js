require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Restaurant = require('./models/Restaurant');
const Product = require('./models/Product');
const Order = require('./models/Order');

// Conectar a MongoDB
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.error('Error conectando a MongoDB', err));

// Datos quemados
const users = [
    {
        email: 'john.doe@example.com',
        password: 'password123',
        name: 'John Doe',
        phone: '123-456-7890',
        address: '123 Main St, Springfield, IL',
        role: 'Cliente'
    },
    {
        email: 'jane.doe@example.com',
        password: 'password123',
        name: 'Jane Doe',
        phone: '987-654-3210',
        address: '456 Elm St, Springfield, IL',
        role: 'Administrador'
    },
];

const restaurants = [
    {
        name: 'Papa Jonathan',
        address: 'Dirección 1',
        category: 'Italiana',
        admin: null
    },
    {
        name: 'Sushi2Go',
        address: 'Dirección 2',
        category: 'Sushi',
        admin: null
    },

];

const products = [
    {
        name: 'Pizza Margherita',
        description: 'Pizza clásica con tomate, mozzarella y albahaca.',
        category: 'Pizza',
        price: 10.50,
        restaurant: null
    },
    {
        name: 'California Roll',
        description: 'Roll con pepino, aguacate y cangrejo.',
        category: 'Sushi',
        price: 8.00,
        restaurant: null
    },

];

async function seedDatabase() {
    try {
        // Eliminar usuarios, restaurantes y productos existentes
        await User.deleteMany({});
        await Restaurant.deleteMany({});
        await Product.deleteMany({});
        await Order.deleteMany({});
        console.log('Usuarios, restaurantes y productos existentes eliminados');

        // Hashear las contraseñas y crear nuevos documentos de usuario
        const hashedUsers = users.map(user => ({
            ...user,
            password: bcrypt.hashSync(user.password, 10)
        }));
        const insertedUsers = await User.insertMany(hashedUsers);
        console.log('Nuevos usuarios insertados');

        // Asociar cada restaurante con un usuario administrador
        const adminUsers = insertedUsers.filter(user => user.role === 'Administrador');
        if (adminUsers.length === 0) {
            throw new Error('No hay usuarios administradores para asociar con los restaurantes');
        }
        const populatedRestaurants = restaurants.map((restaurant, index) => ({
            ...restaurant,
            admin: adminUsers[index % adminUsers.length]._id
        }));
        const insertedRestaurants = await Restaurant.insertMany(populatedRestaurants);
        console.log('Nuevos restaurantes insertados');

        // Asociar cada producto con un restaurante
        const populatedProducts = products.map((product, index) => ({
            ...product,
            restaurant: insertedRestaurants[index % insertedRestaurants.length]._id
        }));
        await Product.insertMany(populatedProducts);
        console.log('Nuevos productos insertados');

        // Desconectar de MongoDB
        await mongoose.connection.close();
        console.log('Desconectado de MongoDB');
    } catch (error) {
        console.error('Error poblando la base de datos', error);
    }
}

// Ejecutar la función de población
seedDatabase();
