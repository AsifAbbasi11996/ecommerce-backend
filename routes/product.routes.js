import express from 'express'
import multer from 'multer'
import path from 'path'
import {
  addProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  totalProducts,
  updateProduct
} from '../controllers/product.controller.js'

const router = express.Router()

// Set up storage engine for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/products/') // Ensure this directory exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname)
  }
})

// Set up file filter to accept only certain file types
const fileFilter = (req, file, cb) => {
  const allowedFileTypes =
    /jpeg|jpg|png|gif|webp|bmp|tiff|jfif|svg|avif|ico|heic/
  const extname = allowedFileTypes.test(
    path.extname(file.originalname).toLowerCase()
  )
  const mimetype = allowedFileTypes.test(file.mimetype)

  if (extname && mimetype) {
    cb(null, true)
  } else {
    cb(new Error('Error: Images Only! It must be image extension issue'))
  }
}

// Set up Multer with storage, limits, and file filter
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // Limit file size to 5 MB
  fileFilter: fileFilter
})

// Define routes
router.post(
  '/add',
  upload.fields([
    { name: 'colors[0][images]', maxCount: 5 },
    { name: 'colors[1][images]', maxCount: 5 },
    { name: 'colors[2][images]', maxCount: 5 },
    { name: 'colors[3][images]', maxCount: 5 },
    { name: 'colors[4][images]', maxCount: 5 },
    { name: 'colors[5][images]', maxCount: 5 },
    { name: 'colors[6][images]', maxCount: 5 }
  ]),
  addProduct
) // Allow multiple image uploads

router.put(
  '/update/:id',
  upload.fields([
    { name: 'colors[0][images]', maxCount: 5 },
    { name: 'colors[1][images]', maxCount: 5 },
    { name: 'colors[2][images]', maxCount: 5 },
    { name: 'colors[3][images]', maxCount: 5 },
    { name: 'colors[4][images]', maxCount: 5 },
    { name: 'colors[5][images]', maxCount: 5 },
    { name: 'colors[6][images]', maxCount: 5 }
  ]),
  updateProduct
) // Allow multiple image uploads

router.get('/all', getAllProducts)
router.delete('/delete/:id', deleteProduct)
router.get('/get/:id', getProductById)
router.get('/count', totalProducts)

export default router
