const { MongoClient, ObjectId } = require("mongodb");

const config = require("../config");

module.exports = {
  getCollection,
  setMongoId: ObjectId
};

// Database Name
const dbName = "collabmusic_db";

var dbConn = null;

async function getCollection(collectionName) {
  try {
    const db = await connect();
    const collection = await db.collection(collectionName);
    return collection;
  } catch (err) {
    console.log("Failed to get Mongo collection", err);
    logger.error("Failed to get Mongo collection", err);
    throw err;
  }
}

async function connect() {
  if (dbConn) return dbConn;
  try {
    const client = await MongoClient.connect(config.dbURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const db = client.db(dbName);
    dbConn = db;
    return db;
  } catch (err) {
    logger.error("Cannot Connect to DB", err);
    throw err;
  }
}
