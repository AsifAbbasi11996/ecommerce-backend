import AdminUser from '../models/adminUser.models.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

// JWT Secret
const JWT_SECRET = process.env.JWT_KEY

const createUser = async (req, res) => {
  try {
    const { name, username, email, password } = req.body
    const image = req.file ? req.file.path : null // Handle image if provided

    // Check if the email already exists
    const existingUser = await AdminUser.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' })
    }

    // Hash the password before saving it
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create new user object
    const newUser = new AdminUser({
      name,
      username,
      email,
      password: hashedPassword,
      image: image ? image : null // Save the image path if an image is uploaded
    })

    // Save the user to the database
    await newUser.save()

    // Return success response
    res.status(201).json({
      message: 'User created successfully',
      newUser: {
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        image: newUser.image, // Include the image in the response
        userId: newUser.id
      }
    })
  } catch (error) {
    console.error('Error registering user: ', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

const loginUser = async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body // Data from either JSON or form-data

    if (!usernameOrEmail || !password) {
      return res
        .status(400)
        .json({ message: 'Username or Email and Password are required' })
    }

    // Check if the input is an email or username
    const isEmail = usernameOrEmail.includes('@')

    // Query user by email or username
    const user = isEmail
      ? await AdminUser.findOne({ email: usernameOrEmail })
      : await AdminUser.findOne({ username: usernameOrEmail })

    if (!user) {
      return res.status(400).json({ message: 'Admin not found' })
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' })
    }

    // Create a JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '1h' }
    )

    // Return the response with user data and token
    res.status(200).json({
      message: 'Login Successful',
      token,
      name: user.name,
      email: user.email,
      username: user.username,
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
    const users = await AdminUser.find() // You can add pagination or filtering here

    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found' })
    }

    res.status(200).json({ users })
  } catch (error) {
    console.error('Error retrieving users:', error.message)
    res.status(500).json({ message: 'Server error' })
  }
}

// Update user by ID with image upload
const updateUserById = async (req, res) => {
  const { id } = req.params

  const { name, username, email, password } = req.body
  const image = req.file ? req.file.path : null // Optional image

  try {
    // Validate user existence
    const user = await AdminUser.findById(id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Update fields
    if (name) user.name = name
    if (username) user.username = username
    if (email) user.email = email
    if (password) {
      user.password = await bcrypt.hash(password, 10) // Hash password before saving
    }
    if (image) user.image = image // Update the image if available

    // Save updated user
    await user.save()
    res.status(200).json({ message: 'User updated successfully', user })
  } catch (error) {
    console.error('Error updating user:', error.message)
    res.status(500).json({ message: 'Server error' })
  }
}

// Get user by ID
const getUserById = async (req, res) => {
  const { id } = req.params

  try {
    // Find the user by ID
    const user = await AdminUser.findById(id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.status(200).json({ user })
  } catch (error) {
    console.error('Error retrieving user:', error.message)
    res.status(500).json({ message: 'Server error' })
  }
}

// Delete user by ID
const deleteUserById = async (req, res) => {
  const { id } = req.params

  try {
    // Validate user existence
    const user = await AdminUser.findById(id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Delete the user
    await AdminUser.findByIdAndDelete(id)

    res.status(200).json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error.message)
    res.status(500).json({ message: 'Server error' })
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
    const user = await AdminUser.findById(id)
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

export {
  createUser,
  loginUser,
  updateUserById,
  getAllUsers,
  getUserById,
  deleteUserById,
  updatePassword
}
