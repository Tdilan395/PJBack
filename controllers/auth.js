const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User')

const authController = {};

authController.register = async (req, res) => {
    const { email, password, name, phone, address, role } = req.body;

    try {
        // Comprobar si el correo electrónico ya está registrado
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'El correo electrónico ya está en uso.' });
        }

        // Crear un nuevo usuario
        user = new User({
            email,
            password: await bcrypt.hash(password, 10),  // Hashear la contraseña
            name,
            phone,
            address,
            role
        });

        // Guardar el usuario en la base de datos
        await user.save();

        // Crear y enviar un token JWT
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error del servidor');
    }
};

authController.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Buscar usuario por correo electrónico
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Usuario no encontrado.' });
        }

        if (!user.isActive) {
            return res.status(403).json({ msg: 'Usuario no está activo.' });
        }
        // Comprobar la contraseña
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Contraseña incorrecta.' });
        }

        // Crear y enviar un token JWT
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });

    } catch (error) {

        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }

        console.error(error.message);
        res.status(500).send('Error del servidor');
    }
};

module.exports = authController;
