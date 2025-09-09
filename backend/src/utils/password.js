import bcrypt from 'bcryptjs';

// Hash a password
export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Compare plain text password with hashed one
export async function comparePassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}
