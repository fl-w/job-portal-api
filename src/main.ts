// slighty hacky middleware to handle async errors since express falls over by default
require('express-async-errors');
import express from 'express';
import morgan from 'morgan';
import mongoose from 'mongoose';

import auth from './routes/auth.route';
import jobs from './routes/jobs.route';
import user from './routes/user.route';
import docs from './routes/docs.route';
import cors from 'cors';
import { globalErrorHandler } from './middleware';
import { config } from './config';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(morgan('tiny'));
app.use(express.json());

app.use('/docs', docs);
app.use('/api/auth', auth);
app.use('/api/jobs', jobs);
app.use('/api/user', user);

app.use(globalErrorHandler);

const port = config.PORT;

app.listen(port, () => {
  mongoose.connect(config.MONGO_URI || '');
  console.log(`🚀 Running jop-portal express server on ${port}...`);
});

export default app;
