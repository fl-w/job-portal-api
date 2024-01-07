import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

const mongod = new MongoMemoryServer();

const connect = async () => {
  await mongod.start();
  const uri = mongod.getUri();
  await mongoose.connect(uri).catch((error) => {
    console.error('Error connecting to database:', uri, error);
    throw error;
  });
};

const disconnect = async () => {
  if (mongoose.connection.readyState == 1) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
  await mongod.stop();
};

const clear = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

export default { connect, disconnect, clear };
