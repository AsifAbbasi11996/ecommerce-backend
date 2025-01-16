import mongoose from 'mongoose'

const SliderSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: true
    },
    smallimage: {
      type: String
    },
    mobileImage: {
      type: String
    },
    link: {
      type: String
    },
    smalltext: {
      type: String
    },
    bigtext: {
      type: String
    }
  },
  { timestamps: true }
)

const Slider = mongoose.model('slider', SliderSchema)

export default Slider
