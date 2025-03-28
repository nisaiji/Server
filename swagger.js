import swaggerJSDoc from "swagger-jsdoc";
import { config } from "./src/config/config.js";

const host = config.host || 'localhost';
const port = config.port || 4000;

const swaggerOptions = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "School-App",
        description: "School-App API allows you to manage student records, staff data, schedules, and resources. It offers secure, JWT-based access and role-based permissions for admins, teachers, and students.",
        version: "1.0.0",
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
    apis: ["./src/docs/**/*.yaml"]
  };
  
  const swaggerDocs = swaggerJSDoc(swaggerOptions);
  export default swaggerDocs;