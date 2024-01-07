// slighty hacky middleware to handle async errors since express falls over by default
require('express-async-errors');
import express from 'express';
import morgan from 'morgan';
import mongoose from 'mongoose';

import cors from 'cors';
import {config} from './config';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(morgan('tiny'));
app.use(express.json());

const port = config.PORT;

app.listen(port, () => {
  console.log(`🚀 Running jop-portal express server on ${port}...`);
  mongoose.connect(config.MONGO_URI || '');
});
