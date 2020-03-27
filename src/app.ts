import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import routes from './routes'

const app = express()

app.use(...Object.values(routes))

const port = process.env.PORT
app.listen(port, () => console.log(`Listening on http://localhost:${port}`))
