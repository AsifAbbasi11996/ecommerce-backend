import mongoose from 'mongoose'

const shippingFeeSchema = new mongoose.Schema({
  pincode: {
    type: String,
    required: true,
    unique: true
  },
  fee: {
    type: Number,
    required: true
  }
})

const ShippingFee = mongoose.model('ShippingFee', shippingFeeSchema)

export default ShippingFee
