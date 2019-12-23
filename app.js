const path = require('path');
const http = require('http');

const nunjucks = require('nunjucks');
const bodyParser = require('body-parser');
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const WebSocket = require('ws');
const amqp = require('amqp');
//const cors = require('cors');

const indexRouter = require('./router/index');
const adminRouter = require('./router/admin');
const userRouter = require('./router/user');
const boardRouter = require('./router/board');
const chatDb = require('./model/chat');

//express
const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

//db
const options = {
    host: 'localhost',
    port: 3306,
    user: 'lurang',
    database: 'node',
    password: 'wnsgh',
};

//session-mysql
const sessionStore = new MySQLStore(options);

const sessionParser = session({
    secret: 'key!#@abcdef',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
});
app.use(sessionParser);

//nunjucks engine
nunjucks.configure('views', {
    autoescape: true,
    express: app,
});
app.set('view engine', 'html');

//cors error
//app.use(cors())
app.use((req, res, next) => {
    //res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin',
     '*',
    ); //*대신 specific domain
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, PATCH, DELETE',
    );
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, Credentials',
    );
    next();
});

//checkAdminPermission
const auth = (req, res, next) => {
    if (req.session.user && req.session.user.admin) {
        return next();
    }
    res.redirect('/');
};
//routes
app.use(indexRouter.routes);
app.use('/user', userRouter.routes);
app.use('/admin', auth, adminRouter.routes);
app.use('/board', boardRouter.routes);

//webSocket setting
const server = http.createServer(app);
const wss = new WebSocket.Server({
    verifyClient: (info, done) => {
        sessionParser(info.req, {}, () => {
            done(info.req.session);
        });
    },
    server,
});

//rabbitmq
const rabbit = amqp.createConnection({});
let chatExchange;
rabbit.on('ready', () => {
    chatExchange = rabbit.exchange('chatExchange', {type: 'fanout'});
});

//wss connection
wss.on('connection', (ws, req) => {
    let msg = {};
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    ws.isAlive = true;

    if (req.session.user) {
        ws.id = req.session.user.id;
    } else {
        ws.id = 'unknown';
    };
    console.log(ws.id + ' connected : ' + ip);

    //message handler
    ws.on('message', (message) => {
        message = JSON.parse(message);
        switch (message.event) {
            //로그인 성공시
            case 'login':
                msg = {
                    event: 'login',
                    id: ws.id,
                };
                //socket.emit
                ws.send(JSON.stringify(msg));
                break;
            //채팅보낼시
            case 'chat':
                msg = {
                    event: 'chat',
                    msg: message.msg,
                    id: ws.id,
                };
                chatExchange.publish('', msg);
                chatDb.addChat(msg.id, msg.msg);
                break;
            default:
                break;
        };
    });
    //heartbeat
    interval = setInterval(() => {
        wss.clients.forEach((ws) => {
            if (ws.isAlive === false) {
                return ws.close();
            };
            ws.isAlive = false;
            ws.ping();
        });
    }, 3000);
    //  receive pong
    ws.on('pong', () => {
        ws.isAlive = true;
        //console.log(ws.id + ' receive a pong');
    });
    ws.on('close', (data) => {
        console.log(ws.id + ' terminated - ' + data);
    });
    ws.on('error', (error) => {
        console.error(error);
    });

    //message queue
    rabbit.queue('', {exclusive: true}, (q) => {
        q.bind('chatExchange', '');
        q.subscribe((msg) => {
            ws.send(JSON.stringify(msg));
        });
    });
});


/* Socket.IO
const server = http.createServer (app);
const io = require ('socket.io') (server);

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
*/
/*
  io.emit => 접속된 모든클라이언트에게 전송
  socket.emit => 전송한 클라이언트에게만 전송
  socket.broadcast.emit => 메시지를 전송한 클라이언트를 제외한 모든클라이언트
              말그대로 브로드캐스트
  io.to(id).emit 특정클라이언트에게만 메시지, id는 socket객체의 id속성값;
*/

server.listen(3000); //app.listen(3000);