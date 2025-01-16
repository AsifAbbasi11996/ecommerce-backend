import express from 'express'
import {
  addToCart,
  viewCart,
  removeFromCart,
  clearCart,
  checkout,
  getCartSummary,
  getAllItemsInCart
} from '../controllers/cart.controller.js'

const router = express.Router()

router.get('/all', getAllItemsInCart)
router.post('/add', addToCart)
router.get('/view-cart/:userId', viewCart)
router.delete('/remove', removeFromCart)
router.delete('/clear-cart', clearCart)
router.post('/checkout', checkout)
router.get('/cart-summary/:userId', getCartSummary)

export default router
