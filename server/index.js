const express = require('express');
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

const cors = require('cors');
const multer = require('multer');
let connectCount = 0;
io.sockets.on("connection", (socket) => {
    ++connectCount;
    console.log("客户端连接成功" + connectCount);
    socket.emit("login", "login success");
    // socket.emit() ：向建立该连接的客户端广播
    // socket.broadcast.emit() ：向除去建立该连接的客户端的所有客户端广播
    // io.sockets.emit() ：向所有客户端广播，等同于上面两个的和

    //接收到消息时触发
    socket.on('message', function(data) {
        console.log('服务端收到 : ', data);
        //注意send()方法其实是发送一个 'message' 事件
        //客户端要通过on('message')来响应

        //socket.send(data);
        io.sockets.emit('message', data);
    });
    //监听自定义事件
    socket.on('myevent', function(data) {
        console.log('客户端发送了一个自定义事件', data);
    });
    //监听图片上传事件
    socket.on('photoUpload', function(data) {
        console.log('客户端发送发送了图片', data);
        io.sockets.emit('photoUpload', data);
    });
    //发生错误时触发
    socket.on('error', function(err) {
        console.log(err);
    });
})



// 监听连接断开事件
io.sockets.on("disconnect", () => {
    console.log("连接已断开...");
});

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
    console.log(file)
    if (file) {
        // 文件名
        let fileName = file.filename;
        // 拼接文件路径
        let avatarUrl = '/upload/' + fileName

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