import mongoose from 'mongoose'

const sizeSchema = new mongoose.Schema({
  size: { type: String, required: true }, // Size, e.g., "S", "M", "L", "XL"
  count: { type: Number, required: true, min: 0 } // Stock count for each size within a color
})

const colorSchema = new mongoose.Schema({
  col: { type: String, required: true }, // Color name, e.g., "Red", "Blue", "Green"
  images: {
    type: [String],
    required: true,
    validate: [
      val => val.length > 0,
      'At least one image is required for the color.'
    ]
  },
  sizes: [sizeSchema] // Array of sizes for each color, with stock count
})

const ProductSchema = new mongoose.Schema(
  {
    productname: {
      type: String,
      required: true
    },
    brand: {
      type: String
    },
    gender: {
      type: String
    },
    category: {
      type: String,
    },
    colors: [colorSchema], // Array of color variants, each with sizes and stock
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
    productdetail: {
      type: [String],
      required: true
    },
    sizefit: {
      type: String
    },
    materialcare: {
      type: [String]
    },
    specification: [
      {
        title: {
          type: String
        },
        data: {
          type: String
        }
      }
    ],
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
    }
  },
  { timestamps: true }
) // Automatically adds createdAt and updatedAt fields

const Product = mongoose.model('Product', ProductSchema)

export default Product
