import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: Number,
      required: true
    },
    image: {
      type: String
    },
    password: {
      type: String
    },
    confirmPassword: {
      type: String
    },
    accountStatus: {
      type: Number,
      default: 0
    },
    lastLogin: Date,
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
)

const Users = mongoose.model('Users', UserSchema)

export default Users
