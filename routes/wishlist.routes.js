import express from 'express'
import {
  addToWishlist,
  viewWishlist,
  removeFromWishlist,
  clearWishlist,
  checkout,
  getWishlistSummary,
  getAllItemsInWishlist
} from '../controllers/wishlist.controller.js'

const router = express.Router()

router.get('/all', getAllItemsInWishlist)
router.post('/add', addToWishlist)
router.get('/view-wishlist/:userId', viewWishlist)
router.delete('/remove', removeFromWishlist)
router.delete('/clear-wishlist', clearWishlist)
router.post('/checkout', checkout)
router.get('/wishlist-summary/:userId', getWishlistSummary)

export default router
