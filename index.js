const express = require("express");
const bodyParser = require("body-parser");
const fileupload = require("express-fileupload");
const cors = require("cors");
const fs = require("fs-extra");
const MongoClient = require("mongodb").MongoClient;
require("dotenv").config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wawxe.mongodb.net/${process.env.DB_NAME} ?retryWrites=true&w=majority`;

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.static("services"));
app.use(fileupload());

app.get("/", (req, res) => {
  res.send("hello mongodb");
});

const port = 4000;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const orderCollection = client.db("creativeAgency").collection("order");
  const reviewCollection = client.db("creativeAgency").collection("review");
  const serviceCollection = client.db("creativeAgency").collection("service");
  const adminCollection = client.db("creativeAgency").collection("admin");

  app.post("/order", (req, res) => {
    orderCollection.insertOne(req.body).then((result) => {
      console.log(result);
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/show-order", (req, res) => {
    orderCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.get("/show-order-by-mail", (req, res) => {
    orderCollection
      .find({ email: req.headers.email })
      .toArray((error, documents) => {
        res.send(documents);
      });
  });

  app.post("/review-aria", (req, res) => {
    reviewCollection.insertOne(req.body).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/getReview", (req, res) => {
    reviewCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.post("/addService", (req, res) => {
    const file = req.files.file;
    const title = req.body.title;
    const Description = req.body.Description;

    const newImg =file.data;
    const encImg = newImg.toString("base64");

    var image = {
      contentType:file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, "base64"),
    };

    serviceCollection
      .insertOne({ title, Description, image })
      .then((result) => {
        res.send(result.insertedCount > 0);
      });
  });


  app.get("/show-service", (req, res) => {
    serviceCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.post("/add-admin", (req, res) => {
    adminCollection
      .insertOne({ admin: req.body.admin })
      .then((result) => {
        console.log(result);
        res.send(result.insertedCount > 0);
      })
      .catch((err) => console.log(err));
  });

  app.get("/check-admin", (req, res) => {
    adminCollection
      .find({ admin: req.headers.email })
      .toArray((error, documents) => {
        res.send(documents.length > 0);
      });
  });

  app.patch("/update-status", (req, res) => {
    ordersCollection
      .updateOne(
        { _id: ObjectID(req.body.id) },
        {
          $set: { status: req.body.status },
        }
      )
      .then((result) => {
        res.send(result.modifiedCount > 0);
      })
      .catch((err) => console.log(err));
  });
});

app.listen(process.env.PORT || port);
