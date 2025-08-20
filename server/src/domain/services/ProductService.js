const IProductService = require("./IProductService");
const Product = require("../entities/Product");

class ProductService extends IProductService {
  constructor(productRepository, userRepository) {
    super();
    this.productRepository = productRepository;
    this.userRepository = userRepository;
  }

  async createProduct(productData, organizationId) {
    try {
      // Verify if user is an organization
      const organization = await this.userRepository.findById(organizationId);
      if (!organization || organization.userType !== "organization") {
        throw new Error("Only organizations can create products");
      }

      // Validate product data
      this._validateProductData(productData);

      // Create product
      const product = Product.create(
        productData.name,
        productData.description,
        productData.price,
        productData.imageUrl,
        organizationId,
        organization.name
      );

      // Save product
      const savedProduct = await this.productRepository.save(product);

      return {
        id: savedProduct.id,
        name: savedProduct.name,
        description: savedProduct.description,
        price: savedProduct.price,
        imageUrl: savedProduct.imageUrl,
        organizationId: savedProduct.organizationId,
        organizationName: savedProduct.organizationName,
        isAvailable: savedProduct.isAvailable,
        createdAt: savedProduct.createdAt,
      };
    } catch (error) {
      throw new Error(`Error creating product: ${error.message}`);
    }
  }

  async updateProduct(id, productData, organizationId) {
    try {
      // Verify if product exists and belongs to organization
      const existingProduct = await this.productRepository.findById(id);
      if (!existingProduct) {
        throw new Error("Product not found");
      }

      if (existingProduct.organizationId !== organizationId) {
        throw new Error("You can only update your own products");
      }

      // Validate product data
      this._validateProductData(productData);

      // Update product
      const updatedProduct = await this.productRepository.update(id, {
        name: productData.name,
        description: productData.description,
        price: productData.price,
        imageUrl: productData.imageUrl,
      });

      return {
        id: updatedProduct.id,
        name: updatedProduct.name,
        description: updatedProduct.description,
        price: updatedProduct.price,
        imageUrl: updatedProduct.imageUrl,
        organizationId: updatedProduct.organizationId,
        organizationName: updatedProduct.organizationName,
        isAvailable: updatedProduct.isAvailable,
        updatedAt: updatedProduct.updatedAt,
      };
    } catch (error) {
      throw new Error(`Error updating product: ${error.message}`);
    }
  }

  async deleteProduct(id, organizationId) {
    try {
      // Verify if product exists and belongs to organization
      const existingProduct = await this.productRepository.findById(id);
      if (!existingProduct) {
        throw new Error("Product not found");
      }

      if (existingProduct.organizationId !== organizationId) {
        throw new Error("You can only delete your own products");
      }

      await this.productRepository.delete(id);
      return { message: "Product deleted successfully" };
    } catch (error) {
      throw new Error(`Error deleting product: ${error.message}`);
    }
  }

  async getProduct(id) {
    try {
      const product = await this.productRepository.findById(id);
      if (!product) {
        throw new Error("Product not found");
      }

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        imageUrl: product.imageUrl,
        organizationId: product.organizationId,
        organizationName: product.organizationName,
        isAvailable: product.isAvailable,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      };
    } catch (error) {
      throw new Error(`Error getting product: ${error.message}`);
    }
  }

  async getProductsByOrganization(organizationId) {
    try {
      const products =
        await this.productRepository.findByOrganizationId(organizationId);

      return products.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        imageUrl: product.imageUrl,
        organizationId: product.organizationId,
        organizationName: product.organizationName,
        isAvailable: product.isAvailable,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      }));
    } catch (error) {
      throw new Error(`Error getting organization products: ${error.message}`);
    }
  }

  async getAllAvailableProducts() {
    try {
      const products = await this.productRepository.findAvailable();

      return products.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        imageUrl: product.imageUrl,
        organizationId: product.organizationId,
        organizationName: product.organizationName,
        isAvailable: product.isAvailable,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      }));
    } catch (error) {
      throw new Error(`Error getting available products: ${error.message}`);
    }
  }

  async searchProducts(query) {
    try {
      if (!query || query.trim().length === 0) {
        return await this.getAllAvailableProducts();
      }

      const products = await this.productRepository.searchByName(query.trim());

      return products.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        imageUrl: product.imageUrl,
        organizationId: product.organizationId,
        organizationName: product.organizationName,
        isAvailable: product.isAvailable,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      }));
    } catch (error) {
      throw new Error(`Error searching products: ${error.message}`);
    }
  }

  async toggleProductAvailability(id, organizationId) {
    try {
      // Verify if product exists and belongs to organization
      const existingProduct = await this.productRepository.findById(id);
      if (!existingProduct) {
        throw new Error("Product not found");
      }

      if (existingProduct.organizationId !== organizationId) {
        throw new Error("You can only update your own products");
      }

      // Toggle availability
      existingProduct.toggleAvailability();
      const updatedProduct = await this.productRepository.update(id, {
        isAvailable: existingProduct.isAvailable,
      });

      return {
        id: updatedProduct.id,
        name: updatedProduct.name,
        isAvailable: updatedProduct.isAvailable,
        updatedAt: updatedProduct.updatedAt,
      };
    } catch (error) {
      throw new Error(`Error toggling product availability: ${error.message}`);
    }
  }

  _validateProductData(productData) {
    if (!productData.name || productData.name.trim().length === 0) {
      throw new Error("Product name is required");
    }

    if (
      !productData.description ||
      productData.description.trim().length === 0
    ) {
      throw new Error("Product description is required");
    }

    if (!productData.price || productData.price <= 0) {
      throw new Error("Product price must be greater than zero");
    }

    if (!productData.imageUrl || productData.imageUrl.trim().length === 0) {
      throw new Error("Product image URL is required");
    }
  }
}

module.exports = ProductService;
