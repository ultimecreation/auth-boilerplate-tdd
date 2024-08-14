import { describe, expect, it } from 'vitest'
import app from '../app'
import supertest from 'supertest'
import { prisma } from '../utils/db/db'



const validUser = {
    firstname: 'test',
    lastname: 'test',
    email: 'test@gmail.com',
    password: '123456',
    passwordConfirm: '123456'
}

describe('Register', () => {

    it('Should return status 400  when register url is called without data', async () => {
        const response = await supertest(app).post('/api/1.0/auth/register').send()
        expect(response.status).toBe(400)
    })

    it.each([
        ['firstname', '', 'Firstname is required'],
        ['lastname', '', 'Lastname is required'],
        ['email', '', 'Email is required'],
        ['email', 'email@email', 'Email is invalid'],
        ['password', '', 'Password is required'],
        ['passwordConfirm', '', 'Password confirmation is required'],
    ])(`When %s field has %s value ,we receive '%s' error msg`, async (field, value, expected) => {
        let tmpUser = { ...validUser }
        tmpUser[field] = value

        const response = await supertest(app).post('/api/1.0/auth/register').send(tmpUser)
        expect(response.body.errors[field]).toBe(expected)
    })

    it.each([
        ['123', '456', 'Passwords do not match'],
        ['a', '456', 'Passwords do not match'],
        ['123', '?', 'Passwords do not match'],
    ])(`returns 'passwords do not match' message when password value is '%s' and passwordConfirm value is '%s'`, async (passwordValue, passwordConfirmValue, expectedMsg) => {
        let tmpUser = {
            ...validUser,
            password: passwordValue,
            passwordConfirm: passwordConfirmValue
        }
        const response = await supertest(app).post('/api/1.0/auth/register').send(tmpUser)
        expect(response.body.errors.passwordConfirm).toBe(expectedMsg)
    })

    it('returns "Email already in use" message when email is already taken', async () => {
        await prisma.user.deleteMany()
        let tmpUser = { ...validUser }
        delete tmpUser.passwordConfirm
        await prisma.user.create({
            data: { ...tmpUser },
        })

        const response = await supertest(app).post('/api/1.0/auth/register').send(validUser)
        expect(response.body.errors.email).toBe("Email already in use")
    })

    it('Should return status 200 OK when register url is called with valid data', async () => {
        await prisma.user.deleteMany()
        const response = await supertest(app).post('/api/1.0/auth/register').send(validUser)
        expect(response.status).toBe(201)
    })
})

describe('Login', () => {

    it('returns status 200 OK when login url is called with valid data', async () => {
        const response = await supertest(app).post('/api/1.0/auth/login').send({
            email: validUser.email,
            password: validUser.password
        })
        expect(response.status).toBe(200)
    })

    it('returns status 400 when login url is called without data', async () => {
        const response = await supertest(app).post('/api/1.0/auth/login').send()
        expect(response.status).toBe(400)
    })
    it('returns error messages for empty email and empty password when login url is called', async () => {
        const response = await supertest(app).post('/api/1.0/auth/login').send()

        expect(response.body.errors.email).toBe("Email is required")
        expect(response.body.errors.password).toBe("Password is required")
    })

    it('returns error messages for invalid email and empty password when login url is called', async () => {
        const response = await supertest(app).post('/api/1.0/auth/login').send({
            email: 'email.com'
        })

        expect(response.body.errors.email).toBe("Email is invalid")
        expect(response.body.errors.password).toBe("Password is required")
    })

    it('returns user not found error when email is not found in db', async () => {
        await prisma.user.deleteMany()

        const response = await supertest(app).post('/api/1.0/auth/login').send({
            email: validUser.email,
            password: validUser.password
        })

        expect(response.body.errors.user).toBe('User not found')
    })
    it('returns the user jwt token when login is successfull', async () => {
        await prisma.user.deleteMany()
        let tmpUser = { ...validUser }
        delete tmpUser.passwordConfirm
        await prisma.user.create({
            data: { ...tmpUser },
        })

        const response = await supertest(app).post('/api/1.0/auth/login').send({
            email: validUser.email,
            password: validUser.password
        })

        expect(response.body.token).toBeTruthy()
    })
})
