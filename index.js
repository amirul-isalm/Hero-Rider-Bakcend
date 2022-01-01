const express = require("express");
const app = express();
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const fileUpload = require("express-fileupload");
const stripe = require("stripe")(process.env.STRIPE_SECRET);

const port = process.env.PORT || 5000;
const cors = require("cors");
app.use(cors());
app.use(express.json());
app.use(fileUpload());

// mongodb clint and uri link;
const { MongoClient } = require("mongodb");
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.jgifu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("Herorider");
    const RiderCollection = database.collection("riderCollection");
    const LearnerCollection = database.collection("learnerCollection");
    const courseCollection = database.collection("courseColleciton");
// Get all user
    
    app.get("/riders", async (req, res) => {
      const result = await RiderCollection.find({}).toArray()
      res.json(result)
    })
    app.get("/learners", async (req, res) => {
      const result = await LearnerCollection.find({}).toArray()
      res.json(result)
    })

    //post rider collection
    app.post("/riders", async (req, res) => {
      const userName = req.body.userName;
      const email = req.body.email;
      const age = req.body.email;
      const address = req.body.address;
      const phone = req.body.phone;
      const area = req.body.area;
      const vichle = req.body.vichaleType;
      const account = req.body.accountType;
      const carinformation = req.body.carinformation;
      const passsword = req.body.password;
      const status = "active";
      // photo decoded
      const nidFront = Buffer.from(
        req.files.nidFront.data.toString("base64"),
        "base64"
      );
      const nidBack = Buffer.from(
        req.files.nidBack.data.toString("base64"),
        "base64"
      );
      const drivingFront = Buffer.from(
        req.files.drivingFront.data.toString("base64"),
        "base64"
      );
      const drivingBack = Buffer.from(
        req.files.drivingBack.data.toString("base64"),
        "base64"
      );
      const profilePic = Buffer.from(
        req.files.profilePic.data.toString("base64"),
        "base64"
      );
      const Rider = {
        userName,
        email,
        age,
        address,
        phone,
        area,
        vichle,
        account,
        carinformation,
        passsword,
        status,
        nidFront,
        nidBack,
        drivingFront,
        drivingBack,
        profilePic,
      };

      const result = await RiderCollection.insertOne(Rider);
      res.json(result);
    });
    //post learner collection
    app.post("/lrarners", async (req, res) => {
      const userName = req.body.userName;
      const email = req.body.email;
      const age = req.body.email;
      const address = req.body.address;
      const phone = req.body.phone;

      const vichle = req.body.vichaleType;
      const account = req.body.accountType;
      const passsword = req.body.password;
      const status = "active";
      // photo decoded
      const nidFront = Buffer.from(
        req.files.nidFront.data.toString("base64"),
        "base64"
      );
      const nidBack = Buffer.from(
        req.files.nidBack.data.toString("base64"),
        "base64"
      );

      const profilePic = Buffer.from(
        req.files.profilePic.data.toString("base64"),
        "base64"
      );
      const learner = {
        userName,
        email,
        age,
        address,
        phone,

        vichle,
        account,

        passsword,
        status,
        nidFront,
        nidBack,

        profilePic,
      };

      const result = await LearnerCollection.insertOne(learner);
      res.json(result);
    });

    // get user data useing email
    app.get("/rider", async (req, res) => {
      const email = req.query.email;
      const coursor = { email: email };

      const result = await RiderCollection.find(coursor).toArray();
      res.json(result);
    });
    app.get("/learner", async (req, res) => {
      const email = req.query.email;
      const coursor = { email: email };

      const result = await LearnerCollection.find(coursor).toArray();
      res.json(result);
    });

    // get specific data useing id
    app.get("/courses", async (req, res) => {
      const result = await courseCollection.find({}).toArray();
      res.json(result);
    });

    app.get("/course/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await courseCollection.findOne(query);
      res.json(result);
    });

    // paymnet api
    app.post("/create-payment-intent", async (req, res) => {
      const paymentinfo = req.body;

      const amount = paymentinfo.price * 100;
      const paymentIntant = await stripe.paymentIntents.create({
        currency: "usd",
        amount: amount,
        payment_method_type: ["card"],
      });
      res.json({ clientSecret: paymentIntant.client_secret });
    });

     app.get("/users/:email", async (req, res) => {
       const email = req.params.email;
       if (email) {
         const coursor = { email: email };
         const user = await RiderCollection.findOne(coursor);
         let isAdmin = false;
         if (user?.account === "admin") {
           isAdmin = true;
         }
         res.json({ admin: isAdmin });
       }
     });
  } finally {
    //    await client.close()
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello Hero Rider !");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
