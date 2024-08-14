import express from "express";
import AuthMiddleware from "../utils/middleware/AuthMiddleware.js";
import AuthController from "../controllers/AuthController.js";

const AuthRouter = express.Router()

AuthRouter.post('/api/1.0/auth/register',
    AuthMiddleware.validateIncomingFieldsOnRegister,
    AuthController.register
)
AuthRouter.post('/api/1.0/auth/login',
    AuthMiddleware.validateIncomingFieldsOnLogin,
    AuthController.login
)
export default AuthRouter