import ShippingFee from '../models/shippingFee.models.js'

// Get All Shipping Fees
const getAllShippingFees = async (req, res) => {
  try {
    const shippingFees = await ShippingFee.find()
    res.status(200).json(shippingFees)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching shipping fees', error })
  }
}

// Add a new Shipping Fee
const addShippingFee = async (req, res) => {
  console.log('Request Body:', req.body) // Log the request body to check if data is received

  try {
    const { pincode, fee } = req.body

    if (!pincode || !fee) {
      return res.status(400).json({
        message: 'Pincode and fee are required fields'
      })
    }

    const existingFee = await ShippingFee.findOne({ pincode })

    if (existingFee) {
      return res
        .status(400)
        .json({ message: 'Shipping fee already exists for this pincode' })
    }

    const newShippingFee = new ShippingFee({ pincode, fee })
    const savedShippingFee = await newShippingFee.save()

    return res.status(201).json({
      message: 'Shipping fee added successfully',
      savedShippingFee
    })
  } catch (error) {
    console.error(error)
    return res
      .status(500)
      .json({ message: 'Server error, could not add shipping fee', error })
  }
}

// Get a specific shipping fee by pincode
const getShippingFeeByPincode = async (req, res) => {
  try {
    const { pincode } = req.params

    // Find the shipping fee by pincode
    const shippingFee = await ShippingFee.findOne({ pincode })

    if (!shippingFee) {
      return res
        .status(404)
        .json({ message: 'Shipping fee not found for this pincode' })
    }

    return res.status(200).json(shippingFee)
  } catch (error) {
    console.error(error)
    return res
      .status(500)
      .json({ message: 'Server error, could not fetch shipping fee', error })
  }
}

// Update a shipping fee by pincode
const updateShippingFee = async (req, res) => {
  try {
    const { pincode } = req.params
    const { fee } = req.body

    // Find the shipping fee by pincode
    const shippingFee = await ShippingFee.findOne({ pincode })

    if (!shippingFee) {
      return res
        .status(404)
        .json({ message: 'Shipping fee not found for this pincode' })
    }

    // Update the fee for the shipping fee
    shippingFee.fee = fee || shippingFee.fee

    // Save the updated shipping fee
    const updatedShippingFee = await shippingFee.save()

    return res.status(200).json({
      message: 'Shipping fee updated successfully',
      shippingFee: updatedShippingFee
    })
  } catch (error) {
    console.error(error)
    return res
      .status(500)
      .json({ message: 'Server error, could not update shipping fee', error })
  }
}

// Delete a shipping fee by pincode
const deleteShippingFee = async (req, res) => {
  try {
    const { pincode } = req.params

    // Find and delete the shipping fee by pincode
    const deletedShippingFee = await ShippingFee.findOneAndDelete({ pincode })

    if (!deletedShippingFee) {
      return res
        .status(404)
        .json({ message: 'Shipping fee not found for this pincode' })
    }

    return res.status(200).json({
      message: 'Shipping fee deleted successfully',
      shippingFee: deletedShippingFee
    })
  } catch (error) {
    console.error(error)
    return res
      .status(500)
      .json({ message: 'Server error, could not delete shipping fee', error })
  }
}

export {
  getAllShippingFees,
  addShippingFee,
  getShippingFeeByPincode,
  updateShippingFee,
  deleteShippingFee
}
