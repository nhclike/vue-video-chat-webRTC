const express = require('express');
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

const USERCOUNT = 3;
// Chatroom

io.sockets.on("connection", (socket) => {
    // socket.emit() ：向建立该连接的客户端广播
    // socket.broadcast.emit() ：向除去建立该连接的客户端的所有客户端广播
    // io.sockets.emit() ：向所有客户端广播，等同于上面两个的和

    //接收到消息时触发
    socket.on('message', function(room, data) {
        console.log('服务端收到message : ', data.type);
        socket.to(room).emit('message', room, data);
    });


    //加入房间概念
    //加入房间
    socket.on('join', (room) => {
        socket.join(room);
        var myRoom = io.sockets.adapter.rooms[room];
        var users = (myRoom) ? Object.keys(myRoom.sockets).length : 0;
        console.log("join:当前房间有" + users + "人");
        //console.log(socket)
        if (users < USERCOUNT) {
            socket.emit('joined', room, socket.id); //给本人回
            if (users > 1) {
                socket.to(room).emit('otherjoin', room, socket.id); //给房间除自己以外的人
            }
        } else {
            socket.leave(room);
            socket.emit('full', room, socket.id); //给本人回
        }


    })

    //离开房间       
    socket.on('leave', (room) => {

        var myRoom = io.sockets.adapter.rooms[room];
        var users = (myRoom) ? Object.keys(myRoom.sockets).length : 0;
        //users-1
        socket.leave(room);
        console.log("当前房间有" + Number(users - 1) + "人");

        socket.emit('leaved', room, socket.id); //给本人回
        socket.to(room).emit('bye', room, socket.id); //给房间除自己以外的人


    })
})

server.listen(3000, () => {
    console.log("监听3000端口");
});