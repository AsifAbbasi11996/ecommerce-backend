import mongoose from 'mongoose'

// Cart Schema
const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to the User model (assuming you're tracking users)
      required: true
    },
    items: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Item', // Reference to the Item model
          required: true
        }
      }
    ]
  },
  {
    timestamps: true
  }
)

const Cart = mongoose.model('Cart', cartSchema)

export default Cart
