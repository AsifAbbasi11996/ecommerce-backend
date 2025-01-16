import Product from '../models/product.models.js'

// Add Product 
const addProduct = async (req, res) => {
  try {
    const {
      productname,
      brand,
      gender,
      category,
      rating,
      mrp,
      sp,
      productdetail,
      sizefit,
      materialcare,
      specification,
      discount
    } = req.body

    // Validate that colors is an array of objects
    if (!Array.isArray(req.body.colors)) {
      return res.status(400).json({ message: 'Colors field must be an array.' })
    }

    // Calculate discount percentage if both mrp and sp are provided
    let discountPercentage = 0
    if (mrp && sp && parseFloat(mrp) > parseFloat(sp)) {
      discountPercentage =
        ((parseFloat(mrp) - parseFloat(sp)) / parseFloat(mrp)) * 100
    }

    // Process colors and images
    const colorsWithImages = req.body.colors.map((colorObj, index) => {
      // Get the images for each color from req.files
      const colorImages = req.files[`colors[${index}][images]`]
        ? req.files[`colors[${index}][images]`].map(file => file.path) // Assuming files are uploaded like this
        : []

      // Ensure that each color object has a valid 'sizes' array
      if (!Array.isArray(colorObj.sizes) || colorObj.sizes.length === 0) {
        return res.status(400).json({ message: 'Each color must have sizes.' })
      }

      // Process sizes for each color
      const sizes = colorObj.sizes.map(size => ({
        size: size.size,
        count: parseInt(size.count, 10) || 0 // Ensure count is an integer and defaults to 0
      }))

      return {
        col: colorObj.col, // Color name
        images: colorImages,
        sizes: sizes
      }
    })

    // Process product details into an array (if not already)
    const productDetailsArray = Array.isArray(productdetail)
      ? productdetail
      : [productdetail]

    // Process material care into an array
    const materialCareArray = materialcare
      ? materialcare.split(',').map(m => m.trim())
      : []

    // Process specification (if provided)
    const specificationArray = specification
      ? specification.map(spec => ({
          title: spec.title,
          data: spec.data
        }))
      : []

    // Create a new product
    const newProduct = new Product({
      productname,
      brand,
      gender,
      category,
      rating: rating || 0, // Default to 0 if rating is not provided
      mrp: parseFloat(mrp),
      sp: parseFloat(sp),
      colors: colorsWithImages, // Processed colors
      productdetail: productDetailsArray,
      sizefit,
      materialcare: materialCareArray,
      specification: specificationArray,
      discount: discount
        ? {
            percentage: discountPercentage,
            startDate: discount.startDate,
            endDate: discount.endDate
          }
        : undefined, // Only include discount if it's provided
      status: 'available' // Default product status
    })

    // Save the new product to the database
    await newProduct.save()

    // Return the newly created product as a response
    return res.status(201).json(newProduct)
  } catch (error) {
    console.error('Error:', error)
    return res.status(500).json({ message: error.message })
  }
}

// Get all Product
const getAllProducts = async (req, res) => {
  try {
    const product = await Product.find({})
    res.status(200).json(product)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching Product', error })
  }
}

// Get product by ID
const getProductById = async (req, res) => {
  try {
    const productId = req.params.id
    const product = await Product.findById(productId)

    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    res.status(200).json(product)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error })
  }
}

// Update product by ID
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params
    const product = await Product.findById(id)
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' })
    }

    // Collect product data from the request body
    const {
      productname,
      brand,
      gender,
      category,
      colors,
      rating,
      count,
      mrp,
      sp,
      sizes,
      productdetail,
      sizefit,
      materialcare,
      specification,
      discount
    } = req.body

    // Update fields if they are provided
    if (productname) product.productname = productname
    if (brand) product.brand = brand
    if (gender) product.gender = gender
    if (category) product.category = category
    if (rating) product.rating = rating
    if (count) product.count = count
    if (mrp) product.mrp = parseFloat(mrp)
    if (sp) product.sp = parseFloat(sp)
    if (sizefit) product.sizefit = sizefit
    if (productdetail)
      product.productdetail = Array.isArray(productdetail)
        ? productdetail
        : [productdetail]

    // Handle sizes
    if (sizes) {
      product.sizes = sizes.split(',').map(size => size.trim())
    }

    // Handle colors
    if (colors && Array.isArray(colors)) {
      colors.forEach((colorObj, index) => {
        // If the color exists in the product
        if (product.colors[index]) {
          const colorImages = req.files[`colors[${index}][images]`]
            ? req.files[`colors[${index}][images]`].map(file => file.path)
            : []

          // Update images only if they are provided
          if (colorImages.length > 0) {
            product.colors[index].images = colorImages
          }
        }
      })
    }

    // Handle material care
    if (materialcare) {
      product.materialcare = materialcare.split(',').map(m => m.trim())
    }

    // Handle specification
    if (specification) {
      product.specification = specification.map(spec => ({
        title: spec.title,
        data: spec.data
      }))
    }

    // Handle discount
    if (discount) {
      product.discount.percentage =
        discount.percentage || product.discount.percentage
      product.discount.startDate =
        discount.startDate || product.discount.startDate
      product.discount.endDate = discount.endDate || product.discount.endDate
    }

    // Save the updated product
    await product.save()
    return res.status(200).json(product)
  } catch (error) {
    console.error('Error updating product:', error)
    return res.status(500).json({ message: error.message })
  }
}

// Delete Product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params
    const product = await Product.findByIdAndDelete(id)
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' })
    }
    return res.status(200).json({ message: 'Product deleted successfully.' })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

// Total Product count
const totalProducts = async (req, res) => {
  try {
    const totalProduct = await Product.countDocuments()
    res.status(200).json({ totalProduct })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

export {
  addProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  totalProducts,
}
