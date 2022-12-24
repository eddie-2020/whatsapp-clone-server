// importing
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import Pusher from "pusher";

import Messages from "./models/messagesDb.model.js";

// app config
const app = express();
dotenv.config();
const port = process.env.PORT || 5000;

const pusher = new Pusher({
  appId: "1529239",
  key: "9d2e1f3c4ac3a28d3470",
  secret: "fc2b9515a826a0a6fd90",
  cluster: "eu",
  useTLS: true,
});

// middleware
app.use(express.json());
app.use(cors());

// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader("Access-Control-Allow-Headers", "*");
//   next();
// });

// DB config
const URI = process.env.CONNECTION_URL;

mongoose.connect(URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.once("open", () => {
  console.log("MongoDB Connected Successfully!");

  const msgCollection = db.collection("messagecontents");
  const changeStream = msgCollection.watch();

  changeStream.on("change", (change) => {
    console.log("A Change Occured", change);

    if (change.operationType === "insert") {
      const messageDetails = change.fullDocument;
      pusher.trigger("messages", "inserted", {
        name: messageDetails.name,
        message: messageDetails.message,
        timestamp: messageDetails.timestamp,
        received: messageDetails.received,
      });
    } else {
      console.log("Error Triggering Pusher");
    }
  });
});

// ???

// api routes
app.route("/").get((req, res) => {
  res.status(200).send("Hello World");
});

app.route("/messages/sync").get((req, res) => {
  Messages.find((err, data) => {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});

app.route("/messages/new").post((req, res) => {
  const dbMessages = req.body;

  Messages.create(dbMessages, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send(data);
    }
  });
});

// listener
app.listen(port, () => console.log(`Listening on localhost: ${port}`));
