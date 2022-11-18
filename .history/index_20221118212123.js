const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;


// For Middleware
const app = express();
app.use(cors());
app.use(express.json());

/********************************************\
            MongoDB Connection Start
\********************************************/
// Import



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.uxgzc97.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {


  try {
    console.log('first')
    // await client.connect()
    const productsCollection = client.db("Electra").collection("products");
    const reviewCollection = client.db("Electra").collection("review");
    const blogsCollection = client.db("Electra").collection("blogs");

    // load all item from database
    app.get("/products", async (req, res) => {
      const query = {};
      const cursor = productsCollection.find(query);
      const allProduct = await cursor.toArray();
      res.send(allProduct);
    });

    app.get("/productslimit", async (req, res) => {
      const query = {};
      const cursor = productsCollection.find(query);
      const allProduct = await cursor.limit(3).toArray();
      res.send(allProduct);
    });

    // load single item using _id
    app.get("/singleProduct/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await productsCollection.findOne(query);
      res.send(product);
    });

    // load multiple item using user email 
    app.get("/reviews/:searchUser", async (req, res) => {
      const query = { user: req.params.user };
      const cursor = reviewCollection.find(query);
      const findedReviewsBasedOnEmail = await cursor.toArray();
      res.send(findedReviewsBasedOnEmail);
    })

    app.get("/reviews", async (req, res) => {
      const query = {};
      const cursor = reviewCollection.find(query);
      const allreview = await cursor.toArray();
      res.send(allreview);
    });

    // add single item to database
    app.post("/add", async (req, res) => {
      const newItem = req.body;
      console.log(newItem);
      res.send({ result: "data received!" });
      const result = await productsCollection.insertOne(newItem);
      console.log("User Inserted. ID: ", result.insertedId);
    });

    app.post("/addreview", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });


    // update a product
    app.put("/review/:id", async (req, res) => {
      const id = req.params.id;
      const updatedProduct = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      console.log(updatedProduct);
      const updatedDoc = {
        $set: {
          name: updatedProduct.name,
          email: updatedProduct.email,
          details: updatedProduct.details,
        },
      };
      const result = await reviewCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    // delete a product from database 
    app.delete(`/reviews/:id`, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await reviewCollection.deleteOne(query);
      res.send(result);
    })

    // Blogs

    app.get("/blogs", async (req, res) => {
      const query = {};
      const cursor = blogsCollection.find(query);
      const blogs = await cursor.toArray();
      res.send(blogs);
    });

  } finally {
    // await client.close();
  }
};
run().catch(console.dir);




/********************************************\
            MongoDB Connection End
\********************************************/



// Create root API
app.get("/", (req, res) => {
  res.send("Running Electra server");
});

// For Port & Listening

app.listen(port, (req, res) => {
  console.log("Listening to port", port);
});

