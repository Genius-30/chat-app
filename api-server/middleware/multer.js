import multer from "multer";

const storage = multer.diskStorage({
  destination: function (_, file, cb) {
    cb(null, "api-server/public/uploads");
  },
  filename: function (_, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const upload = multer({ storage });

export default upload;
