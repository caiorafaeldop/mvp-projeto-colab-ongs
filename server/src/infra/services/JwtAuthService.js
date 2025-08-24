const IAuthService = require("../../domain/services/IAuthService");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../../domain/entities/User");

class JwtAuthService extends IAuthService {
  constructor(userRepository, jwtSecret) {
    super();
    this.userRepository = userRepository;
    this.jwtSecret = jwtSecret;
  }

  async register(userData) {
    try {
      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(
        userData.email
      );
      if (existingUser) {
        throw new Error("User already exists with this email");
      }

      // Create user based on type
      let user;
      if (userData.userType === "organization") {
        user = User.createOrganizationUser(
          userData.name,
          userData.email,
          userData.password,
          userData.phone
        );
      } else {
        user = User.createCommonUser(
          userData.name,
          userData.email,
          userData.password,
          userData.phone
        );
      }

      // Hash password
      user.password = await this.hashPassword(user.password);

      // Save user
      const savedUser = await this.userRepository.save(user);

      // Generate token
      const token = await this.generateToken(savedUser);

      return {
        user: {
          id: savedUser.id,
          name: savedUser.name,
          email: savedUser.email,
          userType: savedUser.userType,
          phone: savedUser.phone,
        },
        token,
      };
    } catch (error) {
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  async login(email, password) {
    try {
      // Find user by email
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        throw new Error("Invalid credentials");
      }

      // Verify password
      const isValidPassword = await this.comparePassword(
        password,
        user.password
      );
      if (!isValidPassword) {
        throw new Error("Invalid credentials");
      }

      // Generate token
      const token = await this.generateToken(user);

      return {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          userType: user.userType,
          phone: user.phone,
        },
        token,
      };
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  async generateToken(user) {
    try {
      const payload = {
        id: user._id,
        email: user.email,
        userType: user.userType,
      };

      return jwt.sign(payload, this.jwtSecret, { expiresIn: "24h" });
    } catch (error) {
      throw new Error(`Token generation failed: ${error.message}`);
    }
  }

  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, this.jwtSecret);
      const user = await this.userRepository.findById(decoded.id);

      if (!user) {
        throw new Error("User not found");
      }

      return {
        id: user.id,
        email: user.email,
        userType: user.userType,
      };
    } catch (error) {
      throw new Error(`Token verification failed: ${error.message}`);
    }
  }

  async hashPassword(password) {
    try {
      const salt = await bcrypt.genSalt(10);
      return await bcrypt.hash(password, salt);
    } catch (error) {
      throw new Error(`Password hashing failed: ${error.message}`);
    }
  }

  async comparePassword(password, hashedPassword) {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      throw new Error(`Password comparison failed: ${error.message}`);
    }
  }
}

module.exports = JwtAuthService;
