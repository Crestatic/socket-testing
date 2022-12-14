// Dependencies
const path = require('path');
const express = require('express');
const session = require('express-session');
const exphbs = require('express-handlebars');
const routes = require('./controllers');
const helpers = require('./utils/helpers');

// Import sequelize connection and store
const sequelize = require('./config/connection');
const { setEngine } = require('crypto');
const SequelizeStore = require('connect-session-sequelize')(session.Store);



const app = express();
const PORT = process.env.PORT || 3001;

// socket.io server
var http = require('http').Server(app);
var io = require('socket.io')(http);

//set up custom handlebars helpers
const hbs = exphbs.create({ helpers });

//config session
const sess = {
    secret: 'Super secret secret',
    cookie: {
        maxAge: 300000,
        httpOnly: true,
        sameSite: 'none',
    },
    resave: false,
    saveUninitialized: true,
    store: new SequelizeStore({
        db: sequelize
    })
};

app.use(session(sess));

// set up template engine
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars')

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(routes);

io.on('connection', socket => {
    console.log('New connection...');
})


// set up connection for db and server
sequelize.sync({ force: false }).then(() => {
    app.listen(PORT, () => console.log(`Now listening to port ${PORT}!`));
});