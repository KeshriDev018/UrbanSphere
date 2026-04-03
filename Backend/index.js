import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({
  path: `${__dirname}/.env`,
});

import app from "./app.js";
import ConnectDB from "./db/index.js";

ConnectDB()
  .then(
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    }),
  )
  .catch((err) => {
    console.log("MONGO DB connection failed", err);
  });
