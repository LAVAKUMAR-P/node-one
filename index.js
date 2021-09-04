const express = require("express");
const app = express();
const cors = require("cors");
const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;
const url = "mongodb+srv://lavakumar:lavakumar@123@cluster0.mu3ky.mongodb.net?retryWrites=true&w=majority";
const PORT=process.env.PORT || 3001

app.use(
  cors({
    origin: "*",
  })
);

app.get("/list-all-to-do", async function (req, res) {
  try {
    //conect the database
    let client = await mongoClient.connect(url);

    //select the db
    let db = client.db("todo_app");

    //select connect action and perform action
    let data = await db.collection("task").find({}).toArray();

    //close the connection
    client.close();

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "something went wrong",
    });
  }
});
app.use(express.json());

app.post("/create-task", async function (req, res) {
  try {
    // connect the database

    let client = await mongoClient.connect(url);

    //select the db
    let db = client.db("todo_app");

    //select the collection and perform the action
    let data = await db.collection("task").insertOne(req.body);

    //close the connection
    await client.close();

    res.json({
      message: "task created",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "somthing went wrong",
    });
  }
});

app.put("/update-task/:id",async function (req, res) {
  try {
    // connect the database

    let client = await mongoClient.connect(url);

    //select the db
    let db = client.db("todo_app");

    //select the collection and perform the action
    let data = await db.collection("task").findOneAndUpdate({_id: mongodb.ObjectId(req.params.id)},{$set:req.body})

    //close the connection
    await client.close();

    res.json({
      message: "task updated",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "somthing went wrong",
    });
  }
});

app.delete("/delete-task/:id", async function (req, res) {
  try {
    // connect the database

    let client = await mongoClient.connect(url);

    //select the db
    let db = client.db("todo_app");

    //select the collection and perform the action
    let data = await db.collection("task").findOneAndDelete({_id: mongodb.ObjectId(req.params.id)})

    //close the connection
    await client.close();

    res.json({
      message: "task Deleted",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "somthing went wrong",
    });
  }
});

app.listen(PORT, function () {
  console.log("Server is Listening");
});
