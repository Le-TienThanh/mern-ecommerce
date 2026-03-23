import express from 'express';
import { getUser, login, logout, register } from '../controllers/authController.js';


const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", getUser);
router.get("/logout", logout);


export default router;