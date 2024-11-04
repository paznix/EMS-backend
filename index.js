import express from "express";
import cors from "cors";

//Configs
import dotenv from "dotenv";
import connectDB from "./db/config.js";
dotenv.config({path : "./.env"});

//Routes
import authRouter from './routes/authRoutes.js';
import leaveRouter from './routes/leaveRoutes.js';
import departmentRouter from './routes/departmentRoutes.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api/leave', leaveRouter);
app.use('/api/department', departmentRouter);
connectDB();

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`)
});