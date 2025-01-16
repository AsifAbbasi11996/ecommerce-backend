import express from 'express'
import {
  addShippingFee,
  deleteShippingFee,
  getAllShippingFees,
  getShippingFeeByPincode,
  updateShippingFee
} from '../controllers/shippingFee.controller.js'

const router = express.Router()

router.get('/all', getAllShippingFees)

router.get('/get/:pincode', getShippingFeeByPincode)

router.post('/add', addShippingFee)

router.put('/update/:pincode', updateShippingFee)

router.delete('/delete/:pincode', deleteShippingFee)

export default router
