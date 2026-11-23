import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../middleware/authMiddleware.js";

// Seeded users for all 4 primary roles
const rawUsers = [
  {
    id: "user_admin",
    name: "Platform Administrator",
    email: "admin@dabbadash.com",
    passwordPlain: "Admin@123",
    role: "admin",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
  },
  {
    id: "user_chef_punjab",
    name: "Chef Harpreet Singh",
    email: "chef@punjabgrill.com",
    passwordPlain: "Chef@123",
    role: "restaurant",
    restaurantId: "rest_1",
    avatar: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=100&auto=format&fit=crop&q=80"
  },
  {
    id: "user_rider_vikram",
    name: "Vikram Singh (Rider)",
    email: "rider.vikram@dabbadash.com",
    passwordPlain: "Rider@123",
    role: "delivery",
    riderId: "rider_1",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
  },
  {
    id: "user_customer_aman",
    name: "Aman Gupta",
    email: "customer.aman@gmail.com",
    passwordPlain: "Customer@123",
    role: "customer",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80"
  }
];

// Initialize users with bcrypt-hashed passwords
let users = rawUsers.map(u => ({
  id: u.id,
  name: u.name,
  email: u.email,
  passwordHash: bcrypt.hashSync(u.passwordPlain, 10),
  role: u.role,
  restaurantId: u.restaurantId,
  riderId: u.riderId,
  avatar: u.avatar
}));

/**
 * Generate signed JWT Token (valid for 24 hours)
 */
export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      restaurantId: user.restaurantId || null,
      riderId: user.riderId || null
    },
    JWT_SECRET,
    { expiresIn: "24h" }
  );
}

/**
 * Authenticate User with Email & Password
 */
export async function authenticateUser(email, password) {
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) {
    throw new Error("Invalid email or password");
  }

  const token = generateToken(user);
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      restaurantId: user.restaurantId,
      riderId: user.riderId,
      avatar: user.avatar
    },
    token
  };
}

/**
 * Register New User
 */
export async function registerNewUser({ name, email, password, role = "customer" }) {
  if (!name || !email || !password) {
    throw new Error("Name, email and password are required");
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters long");
  }

  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    throw new Error("An account with this email already exists");
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const newUser = {
    id: `user_${Date.now()}`,
    name,
    email,
    passwordHash,
    role: ["customer", "restaurant", "delivery", "admin"].includes(role) ? role : "customer",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"
  };

  users.push(newUser);
  const token = generateToken(newUser);

  return {
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      avatar: newUser.avatar
    },
    token
  };
}

/**
 * Get Demo Accounts for Fast Hackathon Evaluation
 */
export function getDemoAccounts() {
  return rawUsers.map(u => ({
    name: u.name,
    email: u.email,
    password: u.passwordPlain,
    role: u.role
  }));
}
