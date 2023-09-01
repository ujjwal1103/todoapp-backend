const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { createServer } = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
require("dotenv").config();

const port = process.env.PORT || 3100;
const app = express();

mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((error) => console.error("Error connecting to MongoDB Atlas:", error));

const httpServer = createServer(app);

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

const todosRouter = require("./Router/todo.js");
const userRouter = require("./Router/user.js");
const productRouter = require("./Router/product.js");
const sliderImageRouter = require("./Router/sliderImage.js");
const categoryRouter = require("./Router/category.js");
const subCategoryRouter = require("./Router/subCategory.js");
const orderRouter = require("./Router/order.js");
const productReviewRouter = require("./Router/productReview.js");
const conversationRouter = require("./Router/Conversation.js");
const messageRouter = require("./Router/message.js");
const addressRouter = require("./Router/address.js");

app.use("/api", todosRouter);
app.use("/api", userRouter);
app.use("/api", productRouter);
app.use("/api", sliderImageRouter);
app.use("/api", categoryRouter);
app.use("/api", subCategoryRouter);
app.use("/api", orderRouter);
app.use("/api", productReviewRouter);
app.use("/api", conversationRouter);
app.use("/api", messageRouter);
app.use("/api", addressRouter);

const io = socketIo(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let onlineUsers = [];

const addUser = (userId, socketId, name) => {
  !onlineUsers.some((user) => user.userId === userId) &&
    onlineUsers.push({ userId, socketId, name });
};

const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};

const getUsers = (userId) => {
  return onlineUsers.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  console.log("A user connected.", socket.id);
  socket.on("getNotification", (data) => {
    socket.broadcast.emit("sendNotification", data);
  });

  socket.on("addUser", (user) => {
    if (user) {
      addUser(user._id, socket.id, user.name);
      io.emit("getUsers", onlineUsers);
    }
  });

  socket.on("sendMessage", (message) => {
    console.log(message);
    const user = getUsers(message.receiver);
    io.to(user?.socketId).emit("getMessage", message);
  });

  socket.on("seenMessages", (data) => {
    const user = getUsers(data.id);

    io.to(user?.socketId).emit("seen", true);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected.", socket.id);
    removeUser(socket.id);
    io.emit("getUsers", onlineUsers);
  });
});

httpServer.listen(port, () => {
  console.log(`Server listening on port: http://localhost:${port}`);
});
