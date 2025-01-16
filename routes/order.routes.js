import express from 'express'
import {
  cancelOrder,
  createOrder,
  deleteOrder,
  getAllCanceledOrders,
  getAllDeliveredOrders,
  getAllOrder,
  getAllOrderPlacedOrders,
  getAllOrdersWithUserData,
  getAllOutForDeliveryOrders,
  getAllReturnedOrders,
  getAllShippedOrders,
  getByUserId,
  getCanceledOrders,
  getOrderByOrderId,
  getReturnedOrders,
  getTotalOrders,
  getTotalSales,
  returnOrder,
  updateOrderStatus
} from '../controllers/order.controller.js'

const router = express.Router()

// create order
router.post('/create', createOrder)

//get all order
router.get('/all', getAllOrder)

//get all order with user data
router.get('/alldata', getAllOrdersWithUserData)

//get order by userid
router.get('/get/user/:userId', getByUserId)

// update order status
router.patch('/updateStatus/:orderId', updateOrderStatus)

// cancel order
router.patch('/cancel/:orderId', cancelOrder)

// get canceled orders
router.get('/cancelOrders/:userId', getCanceledOrders)

//get all canceled orders
router.get('/canceled-orders', getAllCanceledOrders)

// return order
router.patch('/return/:orderId', returnOrder)

// get return order
router.get('/returnOrders/:userId', getReturnedOrders)

// get all returned order
router.get('/returned-orders', getAllReturnedOrders)

// get order by order id
router.get('/get/:id', getOrderByOrderId)

// delete order by order id
router.delete('/delete/:id', deleteOrder)

//get total orders
router.get('/totalOrders', getTotalOrders)

// get the total order sales
router.get('/totalSales', getTotalSales)

// get all order placed orders
router.get('/orderplaced-orders', getAllOrderPlacedOrders)

// get all shipped orders
router.get('/shipped-orders', getAllShippedOrders)

// get all out for delivery orders
router.get('/outfordelivery-orders', getAllOutForDeliveryOrders)

// get all delivered orders
router.get('/delivered-orders', getAllDeliveredOrders)

export default router
