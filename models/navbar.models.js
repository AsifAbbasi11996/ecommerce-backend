import mongoose from 'mongoose'

const navbarSchema = new mongoose.Schema({
  nav: {
    type: String
  },
  link: {
    type: String
  }
})

const Navbar = mongoose.model('Navbar', navbarSchema)

export default Navbar
