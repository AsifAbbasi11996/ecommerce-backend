import Address from '../models/address.models.js'

const getAllAddresses = async (req, res) => {
  try {
    const address = await Address.find()
    res.status(200).json(address)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching addresses' })
  }
}
// Add a new address
const addAddress = async (req, res) => {
  try {
    const { userId, fullName, street, apartment, city, pincode, phone, email } =
      req.body

    // Validate required fields
    if (!userId || !street || !city || !pincode || !phone) {
      return res.status(400).json({
        message: 'User ID, street, city, pincode, and phone are required fields'
      })
    }

    // Create a new address object
    const newAddress = new Address({
      userId,
      fullName,
      street,
      apartment,
      city,
      pincode,
      phone,
      email
    })

    // Save the address to the database
    const savedAddress = await newAddress.save()

    // Respond with the created address
    return res.status(201).json({
      message: 'Address added successfully',
      address: savedAddress
    })
  } catch (error) {
    console.error(error)
    return res
      .status(500)
      .json({ message: 'Server error, could not add address' })
  }
}

// Get a specific address by ID
const getAddressById = async (req, res) => {
  try {
    const { id } = req.params

    // Find the address by ID
    const address = await Address.findById(id).exec()

    if (!address) {
      return res.status(404).json({ message: 'Address not found' })
    }

    return res.status(200).json(address)
  } catch (error) {
    console.error(error)
    return res
      .status(500)
      .json({ message: 'Server error, could not fetch address' })
  }
}

// Get all addresses for a specific user
const getAddressByUserId = async (req, res) => {
  try {
    const { userId } = req.params

    // Find all addresses associated with the userId
    const addresses = await Address.find({ userId }).exec()

    if (addresses.length === 0) {
      return res
        .status(404)
        .json({ message: 'No addresses found for this user' })
    }

    return res.status(200).json(addresses)
  } catch (error) {
    console.error(error)
    return res
      .status(500)
      .json({ message: 'Server error, could not fetch addresses' })
  }
}

// Update an address by ID
const updateAddress = async (req, res) => {
  try {
    const { id } = req.params
    const { fullName, street, apartment, city, pincode, phone, email } =
      req.body

    // Find the address by ID
    const address = await Address.findById(id)

    if (!address) {
      return res.status(404).json({ message: 'Address not found' })
    }

    // Update address fields
    address.fullName = fullName || address.fullName
    address.street = street || address.street
    address.apartment = apartment || address.apartment
    address.city = city || address.city
    address.pincode = pincode || address.pincode
    address.phone = phone || address.phone
    address.email = email || address.email

    // Save the updated address
    const updatedAddress = await address.save()

    return res.status(200).json({
      message: 'Address updated successfully',
      address: updatedAddress
    })
  } catch (error) {
    console.error(error)
    return res
      .status(500)
      .json({ message: 'Server error, could not update address' })
  }
}

// Delete an address by ID
const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params

    // Find and delete the address by ID
    const deletedAddress = await Address.findByIdAndDelete(id)

    if (!deletedAddress) {
      return res.status(404).json({ message: 'Address not found' })
    }

    return res.status(200).json({
      message: 'Address deleted successfully',
      address: deletedAddress
    })
  } catch (error) {
    console.error(error)
    return res
      .status(500)
      .json({ message: 'Server error, could not delete address' })
  }
}

export {
  getAllAddresses,
  addAddress,
  getAddressById,
  getAddressByUserId,
  updateAddress,
  deleteAddress
}
