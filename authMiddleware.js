import jwt from "jsonwebtoken";
import crypto from "crypto";

export const JWT_SECRET = process.env.JWT_SECRET || "dabbadash-hackathon-secure-jwt-key-99824";
export const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "razorpay_secret_hackathon_mock";

/**
 * JWT Verification Middleware
 * Validates the Authorization Bearer token header
 */
export function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];
  if (!authHeader) {
    req.user = null;
    return next();
  }

  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
  } catch (err) {
    req.user = null;
  }
  next();
}

/**
 * Enforce Authentication
 */
export function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      error: "Authentication required",
      message: "Please login with a valid JWT token to access this endpoint"
    });
  }
  next();
}

/**
 * Role-Based Access Control (RBAC)
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Authentication token missing"
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Forbidden",
        message: `Access denied. Requires one of the following roles: [${allowedRoles.join(", ")}]. Current role: '${req.user.role}'`
      });
    }
    next();
  };
}

/**
 * Security: Server-side Price Integrity Validator
 * Prevents client-side price tampering by looking up authentic item prices from the restaurant menu
 */
export function validateOrderIntegrity(restaurants) {
  return (req, res, next) => {
    const { restaurantId, items } = req.body;
    if (!restaurantId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Invalid order data: restaurantId and items required" });
    }

    const rest = restaurants.find(r => r.id === restaurantId);
    if (!rest) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    let calculatedTotal = 0;
    const verifiedItems = [];

    for (const item of items) {
      const menuItem = rest.menu.find(m => m.id === item.id);
      if (!menuItem) {
        return res.status(400).json({ error: `Dish '${item.name || item.id}' does not exist on menu` });
      }
      if (!menuItem.available) {
        return res.status(400).json({ error: `Dish '${menuItem.name}' is currently out of stock` });
      }

      const qty = Math.max(1, parseInt(item.quantity) || 1);
      calculatedTotal += menuItem.price * qty;

      verifiedItems.push({
        id: menuItem.id,
        name: menuItem.name,
        price: menuItem.price, // enforced server price
        quantity: qty
      });
    }

    req.verifiedOrder = {
      restaurant: rest,
      items: verifiedItems,
      subtotal: calculatedTotal
    };

    next();
  };
}

/**
 * Cryptographic Razorpay Payment Signature Verification (HMAC-SHA256)
 */
export function verifyPaymentHMAC(orderId, paymentId, signature) {
  const generatedSignature = crypto
    .createHmac("sha256", RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return generatedSignature === signature;
}
