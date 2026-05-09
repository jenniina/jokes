import express, { Express, Request, Response } from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import bodyParser from 'body-parser'
import * as path from 'path'
import routes from './routes'
import { rateLimit } from './middleware/rateLimit'
import { mongoSanitize } from './middleware/mongoSanitize'

require('dotenv').config()

const app: Express = express()
app.set('etag', false)
const isProduction = process.env.NODE_ENV === 'production'
const clientDistDir = path.join(__dirname, 'frontend', 'client')

// Needed when running behind a reverse proxy (typical in production hosting)
// so req.ip reflects the real client IP via X-Forwarded-For.
app.set('trust proxy', 1)

const PORT: string | number = process.env.PORT || 8080

const allowedOrigin = process.env.CORS_ORIGIN ?? 'https://jokes.jenniina.fi'

// // Debug environment variables (commented in production)
// console.log("Environment check:")
// console.log("Allowed CORS Origin:", allowedOrigin)
// console.log("NODE_ENV:", process.env.NODE_ENV)
// console.log("MONGO_USER exists:", !!process.env.MONGO_USER)
// console.log("MONGO_PASSWORD exists:", !!process.env.MONGO_PASSWORD)
// console.log("MONGO_CLUSTER exists:", !!process.env.MONGO_CLUSTER)
// console.log("MONGO_DB exists:", !!process.env.MONGO_DB)
// console.log(
//   "MONGO_USER value:",
//   process.env.MONGO_USER
//     ? process.env.MONGO_USER.substring(0, 3) + "***"
//     : "undefined"
// )

app.use(
  cors({
    origin: allowedOrigin,
    methods: ['GET', 'HEAD', 'OPTIONS', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'x-api-key',
    ],
  })
)
app.use(express.json())
app.use(bodyParser.json())
// Middleware to parse URL-encoded form data
app.use(express.urlencoded({ extended: true }))

// Basic NoSQL-injection hardening: strips $-operators and dotted keys.
app.use(mongoSanitize())

app.use('/api', (req: Request, res: Response, next) => {
  delete req.headers['if-none-match']
  delete req.headers['if-modified-since']
  res.setHeader(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
  )
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')
  res.setHeader('Surrogate-Control', 'no-store')
  res.removeHeader('ETag')
  res.removeHeader('Last-Modified')
  next()
})

// API routes first
const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 300,
})

app.use('/api', apiLimiter, routes)

// Serve built frontend assets directly and let Vike render HTML routes.
app.use(
  express.static(clientDistDir, {
    index: false,
    maxAge: '1d',
    setHeaders: (res, path) => {
      if (path.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript')
      } else if (path.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css')
      }
    },
  })
)

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK' })
})

app.get('*', async (req: Request, res: Response, next) => {
  if (req.path.startsWith('/api/')) {
    return next()
  }

  if (req.path.includes('.') && !req.path.endsWith('/')) {
    return res.status(404).send('File not found')
  }

  if (!isProduction) {
    return res.sendFile(path.join(clientDistDir, 'index.html'))
  }

  try {
    const { renderPage } = await import('vike/server')
    const pageContext = await renderPage({
      urlOriginal: req.originalUrl,
      headersOriginal: req.headers,
    })

    const httpResponse = pageContext.httpResponse

    if (!httpResponse) {
      return next()
    }

    httpResponse.headers.forEach(([name, value]) => {
      res.setHeader(name, value)
    })

    return res.status(httpResponse.statusCode).send(httpResponse.body)
  } catch (error) {
    console.error('SSR render error:', error)
    return res.status(500).send('Internal Server Error')
  }
})

const uri: string = `mongodb+srv://${encodeURIComponent(
  process.env.MONGO_USER || ''
)}:${encodeURIComponent(process.env.MONGO_PASSWORD || '')}@${
  process.env.MONGO_CLUSTER
}.zzpvtsc.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`

// // Debug the MongoDB URI (commented in production)
// console.log("MongoDB URI (masked):", uri.replace(/:([^:@]+)@/, ":***@"))
// console.log("Raw password length:", process.env.MONGO_PASSWORD?.length || 0)
// console.log(
//   "Encoded password length:",
//   encodeURIComponent(process.env.MONGO_PASSWORD || "").length
// )

const options = { useNewUrlParser: true, useUnifiedTopology: true }

// Mongoose-side hardening for filters.
mongoose.set('strictQuery', true)
mongoose.set('sanitizeFilter', true)

mongoose
  .connect(uri)
  .then(() => {
    console.log('MongoDB connected successfully')

    app.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`)
    )
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error.message)
    console.error('Full error:', error)
    // Don't crash the server, just log the error
    console.error('Starting server without database connection...')
    console.log('Mongo DB:', process.env.MONGO_DB)

    app.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`)
    )
  })
