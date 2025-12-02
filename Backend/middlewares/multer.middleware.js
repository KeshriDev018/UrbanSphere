
import multer from "multer";

// Memory storage → stores file in RAM instead of disk
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB (you can increase)
  },
});

export default upload;
