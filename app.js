var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var redis = require('redis')
    , mongoose = require('mongoose');

app.use(express.static('public'));
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

// 현재 접속한 사용자명 저장할 변수
var usernames = {};

io.sockets.on('connection', function(socket) {
    socket.on('current user', function () {
        io.sockets.emit('current user count', usernames);
    });

    socket.on('chat message', function(data){
        console.log('message from client: ', data);
        io.sockets.emit('chat message', data);
    });

    socket.on('add user', function (username) {
        console.log(username + ' 접속');
        // 소켓 세션의 username 필드에 사용자가 전송한 값 저장
        socket.username = username;
        usernames[username] = username;
        socket.emit('connect chat', 'SERVER', 'you have connected');
        socket.broadcast.emit('connect chat', 'SERVER', username + ' has connected');
        io.sockets.emit('connect users', usernames);
    });

    socket.on('mod user', function (username, nusername) {
       console.log(username + '이 ' + nusername + ' 로 닉네임 변경');
       delete usernames[username];
       socket.username = nusername;
       usernames[nusername] = nusername;
       io.sockets.emit('connect users', usernames);
    });

    socket.on('disconnect', function () {
        console.log(socket.username + ' 접속 해제');
        delete usernames[socket.username];
        io.sockets.emit('connect users', usernames);
        socket.broadcast.emit('connect chat', 'SERVER', socket.username + ' has disconnected');
    })
});

server.listen(process.env.PORT || 3000, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});