const express = require("express");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
// const { getDatabase, ref, onValue } = require("firebase/database");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});


app.use(cors());
app.use(express.json());

app.use(express.static(path.resolve(__dirname, "../client")));

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../client", "index.html"));
});

const generateRoomId = () => {
  const generateGroup = () =>
    Math.random().toString(36).substring(2, 5); 
  return `${generateGroup()}-${generateGroup()}-${generateGroup()}`;
};

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.emit("user-connection", io.engine.clientsCount);

  socket.on("create-room", (callback) => {
    const roomId = generateRoomId();
    socket.join(roomId);
    console.log(`Room created: ${roomId}`);
    callback(roomId);
  });

  socket.on("server-cold-start", (message) => {
    console.log(message);
    socket.emit("server-started", "Server is online");
  })

  socket.on("user-connection-room",({userRoomId, userName})=>{
    socket.join(userRoomId);
    console.log(`User connected to room: ${userRoomId}`);
    socket.emit("user-has-connected", userName)
    socket.to(userRoomId).emit("user-joined", userName);
  });

  socket.on("user-message-send", ({ userRoomId, userMessage, roomUserName, userMessageTime }) => {
    socket.to(userRoomId).emit("user-message-receive", {userMessage, roomUserName}); 
    console.log("User message sent", { userMessage, userRoomId, roomUserName, userMessageTime });
  });
  

  socket.on("leave-room", (roomId)=>{
    socket.leave(roomId);
    socket.to(roomId).emit("user-left", socket.id);
    console.log(`User left room: ${roomId}`);
  })

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

const PORT = 4001; 
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
