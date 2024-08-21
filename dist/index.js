"use strict";

var _express = _interopRequireDefault(require("express"));
var _morgan = _interopRequireDefault(require("morgan"));
var _cors = _interopRequireDefault(require("cors"));
var _swaggerUiExpress = _interopRequireDefault(require("swagger-ui-express"));
var _dbConfig = _interopRequireDefault(require("./src/config/db.config.js"));
var _indexRouter = _interopRequireDefault(require("./src/routers/index.router.js"));
var _config = require("./src/config/config.js");
var _cookieParser = _interopRequireDefault(require("cookie-parser"));
var _swagger = _interopRequireDefault(require("./swagger.js"));
require("module-alias/register.js");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// import "module-alias/register"

const PORT = _config.config.port || 4000;
const app = (0, _express.default)();
app.use(_express.default.json());
app.use((0, _cookieParser.default)());
app.use((0, _morgan.default)("common"));
app.use((0, _cors.default)({
  Credential: true,
  origin: "*"
}));
app.use("/api-docs", _swaggerUiExpress.default.serve, _swaggerUiExpress.default.setup(_swagger.default));
app.use("/", _indexRouter.default);
app.listen(PORT, () => {
  console.log(`server is running at ${PORT}`);
  (0, _dbConfig.default)();
});