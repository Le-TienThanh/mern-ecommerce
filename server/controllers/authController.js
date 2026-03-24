import ErrorHandler from '../middlewares/errorMiddleware.js';
import { catchAsyncErrors } from '../middlewares/catchAsyncError.js';
import database from '../database/db.js';
import bcrypt from 'bcrypt';
import { sendToken } from '../utils/jwtToken.js';
import { generateEmailTemplate } from '../utils/generateForgotPasswordEmailTemplate.js';
import { sendEmail } from '../utils/sendEmail.js';
import { generateResetPasswordToken } from '../utils/generateResetpasswordToken.js';

export const register = catchAsyncErrors(async (req, res, next) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return next(
            new ErrorHandler('Please provide all required fields', 400),
        );
    }
    const isAlreadyRegistered = await database.query(
        'SELECT * FROM users WHERE email = $1',
        [email],
    );
    if (isAlreadyRegistered.rows.length > 0) {
        return next(
            new ErrorHandler('User already registered with this email', 400),
        );
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await database.query(
        'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
        [name, email, hashedPassword],
    );
    sendToken(user.rows[0], 201, 'User registered successfully', res);
});

export const login = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new ErrorHandler('Please provide email and password', 400));
    }
    const user = await database.query('SELECT * FROM users WHERE email = $1', [
        email,
    ]);
    if (user.rows.length === 0) {
        return next(new ErrorHandler('Invalid email or password', 401));
    }
    const isPasswordMatched = await bcrypt.compare(
        password,
        user.rows[0].password,
    );
    if (!isPasswordMatched) {
        return next(new ErrorHandler('Invalid email or password', 401));
    }
    sendToken(user.rows[0], 200, 'Logged in successfully', res);
});

export const getUser = catchAsyncErrors(async (req, res, next) => {
    const { user } = req;

    res.status(200).json({
        success: true,
        user,
    });
});

export const logout = catchAsyncErrors(async (req, res, next) => {
    res.status(200)
        .cookie('token', '', {
            expires: new Date(Date.now()),
            httpOnly: true,
        })
        .json({
            success: true,
            message: 'Logged out successfully',
        });
});

export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const { email } = req.body;
    const { frontendUrl } = req.body;
    const userResult = await database.query(
        'SELECT * FROM users WHERE email = $1',
        [email],
    );
    if (userResult.rows.length === 0) {
        return next(new ErrorHandler('User not found with this email', 404));
    }
    const user = userResult.rows[0];
    const { resetToken, hashedToken, resetPasswordExpire } =
        generateResetPasswordToken();
    await database.query(
        'UPDATE users SET reset_password_token = $1, reset_password_expires = to_timestamp($2) WHERE email = $3',
        [hashedToken, resetPasswordExpire / 1000, email],
    );
    const resetPasswordUrl = `${frontendUrl}/password/reset/${resetToken}`;
    const message = generateEmailTemplate(resetPasswordUrl);
    try {
        await sendEmail({
            email: user.email,
            subject: 'Ecommerce Password Recovery',
            message,
        });
        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully`,
        });
    } catch (error) {
        await database.query(
            'UPDATE users SET reset_password_token = NULL, reset_password_expires = NULL WHERE email = $1',
            [email],
        );
        console.log('error: ',error)
        return next(
            new ErrorHandler(
                'Failed to send email. Please try again later.',
                500,
            ),
        );
    }
});
