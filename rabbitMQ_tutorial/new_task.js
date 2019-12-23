const amqp = require('amqp');

const options = { 
    host: 'localhost',
    port: 5672, 
    login: 'guest', 
    password: 'guest', 
    connectionTimeout: 10000, 
    authMechanism: 'AMQPLAIN', 
    vhost: '/', 
    noDelay: true, 
    ssl: { 
        enabled : false
    },
}
const rabbit = amqp.createConnection(options);
const queue = 'task_queue';
const msg = process.argv.slice(2).join(' ') || "Hello World!";

let count = 1;
let ctag = new Array();
const messageQueue = (socket) => {
    rabbit.on('ready', () => {
        socket.on('connection', (message) => {
            const exchange = 'share-1';
            if (message.type == 'register') {
                if (conn.exchange === undefined) {
                    conn.exchange = rabbit.exchange(exchange, {
                        type: 'topic',
                        autoDelete: false,
                        durable: false,
                        exclusive: false,
                        confirm: true,
                    });
                }
                if (conn.q === undefined) {
                    conn.q = rabbit.queue('share-1-' + message.userId, {
                        durable: true, 
                        autoDelete: false, 
                        exclusive: false,
                    }, () => { 
                        //conn.channel = 'share-1.' + message.userId; 
                        conn.channel = 'share-1.'+message.userId;
                        conn.q.bind(conn.exchange, 'share-1.*');
                        conn.q.bind(conn.exchange, 'share-1'+message.userId);
                        conn.q.subscribe((message) => {
                            $logger.debug("[MSG] ---> " + JSON.stringify(message));
                            conn.write(JSON.stringify(message) + '\n');
                        }).addCallback((ok) => {
                            ctag[conn.channel] = ok.consumerTag;
                        })
                    });
                }
            } else if (message.type == 'chat') {
                const reply = {
                    type: 'push', 
                    message: message.message, 
                    userId: message.userId, 
                    //visitorNick: obj.channel, 
                    customField1: '', 
                    //time: utils.getDateTime(), 
                    channel: 'share-1.' + message.userId, 
                    //channel: 'share-1
                }
            }
            conn.on('disconnect', () => {
                if (ctag[conn.channel] != null) {
                    conn.q.unsubscribe(ctag[conn.channel]);
                    $logger.debug('### unsubscribe : ' + ctag[conn.channel]);
                    delete ctag [conn.channel];
                }
                $logger.info("Disconnected Socket [%s]",conn.channel); 
                conn.disconnect();
            });
        });
    });

}