import express from "express";
import morgan from "morgan";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import connectDB from "./src/config/db.config.js";
import router from "./src/routers/index.router.js";
import { config } from "./src/config/config.js";
import cookieParser from "cookie-parser";
import swaggerDocs from "./swagger.js";
const PORT = config.port || 4000;

const app = express();
app.use(express.json());
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

app.listen(PORT, () => {
  console.log(`server is running at ${PORT}`);
  connectDB();
});
