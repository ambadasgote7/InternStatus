import express from "express";
const app = express();

import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.js";


app.use(express.json());
app.use(cookieParser());

app.use('/', authRouter);


export default app;