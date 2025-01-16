import Cart from '../models/cart.models.js'
import Item from '../models/item.models.js'

// Controller for get All items in cart
const getAllItemsInCart = async (req, res) => {
  try {
    const cart = await Cart.find()
    res.status(200).json(cart)
  } catch (error) {
    console.error('Error fetching all items')
    res.status(500).json({ message: 'Error fetching all items' })
  }
}

// Controller for Adding Item to Cart
const addToCart = async (req, res) => {
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

    // Check if the cart already exists for the user
    let cart = await Cart.findOne({ user: userId })

    if (!cart) {
      // If no cart exists, create a new one
      cart = new Cart({
        user: userId,
        items: [{ item: itemId }] // Add item without quantity
      })
    } else {
      // If the cart exists, check if the item already exists
      const itemIndex = cart.items.findIndex(
        item => item.item.toString() === itemId
      )

      if (itemIndex >= 0) {
        // Item already exists, no need to add again
        return res.status(400).json({ message: 'Item already in cart' })
      } else {
        // Otherwise, add the new item to the cart
        cart.items.push({ item: itemId })
      }
    }

    // Save the cart
    await cart.save()
    return res
      .status(200)
      .json({ message: 'Item added to cart successfully', cart })
  } catch (error) {
    return res
      .status(500)
      .json({ error: 'Something went wrong', message: error.message })
  }
}

// Controller for Viewing Cart
const viewCart = async (req, res) => {
  const { userId } = req.params

  try {
    const cart = await Cart.findOne({ user: userId }).populate('items.item')

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' })
    }

    return res.status(200).json({ cart })
  } catch (error) {
    return res
      .status(500)
      .json({ error: 'Something went wrong', message: error.message })
  }
}

// Controller for Removing Item from Cart
const removeFromCart = async (req, res) => {
  const { userId, itemId } = req.body

  if (!userId || !itemId) {
    return res.status(400).json({
      error: 'Invalid input. Please provide valid userId and itemId.'
    })
  }

  try {
    // Find the cart for the given userId
    const cart = await Cart.findOne({ user: userId })

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' })
    }

    // Find the index of the item in the cart
    const itemIndex = cart.items.findIndex(
      item => item._id.toString() === itemId // Compare the item _id
    )

    if (itemIndex < 0) {
      return res.status(404).json({ error: 'Item not found in cart' })
    }

    // Remove the item from the cart
    cart.items.splice(itemIndex, 1)

    // Save the updated cart
    await cart.save()

    return res
      .status(200)
      .json({ message: 'Item removed from cart successfully', cart })
  } catch (error) {
    return res
      .status(500)
      .json({ error: 'Something went wrong', message: error.message })
  }
}

// Controller for Clearing the Entire Cart
const clearCart = async (req, res) => {
  const { userId } = req.body

  if (!userId) {
    return res.status(400).json({
      error: 'Invalid input. Please provide valid userId.'
    })
  }

  try {
    const cart = await Cart.findOne({ user: userId })

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' })
    }
    
    // Clear the entire cart
    cart.items = []

    await cart.save()

    return res.status(200).json({ message: 'Cart cleared successfully', cart })
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
    const cart = await Cart.findOne({ user: userId })

    if (!cart || cart.items.length === 0) {
      return res.status(404).json({ error: 'Cart is empty or not found' })
    }

    // Process the checkout (payment, shipping, etc.)
    // This could be extended to integrate with a payment gateway

    // Clear cart after checkout
    cart.items = []

    await cart.save()

    return res
      .status(200)
      .json({ message: 'Checkout successful, cart cleared', cart })
  } catch (error) {
    return res
      .status(500)
      .json({ error: 'Something went wrong', message: error.message })
  }
}

// Controller for Getting Cart Summary
const getCartSummary = async (req, res) => {
  const { userId } = req.params

  try {
    const cart = await Cart.findOne({ user: userId }).populate('items.item')

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' })
    }

    // Calculate total price and item count (without quantity field)
    const totalItems = cart.items.length // Count of unique items in cart
    const totalPrice = cart.items.reduce(
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
  getAllItemsInCart,
  addToCart,
  viewCart,
  removeFromCart,
  clearCart,
  checkout,
  getCartSummary
}
