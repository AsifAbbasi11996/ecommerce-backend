import express from 'express'
import multer from 'multer'
import path from 'path'
import {
  addCategory,
  deleteCategoryById,
  getAllCategories,
  getCategoryById,
  updateCategoryById
} from '../controllers/category.controller.js'

const router = express.Router()

// Set up storage engine for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/category/')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname)
  }
})

// Set up file filter to accept only certain file types
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png|gif|webp|bmp|tiff|jfif|svg|avif|ico/
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

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 },
  fileFilter: fileFilter
})

// Fetch all category
router.get('/all', getAllCategories)

// Add Category
router.post('/add', upload.single('image'), addCategory)

// Get By id
router.get('/get/:id', getCategoryById)

// Update by id
router.put('/update/:id', upload.single('image'), updateCategoryById)

// Delete by id
router.delete('/del/:id', deleteCategoryById)

export default router
