import express from "express";
const app = express();

app.use(express.json());

app.use('/test', (req, res) => {
    res.send("Test Route");
});


export default app;