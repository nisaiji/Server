import express from "express";
import morgan from "morgan";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import connectDB from "./src/config/db.config.js";
import router from "./src/routers/index.router.js";
import { config } from "./src/config/config.js";
import cookieParser from "cookie-parser";
import swaggerDocs from "./swagger.js";
import 'module-alias/register.js'
const PORT = config.port || 4000;

const app = express();
app.use(express.json({limit:"5mb"}));
app.use(cookieParser());
app.use(morgan("common"));
app.use(
  cors({
    Credential: true,
    origin: "*"
  })
);


app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use("/", router);
app.use((err, req, res, next)=>{
  return res.status(500).send({error: err.message});
});

app.listen(PORT, () => {
  console.log(`server is running at ${PORT}`);
  connectDB();
});
