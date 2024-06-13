import swaggerJSDoc from "swagger-jsdoc";
import { config } from "./src/config/config.js";

const host = config.host || 'localhost';
const port = config.port || 4000;

const swaggerOptions = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "School-App",
        description: "This is a server for school-app",
        version: "1.0.0"
      },
      host:host+':'+port,
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
    // apis: ["./src/docs/**/*.yaml"],
    apis:["./src/routers/*.js"]
  };
  
  const swaggerDocs = swaggerJSDoc(swaggerOptions);
  export default swaggerDocs;