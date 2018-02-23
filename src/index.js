import express from "express";
import path from "path";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import Promise from "bluebird";

import auth from "./routes/auth";
import users from "./routes/users";
import members from "./routes/members";
import cors from 'cors'
dotenv.config();
const app = express();
var corsOptions = {
  origin: 'https://gymxpert.herokuapp.com',
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
mongoose.Promise = Promise;

mongoose.connect(process.env.MONGODB_URL, { useMongoClient: true }).then(
  err => {
    app.get("/*", (req, res) => {
      res.status(500).json({ message: 'could not connect to database)' })
    });
  }
);
app.use("/api/auth", auth);
app.use("/api/users", users);
app.use("/api/members", members);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/build/index.html"));
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log("Running on localhost:8080"));
