import cookieParser from "cookie-parser"
import cors from "cors"
import express from "express"
import fileUpload from "express-fileupload"
import fs from "fs"
import path from "path"
import process from "process"
import authRouter from "./auth/route.js"
import Product from "./db/product.js"
import connectToDatabase from "./db/utils.js"
import { getProductFromUserBody, uploadProduct } from "./helpers/shopify.js"

// rename uploadProduct to uploadToShopify
const uploadToShopify = uploadProduct

// Create the server
const app = express()
connectToDatabase("inventory")

// setup middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// setup static files
const publicFiles = express.static(path.join(process.cwd(), "public"))
app.use("/public", publicFiles)
app.use("/", publicFiles)

/**
 * @route /auth
 * @description Authentication routes
 */
app.use("/auth", authRouter)

// Enable CORS for all routes
app.use(
  cors({
    origin: "*",
  })
)

/**
 * @route /publish
 * @description Publish a product to the store
 * @process
 * 1. Receive product details from admin client
 * 2. Create a product object from the details
 * 3. Save product to database
 * 4. Upload product to Shopify
 * 5. Send response to admin client
 */
app.post("/publish", fileUpload(), async (req, res) => {
  const product = getProductFromUserBody(req.body)

  await Product.create(product).catch((err) => {
    console.log(err)
    res.status(500).send("Failed to publish product")
  })

  uploadToShopify(product)

  res.send("Product published successfully")
})

app.use((err, req, res, next) => {
  if (!fs.existsSync("./logs/err.log")) {
    if (!fs.existsSync("./logs")) fs.mkdirSync("./logs")
    fs.writeFileSync("./logs/err.log", "")
  }

  const error = `
    //////////////////////////////////////////////////
    time: ${new Date().toISOString()}
    message: ${err.message},
    stack: ${err.stack},
    //////////////////////////////////////////////////
    \n\n
  `

  fs.appendFileSync("./logs/err.log", `${error}\n`)
  res.status(500).send(error)
})

app.all("*", (req, res) => {
  res.status(404).send("Page not found")
})

// Start the server
app.listen(3000, () => {
  console.log("Server is running on port 3000")
})
