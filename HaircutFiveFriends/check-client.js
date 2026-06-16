import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Client from './src/client/client.model.js';

dotenv.config();

const check = async () => {
  try {
    await mongoose.connect(process.env.URI_MONGO);
    console.log('Connected to MongoDB');
    const clients = await Client.find({});
    console.log('Clients count:', clients.length);
    clients.forEach(c => {
      console.log(`- Name: ${c.name}, Email: ${c.email}, UserId: ${c.userId}, MongoId: ${c._id}`);
    });
    
    console.log('Testing findOne by userId: "usr_c1ientDemo12"');
    const client = await Client.findOne({ userId: 'usr_c1ientDemo12' });
    console.log('Found client:', client ? client.name : 'null');
    
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
};

check();
