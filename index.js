const express = require('express');
const { listen } = require('socket.io');
const app = express();
const PORT = process.env.PORT || 3000;

var userList = []

app.get('/',(req,res)=> {
    res.redirect('/room/You/all');
})

app.get('/room/:userName/:roomName', (req,res) => {
    res.render('room.ejs',{
        userName : req.params.userName,
        roomName : req.params.roomName,
    });
})

var server = app.listen(PORT,()=>{
    console.log("The server is running @ " + PORT)
})
const io = require('socket.io')(server)

io.sockets.on('connection', (socket)=>{
    socket.on('connection',(data)=>{
        socket.data = data
        socket.join(socket.data.roomName);
        var storeData = {}
        storeData['socketId'] = socket.id
        storeData['roomName'] = data.roomName
        storeData['userName'] = data.userName
        userList.push(storeData)
        io.to(socket.data.roomName).emit('is_online',({username : socket.data.userName, userList}));
        io.to(socket.data.roomName).emit('change-users',userList);
    })
    socket.on('chat_message', message => {
        io.to(socket.data.roomName)
        .emit('chat_message',{
            message : message,
            userName : socket.data.userName
        });
    })
    socket.on('disconnect',() => {
        console.log("Disconnect Ran...");
        var tempUserList = []
        userList.forEach(element=> {
            if(element.userName !== socket.data.userName)
            {
                tempUserList.push(element)
            }
        })
        userList = tempUserList
        socket.to(socket.data.roomName).emit('change-users',userList);
    })
})