import connectDB from "./db/config.js";
import User from "./models/User.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config({path : "./.env"});

const userRegister = async () => {
    connectDB();
    try {
        const hashPassword = await bcrypt.hash("codeHack", 10);
        const newUser = new User({
            firstName: "Code",
            lastName: "Hack",
            email: "codehack@gmail.com",
            password: hashPassword,
            role: "emp",
        });
        await newUser.save();
    } catch (error) {
        console.log(error);
        
    }
}

userRegister();