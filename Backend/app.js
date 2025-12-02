import express, { urlencoded } from "express";

import cors from "cors";

import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));

app.use(
  urlencoded({
    extended: true,
    limit: "16kb",
  })
);

app.use(express.static("public"));

app.use(cookieParser());

import userRouter from "./routes/user.routes.js"
import societyRouter from "./routes/societyRegistration.routes.js"
import complaintRouter from "./routes/complaint.routes.js"
import flatRouter from "./routes/flat.routes.js";
import maintenanceBillRouter from "./routes/maintenanceBill.routes.js";
import noticeRouter from "./routes/notice.routes.js";
import packageRouter from "./routes/package.routes.js";
import paymentRouter from "./routes/payment.routes.js";
import staffRouter from "./routes/staff.routes.js";
import visitorRouter from "./routes/visitor.routes.js";





app.use("/api/v1/user",userRouter)
app.use("/api/v1/society",societyRouter)
app.use("/api/v1/complaint",complaintRouter)
app.use("/api/v1/flat",flatRouter)
app.use("/api/v1/bill",maintenanceBillRouter)
app.use("/api/v1/notice",noticeRouter)
app.use("/api/v1/package",packageRouter)
app.use("/api/v1/payment",paymentRouter)
app.use("/api/v1/staff",staffRouter)
app.use("/api/v1/visitor",visitorRouter)









export default app