// socketIOConfig.js

const socketIo = require("socket.io");

const ios = (httpServer) => {
  const io = socketIo(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected.", socket.id);
   

    socket.on("disconnect", () => {
      console.log("A user disconnected.");
    });
  });

 
};

