import mongoose from 'mongoose'

// Subdocument schema for orderDetails
const orderDetailSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true
    },
    itemName: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    selectedColor: {
      type: String,
      required: false // Optional
    },
    selectedImage: {
      type: String,
      required: false // Optional
    }
  },
  {
    _id: false // Optional subdocument doesn't need a separate _id
  }
)

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    addressId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Address',
      required: true
    },
    orderDetails: {
      type: [orderDetailSchema]
    },
    totalQuantity: {
      type: Number
    },
    subtotal: {
      type: Number
    },
    discountAmount: {
      type: Number
    },
    paymentMethod: {
      type: String
    },
    shippingFee: {
      type: Number
    },
    total: {
      type: Number
    },
    deliveryDate: {
      type: Date,
      default: () => {
        const currentDate = new Date()
        currentDate.setDate(currentDate.getDate() + 7)
        return currentDate
      }
    },
    orderStatus: {
      type: String,
      enum: [
        'order placed',
        'shipped',
        'out for delivery',
        'delivered',
        'canceled',
        'returned'
      ],
      default: 'order placed'
    },
    orderplacedDate: {
      type: Date,
      required: false
    },
    shippedDate: {
      type: Date,
      required: false
    },
    outfordeliveryDate: {
      type: Date,
      required: false
    },
    deliveredDate: {
      type: Date,
      required: false
    },
    cancellationReason: {
      type: String,
      required: false
    },
    canceledDate: {
      type: Date,
      required: false
    },
    returnReason: {
      type: String,
      required: false
    },
    returnDate: {
      type: Date,
      required: false
    }
  },
  {
    timestamps: true
  }
)

const Order = mongoose.model('Order', orderSchema)

export default Order
