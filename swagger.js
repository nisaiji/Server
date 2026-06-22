import swaggerJSDoc from "swagger-jsdoc";

import { config } from "./src/config/config.js";

const host = config.host || "localhost";
const port = config.port || 4000;
const baseUrl = process.env.NODE_ENV === "production"
  ? `https://${host}`
  : `http://${host}:${port}`;

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "School-App",
      description: "School-App API allows you to manage student records, staff data, schedules, and resources. It offers secure, JWT-based access and role-based permissions for admins, teachers, and students.",
      version: "1.0.0",
      contact: {
        name: "API Support",
      }
    },
    servers: [
      { url: baseUrl, description: process.env.NODE_ENV === "production" ? "Production" : "Local Development" }
    ],
    components: {
      securitySchemes: {
        Authorization: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token: Bearer <token>"
        }
      }
    },
    security: [{ Authorization: [] }]
  },
  apis: ["./src/docs/**/*.yaml"]
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);
export default swaggerDocs;