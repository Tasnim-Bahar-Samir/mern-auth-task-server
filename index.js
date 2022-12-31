const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
const bcrypt = require('bcryptjs')
const app = express();
const jwt = require('jsonwebtoken')
const port = process.env.PORT || 5000;
require('dotenv').config()
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.skbfv9j.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const userCollection = client.db('dbUser1').collection('users')

async function run(){
    try{
        app.post("/users", async (req, res) => {

            const {name,email,password,address,phone} = req.body;
            const ancryptedPassword = await bcrypt.hash(password,10)
            console.log(ancryptedPassword)
            const query = {email}
            const alreadyAddedUser = await userCollection.find(query).toArray();
            if(alreadyAddedUser.length){
              return res.send({success:false, message:"This user already exist"})
            }
            const user = {
              name,
              email,
              password: ancryptedPassword,
              email,
              address,
              phone,
            }
            const result = await userCollection.insertOne(user);
      
            if (result.insertedId) {
              res.send({
                success: true,
                message: "User registered successfully",
              });
            } else {
              res.send({
                success: false,
                message: "Failed to register",
              });
            }
          });

    app.post('/login', async(req,res)=>{
      const {email,password} = req.body;
      const user = await userCollection.findOne({email})
      if(!user){
        return res.send({success: false, message:"No user found.Please register first."})
      }
      if(await bcrypt.compare(password, user.password)){
        const token = jwt.sign({email},process.env.JWT_SECRETEKEY)
        if(res.status(201)){
          res.send({ success:true, message:'Token given'})
        }
      }else{
        res.send({ success:false, message:'Failed to generate token'})
      }
    })
    }catch(err){
        console.log(err.message,err.name)
    }
}
run()

app.get('/',(req,res)=>{
    res.send('Server is running')
})


app.listen(port,()=>{
    console.log('Server is running on',port)
})