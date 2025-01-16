import Users from '../models/user.models.js'
import dotenv from 'dotenv'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import moment from 'moment'

dotenv.config()

// JWT Secret
const JWT_SECRET = process.env.JWT_KEY

// Create User (Registration)
const createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, confirmPassword } =
      req.body
    const image = req.file ? req.file.path : null // Handle image if provided

    // Check required fields
    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !password ||
      !confirmPassword
    ) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    // Check password match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' })
    }

    // Check if user already exists
    const existingUser = await Users.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const newUser = new Users({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      image: image ? image : null // Save the image path if an image is uploaded
    })

    await newUser.save()
    res.status(201).json({ message: 'User created successfully', newUser })
  } catch (error) {
    console.error('Error creating user:', error) // Log the error for debugging
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// Login User
const userLogin = async (req, res) => {
  try {
    const { phoneOrEmail, password } = req.body // Data from either JSON or form-data

    if (!phoneOrEmail || !password) {
      return res
        .status(400)
        .json({ message: 'Phone or Email and Password are required' })
    }

    // Check if the input is an email or username
    const isEmail = phoneOrEmail.includes('@')

    // Query user by email or phone
    const user = isEmail
      ? await Users.findOne({ email: phoneOrEmail })
      : await Users.findOne({ phone: phoneOrEmail })

    if (!user) {
      return res.status(400).json({ message: 'User not found' })
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' })
    }

    // Create a JWT token
    const token = jwt.sign(
      { userId: user.id, firstName: user.firstName },
      JWT_SECRET,
      { expiresIn: '1h' }
    )

    // Return the response with user data and token
    res.status(200).json({
      message: 'Login Successful',
      token,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      image: user.image,
      userId: user.id
    })
  } catch (error) {
    console.error('Error logging in user:', error)
    res.status(500).json({ message: 'Server Error' })
  }
}

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await Users.find()
    res.status(200).json(users)
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// Get user by ID
const getUserById = async (req, res) => {
  const { id } = req.params

  try {
    const user = await Users.findById(id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.status(200).json(user)
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// Update user by ID
const updateUserById = async (req, res) => {
  const { id } = req.params
  const { firstName, lastName, email, phone } = req.body
  const image = req.file ? req.file.path : null

  try {
    const user = await Users.findById(id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Update fields
    if (firstName) user.firstName = firstName
    if (lastName) user.lastName = lastName
    if (email) user.email = email
    if (phone) user.phone = phone
    if (image) user.image = image

    await user.save()
    res.status(200).json({ message: 'User updated successfully', user })
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// Delete user by ID
const deleteUserById = async (req, res) => {
  const { id } = req.params

  try {
    const deletedUser = await Users.findByIdAndDelete(id)
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.status(200).json({ message: 'User deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// Update user password
const updatePassword = async (req, res) => {
  const { id } = req.params
  const { currentPassword, newPassword, confirmNewPassword } = req.body

  // Ensure that password fields are provided
  if (!currentPassword || !newPassword || !confirmNewPassword) {
    return res
      .status(400)
      .json({ message: 'Please provide all password fields' })
  }

  try {
    const user = await Users.findById(id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Compare current password
    const isMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' })
    }

    // Check if new passwords match
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: 'New passwords do not match' })
    }

    // Hash new password
    user.password = await bcrypt.hash(newPassword, 10)

    // Save user with updated password
    user.updatedAt = new Date()

    await user.save()

    return res.status(200).json({ message: 'Password updated successfully' })
  } catch (error) {
    console.error('Error updating password:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// Total users
const totalUsers = async (req, res) => {
  try {
    const count = await Users.countDocuments()
    res.status(200).json({ totalUsers: count })
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// Fetch users created today
const getUsersToday = async (req, res) => {
  try {
    const startOfDay = moment().startOf('day').toDate()
    const endOfDay = moment().endOf('day').toDate()

    const users = await Users.find({
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    })

    res.status(200).json({ count: users.length, users })
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// Export all functions
export {
  createUser,
  userLogin,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  updatePassword,
  totalUsers,
  getUsersToday
}
