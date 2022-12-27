const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const secret = 'mon-secret-secret';

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
})

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', UserSchema);

function generateToken(user) {
  return jwt.sign(user, secret, { expiresIn: '1h' });
}

function verifyToken(token) {
  return jwt.verify(token, secret);
}

async function signUp(email, password) {
  const user = new User({ email, password });
  await user.save();
  return user;
}

async function login(email, password) {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid email or password');
  }
  const validPassword = await user.comparePassword(password);
  if (validPassword) {
    const token = generateToken({ id: user._id });
    return token;
  } else {
    throw new Error('Invalid email or password');
  }
}

module.exports = {
  signUp,
  login,
  verifyToken,
};