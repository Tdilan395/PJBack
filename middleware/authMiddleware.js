const jwt = require('jsonwebtoken');


const verifyToken = (req, res, next) => {
    const bearerHeader = req.headers['authorization'];

    if (!bearerHeader) {
        return res.status(403).send('Se requiere token de autorización');
    }

    const token = bearerHeader.split(' ')[1];  // Dividir en el espacio y obtener el token

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send('Token no válido');
        }

        req.userId = decoded.userId;  // Asegúrate de que esté 'userId' no 'id', según cómo creaste el token
        next();
    });
};

module.exports = verifyToken;
