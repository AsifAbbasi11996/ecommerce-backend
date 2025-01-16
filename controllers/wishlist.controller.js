import Wishlist from '../models/wishlist.models.js'
import Item from '../models/item.models.js'

// Controller for get All items in Wishlist
const getAllItemsInWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.find()
    res.status(200).json(wishlist)
  } catch (error) {
    console.error('Error fetching all items')
    res.status(500).json({ message: 'Error fetching all items' })
  }
}

// Controller for Adding Item to Wishlist
const addToWishlist = async (req, res) => {
  const { userId, itemId } = req.body

  // Input validation
  if (!userId || !itemId) {
    return res.status(400).json({
      error: 'Invalid input. Please provide valid userId and itemId.'
    })
  }

  try {
    // Check if the item exists
    const item = await Item.findById(itemId)
    if (!item) {
      return res.status(404).json({ error: 'Item not found' })
    }

    // Check if the Wishlist already exists for the user
    let wishlist = await Wishlist.findOne({ user: userId })

    if (!wishlist) {
      // If no Wishlist exists, create a new one
      wishlist = new Wishlist({
        user: userId,
        items: [{ item: itemId }] // Add item without quantity
      })
    } else {
      // If the Wishlist exists, check if the item already exists
      const itemIndex = wishlist.items.findIndex(
        item => item.item.toString() === itemId
      )

      if (itemIndex >= 0) {
        // Item already exists, no need to add again
        return res.status(400).json({ message: 'Item already in Wishlist' })
      } else {
        // Otherwise, add the new item to the Wishlist
        wishlist.items.push({ item: itemId })
      }
    }

    // Save the Wishlist
    await wishlist.save()
    return res
      .status(200)
      .json({ message: 'Item added to Wishlist successfully', wishlist })
  } catch (error) {
    return res
      .status(500)
      .json({ error: 'Something went wrong', message: error.message })
  }
}

// Controller for Viewing Wishlist
const viewWishlist = async (req, res) => {
  const { userId } = req.params

  try {
    const wishlist = await Wishlist.findOne({ user: userId }).populate('items.item')

    if (!wishlist) {
      return res.status(404).json({ error: 'Wishlist not found' })
    }

    return res.status(200).json({ wishlist })
  } catch (error) {
    return res
      .status(500)
      .json({ error: 'Something went wrong', message: error.message })
  }
}

// Controller for Removing Item from Wishlist
const removeFromWishlist = async (req, res) => {
  const { userId, itemId } = req.body

  if (!userId || !itemId) {
    return res.status(400).json({
      error: 'Invalid input. Please provide valid userId and itemId.'
    })
  }

  try {
    // Find the Wishlist for the given userId
    const wishlist = await Wishlist.findOne({ user: userId })

    if (!wishlist) {
      return res.status(404).json({ error: 'Wishlist not found' })
    }

    // Find the index of the item in the Wishlist
    const itemIndex = wishlist.items.findIndex(
      item => item._id.toString() === itemId // Compare the item _id
    )

    if (itemIndex < 0) {
      return res.status(404).json({ error: 'Item not found in Wishlist' })
    }

    // Remove the item from the Wishlist
    wishlist.items.splice(itemIndex, 1)

    // Save the updated Wishlist
    await wishlist.save()

    return res
      .status(200)
      .json({ message: 'Item removed from Wishlist successfully', wishlist })
  } catch (error) {
    return res
      .status(500)
      .json({ error: 'Something went wrong', message: error.message })
  }
}

// Controller for Clearing the Entire Wishlist
const clearWishlist = async (req, res) => {
  const { userId } = req.body

  if (!userId) {
    return res.status(400).json({
      error: 'Invalid input. Please provide valid userId.'
    })
  }

  try {
    const wishlist = await Wishlist.findOne({ user: userId })

    if (!wishlist) {
      return res.status(404).json({ error: 'Wishlist not found' })
    }
    
    // Clear the entire Wishlist
    wishlist.items = []

    await wishlist.save()

    return res.status(200).json({ message: 'Wishlist cleared successfully', wishlist })
  } catch (error) {
    return res
      .status(500)
      .json({ error: 'Something went wrong', message: error.message })
  }
}

// Controller for Checkout
const checkout = async (req, res) => {
  const { userId } = req.body

  if (!userId) {
    return res.status(400).json({
      error: 'Invalid input. Please provide valid userId.'
    })
  }

  try {
    const wishlist = await Wishlist.findOne({ user: userId })

    if (!wishlist || wishlist.items.length === 0) {
      return res.status(404).json({ error: 'Wishlist is empty or not found' })
    }

    // Process the checkout (payment, shipping, etc.)
    // This could be extended to integrate with a payment gateway

    // Clear Wishlist after checkout
    wishlist.items = []

    await wishlist.save()

    return res
      .status(200)
      .json({ message: 'Checkout successful, Wishlist cleared', wishlist })
  } catch (error) {
    return res
      .status(500)
      .json({ error: 'Something went wrong', message: error.message })
  }
}

// Controller for Getting Wishlist Summary
const getWishlistSummary = async (req, res) => {
  const { userId } = req.params

  try {
    const wishlist = await Wishlist.findOne({ user: userId }).populate('items.item')

    if (!wishlist) {
      return res.status(404).json({ error: 'Wishlist not found' })
    }

    // Calculate total price and item count (without quantity field)
    const totalItems = wishlist.items.length // Count of unique items in Wishlist
    const totalPrice = wishlist.items.reduce(
      (sum, item) => sum + item.item.price,
      0
    )

    return res.status(200).json({
      totalItems,
      totalPrice
    })
  } catch (error) {
    return res
      .status(500)
      .json({ error: 'Something went wrong', message: error.message })
  }
}

export {
  getAllItemsInWishlist,
  addToWishlist,
  viewWishlist,
  removeFromWishlist,
  clearWishlist,
  checkout,
  getWishlistSummary
}
