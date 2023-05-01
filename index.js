const express = require('express');
const cors = require('cors')
const ObjectId = require('mongodb').ObjectId ;
const { MongoClient } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cowhf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();

        const database = client.db("drone-world");
        const productsCollection = database.collection("products")
        const orderCollection = database.collection("orders")
        const reviewCollection = database.collection("reviews")
        const userCollection = database.collection("users")

        // get all products
        app.get('/products', async (req,res) => {
            const cursor = productsCollection.find({})
            const products = await cursor.toArray();
            res.send(products)
        })

        // get a single item 
        app.get('/buyNow/:id', async (req, res) => {
          const id = req.params.id ;
          const query = {_id : ObjectId(id)};
          const result = await productsCollection.findOne(query);
          res.send(result)
        })

      // add orders api
      app.post('/order', async (req,res) => {
        const order = req.body;
        const result = await orderCollection.insertOne(order);
        res.json(result);
      })

      // get orders for an user
      app.get('/orders', async(req, res) => {
        const email = req.query.email;
        const query = { email : email };
        const cursor = orderCollection.find(query);
        const orders = await cursor.toArray();
        res.send(orders)
      })

    // give review from an user
    app.post('/customerReview', async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.json(result)
    })


    // get all reviews
    app.get('/reviews', async (req, res) => {
      const cursor = reviewCollection.find({});
      const result = await cursor.toArray();
      res.send(result)
    })


    // save a user
    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      console.log(result);
      res.json(result);
    })


    // insert data to the products colletion 
    app.post('/products', async (req, res) => {
      const addProduct = req.body;
      const result = await productsCollection.insertOne(addProduct)
      res.json(result)
    })


    // upsert an user to the database
    app.put('/users', async(req, res) => {
      const user = req.body;
      const filter = {email : user.email} ;
      const options = {upsert : true};
      const updateDoc = {$set : user};
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    })


    // make admin
    app.put('/users/admin', async (req, res) => {
      const user = req.body;
      const filter = { email : user.email };
      const updateDoc = { $set : { role : 'admin' } };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.json(result);
    })

    // status pending to shipped
    app.put('/orders/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) }
      const udateDoc = {
          $set: {
              status: 'Shipped'
          },
      };
      const result = await orderCollection.updateOne(query, udateDoc)
      res.json(result)
  })


    // find an admin
    app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email : email };
      const user = await userCollection.findOne(query)
      let isAdmin = false ;
      if(user?.role === 'admin'){
        isAdmin = true
      }

      res.json( { admin : isAdmin } )
    })

    // get all orders
    app.get('/allOrders', async (req, res) => {
      const cursor = orderCollection.find({});
      const result = await cursor.toArray();
      res.send(result);
    })


    // delete an order for an user
      app.delete('/orders/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) }
        const result = await orderCollection.deleteOne(query)
        res.json(result)
    })


    // delete an order from all orders
    app.delete('/allOrders/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.json(result)
    })


    // delete a data from all products
    app.delete('/products/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id : ObjectId(id) };
      const result = await productsCollection.deleteOne(query);
      res.json(result);
    })


    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World!')
})


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})