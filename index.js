import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import connectDB from './src/config/db.config.js';
import router from './src/routers/index.router.js';
// import swaggerDocs from './src/config/swagger.config.js';
dotenv.config();

const PORT = process.env.PORT || 4000;

const app = express();
app.use(express.json());
app.use(morgan('comman'));
app.use(cors({
    Credential:true,
    origin:"http://localhost:3000",
}))

const swaggerOptions = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "School-App",
        description: "This is a server for school-app",
        version: "1.0.0"
      }
    },
    servers: [{ url: "http://localhost:4000/" }],
    apis: ["./src/routers/*.js"]
  };
  
  const swaggerDocs = swaggerJSDoc(swaggerOptions);

app.use("/api-docs",swaggerUi.serve , swaggerUi.setup(swaggerDocs));

app.use("/",router);

app.listen(PORT,()=>{
    console.log(`server is running at ${PORT}`);
    connectDB();
})