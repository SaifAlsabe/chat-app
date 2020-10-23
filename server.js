const express = require('express');
const app = express();
PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => { console.log('Listening at port 3000') });
const io = require('socket.io')(server);

rooms = {};

let taken;

app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    taken = false
    res.render('lobby', { taken, rooms });
})

app.post('/room', (req, res) => {

    //check if user entered room name
    if (req.body.room) {

        //check if room already exist
        if (rooms[req.body.room] == undefined) {
            rooms[req.body.room] = { roomUsers: {} };
            res.redirect(req.body.room);
        } else {
            taken = true
            res.render('lobby', { taken });
        }

    } else {
        console.log('Please enter a valid room name')
        res.redirect('/');
    }

})

app.get('/:room', (req, res) => {
    res.render('room', { roomName: req.params.room });
})

io.on('connect', socket => {

    //new user connects
    socket.on('send-new-user', (name, roomName) => {
        socket.join(roomName);
        rooms[roomName].roomUsers[socket.id.toString()] = name;
        socket.to(roomName).emit('receive-new-user', name);
        io.in(roomName).emit('update-users', Object.values(rooms[roomName].roomUsers));
    })

    //user disconnects
    socket.on('disconnect', () => {

        //get room name
        let roomName;
        Object.entries(rooms).forEach(room => {
            Object.keys(room[1].roomUsers).forEach(key => {
                if (key === socket.id) roomName = room[0];
            })
        })

        if (rooms[roomName]) {
            socket.to(roomName).emit('user-disconnect', rooms[roomName].roomUsers[socket.id]);
            delete rooms[roomName].roomUsers[socket.id];
            socket.to(roomName).emit('update-users', Object.values(rooms[roomName].roomUsers));

            if (Object.values(rooms[roomName].roomUsers).length === 0) delete rooms[roomName];
        }



    })

    //messaging
    socket.on('message', (message, roomName) => {
        socket.to(roomName).emit('new-message', { message: message, name: rooms[roomName].roomUsers[socket.id] });
    })
})