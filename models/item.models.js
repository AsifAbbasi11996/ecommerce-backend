import mongoose from 'mongoose'

const itemSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: true
    },
    brand: {
      type: String
    },
    category: {
      type: String
    },
    images: {
      type: [String],
      required: true
    },
    color: {
      type: [String]
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    mrp: {
      type: Number,
      required: true
    },
    sp: {
      type: Number,
      required: true
    },
    itemdetail: {
      type: [String],
      required: true
    },
    stock: {
      type: Number
    },
    discount: {
      percentage: {
        type: Number,
        min: 0,
        max: 100
      },
      startDate: {
        type: Date
      },
      endDate: {
        type: Date,
        validate: {
          validator: function (v) {
            return this.discount.startDate < v // Ensures endDate is after startDate
          },
          message: 'End date must be later than the start date'
        }
      }
    },
    status: {
      type: String,
      enum: ['available', 'out of stock', 'discontinued'],
      default: 'available' // Default product status
    },
    orderCount: { type: Number, default: 0 },
    sales: { type: Number, default: 0 },
    bestseller: { type: Boolean, default: false } // Flag to mark bestseller
  },
  { timestamps: true }
) // Automatically adds createdAt and updatedAt fields

const Item = mongoose.model('Item', itemSchema)

export default Item
