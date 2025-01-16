import mongoose from "mongoose";

const adminUserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        username: {
            type: String,
            unique: true,
            required: true
        },
        email: {
            type: String,
            unique: true,
            required: true
        },
        password: {
            type: String,
            required: true,
            minlength: 8
        },
        image: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true
    }
)

const AdminUser = mongoose.model("AdminUser", adminUserSchema)

export default AdminUser