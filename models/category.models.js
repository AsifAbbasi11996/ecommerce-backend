import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema(
  {
    categoryName: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    },
    link: {
      type: String,
    }
  },
  { timestamps: true }
)

const Category = mongoose.model('Category', categorySchema)

export default Category
