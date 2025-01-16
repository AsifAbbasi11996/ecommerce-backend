import Navbar from '../models/navbar.models.js'

// Get all nav items
export const getNavItems = async (req, res) => {
  try {
    const navItems = await Navbar.find()
    res.status(200).json(navItems)
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving nav items' })
  }
}

// Get a single nav item by id
export const getNavItemById = async (req, res) => {
  const { id } = req.params
  try {
    const navItem = await Navbar.findById(id)
    if (!navItem) {
      return res.status(404).json({ message: 'Nav item not found' })
    }
    res.status(200).json(navItem)
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving nav item' })
  }
}

// Create a new nav item
export const createNavItem = async (req, res) => {
  const { nav, link } = req.body
  try {
    const newNavItem = new Navbar({ nav, link })
    await newNavItem.save()
    res.status(201).json(newNavItem)
  } catch (error) {
    res.status(500).json({ message: 'Error creating nav item' })
  }
}

// Update an existing nav item
export const updateNavItem = async (req, res) => {
  const { id } = req.params
  const { nav, link } = req.body
  try {
    const updatedNavItem = await Navbar.findByIdAndUpdate(
      id,
      { nav, link },
      { new: true }
    )
    if (!updatedNavItem) {
      return res.status(404).json({ message: 'Nav item not found' })
    }
    res.status(200).json(updatedNavItem)
  } catch (error) {
    res.status(500).json({ message: 'Error updating nav item' })
  }
}

// Delete a nav item
export const deleteNavItem = async (req, res) => {
  const { id } = req.params
  try {
    const deletedNavItem = await Navbar.findByIdAndDelete(id)
    if (!deletedNavItem) {
      return res.status(404).json({ message: 'Nav item not found' })
    }
    res.status(200).json({ message: 'Nav item deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Error deleting nav item' })
  }
}
