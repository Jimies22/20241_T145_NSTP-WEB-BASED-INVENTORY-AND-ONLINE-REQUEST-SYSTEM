// models/User.js
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    email: { 
        type: String, 
        required: true, 
        unique: true,
        validate: {
            validator: function(v) {
                return /^[0-9]+@student\.buksu\.edu\.ph$/.test(v) || 
                       /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
            },
            message: props => `${props.value} is not a valid email!`
        }
    },
    password: {
        type: String,
        required: true  // This ensures password can't be undefined
    },
    role: { 
        type: String, 
        required: true,
        enum: ['admin', 'user'],
        default: 'user'
    },
    name: { 
        type: String, 
        required: true 
    },
    department: { 
        type: String, 
        required: true 
    },
    userID: { 
        type: Number, 
        unique: true, 
        required: true,
        validate: {
            validator: function(v) {
                return Number.isInteger(v) && v.toString().length >= 7;
            },
            message: props => `${props.value} is not a valid user ID!`
        }
    },
    googleId: String, // If you are using Google login, this might be needed
    isArchived: { 
        type: Boolean, 
        default: false 
    },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

userSchema.methods.generateGoogleId = function () {
    if (!this.googleId) {
        this.googleId = uuidv4();
    }
};

const User = mongoose.model('User', userSchema);

module.exports = User;
