import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectMongoDB from "./db/connectDB.js";
import commentsRoutes from './routes/comments.routes.js';
import authRoutes from "./routes/auth.routes.js";

const app = express()
const port = 3000
dotenv.config();
app.use(cors())
app.use(express.json());

app.use(commentsRoutes);
app.use(authRoutes)
app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    connectMongoDB();
    console.log(`http://localhost:${port}`)
})