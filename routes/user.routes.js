import express from 'express'
import path from 'path'
import multer from 'multer'
import {
  createUser,
  deleteUserById,
  getAllUsers,
  getUserById,
  totalUsers,
  updatePassword,
  updateUserById,
  userLogin
} from '../controllers/user.controller.js'

const router = express.Router()

// Define allowed file types (image formats)
const fileTypes = /jpeg|jpg|png|gif|bmp|svg+xml|webp|avif|jfif/ // Allowed image file types
const maxSize = 10 * 1024 * 1024 // Maximum file size (10MB) - Adjust as needed

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/users/') // Directory for storing uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)) // Unique filename
  }
})

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

router.post('/create', upload.none(), createUser)
router.post('/login', upload.none(), userLogin)
router.get('/all', getAllUsers)
router.put('/update/:id', upload.single('image'), updateUserById)
router.delete('/delete/:id', deleteUserById)
router.get('/get/:id', getUserById)
router.put('/update/password/:id', updatePassword)
router.get('/totalUsers', totalUsers)

export default router
