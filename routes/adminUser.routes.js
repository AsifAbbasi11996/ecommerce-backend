import express from 'express'
import path from 'path'
import multer from 'multer'
import {
  createUser,
  deleteUserById,
  getAllUsers,
  getUserById,
  loginUser,
  updatePassword,
  updateUserById
} from '../controllers/adminUser.controller.js'

const router = express.Router()

// Define allowed file types (image formats)
const fileTypes = /jpeg|jpg|png|gif|bmp|svg+xml|webp|avif|jfif/ // Allowed image file types
const maxSize = 10 * 1024 * 1024 // Maximum file size (10MB) - Adjust as needed

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/adminUser/') // Directory for storing uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)) // Unique filename
  }
})

// Multer setup
const upload = multer({
  storage: storage,
  limits: { fileSize: maxSize }, // Limit file size
  fileFilter: (req, file, cb) => {
    // Check file type
    const extname = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    )
    const mimetype = fileTypes.test(file.mimetype)
    if (extname && mimetype) {
      return cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'))
    }
  }
})

// Routes

router.post('/create', upload.none(), createUser)

// Login route (supports form-data, including username/email and password)
router.post('/login', upload.none(), loginUser) // Handles form-data without files (for username/email and password)

// Update user by ID (supports image upload if needed)
router.put('/update/:id', upload.single('image'), updateUserById) // Handles form-data with image (optional)

// Get All users
router.get('/all', getAllUsers)

// Get users by Id
router.get('/get/:id', getUserById)

// delete by user id
router.delete('/del/:id', deleteUserById)

// update password by id
router.put('update-password/:id', updatePassword)

// Export router
export default router
