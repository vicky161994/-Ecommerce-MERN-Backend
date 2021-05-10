const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const dbConfig = require("./config/dbConfig");
const PORT = process.env.PORT || 4000;
app.get("/", (req, res) => res.send("server connected successfully!"));
const userRoute = require("./routes/usersRoutes");
const porductRoute = require("./routes/productsRoutes");
app.use("/api/users", userRoute);
app.use("/api/products", porductRoute);
app.listen(PORT, () =>
  console.log(`server is up and running on port: ${PORT}`)
);
