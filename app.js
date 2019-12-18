const path = require ('path');
const http = require ('http');

const nunjucks = require ('nunjucks');
const bodyParser = require ('body-parser');
const express = require ('express');
const session = require ('express-session');
const MySQLStore = require ('express-mysql-session') (session);
const cors = require ('cors');
// testing?
//const elasticsearch = require('elasticsearch');

const indexRouter = require ('./router/index');
const adminRouter = require ('./router/admin');
const userRouter = require ('./router/user');
const boardRouter = require ('./router/board');

//express
const app = express ();
app.use (bodyParser.urlencoded ({extended: false}));
app.use (bodyParser.json ());
app.use (express.static (path.join (__dirname, 'public')));

//db
const options = {
  host: 'localhost',
  port: 3306,
  user: 'lurang',
  database: 'node',
  password: 'wnsgh',
};

//session-mysql
const sessionStore = new MySQLStore (options);
app.use (
  session ({
    secret: 'key!#@abcdef',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
  })
);

//nunjucks
nunjucks.configure ('views', {
  autoescape: true,
  express: app,
});
app.set ('view engine', 'html');

//cors error
//app.use(cors())
app.use ((req, res, next) => {
  //res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader ('Access-Control-Allow-Origin', '*'); //*대신 specific domain
  res.setHeader (
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader (
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Credentials'
  );
  next ();
});

//checkAdminPermission
const auth = (req, res, next) => {
  if (req.session.user && req.session.user.admin) {
    return next ();
  }
  res.redirect ('/');
};
//routes
app.use (indexRouter.routes);
app.use ('/user', userRouter.routes);
app.use ('/admin', auth, adminRouter.routes);
app.use ('/board', boardRouter.routes);

//socket.io
const server = http.createServer (app);
const io = require ('socket.io') (server);
server.listen (3000); //app.listen(3000);

io.on ('connection', socket => {
  socket.on ('disconnect', () => {
    io.emit ('disconnect', {
      msg: socket.id,
    });
  });
  socket.on ('login', data => {
    if (!data.id) {
      data.id = 'unknown';
    }
    socket.id = data.id;
    io.emit ('login', data.id);
  });

  socket.on ('chat', data => {
    socket.broadcast.emit ('chat', {
      from: {
        id: socket.id,
      },
      msg: data.msg,
    });
  });
});

/*
    io.emit => 접속된 모든클라이언트에게 전송
    socket.emit => 전송한 클라이언트에게만 전송
    socket.broadcast.emit => 메시지를 전송한 클라이언트를 제외한 모든클라이언트
                말그대로 브로드캐스트
    io.to(id).emit 특정클라이언트에게만 메시지, id는 socket객체의 id속성가ㅄ;
*/
