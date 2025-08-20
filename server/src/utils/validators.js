/**
 * Utilitários de validação para dados de entrada
 */
class Validators {
  /**
   * Valida se um email é válido
   * @param {string} email - Email a ser validado
   * @returns {boolean} True se válido
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida se uma senha é forte
   * @param {string} password - Senha a ser validada
   * @returns {boolean} True se válida
   */
  static isStrongPassword(password) {
    // Mínimo 6 caracteres
    return password && password.length >= 6;
  }

  /**
   * Valida se um nome é válido
   * @param {string} name - Nome a ser validado
   * @returns {boolean} True se válido
   */
  static isValidName(name) {
    return name && name.trim().length >= 2;
  }

  /**
   * Valida se um preço é válido
   * @param {number} price - Preço a ser validado
   * @returns {boolean} True se válido
   */
  static isValidPrice(price) {
    return typeof price === "number" && price > 0;
  }

  /**
   * Valida se uma URL é válida
   * @param {string} url - URL a ser validada
   * @returns {boolean} True se válida
   */
  static isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Valida dados de registro de usuário
   * @param {object} userData - Dados do usuário
   * @returns {object} Resultado da validação
   */
  static validateUserRegistration(userData) {
    const errors = [];

    if (!this.isValidName(userData.name)) {
      errors.push("Nome deve ter pelo menos 2 caracteres");
    }

    if (!this.isValidEmail(userData.email)) {
      errors.push("Email inválido");
    }

    if (!this.isStrongPassword(userData.password)) {
      errors.push("Senha deve ter pelo menos 6 caracteres");
    }

    if (!["common", "organization"].includes(userData.userType)) {
      errors.push('Tipo de usuário deve ser "common" ou "organization"');
    }

    if (!userData.phone || userData.phone.trim().length === 0) {
      errors.push("Telefone é obrigatório");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Valida dados de login
   * @param {object} loginData - Dados de login
   * @returns {object} Resultado da validação
   */
  static validateLogin(loginData) {
    const errors = [];

    if (!this.isValidEmail(loginData.email)) {
      errors.push("Email inválido");
    }

    if (!loginData.password || loginData.password.trim().length === 0) {
      errors.push("Senha é obrigatória");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Valida dados de produto
   * @param {object} productData - Dados do produto
   * @returns {object} Resultado da validação
   */
  static validateProduct(productData) {
    const errors = [];

    if (!this.isValidName(productData.name)) {
      errors.push("Nome do produto deve ter pelo menos 2 caracteres");
    }

    if (
      !productData.description ||
      productData.description.trim().length === 0
    ) {
      errors.push("Descrição é obrigatória");
    }

    if (!this.isValidPrice(productData.price)) {
      errors.push("Preço deve ser um número maior que zero");
    }

    if (!this.isValidUrl(productData.imageUrl)) {
      errors.push("URL da imagem é inválida");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Sanitiza uma string removendo caracteres especiais perigosos
   * @param {string} str - String a ser sanitizada
   * @returns {string} String sanitizada
   */
  static sanitizeString(str) {
    if (typeof str !== "string") return str;
    return str.trim().replace(/[<>]/g, "");
  }

  /**
   * Sanitiza um objeto removendo caracteres especiais de todas as strings
   * @param {object} obj - Objeto a ser sanitizado
   * @returns {object} Objeto sanitizado
   */
  static sanitizeObject(obj) {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === "string") {
        sanitized[key] = this.sanitizeString(value);
      } else if (typeof value === "object" && value !== null) {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }
}

module.exports = Validators;
