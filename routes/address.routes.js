import express from 'express'
import {
  addAddress,
  getAddressById,
  getAddressByUserId,
  updateAddress,
  deleteAddress,
  getAllAddresses
} from '../controllers/address.controller.js'

const router = express.Router()

// Route to see all addresses
router.get('/all', getAllAddresses)

// Route to add a new address
router.post('/add', addAddress)

// Route to get a specific address by ID
router.get('/get/:id', getAddressById)

// Route to get all addresses for a specific user
router.get('/get/user/:userId', getAddressByUserId)

// Route to update an address by ID
router.put('/update/:id', updateAddress)

// Route to delete an address by ID
router.delete('/delete/:id', deleteAddress)

export default router
