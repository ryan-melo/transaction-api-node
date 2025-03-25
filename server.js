import express from 'express'

import publicRouter from './routes/public.js'
import privateRouter from './routes/private.js'
import auth from './middlewares/auth.js'
import loggers from './middlewares/logging.js'

const app = express()
const port = 3000

app.use(express.json())

app.use('/', publicRouter)
app.use('/', auth, privateRouter)


app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})