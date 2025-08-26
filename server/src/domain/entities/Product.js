class Product {
  constructor(
    id,
    name,
    description,
    price,
    imageUrls,
    organizationId,
    organizationName,
    isAvailable,
    createdAt,
    updatedAt,
    category
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.price = price;
    this.imageUrls = imageUrls;
    this.organizationId = organizationId;
    this.organizationName = organizationName;
    this.isAvailable = isAvailable !== false; // default true
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
    this.category = category;
  }

  static create(
    name,
    description,
    price,
    imageUrls,
    organizationId,
    organizationName,
    category
  ) {
    return new Product(
      null,
      name,
      description,
      price,
      imageUrls,
      organizationId,
      organizationName,
      true,
      new Date(), // Explicitly set createdAt
      new Date(), // Explicitly set updatedAt
      category // Pass category to constructor
    );
  }

  update(name, description, price, imageUrls, category) {
    // Add category parameter
    this.name = name;
    this.description = description;
    this.price = price;
    this.imageUrls = imageUrls;
    this.category = category; // Update category
    this.updatedAt = new Date();
  }

  toggleAvailability() {
    this.isAvailable = !this.isAvailable;
    this.updatedAt = new Date();
  }

  getWhatsAppLink(phone) {
    const message = encodeURIComponent(
      `Olá! Gostaria de saber mais sobre o produto "${this.name}" da ${this.organizationName}.`
    );
    return `https://wa.me/${phone}?text=${message}`;
  }
}

module.exports = Product;
