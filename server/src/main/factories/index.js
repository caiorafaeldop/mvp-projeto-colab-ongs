const MongoUserRepository = require("../../data/repositories/MongoUserRepository");
const MongoProductRepository = require("../../data/repositories/MongoProductRepository");
const JwtAuthService = require("../../infra/services/JwtAuthService");
const ProductService = require("../../domain/services/ProductService");
const createAuthRoutes = require("../../presentation/routes/authRoutes");
const createProductRoutes = require("../../presentation/routes/productRoutes");

class AppFactory {
  constructor() {
    this.userRepository = null;
    this.productRepository = null;
    this.authService = null;
    this.productService = null;
  }

  createUserRepository() {
    if (!this.userRepository) {
      this.userRepository = new MongoUserRepository();
    }
    return this.userRepository;
  }

  createProductRepository() {
    if (!this.productRepository) {
      this.productRepository = new MongoProductRepository();
    }
    return this.productRepository;
  }

  createAuthService() {
    if (!this.authService) {
      const userRepository = this.createUserRepository();
      const jwtSecret = process.env.JWT_SECRET || "your-secret-key";
      this.authService = new JwtAuthService(userRepository, jwtSecret);
    }
    return this.authService;
  }

  createProductService() {
    if (!this.productService) {
      const productRepository = this.createProductRepository();
      const userRepository = this.createUserRepository();
      this.productService = new ProductService(
        productRepository,
        userRepository
      );
    }
    return this.productService;
  }

  createAuthRoutes() {
    const authService = this.createAuthService();
    return createAuthRoutes(authService);
  }

  createProductRoutes() {
    const productService = this.createProductService();
    const authService = this.createAuthService();
    return createProductRoutes(productService, authService);
  }
}

module.exports = AppFactory;

