import express from "express";
import morgan from "morgan";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import connectDB from "./src/config/db.config.js";
import router from "./src/routers/index.router.js";
import { config } from "./src/config/config.js";
import cookieParser from "cookie-parser";

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

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "School-App",
      description: "This is a server for school-app",
      version: "1.0.0"
    },
    components: {
      securitySchemes: {
        Authorization: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          value: "Bearer <JWT token here>"
        }
      }
    }
  },
  servers: [{ url: "http://localhost:4000/" }],
  apis: ["./src/routers/*.js"]
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use("/", router);

app.listen(PORT, () => {
  console.log(`server is running at ${PORT}`);
  connectDB();
});
