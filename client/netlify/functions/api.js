
const serverless = require('serverless-http');
const mongoose = require('mongoose');

let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }
  
  const db = await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB Connected Successfully! (Serverless)');
  cachedDb = db;
  return db;
}

const app = require('../../app'); 

const handler = serverless(app);

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false; // Recommended for Mongoose
  await connectToDatabase();
  
  return await handler(event, context);
};