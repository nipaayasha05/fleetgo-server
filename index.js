const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;

// car_Rental
// V6NqseoS43khXDTj

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sgjw94w.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const carsCollection = client.db("carRental").collection("cars");
    const bookingCollection = client.db("carRental").collection("bookings");

    // cars api
    app.get("/cars", async (req, res) => {
      const { search } = req.query;
      // console.log(search);
      const email = req.query.email;
      let query = {};

      if (search) {
        query = {
          $or: [
            {
              carModel: { $regex: search, $options: "i" },
            },
            {
              brand: { $regex: search, $options: "i" },
            },
            {
              location: { $regex: search, $options: "i" },
            },
          ],
        };
      }

      if (email) {
        query.email = email;
      }
      const result = await carsCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/recentCar", async (req, res) => {
      const result = await carsCollection
        .find()
        .sort({ date: -1 })
        .limit(8)
        .toArray();
      res.send(result);
    });

    app.get("/bookings", async (req, res) => {
      const email = req.query.email;
      const query = {};
      if (email) {
        query.email = email;
      }
      const result = await bookingCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/cars", async (req, res) => {
      const addCar = req.body;
      addCar.bookingCount = parseInt(addCar.bookingCount) || 0;
      const result = await carsCollection.insertOne(addCar);

      res.send(result);
    });

    app.post("/bookings", async (req, res) => {
      const booking = req.body;
      console.log(booking);
      const result = await bookingCollection.insertOne(booking);
      res.send(result);
    });

    app.put("/cars/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedCar = req.body;
      updatedCar.bookingCount = parseInt(updatedCar.bookingCount) || 0;
      const updatedDoc = {
        $set: updatedCar,
      };
      const result = await carsCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    app.patch("/cars/increment-booking/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = { $inc: { bookingCount: 1 } };

      const result = await carsCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    // app.put("/cars/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const filter = { _id: new ObjectId(id) };
    //   // const { bookingCount } = req.body;
    //   const updatedDoc = {
    //     $inc: {
    //       bookingCount: 1,
    //     },
    //   };
    //   const result = await carsCollection.updateOne(filter, updatedDoc);
    //   res.send(result);
    // });

    app.patch("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          startDate: req.body.startDate,
          endDate: req.body.endDate,
          price: req.body.price,
          status: req.body.status,
        },
      };
      const result = await bookingCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    app.delete("/cars/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await carsCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Car Rental Server");
});

app.listen(port, () => {
  console.log(`Car Rental Server is running on port ${port}`);
});
