import express from 'express'

import publicRouter from './routes/public.js'

const app = express()
const port = 3000

app.use(express.json())

app.use('/', publicRouter)


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})