const authMiddleware = (authService) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Access token required",
        });
      }

      const decoded = await authService.verifyToken(token);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }
  };
};

const organizationMiddleware = () => {
  return (req, res, next) => {
    if (req.user.userType !== "organization") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only organizations can perform this action.",
      });
    }
    next();
  };
};

module.exports = {
  authMiddleware,
  organizationMiddleware,
};

