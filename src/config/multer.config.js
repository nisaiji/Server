import path from "path";

import multer from "multer";

const storage = multer.diskStorage({
  destination: "./uploads/xlsx/students",
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  }
});

export default storage;
