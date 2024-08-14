import { body } from "express-validator"


import { prisma } from "../db/db"
export default new class AuthMiddleware {

    validateIncomingFieldsOnRegister = [
        body('firstname').trim().notEmpty().withMessage("Firstname is required"),
        body('lastname').trim().notEmpty().withMessage("Lastname is required"),
        this.checkPasswordNotEmpty(),
        body('passwordConfirm').trim().notEmpty().withMessage("Password confirmation is required").bail()
            .custom((value, { req }) => {
                return value === req.body.password
            })
            .withMessage('Passwords do not match'),
        this.checkEmailNotEmptyAndIsValid()
            .custom(async (email) => {

                const emailExists = await prisma.user.findFirst({ where: { email } });
                if (emailExists) {
                    throw new Error;
                }
            }).withMessage('Email already in use')

    ]

    validateIncomingFieldsOnLogin = [
        this.checkEmailNotEmptyAndIsValid(),
        this.checkPasswordNotEmpty()

    ]

    checkPasswordNotEmpty() {
        return body('password').trim().notEmpty().withMessage("Password is required")
    }

    checkEmailNotEmptyAndIsValid() {
        return body('email').trim().notEmpty().withMessage("Email is required").bail()
            .isEmail().withMessage("Email is invalid").bail()
    }

}