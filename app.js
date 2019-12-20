const path = require('path');
const http = require('http');

const nunjucks = require('nunjucks');
const bodyParser = require('body-parser');
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
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
const WebSocket = require('ws');

const wss = new WebSocket.Server({
    //socket안에서 req.session을 쓰고자 sessionParser를 이용함
    verifyClient: (info, done) => {
        sessionParser(info.req, {}, () => {
            done(info.req.session);
        });
    },
    server,
});
//wss connection
wss.on('connection', (ws, req) => {
    let msg = {};
    ws.isAlive = true;
    //if login => getid, else id='unknown'
    if (req.session.user) {
        ws.id = req.session.user.id;
    } else {
        ws.id = 'unknown';
    };
    console.log(ws.id + ' connected');

    //message handler
    ws.on('message', (message) => {
        ws.ping();
        message = JSON.parse(message);
        //message의 이벤트key값에 해당하는 value 별로 행동, event이름을
        //임의로 지어서 client쪽에서 보내주었었음
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
            //혹시모를에러..?
            try {
                chatDb.addChat(msg.id, msg.msg);
                //broadcast
                
                //현재 close관련event테스트를위해 쓴거니 나중에지우길바람
                ws.close();

                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(msg));
                    };
                });
            } catch (err) {
                console.error(err);
            };
            break;
        };
    });

    //  ping -> 3초마다 연결확인함, isAlive 가 false일경우 terminate함 
    //  event close는 terminate되면 client에게 event메세지를보내서
    //  Jquery로 페이지를 리로드하게만듬
    interval = setInterval(() => {
        wss.clients.forEach((ws) => {
            if (ws.isAlive === false) {
                return ws.close();
            };
            ws.isAlive = false;
            ws.ping();
        }); 
    }, 3000);
    //  receive pong -> 연결에 응답이왔으면 alive를 true로 줘서 연결되어있음을 알려줌
    ws.on('pong', () => {
        ws.isAlive = true;
        //console.log(ws.id + ' receive a pong');
    });
    ws.on('close', (data) => {
        console.log(ws.id + ' terminated' + data);
    });
    ws.on('error', (error) => {
        console.error(error);
    });
    // 접속한 ip 얻어올수있음, 비로그인일때 아이디에 일부적어주거나 검증같은거할때 쓸려고했으나
    //  local한정이라 안쓸거같음, 앞에[x-~]는 프록시용
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
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