const path = require('path')
const express = require('express');
const bodyParser = require('body-parser');
const nunjucks = require('nunjucks');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

const cors = require('cors');

const indexRouter = require('./router/index')
const adminRouter = require('./router/admin')
const userRouter = require('./router/user')
const boardRouter = require('./router/board')

//express
const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')))

//db
const options = {
    host: 'localhost',
    port: 3306,
    user: 'lurang',
    database: 'node',
    password: 'wnsgh'
};

//session-mysql
const sessionStore = new MySQLStore(options);
app.use(session({
    secret              : 'tisecret',
    resave              : false,
    saveUninitialized   : false,
    store               : sessionStore
}))

//nunjucks
app.set('view engine', 'html');
const env = nunjucks.configure(['views/'],{
    autoescape: true,
    express: app,
});

//cors error
app.use(cors())
app.use((req, res ,next) => {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin','*'); //*대신 specific domain 가능
    res.setHeader('Access-Control-Allow-Methods','GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Credentials'); 
    next();
});

//checkPermission
const checkLogin = (req, res, next) => {
    if(req.session){
        if(req.session.user) {
            return next();
        }
    }
    res.redirect('/')
}

const auth = (req, res, next) => {
    if(req.session){
        if(req.session.user) {
            if(req.session.user.admin) {
                return next();
            } 
        }
    }
    res.redirect('/');
}

//routes
app.use(indexRouter.routes);
app.use('/user', userRouter.routes);
app.use('/admin', auth, adminRouter.routes);
app.use('/board', boardRouter.routes);

app.listen(3000);