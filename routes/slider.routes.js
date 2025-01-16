import express from 'express'
import multer from 'multer'
import path from 'path'
import {
  getAllSliders,
  getSliderById,
  deleteSliderById,
  deleteSliderImage,
  updateSliderById,
  addSlider
} from '../controllers/slider.controller.js'
const router = express.Router()

// Set up storage engine for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/slider/')
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

// Fetch all sliders
router.get('/all', getAllSliders)

// Fetch single slider by id
router.get('/get/:id', getSliderById)

// Delete slider by id
router.delete('/del/:id', deleteSliderById)

// Add a new slider
router.post(
  '/add',
  upload.fields([
    { name: 'image' },
    { name: 'smallimage' },
    { name: 'mobileImage' }
  ]),
  addSlider
)

// Update slider by id
router.put(
  '/update/:id',
  upload.fields([
    { name: 'image' },
    { name: 'smallimage' },
    { name: 'mobileImage' }
  ]),
  updateSliderById
)

// Delete image from a slider
router.delete('/del/:id/image', deleteSliderImage)

export default router
