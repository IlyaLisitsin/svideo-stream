const fs = require('fs');
const http = require('http');
const https = require('https');
const Websocket = require('websocket').server;

const receiverHtml = fs.readFileSync('./receiver.html', 'utf-8');

const server = http.createServer((err, res) => {
    res.end(receiverHtml);
});

server.listen(1212, 'localhost', () => console.log('server connected!'));

const ws = new Websocket({
    httpServer: server,
    autoAcceptConnections: false
});

const connections = [];

ws.on('request', req => {
    const connection = req.accept('', req.origin);
    connections.push(connection);
    console.log('Connected ' + connection.remoteAddress);

    connection.on('message', message => {
        console.log(message.utf8Data)
        // connections.slice(1).forEach(connection => connection.send(message.utf8Data))
        connections.forEach(connection => connection.send(message.utf8Data))


    })
});
