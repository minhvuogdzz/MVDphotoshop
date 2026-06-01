import mongoose from 'mongoose';

const uri = "mongodb+srv://ougvnit2_db_user:Mvd0405@cluster0.1pkd1py.mongodb.net/?appName=Cluster0";

mongoose.connect(uri)
  .then(() => {
    console.log("Connected successfully!");
    process.exit(0);
  })
  .catch(err => {
    console.error("Connection failed:", err.message);
    process.exit(1);
  });
