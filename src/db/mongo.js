// import dotenv from "dotenv";
// dotenv.config(); 

import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is missing in environment variables");
}

const client = new MongoClient(process.env.MONGODB_URI);

let db;

export async function getDB() {
  if (!db) {
    await client.connect();
    db = client.db("pastebin-lite");
  }
  return db;
}
