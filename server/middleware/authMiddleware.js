// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ✅ Middleware to protect routes
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id)
        .select("-password")
        .populate("team", "name members");

      // 🔍 DEBUG LOG
      console.log("🔐 Authenticated User:", {
        id: req.user._id,
        name: req.user.name,
        role: req.user.role,
        team: req.user.team?._id || null,
        teamName: req.user.team?.name || null,
      });

      next();
    } catch (err) {
      console.error("❌ JWT error:", err.message);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

// ✅ Role-based access utility
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};

// ✅ Specific guards
export const isAdmin = authorize("Admin");
export const isTeamLead = authorize("TeamLead");
export const isMember = authorize("Member");
