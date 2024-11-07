import multer from "multer";
import path from "path";

const storage = multer.memoryStorage({
  destination: function (_, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (_, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } });

export default upload;
