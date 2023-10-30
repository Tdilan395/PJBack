const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
require('dotenv').config();
const app = express();

app.use(morgan('dev'));

const authRouter = require('./routes/AuthRouter');
const usersRouter = require('./routes/UserRouter');
const restaurantsRouter = require('./routes/RestaurantRouter');
const productsRouter = require('./routes/ProductRouter');
const ordersRouter = require('./routes/OrderRouter');


// Middlewares
app.use(bodyParser.json());

app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/restaurants', restaurantsRouter);
app.use('/products', productsRouter);
app.use('/orders', ordersRouter);

module.exports = app;