const express = require("express");
const app = express();
const cors = require("cors");
const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;
const bcryptjs = require('bcrypt');
const url = "mongodb://localhost:27017";
//"mongodb+srv://lava:lava123@cluster0.py3np.mongodb.net?retryWrites=true&w=majority";
const PORT=process.env.PORT || 3001


app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());
app.post("/register", async function (req, res) {
  try {
      // Connect the Database
      let client = await mongoClient.connect(url)

      // Select the DB
      let db = client.db("todo_app");

      // Hash the password
      console.log(req.body.password);
      let salt = bcryptjs.genSaltSync(10);
      let hash = bcryptjs.hashSync(req.body.password,salt);
      req.body.password = hash;
     // console.log(hash);

      // Select the Collection and perform the action
      let data = await db.collection("task").insertOne(req.body)

      // Close the Connection
      await client.close();

      res.json({
          message: "User Registered",
          id: data._id
      })
  } catch (error) {
        console.log(error);
        res.json({
          message: "Registeration failed"
      })
  }
})

//login
app.post("/login", async function (req, res) {
  try {
      // Connect the Database
      let client = await mongoClient.connect(url)

      // Select the DB
      let db = client.db("todo_app");

      // Find the user with email_id
      let user = await db.collection("task").findOne({ username: req.body.username });

      if (user) {
          // Hash the incoming password
          // Compare that password with user's password
          console.log(req.body)
          console.log(user.password)
          let matchPassword = bcryptjs.compareSync(req.body.password, user.password)
         if(matchPassword){
          res.json({
            message: "true"
        })
         }
      } else {
          res.status(404).json({
              message: "Username/Password is incorrect"
          })
      }





  } catch (error) {
      console.log(error)
  }
})

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
