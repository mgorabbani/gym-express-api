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

app.use(bodyParser.json());
mongoose.Promise = Promise;
app.use(cors())
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

app.get("/*", (req, res) => {
  res.status(200).json({ message: 'this is api dude!, learn your routes ;)' })
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log("Running on localhost:8080"));
