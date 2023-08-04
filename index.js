import express from "express"
import db from "./config/database.js";
import router from "./route/index.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser" //digunakan sebagai middleware
import cors from "cors";

dotenv.config();
const app = express()

try {
    await db.authenticate();
    console.log("Database Connected...");
} catch (error) {
    console.error(errorr);
}


// MIDDLEWARE
// credentials = karena kita menginginkan client menengirimkan credentials
// origin = domain yang diizinkan untk bisa mengakses api kita, karena menggunakan reactJS, secara default menggunakan port 3000
app.use(cors({credentials:true, origin:'http://localhost:3001'})) 
app.use(cookieParser());
app.use(express.json()); //express.json agar bisa menerima data dalam format json
app.use(router); //middleware

app.listen(5000, () => {
    console.log(`Server started at port 5000`);
});
