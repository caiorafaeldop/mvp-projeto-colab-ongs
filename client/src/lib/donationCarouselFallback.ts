export type DonationCarouselFallbackSlide = {
  imageUrl: string;
  caption: string;
  altText: string;
  theme: string;
  albumTitle?: string;
  albumSubtitle?: string;
  order: number;
};

export const DONATION_CAROUSEL_FALLBACK_SLIDES: DonationCarouselFallbackSlide[] = [
  { imageUrl: "/img/Img_Donations_1.jpeg", caption: "Doação de cabelo", altText: "Doação de cabelo para confecção de perucas", theme: "Doações de Cabelo", albumTitle: "Doações de Cabelo", albumSubtitle: "Sua solidariedade se transforma em autoestima.", order: 1 },
  { imageUrl: "/img/Img_Donations_2.jpeg", caption: "Peruca confeccionada", altText: "Peruca confeccionada com cabelo doado", theme: "Doações de Cabelo", order: 2 },
  { imageUrl: "/img/Img_Donations_3.jpeg", caption: "Peruca em uso", altText: "Paciente usando peruca feita com cabelo doado", theme: "Doações de Cabelo", order: 3 },
  { imageUrl: "/img/Img_Donations_4.jpeg", caption: "Oficina de artesanato", altText: "Oficina de artesanato com bonecas de pano", theme: "Dia a Dia na Casa", albumTitle: "Dia a Dia na Casa", albumSubtitle: "Artesanato, pintura e trabalhos manuais que aquecem os corações.", order: 1 },
  { imageUrl: "/img/Img_Donations_5.jpeg", caption: "Pintando artesanato", altText: "Pintando e criando artesanato", theme: "Dia a Dia na Casa", order: 2 },
  { imageUrl: "/img/Img_Donations_6.jpeg", caption: "Costurando peças", altText: "Costurando peças artesanais", theme: "Dia a Dia na Casa", order: 3 },
  { imageUrl: "/img/Img_Donations_7.jpeg", caption: "Passeio na orla", altText: "Passeio na orla da praia", theme: "Momentos de Passeio", albumTitle: "Momentos de Passeio", albumSubtitle: "Proporcionamos passeios que trazem alegria e momentos inesquecíveis.", order: 1 },
  { imageUrl: "/img/Img_Donations_8.jpeg", caption: "Grupo na praia", altText: "Grupo na beira do mar", theme: "Momentos de Passeio", order: 2 },
  { imageUrl: "/img/Img_Donations_9.jpeg", caption: "Visita ao aquário", altText: "Visita ao aquário", theme: "Momentos de Passeio", order: 3 },
  { imageUrl: "/img/Img_Donations_10.jpeg", caption: "Dentro do aquário", altText: "Dentro do aquário", theme: "Momentos de Passeio", order: 4 },
  { imageUrl: "/img/Img_Donations_11.jpeg", caption: "Bosque dos Sonhos", altText: "Passeio no Bosque dos Sonhos", theme: "Momentos de Passeio", order: 5 },
  { imageUrl: "/img/Img_Donations_12.jpeg", caption: "Centro de Artesanato", altText: "Visita ao Centro de Artesanato de Tambaú", theme: "Momentos de Passeio", order: 6 },
  { imageUrl: "/img/Img_Donations_13.jpeg", caption: "Passeio pelo litoral", altText: "Passeio pelo litoral", theme: "Momentos de Passeio", order: 7 },
  { imageUrl: "/img/Img_Donations_14.jpeg", caption: "Feirinha de Tambaú", altText: "Feirinha de Artesanato de Tambaú", theme: "Momentos de Passeio", order: 8 },
  { imageUrl: "/img/Img_Donations_15.jpeg", caption: "Pontos turísticos", altText: "Passeio por pontos turísticos", theme: "Momentos de Passeio", order: 9 },
  { imageUrl: "/img/Img_Donations_16.jpeg", caption: "Monumento à beira-mar", altText: "Visita a monumento religioso à beira-mar", theme: "Momentos de Passeio", order: 10 },
  { imageUrl: "/img/Img_Donations_17.jpeg", caption: "Descanso na praia", altText: "Momento de descanso na praia", theme: "Momentos de Passeio", order: 11 },
  { imageUrl: "/img/Img_Donations_18.jpeg", caption: "Caminhada na praia", altText: "Caminhada na praia", theme: "Momentos de Passeio", order: 12 },
];
