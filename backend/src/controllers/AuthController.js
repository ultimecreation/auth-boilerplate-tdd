
import { matchedData, validationResult } from "express-validator"
import { prisma } from "../utils/db/db"
import jwt from 'jsonwebtoken'

export default new class AuthController {
    async register(req, res) {
        const result = validationResult(req)

        if (!result.isEmpty()) {
            const errors = {}
            result.array().forEach(error => {
                errors[error.path] = error.msg
            })
            return res.status(400).send({ errors });
        }

        const sanitizedData = matchedData(req)
        delete sanitizedData.passwordConfirm
        await prisma.user.create({
            data: { ...sanitizedData },
        })

        return res.status(201).json({ msg: 'User created' })
    }

    async login(req, res) {
        const result = validationResult(req)
        if (!result.isEmpty()) {
            const errors = {}
            result.array().forEach(error => {
                errors[error.path] = error.msg
            })
            return res.status(400).send({ errors })
        }

        const user = await prisma.user.findFirst({ where: { email: req.body.email } })

        if (!user) {
            return res.status(400).send({ errors: { user: 'User not found' } })
        }

        const token = jwt.sign({ user }, 'secret')
        return res.status(200).send({ token: `Bearer ${token}` })

    }
}()