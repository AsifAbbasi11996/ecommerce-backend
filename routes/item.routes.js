import express from 'express'
import multer from 'multer'
import path from 'path'
import {
  addItem,
  getAllItems,
  getItemById,
  updateItemById,
  deleteItemById,
  deleteImageFromItem,
  addImagesToItem,
  getRelatedItemsByCategory,
  getTotalItems,
  markAsBestseller,
  searchItems
} from '../controllers/item.controller.js' // Adjust the path as necessary

const router = express.Router()

// Ensure the upload directory exists
import fs from 'fs'
const uploadDir = 'uploads/items/'
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Set up storage engine for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir) // Upload directory
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`)
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
    cb(
      new Error(
        'Error: Images only! Supported formats are jpeg, jpg, png, gif, etc.'
      )
    )
  }
}

// Set up Multer with storage, limits, and file filter
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // Limit file size to 5 MB
  fileFilter: fileFilter
})

// Define routes
router.post('/add', upload.array('images', 5), addItem) // Add a new item
router.get('/all', getAllItems) // Get all items
router.get('/search', searchItems) // Get all search items
router.get('/get/:id', getItemById) // Get a single item by ID
router.put('/update/:id', upload.array('images', 5), updateItemById) // Update an item by ID
router.delete('/del/:id', deleteItemById) // Delete an item by ID
router.delete('/del/:id/:imagePath', deleteImageFromItem) // Delete a single image from the images array
router.put('/add/:id/images', upload.array('images', 5), addImagesToItem) // Add images to the images array
router.get('/related/:category', getRelatedItemsByCategory)
router.get('/totalItems', getTotalItems)

// Update the item to mark as bestseller
router.put('/:id/bestseller', markAsBestseller);


export default router
