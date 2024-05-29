import swaggerJSDoc from "swagger-jsdoc";
import path from "path";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "School-App",
      description: "This is a server for school-app",
      version: "1.0.0",
    },
  },
  servers: [{ url: "http://localhost:4000/" }],
  apis: ["../../index.js"],
  // apis: [path.resolve(__dirname, "../../index.js")]
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);
export default swaggerDocs;
