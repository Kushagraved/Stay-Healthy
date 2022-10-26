const express=require('express');
const app=express();
const mongoose=require('mongoose');

require('dotenv').config();
// console.log(process.env.MONGO_URL);
const port=process.env.PORT || 5000;


app.use(express.json());
const userRoute=require('./routes/userRoute')
const adminRoute=require('./routes/adminRoute')
const doctorRoute=require('./routes/doctorRoute')



app.use('/api/user',userRoute);
app.use('/api/admin',adminRoute);
app.use('/api/doctor',doctorRoute);


//For Heroku Deployment
if (process.env.NODE_ENV === "production") {
    app.use("/", express.static("client/build"));
  
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "client/build/index.html"));
    });
}
app.get("/", (req, res) => res.send("Hello World!"));



mongoose.connect(process.env.MONGO_URL)
    .then(()=>app.listen(port,()=>console.log(`Listening on port ${port}`)))
    .catch((error)=>console.log(error));

// app.listen(port,()=>console.log(`Listening on port ${port}`));

