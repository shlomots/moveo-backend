const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const cors = require('cors');
const port = process.env.PORT || 3001;
const io = new Server(server, {
    cors: {
        origin: "*", // Allows all origins. For production, specify your front-end server's URL.
        methods: ["GET", "POST"]
    }
});
app.use(cors());
app.get('/', (req, res) => {
    res.send('<h1>Hello world</h1>'); // Replace with your HTML or route handling
});

let textInRooms = {
    "1" :"",
    "2" :"",
    "3" :"",
    "4" :""
}

io.on('connection', (socket) => {
    console.log('a user connected');
    let client_room_number;
    // Listen for 'join room' event with roomNumber
    socket.on('join room', (roomNumber) => {
        client_room_number = roomNumber;//this varibale will be individual for every client. we will you use it in the disconnection.
        socket.join(roomNumber); // Join the socket to the room
        console.log(`Socket ${socket.id} joined room ${roomNumber}`);
        if(textInRooms[roomNumber]!=""){
            socket.emit('text update', {"room": roomNumber,"text":textInRooms[roomNumber]});//importent that its just emit because emit to room send to everyone else in the room.also importen that this is the structure of the data sent beacuse thats how the client expects it.
        }
    });

    // Listen for 'text change' event with data containing room and text
    socket.on('text change', (data) => {
        // data should be an object like { room: '1', text: '...' }
        // Broadcast the text change to all clients in the same room except the one who sent it
        if(data.text!=textInRooms[data.room]){
            textInRooms[data.room]= data.text;
        }
        socket.to(data.room).emit('text update', data);
        console.log(`Broadcasted text change in room ${data.room}`);
    });

    // Listen for 'disconnect' event
    socket.on('disconnect', (data) => {
        visitCounts[client_room_number]--;
        console.log('user disconnected');
        console.log(`the number of visits in room ${client_room_number} = ${visitCounts[client_room_number]}`);
    });
});

let visitCounts = {
    "1":0,
    "2":0,
    "3":0,
    "4":0
};

app.get('/visits', (req, res) => {
    const room = parseInt(req.query.room, 10);
    res.json({ visitorNumber: visitCounts[room] });
    visitCounts[room]++;
});

server.listen(port, () => {
    console.log('lets start coding');
});