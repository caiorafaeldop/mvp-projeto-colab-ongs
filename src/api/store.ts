export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  stock: number; 
}

const mockProducts: Product[] = [
  {
    _id: '1',
    name: 'Alpargatas Havaianas Mule Evolution II',
    description: 'Em estilo casual e cheia de elegância, fica linda nos pés e remete a descontração do clima praiano mas também valoriza composições chiques e urbanas.',
    price: 103.99,
    category: 'Calçados',
    images: ['/img/shoes/havaianas-mule-evolution.jpg'],
    stock: 15,
  },
  {
    _id: '2',
    name: 'Alpargatas Havaianas Mule Clássica',
    description: 'Prático, charmoso e confortável, o sapato tipo Mule, aberto na parte de trás, é daqueles que é só calçar e pronto, não tem complicação.',
    price: 70.00,
    category: 'Calçados',
    images: ['/img/shoes/havaianas-mule-classic.jpg'],
    stock: 8,
  },
  {
    _id: '3',
    name: 'Alpargatas Havaianas Slipper Cozy II',
    description: 'Nossa slipper tipo mule é o calçado mais aconchegante (e estiloso) que você pode ter para os dias frios. Sinta-se caminhando nas nuvens!',
    price: 144.49,
    category: 'Calçados',
    images: ['/img/shoes/havaianas-slipper-cozy.jpg'],
    stock: 12,
  },
  {
    _id: '4',
    name: 'Jogo Americano Redondo Vermelho',
    description: 'Um jogo americano é um item essencial para quem gosta de receber bem. Ele protege a mesa e ainda traz um toque especial à decoração.',
    price: 29.90,
    category: 'Decoração',
    images: ['/img/shoes/jogo_americano.jpg'],
    stock: 12,
  },
  {
    _id: '5',
    name: 'Jogo Americano Redondo Cinza',
    description: 'Um jogo americano é um item essencial para quem gosta de receber bem. Ele protege a mesa e ainda traz um toque especial à decoração.',
    price: 29.90,
    category: 'Decoração',
    images: ['/img/shoes/jogo_americano_2.jpg'],
    stock: 12,
  },
  {
    _id: '6',
    name: 'Brinco Artesanal',
    description: 'Item feito à mão, com design exclusivo e materiais de alta qualidade.',
    price: 9.90,
    category: 'Decoração',
    images: ['/img/shoes/brincos.jpg'],
    stock: 12,
  }
];

export const getProducts = (): Promise<{ products: Product[] }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ products: mockProducts });
    }, 500);
  });
};

export const getProductById = (id: string): Promise<{ product: Product | undefined }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const product = mockProducts.find(p => p._id === id);
      resolve({ product });
    }, 500);
  });
};
