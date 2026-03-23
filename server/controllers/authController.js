import ErrorHandler from "../middlewares/errorMiddleware.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import database from "../database/db.js";
import bcrypt from "bcrypt";
import { sendToken } from "../utils/jwtToken.js";

export const register = catchAsyncErrors(async (req, res, next) => {
    const {name, email, password} = req.body;
    if (!name || !email || !password) {
        return next(new ErrorHandler("Please provide all required fields", 400));
    }
    const isAlreadyRegistered = await database.query("SELECT * FROM users WHERE email = $1", [email]);
    if(isAlreadyRegistered.rows.length > 0){
        return next(new ErrorHandler("User already registered with this email", 400));
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await database.query("INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *", 
        [name, email, hashedPassword]);
    sendToken(user.rows[0], 201, "User registered successfully", res);

})

export const login = catchAsyncErrors(async (req, res, next) => {})

export const getUser = catchAsyncErrors(async (req, res, next) => {})

export const logout = catchAsyncErrors(async (req, res, next) => {})