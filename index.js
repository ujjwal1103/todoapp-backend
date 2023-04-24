const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const todosRouter = require("./Router/todo.js");
require("dotenv").config();
const port = process.env.PORT || 3100;
const app = express();
app.use(bodyParser.json());
app.use(express.json());
mongoose
  .connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((error) => console.error("Error connecting to MongoDB Atlas:", error));

// app.use("/categories", categoryRouter);
// app.use("/subCategories", SubCategoryRouter);
// app.use("/products", productRouter);

app.use("/api", todosRouter);


// Start the server
app.listen(port, () => {
  console.log(`Server listening on port: http://localhost:${port}`);
});
