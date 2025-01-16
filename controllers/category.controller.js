import Category from '../models/category.models.js'

const addCategory = async (req, res) => {
  const image = req.file ? req.file.path : null
  const { categoryName, link } = req.body

  const newCategory = new Category({
    categoryName,
    link,
    image
  })

  try {
    const savedCategory = await newCategory.save()

    // Send response with both the saved category and a success message
    res.status(200).json({
      message: 'Category Added Successfully',
      category: savedCategory
    })
  } catch (error) {
    console.error('Error adding category:', error.message)
    res.status(500).json({ message: 'Failed to add category' })
  }
}

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find() // Fetch all categories from the database
    res.status(200).json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error.message)
    res.status(500).json({ message: 'Failed to get categories' })
  }
}

const getCategoryById = async (req, res) => {
  const { id } = req.params

  try {
    const category = await Category.findById(id)

    if (!category) {
      return res.status(404).json({ message: 'Category not found' })
    }

    res.status(200).json(category)
  } catch (error) {
    console.error('Error fetching category by ID:', error.message)
    res.status(500).json({ message: 'Failed to get category' })
  }
}

const updateCategoryById = async (req, res) => {
  const { id } = req.params
  const { categoryName, link } = req.body
  const image = req.file ? req.file.path : null

  try {
    const category = await Category.findById(id)

    if (!category) {
      return res.status(404).json({ message: 'Category not found' })
    }

    // Update the category
    category.categoryName = categoryName || category.categoryName
    category.link = link || category.link
    category.image = image || category.image

    const updatedCategory = await category.save()
    res.status(200).json({
      message: 'Category Updated Successfully',
      category: updatedCategory
    })
  } catch (error) {
    console.error('Error updating category:', error.message)
    res.status(500).json({ message: 'Failed to update category' })
  }
}

const deleteCategoryById = async (req, res) => {
  const { id } = req.params

  try {
    const category = await Category.findByIdAndDelete(id)

    if (!category) {
      return res.status(404).json({ message: 'Category not found' })
    }

    res.status(200).json({
      message: 'Category Deleted Successfully',
      category: category
    })
  } catch (error) {
    console.error('Error deleting category:', error.message)
    res.status(500).json({ message: 'Failed to delete category' })
  }
}

export {
  addCategory,
  getAllCategories,
  getCategoryById,
  updateCategoryById,
  deleteCategoryById
}
