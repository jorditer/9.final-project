import mongoose, { Schema, Document } from 'mongoose';
import express from 'express';
import dotenv from 'dotenv';
import pinRoutes from './routes/pins.route.js';
import userRoutes from './routes/users.route.js';
import cors from 'cors';
// import { default as Event } from './models/events.model.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // Allows us to accept JSON data in the req.body

app.use(cors());
app.use("/api/pins", pinRoutes);
app.use("/api/users", userRoutes);

const mongoUrl = process.env.MONGO_URL;
if (!mongoUrl) {
    throw new Error('MONGO_URL is not defined in the environment variables');
}

mongoose.connect(mongoUrl)
    .then(() => {
        console.log('Connected to MongoDB!');
        app.listen(PORT, () => {
            console.log(`Server started on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Connection error', error);
    }) ;