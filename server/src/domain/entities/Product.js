class Product {
  constructor(
    id,
    name,
    description,
    price,
    imageUrl,
    organizationId,
    organizationName,
    isAvailable,
    createdAt,
    updatedAt
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.price = price;
    this.imageUrl = imageUrl;
    this.organizationId = organizationId;
    this.organizationName = organizationName;
    this.isAvailable = isAvailable !== false; // default true
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
  }

  static create(
    name,
    description,
    price,
    imageUrl,
    organizationId,
    organizationName
  ) {
    return new Product(
      null,
      name,
      description,
      price,
      imageUrl,
      organizationId,
      organizationName,
      true
    );
  }

  update(name, description, price, imageUrl) {
    this.name = name;
    this.description = description;
    this.price = price;
    this.imageUrl = imageUrl;
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
