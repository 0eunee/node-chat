var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

app.get('/', function (req, res) {
   res.sendFile(__dirname + '/index.html');
});

var chat = io.on('connection', function(socket) {
    socket.on('chat message', function(data){
        console.log('message from client: ', data);

        socket.name = data.name;
        socket.msg = data.msg;

        io.emit('chat message', data);
    });
});

server.listen(3000, function () {
    console.log('Socket IO server listening on port 3000');
});