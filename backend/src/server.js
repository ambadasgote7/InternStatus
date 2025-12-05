import app from "./app.js";
import dotenv from "dotenv";
import connectDB from "./config/database.js";

dotenv.config();

const PORT = process.env.PORT;

connectDB()
    .then(() => {
        console.log("Database Connected Successfully");
        app.listen(7777, () => {
            console.log("Server is running on Port " + PORT);
        });
    })
    .catch ((err) =>  {
        console.log("ERROR : " + err.message);
    });




