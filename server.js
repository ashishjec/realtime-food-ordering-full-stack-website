require('dotenv').config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const ejs = require('ejs')
const path = require('path')
const expressLayout = require('express-ejs-layouts')
const PORT = process.env.PORT || 3000 

const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('express-flash')
const MongoDbStore = require('connect-mongo')(session)
const passport = require('passport')
const Emitter = require('events')
const cartRoutes = require('./routes/cartRoutes');

// Database connection

mongoose.connect(process.env.MONGO_CONNECTION_URL, { useNewUrlParser: true, useCreateIndex:true, useUnifiedTopology: true, useFindAndModify : true });
const connection = mongoose.connection;
connection.once('open', () => {
console.log('Database connected...');
}).catch(err => {
console.log('Connection failed...')
});

// Session store
let mongoStore = new MongoDbStore({
            mongooseConnection: connection,
            collection: 'sessions'
})

// Event emitter
const eventEmitter = new Emitter()
app.set('eventEmitter', eventEmitter)

// Session config
app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave: true,
    store: mongoStore,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 hour
}))

// Passport config
const passportInit = require('./app/config/passport')
passportInit(passport)
app.use(passport.initialize())
app.use(passport.session())


app.use(flash())
// Assets
app.use(express.static('public'))
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// Global middleware
app.use((req, res, next) => {
    res.locals.session = req.session
    res.locals.user = req.user
    next()
})

// set Template engine
app.use(expressLayout)
app.set('views', path.join(__dirname, '/resources/views'))
app.set('view engine', 'ejs')

require('./routes/web')(app)
app.use('/cart', cartRoutes);
app.use((req, res) => {
    res.status(404).render('errors/404')
})

const server = app.listen(PORT , () => {
    console.log(`Listening on port ${PORT}`)
})
// Socket
const io = require('socket.io')(server)
io.on('connection', (socket) => {
      // Join 
      socket.on('join', (orderId) => {
        socket.join(orderId)
      })
})

app.use(bodyParser.json());

app.post('/webhook', (req, res) => {
    const intentName = req.body.queryResult.intent.displayName;

    if (intentName === 'Order Status') {
        const orderId = req.body.queryResult.parameters.orderId;
        // Fetch order status from your database
        const orderStatus = getOrderStatus(orderId); // Implement this function
        res.json({
            fulfillmentText: `Your order status is: ${orderStatus}`
        });
    } else if (intentName === 'Menu') {
        // Fetch menu from your database
        const menu = getMenu(); // Implement this function
        res.json({
            fulfillmentText: `Here is our menu: ${menu}`
        });
    } else {
        res.json({
            fulfillmentText: `I didn't understand that. Can you try again?`
        });
    }
});

function getOrderStatus(orderId) {
    // Dummy implementation
    return "In Progress";
}

function getMenu() {
    // Dummy implementation
    return "Pizza, Pasta, Salad";
}

eventEmitter.on('orderUpdated', (data) => {
    io.to(`order_${data.id}`).emit('orderUpdated', data)
})

eventEmitter.on('orderPlaced', (data) => {
    io.to('adminRoom').emit('orderPlaced', data)
})

