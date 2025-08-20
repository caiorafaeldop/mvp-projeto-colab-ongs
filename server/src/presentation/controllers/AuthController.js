const Validators = require("../../utils/validators");

class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  register = async (req, res) => {
    try {
      const userData = Validators.sanitizeObject(req.body);
      const { name, email, password, userType, phone } = userData;

      // Validate user data
      const validation = Validators.validateUserRegistration(userData);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validation.errors,
        });
      }

      const result = await this.authService.register(userData);

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

  login = async (req, res) => {
    try {
      const loginData = Validators.sanitizeObject(req.body);
      const { email, password } = loginData;

      // Validate login data
      const validation = Validators.validateLogin(loginData);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validation.errors,
        });
      }

      const result = await this.authService.login(
        loginData.email,
        loginData.password
      );

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: result,
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message,
      });
    }
  };

  getProfile = async (req, res) => {
    try {
      res.status(200).json({
        success: true,
        data: {
          id: req.user.id,
          email: req.user.email,
          userType: req.user.userType,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching profile",
      });
    }
  };
}

module.exports = AuthController;
