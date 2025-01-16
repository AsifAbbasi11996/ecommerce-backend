import mongoose from 'mongoose'
import Order from '../models/order.models.js'
import Item from '../models/item.models.js'
import User from '../models/user.models.js'

// Create order
const createOrder = async (req, res) => {
  try {
    const {
      userId,
      addressId,
      orderDetails,
      totalQuantity,
      subtotal,
      discountAmount,
      paymentMethod,
      shippingFee,
      total,
      orderplacedDate,
      deliveryDate
    } = req.body

    // Ensure deliveryDate is at least 7 days from the current date
    let adjustedDeliveryDate = new Date(deliveryDate)
    const currentDate = new Date()
    const minDeliveryDate = new Date(
      currentDate.setDate(currentDate.getDate() + 7)
    ) // 7 days from now

    // If deliveryDate is earlier than 7 days from now, adjust it
    if (adjustedDeliveryDate < minDeliveryDate) {
      adjustedDeliveryDate = minDeliveryDate
    }

    // Loop through orderDetails to update items
    await Promise.all(
      orderDetails.map(async item => {
        // Find the item by its ID
        const foundItem = await Item.findById(item.itemId)
        if (!foundItem) {
          throw new Error(`Item with ID ${item.itemId} not found.`)
        }

        // Update stock and orderCount
        foundItem.stock -= item.quantity // Decrease stock based on ordered quantity
        foundItem.orderCount += item.quantity // Increase order count

        // Calculate and update sales
        foundItem.sales += foundItem.sp * item.quantity // Increase sales based on quantity and price

        // Save the updated item to the database
        await foundItem.save()
      })
    )

    // Create the new order
    const newOrder = await Order.create({
      userId,
      addressId,
      orderDetails,
      totalQuantity,
      subtotal,
      discountAmount,
      paymentMethod,
      shippingFee,
      total,
      orderplacedDate,
      deliveryDate: adjustedDeliveryDate // Use the adjusted shipping date
    })

    newOrder.save() // Save the new order

    // Return success response
    res.status(201).json({ message: 'Order created successfully', newOrder })
  } catch (error) {
    console.error('Error creating order:', error)
    res.status(500).json({ message: error.message })
  }
}

//get all order
const getAllOrder = async (req, res) => {
  try {
    const order = await Order.find().sort({ createdAt: -1 })
    res.status(200).json(order)
  } catch (error) {
    console.error('Error getting all orders:', error)
  }
}

const getAllOrdersWithUserData = async (req, res) => {
  try {
    // Fetch all orders and sort by createdAt in descending order
    const orders = await Order.find().sort({ createdAt: -1 })

    // For each order, fetch the user details using the userId
    const ordersWithUserData = await Promise.all(
      orders.map(async order => {
        // Fetch user data by userId
        const user = await User.findById(order.userId)

        // Attach user data to the order object
        order.user = user

        return order
      })
    )

    // Send back orders with user data
    res.status(200).json(ordersWithUserData)
  } catch (error) {
    console.error('Error getting all orders with user data:', error)
    res.status(500).json({ message: 'Error fetching orders with user data' })
  }
}

// getByUserId controller
const getByUserId = async (req, res) => {
  try {
    const { userId } = req.params // Extract userId from the request params

    // Ensure the userId is a valid ObjectId (in case it's passed as a string)
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid userId' })
    }

    // Query the database using userId
    const order = await Order.find({
      userId,
      orderStatus: { $nin: ['returned', 'canceled'] } // Exclude 'returned' and 'canceled' statuses
    }).sort({ createdAt: -1 })

    if (!order.length) {
      return res.status(404).json({ message: 'No orders found for this user.' })
    }

    res.status(200).json(order)
  } catch (error) {
    console.error('Error fetching orders by userId:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Update Order Status by orderId
const updateOrderStatus = async (req, res) => {
  try {
    const { newStatus, cancellationReason, returnReason } = req.body
    const { orderId } = req.params

    const validStatuses = [
      'order placed',
      'shipped',
      'out for delivery',
      'delivered',
      'canceled',
      'returned'
    ]
    if (!validStatuses.includes(newStatus)) {
      return res.status(400).json({ message: 'Invalid order status' })
    }

    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    // Prevent status change if order is already delivered
    if (order.orderStatus === 'delivered' && newStatus !== 'delivered') {
      return res.status(400).json({
        message: 'Order has already been delivered and cannot be changed'
      })
    }

    // Handle cancellation logic
    if (newStatus === 'canceled') {
      if (
        ['shipped', 'out for delivery', 'delivered'].includes(order.orderStatus)
      ) {
        return res.status(400).json({
          message: 'Cannot cancel an order that is shipped or delivered'
        })
      }
      order.orderStatus = 'canceled'
      order.canceledDate = new Date()
      if (cancellationReason) {
        order.cancellationReason = cancellationReason
      }
    }

    // Handle return logic
    else if (newStatus === 'returned') {
      if (order.orderStatus !== 'delivered') {
        return res
          .status(400)
          .json({ message: 'Can only return delivered orders' })
      }
      order.orderStatus = 'returned'
      order.returnDate = new Date()
      if (returnReason) {
        order.returnReason = returnReason
      }
    }

    // Handle other status changes
    else {
      order.orderStatus = newStatus
      // Set appropriate date fields based on the new status
      if (newStatus === 'order placed') {
        order.orderplacedDate = new Date()
      } else if (newStatus === 'shipped') {
        order.shippedDate = new Date()
      } else if (newStatus === 'out for delivery') {
        order.outfordeliveryDate = new Date()
      } else if (newStatus === 'delivered') {
        order.deliveredDate = new Date()
      }
    }

    // Save the updated order
    await order.save()

    res
      .status(200)
      .json({ message: 'Order status updated successfully', order })
  } catch (error) {
    console.error('Error updating order status:', error)
    res.status(500).json({ message: error.message })
  }
}

// Cancel order
const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params // Order ID to be canceled

    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    // If the order has already been shipped or delivered, prevent cancellation
    if (
      ['shipped', 'out for delivery', 'delivered'].includes(order.orderStatus)
    ) {
      return res
        .status(400)
        .json({ message: 'Cannot cancel a shipped or delivered order' })
    }

    // Update the order status to 'canceled' and set the canceled date
    order.orderStatus = 'canceled'
    order.canceledDate = new Date() // Set canceled date
    await order.save()

    res.status(200).json({ message: 'Order canceled successfully', order })
  } catch (error) {
    console.error('Error canceling order:', error)
    res.status(500).json({ message: error.message })
  }
}

// Return order
const returnOrder = async (req, res) => {
  try {
    const { orderId } = req.params // Order ID to be returned

    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    // If the order has not been delivered, prevent return
    if (order.orderStatus !== 'delivered') {
      return res
        .status(400)
        .json({ message: 'Can only return delivered orders' })
    }

    // Update the order status to 'returned' and set the return date
    order.orderStatus = 'returned'
    order.returnDate = new Date() // Set return date
    await order.save()

    res.status(200).json({ message: 'Order returned successfully', order })
  } catch (error) {
    console.error('Error returning order:', error)
    res.status(500).json({ message: error.message })
  }
}

// Get Canceled Orders by User ID
const getCanceledOrders = async (req, res) => {
  try {
    const { userId } = req.params // Get userId from the URL parameter

    // Fetch canceled orders for the given user
    const canceledOrders = await Order.find({
      userId,
      orderStatus: 'canceled'
    })

    if (!canceledOrders.length) {
      return res.status(404).json({ message: 'No canceled orders found.' })
    }

    res.status(200).json(canceledOrders)
  } catch (error) {
    console.error('Error fetching canceled orders:', error)
    res.status(500).json({ message: error.message })
  }
}

// Get Returned Orders by User ID
const getReturnedOrders = async (req, res) => {
  try {
    const { userId } = req.params // Get userId from the URL parameter

    // Fetch returned orders for the given user
    const returnedOrders = await Order.find({
      userId,
      orderStatus: 'returned'
    })

    if (!returnedOrders.length) {
      return res.status(404).json({ message: 'No returned orders found.' })
    }

    res.status(200).json(returnedOrders)
  } catch (error) {
    console.error('Error fetching returned orders:', error)
    res.status(500).json({ message: error.message })
  }
}

// get by order id
const getOrderByOrderId = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }
    res.status(200).json({ success: true, order })
  } catch (error) {
    console.error('Error fetching order:', error)
    res.status(500).json({ message: error.message })
  }
}

// delete order
const deleteOrder = async (req, res) => {
  try {
    // Find the order by its ID
    const order = await Order.findById(req.params.id)

    // If the order does not exist
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    // Loop through orderDetails to update the corresponding items
    await Promise.all(
      order.orderDetails.map(async item => {
        // Find the item by its ID
        const foundItem = await Item.findById(item.itemId)
        if (!foundItem) {
          throw new Error(`Item with ID ${item.itemId} not found.`)
        }

        // Update the stock and order count of the item
        foundItem.stock += item.quantity // Revert stock based on the deleted order quantity
        foundItem.orderCount -= item.quantity // Decrease order count

        // Update sales
        foundItem.sales -= foundItem.sp * item.quantity // Decrease sales based on quantity and price

        // Save the updated item
        await foundItem.save()
      })
    )

    // Delete the specific order from the database using its ID
    await Order.deleteOne({ _id: req.params.id }) // Pass the correct condition to delete the specific order

    // Return success response
    res.status(200).json({ message: 'Order deleted successfully' })
  } catch (error) {
    console.error('Error deleting order:', error)
    res.status(500).json({ message: error.message })
  }
}

// get total order
const getTotalOrders = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments()
    res.status(200).json({ totalOrders })
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// get total sales
const getTotalSales = async (req, res) => {
  try {
    // Fetch all orders from the database
    const orders = await Order.find()

    // Calculate total sales from all orders
    const totalSales = orders.reduce((sum, order) => {
      return sum + order.total // Add the totalPrice of each order
    }, 0)

    // Return the total sales
    res.json({
      totalSales // Return the total sales with two decimal points
    })
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error calculating total sales', error: error.message })
  }
}

// get all order placed orders
const getAllOrderPlacedOrders = async (req, res) => {
  try {
    const orderplacedOrders = await Order.find({ orderStatus: 'order placed' })

    // Count how many orders are in 'order placed' status
    const orderPlacedCount = await Order.countDocuments({
      orderStatus: 'order placed'
    })

    res.status(200).json({ orderplacedOrders, count: orderPlacedCount })
  } catch (error) {
    console.error('Error fetching returned orders', error)
    res.status(500).json({ message: 'Internal server error ' })
  }
}

// Get all shipped orders with count
const getAllShippedOrders = async (req, res) => {
  try {
    const shippedOrders = await Order.find({ orderStatus: 'shipped' })

    // Count how many orders are in 'shipped' status
    const shippedOrderCount = await Order.countDocuments({
      orderStatus: 'shipped'
    })

    res.status(200).json({ shippedOrders, count: shippedOrderCount })
  } catch (error) {
    console.error('Error fetching shipped orders', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Get all out for delivery orders with count
const getAllOutForDeliveryOrders = async (req, res) => {
  try {
    const outfordeliveryOrders = await Order.find({
      orderStatus: 'out for delivery'
    })

    // Count how many orders are in 'out for delivery' status
    const outForDeliveryCount = await Order.countDocuments({
      orderStatus: 'out for delivery'
    })

    res.status(200).json({ outfordeliveryOrders, count: outForDeliveryCount })
  } catch (error) {
    console.error('Error fetching out for delivery orders', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Get all delivered orders with count
const getAllDeliveredOrders = async (req, res) => {
  try {
    const deliveredOrders = await Order.find({ orderStatus: 'delivered' })

    // Count how many orders are in 'delivered' status
    const deliveredOrderCount = await Order.countDocuments({
      orderStatus: 'delivered'
    })

    res.status(200).json({ deliveredOrders, count: deliveredOrderCount })
  } catch (error) {
    console.error('Error fetching delivered orders', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Get all canceled orders with count
const getAllCanceledOrders = async (req, res) => {
  try {
    const canceledOrders = await Order.find({ orderStatus: 'canceled' })

    // Count how many orders are in 'canceled' status
    const canceledOrderCount = await Order.countDocuments({
      orderStatus: 'canceled'
    })

    res.status(200).json({ canceledOrders, count: canceledOrderCount })
  } catch (error) {
    console.error('Error fetching canceled orders', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Get all returned orders with count
const getAllReturnedOrders = async (req, res) => {
  try {
    const returnedOrders = await Order.find({ orderStatus: 'returned' })

    // Count how many orders are in 'returned' status
    const returnedOrderCount = await Order.countDocuments({
      orderStatus: 'returned'
    })

    res.status(200).json({ returnedOrders, count: returnedOrderCount })
  } catch (error) {
    console.error('Error fetching returned orders', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export {
  createOrder,
  getAllOrder,
  getAllOrdersWithUserData,
  updateOrderStatus,
  getByUserId,
  cancelOrder,
  getCanceledOrders,
  getAllCanceledOrders,
  returnOrder,
  getReturnedOrders,
  getAllReturnedOrders,
  getOrderByOrderId,
  deleteOrder,
  getTotalOrders,
  getTotalSales,
  getAllDeliveredOrders,
  getAllOrderPlacedOrders,
  getAllOutForDeliveryOrders,
  getAllShippedOrders
}
