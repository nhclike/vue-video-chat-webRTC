//小程序聊天室和pc端聊天室通讯后台逻辑包含图片数据的相互发送
const express = require('express');
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

//跨域和文件上传处理
const cors = require('cors');
const multer = require('multer');

// Chatroom

var numUsers = 0;

io.sockets.on("connection", (socket) => {
    // socket.emit() ：向建立该连接的客户端广播
    // socket.broadcast.emit() ：向除去建立该连接的客户端的所有客户端广播
    // io.sockets.emit() ：向所有客户端广播，等同于上面两个的和
    var addedUser = false;
    // when the client emits 'add user', this listens and executes
    socket.on('addUser', (username) => {
        if (addedUser) return;
        console.log("服务端收到 :" + username + "  addUser消息")
            // we store the username in the socket session for this client
        socket.username = username;
        ++numUsers;
        addedUser = true;
        io.sockets.emit('login', {
            numUsers: numUsers
        });
        // echo globally (all clients) that a person has connected
        io.sockets.emit('userJoined', {
            username: socket.username,
            numUsers: numUsers
        });
    });


    //接收到消息时触发
    socket.on('newMessage', function(data) {
        console.log('服务端收到 : ', data);
        //注意send()方法其实是发送一个 'message' 事件
        //客户端要通过on('message')来响应
        //socket.send(data);
        io.sockets.emit('newMessage', {
            username: socket.username,
            message: data
        });
    });
    //监听图片上传事件
    socket.on('photoUpload', function(data) {
        console.log('服务端收到 :图片', data);
        io.sockets.emit('photoUpload', {
            username: socket.username,
            message: data
        });
    });



    // when the client emits 'typing', we broadcast it to others
    socket.on('typing', () => {
        io.sockets.emit('typing', {
            username: socket.username
        });
    });

    // when the client emits 'stop typing', we broadcast it to others
    socket.on('stopTyping', () => {
        io.sockets.emit('stopTyping', {
            username: socket.username
        });
    });

    // when the user disconnects.. perform this
    socket.on('disconnect', () => {
        console.log("服务端收到 :" + socket.username + "  disconnect");
        if (addedUser) {
            --numUsers;
            // echo globally that this client has left
            io.sockets.emit('userLeft', {
                username: socket.username,
                numUsers: numUsers
            });
        }
    });
    //发生错误时触发
    socket.on('error', function(err) {
        console.log(err);
    });


    //加入房间概念
    //加入房间
    socket.on('joinRoom', (room, username) => {
            socket.username = username;
            socket.join(room);
            var myRoom = io.sockets.adapter.rooms[room];
            var users = Object.keys(myRoom.sockets).length;
            console.log("当前房间有" + users + "人");
            //socket.emit('joined',room,socket.id); //给本人回
            //socket.to(room).emit('joined',room,socket.id); //给房间除自己以外的人
            io.in(room).emit('joined', {
                room: room,
                socketId: socket.id,
                numUsers: users,
                username: socket.username
            }); //给房间所有人

        })
        //离开房间       
    socket.on('leaveRoom', (room, username) => {
        socket.username = username;

        var myRoom = io.sockets.adapter.rooms[room];
        var users = Object.keys(myRoom.sockets).length;
        //users-1
        socket.leave(room);
        console.log("当前房间有" + Number(users - 1) + "人");

        //socket.emit('joined',room,socket.id); //给本人回
        //socket.to(room).emit('joined',room,socket.id); //给房间除自己以外的人
        io.in(room).emit('leaved', {
            room: room,
            socketId: socket.id,
            numUsers: users,
            username: socket.username
        }); //给房间所有人

    })
})


// 处理文件上传的请求
app.use(cors());
// 配置存储路径 和 重命名
var storage = multer.diskStorage({
    // 图片上传到服务器以后 要放置的路径
    destination: 'public/upload',

    // 图片重命名
    filename: function(req, file, cb) {
        var fileFormat = (file.originalname).split(".");
        // 获取时间戳
        var filename = new Date().getTime();
        // 124354654 + "." + jpg
        cb(null, filename + "." + fileFormat[fileFormat.length - 1]);
    }
});

const upload = multer({
    storage,
})

app.post('/upload', upload.single('file'), (req, res) => {
    // 接收到的文件信息
    var file = req.file;
    console.log("服务端接收到的文件信息")
    console.log(file)
    if (file) {
        // 文件名
        let fileName = file.filename;
        // 拼接文件路径
        let avatarUrl = 'http://172.19.82.219:8000/upload/' + fileName

        res.json({
            code: 1,
            file: file,
            avatarUrl: avatarUrl
        })
    } else {
        res.json({
            code: 1
        })
    }
})


server.listen(3000, () => {
    console.log("监听3000端口");
});