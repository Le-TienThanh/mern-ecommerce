import express from 'express';
import { getUser, login, logout, register } from '../controllers/authController.js';
import { isAuthenticated } from '../middlewares/authMiddleware.js';


const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", isAuthenticated, getUser);
router.get("/logout", isAuthenticated, logout);


export default router;