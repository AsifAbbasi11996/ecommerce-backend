import Item from '../models/item.models.js'

// Controller to add a new item
export const addItem = async (req, res) => {
  try {
    // Extracting the fields from the request body
    const {
      itemName,
      brand,
      category,
      color,
      rating,
      mrp,
      sp,
      itemdetail,
      stock,
      discount
    } = req.body

    // Validate that MRP and SP are provided and MRP > SP
    if (!mrp || !sp || mrp <= sp) {
      return res.status(400).json({
        error: 'Invalid MRP and SP values. MRP must be greater than SP.'
      })
    }

    // Calculate discount percentage
    const discountPercentage = Math.round(((mrp - sp) / mrp) * 100)

    // Extracting the image paths uploaded by multer
    const images = req.files.map(file => file.path)

    // Validate that at least one image is provided
    if (!images || images.length === 0) {
      return res.status(400).json({ error: 'At least one image is required.' })
    }

    // Handle color field: convert it to an array if provided
    const colorArray = color ? color.split(',') : []

    // Calculate initial sales value
    const sales = sp * orderCount

    // Creating the item
    const newItem = new Item({
      itemName,
      brand,
      category,
      images,
      color: colorArray,
      rating,
      mrp,
      sp,
      itemdetail: Array.isArray(itemdetail) ? itemdetail : [itemdetail], // Ensure it's an array
      stock,
      discount: {
        ...discount,
        percentage: discountPercentage
      },
      status: 'available',
      orderCount: 0,
      sales
    })

    // Save the item to the database
    const savedItem = await newItem.save()

    res.status(201).json({
      message: 'Item added successfully',
      item: savedItem
    })
  } catch (error) {
    console.error('Error adding item:', error)
    res.status(500).json({ error: 'Internal server error.' })
  }
}

export const getAllItems = async (req, res) => {
  try {
    const items = await Item.find()
    res.status(200).json(items)
  } catch (error) {
    console.error('Error fetching items:', error.message)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// Search items by name or description
export const searchItems = async (req, res) => {
  const { query } = req.query
  if (!query) {
    return res.status(400).json({ message: 'Search query is required.' })
  }

  try {
    const items = await Item.find({
      $or: [
        { itemName: { $regex: query, $options: 'i' } },
        { brand: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { itemdetail: { $regex: query, $options: 'i' } }
      ]
    })
    res.json(items)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Delete an item by ID
export const deleteItemById = async (req, res) => {
  try {
    const { id } = req.params
    const deletedItem = await Item.findByIdAndDelete(id)

    if (!deletedItem) {
      return res.status(404).json({ message: 'Item not found' })
    }

    res.status(200).json({ message: 'Item deleted successfully' })
  } catch (error) {
    console.error('Error deleting item:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// Get an item by ID
export const getItemById = async (req, res) => {
  try {
    const { id } = req.params
    const item = await Item.findById(id)

    if (!item) {
      return res.status(404).json({ message: 'Item not found' })
    }

    res.status(200).json(item)
  } catch (error) {
    console.error('Error fetching item:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// Update an item by ID
export const updateItemById = async (req, res) => {
  try {
    const { id } = req.params

    const item = await Item.findById(id)
    if (!item) {
      return res.status(404).json({ message: 'Item not found.' })
    }

    const {
      itemName,
      brand,
      category,
      color,
      mrp,
      sp,
      itemdetail,
      discount,
      rating,
      stock,
      status,
      orderCount,
      sales
    } = req.body

    // Update fields if they are provided
    if (itemName) item.itemName = itemName
    if (brand) item.brand = brand
    if (category) item.category = category
    if (color) item.color = color
    if (mrp) item.mrp = mrp
    if (sp) item.sp = sp
    if (itemdetail) item.itemdetail = itemdetail
    if (rating) item.rating = rating
    if (stock) item.stock = stock
    if (status) item.status = status
    if (orderCount) item.orderCount = orderCount
    if (sales) item.sales = sales

    // Automatically calculate and set discount percentage based on MRP and SP
    if (mrp && sp) {
      const discountPercentage = ((mrp - sp) / mrp) * 100
      item.discount = {
        percentage: Math.round(discountPercentage),
        startDate: discount?.startDate || item.discount.startDate,
        endDate: discount?.endDate || item.discount.endDate
      }
    }

    // Handle the discount object update if provided (only update dates if provided)
    if (discount) {
      if (discount.startDate) {
        item.discount.startDate = discount.startDate
      }
      if (discount.endDate) {
        item.discount.endDate = discount.endDate
      }
    }

    // Handle image update
    if (req.files && req.files.length > 0) {
      const imagePaths = req.files.map(file => file.path) // Extract file paths of uploaded images
      item.images = imagePaths // Replace images array with new ones
    }

    // Save the updated item to the database
    const updatedItem = await item.save()

    res
      .status(200)
      .json({ message: 'Item updated successfully', item: updatedItem })
  } catch (error) {
    console.error('Error updating item:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// Delete a single image from the images array
export const deleteImageFromItem = async (req, res) => {
  try {
    const { id, imagePath } = req.params

    // Normalize the image path (replace backslashes with forward slashes)
    const normalizedImagePath = imagePath.replace(/\\+/g, '/')

    if (!normalizedImagePath) {
      return res.status(400).json({ message: 'Image path is required' })
    }

    // Find the item by ID
    const item = await Item.findById(id)

    if (!item) {
      return res.status(404).json({ message: 'Item not found' })
    }

    // Check if the image path exists in the item's images array
    const imageIndex = item.images.indexOf(normalizedImagePath)

    if (imageIndex === -1) {
      return res.status(400).json({ message: 'Image not found in item' })
    }

    // Remove the image from the images array
    item.images.splice(imageIndex, 1)

    // Save the updated item
    await item.save()

    // Respond with the updated item and success message
    res.status(200).json({ message: 'Image removed successfully', item })
  } catch (error) {
    console.error('Error removing image:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// Add more images to the images array
export const addImagesToItem = async (req, res) => {
  try {
    const { id } = req.params
    const newImages = req.files.map(file => file.path) // Paths of newly uploaded images

    const item = await Item.findById(id)

    if (!item) {
      return res.status(404).json({ message: 'Item not found' })
    }

    // Add new images to the existing images array
    item.images = [...item.images, ...newImages]
    await item.save()

    res.status(200).json({ message: 'Images added successfully', item })
  } catch (error) {
    console.error('Error adding images:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// Controller to get related items based on category
export const getRelatedItemsByCategory = async (req, res) => {
  try {
    const { category } = req.params // Extract category from the URL parameter

    // Find all items in the same category (excluding the current item)
    const relatedItems = await Item.find({ category })
      .limit(4) // Limit the number of related products
      .sort({ rating: -1 }) // You can sort by rating or other criteria (e.g., price, newness)

    if (!relatedItems.length) {
      return res.status(404).json({ message: 'No related products found' })
    }

    res.status(200).json(relatedItems)
  } catch (error) {
    console.error('Error fetching related items:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// Total Item count
export const getTotalItems = async (req, res) => {
  try {
    const totalItems = await Item.countDocuments()
    res.status(200).json({ totalItems })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

// Controller to update an item's bestseller status
export const markAsBestseller = async (req, res) => {
  try {
    const { bestseller } = req.body

    // Validate that the bestseller field is provided and is a boolean
    if (typeof bestseller !== 'boolean') {
      return res
        .status(400)
        .json({ error: 'Invalid bestseller value. It should be a boolean.' })
    }

    // Find the item by ID and update its bestseller status
    const item = await Item.findById(req.params.id)
    if (!item) {
      return res.status(404).json({ error: 'Item not found.' })
    }

    item.bestseller = bestseller
    await item.save()

    res.status(200).json({
      message: 'Item updated successfully',
      item
    })
  } catch (error) {
    console.error('Error updating bestseller status:', error)
    res.status(500).json({ error: 'Internal server error.' })
  }
}
