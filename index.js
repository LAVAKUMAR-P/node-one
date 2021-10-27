const express = require("express");
const app = express();
const cors = require("cors");
const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;
const bcryptjs = require('bcrypt');
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const url = process.env.DB;
//"mongodb+srv://lava:lava123@cluster0.py3np.mongodb.net?retryWrites=true&w=majority";
const PORT= process.env.PORT || 3001


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


          if (matchPassword) {
            // Generate JWT token
            let token = jwt.sign({ id: user._id },process.env.JWT_SECRET)
            res.json({
                message: true,
                token
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

//authondication
function authenticate(req, res, next) {
  try {
  // Check if the token is present
  // if present -> check if it is valid
  if(req.headers.authorization){
      jwt.verify(req.headers.authorization,process.env.JWT_SECRET,function(error,decoded){
          if(error){
              res.status(500).json({
                  message: "Unauthorized"
              })
          }else{
              console.log(decoded)
              req.userid = decoded.id;
              next()
          }
          
      });
    
  }else{
      res.status(401).json({
          message: "No Token Present"
      })
  }
  } catch (error) {
      console.log(error)
      res.status(500).json({
          message: "Internal Server Error"
      })
  }
  
}

app.get("/list-all-todo",[authenticate], async function (req, res) {
  try {
    console.log(req.body);
    //conect the database
    let client = await mongoClient.connect(url);

    //select the db
    let db = client.db("todo_app");

    //select connect action and perform action
    let data = await db.collection("task").find({userid : req.userid}).toArray();

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


app.post("/create-task",[authenticate], async function (req, res) {
  try {
    // connect the database

    let client = await mongoClient.connect(url);

    //select the db
    let db = client.db("todo_app");

    //select the collection and perform the action
    req.body.userid = req.userid;
    console.log(req.body)
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

app.put("/update-task/:id",[authenticate],async function (req, res) {
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

app.delete("/delete-task/:id",[authenticate], async function (req, res) {
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

app.get("/dashboard", [authenticate], async (req, res) => {
  res.json({
      message: "Protected Data"
  })
})

app.listen(PORT, function () {
  console.log(`Server is Listening ${PORT}`);
});
