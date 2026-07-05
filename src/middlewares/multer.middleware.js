import multer from "multer";
import storage from "../config/multer.config.js";

const multerUpload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }
});

const upload = (req, res, next) => {
  multerUpload.single("file")(req, res, (err) => {
    if (err) {
      return res
        .status(400)
        .send({ status: "error", statusCode: 400, message: err.message });
    }
    next();
  });
};

export default upload;
