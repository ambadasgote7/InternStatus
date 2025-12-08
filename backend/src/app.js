import express from "express";
const app = express();

import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.js";

app.use(cors({
    origin : "http://localhost:5173",
    credentials : true,
}));
app.use(express.json());
app.use(cookieParser());

app.use('/', authRouter);


export default app;