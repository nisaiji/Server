import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import connectDB from './src/config/db.config.js';
import router from './src/routers/index.router.js';
dotenv.config();

const PORT = process.env.PORT || 4000;

const app = express();
app.use(express.json());
app.use(morgan('comman'));
app.use(cors({
    Credential:true,
    origin:"http://localhost:3000",
}))

app.use("/",router);

app.listen(PORT,()=>{
    console.log(`server is running at ${PORT}`);
    connectDB();
})