// En tu archivo de controlador de usuario (e.g., userController.js)
const User = require('../models/User');  // Importa tu modelo de usuario
const bcrypt = require('bcryptjs');

userController = {};

userController.getUser = async (req, res) => {
    try {
        let user;
        if (req.query.id) {
            // Caso 1: ID proporcionado
            user = await User.findById(req.query.id);
        } else if (req.query.email && req.query.password) {
            // Caso 2: Correo electrónico y contraseña proporcionados
            user = await User.findOne({ email: req.query.email });
            if (user && !bcrypt.compareSync(req.query.password, user.password)) {
                // La contraseña no coincide
                user = null;
            }
        }

        if (!user) {
            // Usuario no encontrado o la contraseña no coincide
            return res.status(404).send('Usuario no encontrado o credenciales incorrectas');
        }

        // Usuario encontrado, enviar datos del usuario
        res.json(user);
    } catch (error) {
        // Manejo de errores
        console.error(error.message);
        res.status(500).send('Error del servidor');
    }
};

userController.updateUser = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.userId;  // Obtener el ID del usuario del objeto req

        if (id !== userId) {
            // Si los IDs no coinciden, el usuario no está autorizado para actualizar este perfil
            return res.status(403).send('No autorizado');
        }

        const updateData = { ...req.body };

        // Verificar si se proporciona una contraseña y hashearla antes de la actualización
        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }

        // Incluir { runValidators: true } para forzar la validación del esquema
        const user = await User.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).send('Usuario no encontrado');
        }

        res.json(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error del servidor');
    }
};

userController.inactivateUser = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.userId;  // Obtener el ID del usuario del objeto req

        if (id !== userId) {
            // Si los IDs no coinciden, el usuario no está autorizado para actualizar este perfil
            return res.status(403).send('No autorizado');
        }

        // Inhabilitar el usuario
        const user = await User.findByIdAndUpdate(
            id,
            { $set: { isActive: false } },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).send('Usuario no encontrado');
        }

        res.json(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error del servidor');
    }
};

module.exports = userController;