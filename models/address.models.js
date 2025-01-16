import mongoose from 'mongoose'

const addressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    fullName: {
      type: String
    },
    street: {
      type: String
    },
    apartment: {
      type: String
    },
    city: {
      type: String
    },
    pincode: {
      type: String
    },
    phone: {
      type: String
    },
    email: {
      type: String
    }
  },
  {
    timestamps: true
  }
)

const Address = mongoose.model('Address', addressSchema)

export default Address
