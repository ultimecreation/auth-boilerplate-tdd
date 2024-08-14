import express from 'express'
import AuthRouter from './routes/AuthRoutes'

const app = express()


app.use(express.json())
    .use('/', AuthRouter)


export default app