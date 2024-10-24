import multer from "multer";

const storage = multer.memoryStorage({
  destination: function (_, file, cb) {
    cb(null, "api-server/public/uploads");
  },
  filename: function (_, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } });

export default upload;
