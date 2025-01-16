import express from 'express'
import {
  getNavItems,
  getNavItemById,
  createNavItem,
  updateNavItem,
  deleteNavItem
} from '../controllers/navbar.controller.js'

const router = express.Router()

// Route to get all navbar items
router.get('/all', getNavItems)

// Route to get a single navbar item by ID
router.get('/get/:id', getNavItemById)

// Route to create a new navbar item
router.post('/add', createNavItem)

// Route to update an existing navbar item
router.put('/update/:id', updateNavItem)

// Route to delete a navbar item
router.delete('/delete/:id', deleteNavItem)

export default router
