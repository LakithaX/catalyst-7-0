export type ProductCategory = 'ALL' | 'APPAREL' | 'ACCESSORIES' | 'COLLECTIBLES' | 'SPECIAL SERIES';

export interface ProductOptions {
  sizes?: string[];
  colors?: string[];
}

export interface MerchProduct {
  id: string;
  name: string;
  variant: string;
  category: Exclude<ProductCategory, 'ALL'>;
  images: string[];
  description: string;
  options?: ProductOptions;
  // Authentic metadata with editable flags for missing commercial info
  tag?: string;
  claimStatus: string;
  claimEligibility: string;
  pickupLocation: string;
  materialDetails?: string[];
  careInstructions?: string[];
  priceLkr: number;
  priceDisplay: string;
  isAvailable: boolean;
}

export const MERCH_PRODUCTS: MerchProduct[] = [
  {
    id: "delegate-tee-black",
    name: "DELEGATE TEE",
    variant: "OBSIDIAN BLACK",
    category: "APPAREL",
    images: [
      "/assets/catalyst-merch/del-black-front.png",
      "/assets/catalyst-merch/del-black-back.png"
    ],
    description: "Crafted from ultra-heavyweight 280 GSM Japanese combed cotton with a structured streetwear drop-shoulder fit. Features the metallic Catalyst 7.0 crest on the chest and an intricate Bushido warrior calligraphy artwork silk-screened across the back.",
    options: {
      sizes: ["S", "M", "L", "XL"]
    },
    tag: "#SignatureDrop",
    claimStatus: "OFFICIAL DELEGATE DROP",
    claimEligibility: "Catalyst 7.0 Delegate Pass Holders",
    pickupLocation: "Catalyst Registration Hall · SLIIT Campus",
    materialDetails: [
      "280 GSM Heavyweight Combed Cotton",
      "Reinforced double-stitched ribbed collar",
      "High-density discharge screenprint back graphic",
      "Pre-shrunk Japanese streetwear relaxed cut"
    ],
    careInstructions: [
      "Machine wash cold inside out with like colors",
      "Do not iron directly over back calligraphy artwork",
      "Hang dry in shade to preserve cotton structure"
    ],
    priceLkr: 2850,
    priceDisplay: "LKR 2,850",
    isAvailable: true
  },
  {
    id: "bucket-hat-tokyo",
    name: "CATALYST BUCKET HAT",
    variant: "TOKYO EDITION",
    category: "ACCESSORIES",
    images: [
      "/assets/catalyst-merch/del-bucket-hat.png"
    ],
    description: "Structured all-weather canvas bucket hat inspired by Tokyo street culture. Features high-density 3D tonal embroidery of the Catalyst emblem with reinforced brim stitching.",
    options: {
      sizes: ["ONE SIZE (58cm)"]
    },
    tag: "#Streetwear",
    claimStatus: "LIMITED RUN",
    claimEligibility: "Open to All Registered Participants",
    pickupLocation: "Merch Desk · Catalyst Venue",
    materialDetails: [
      "100% Water-repellent Cotton Duck Canvas",
      "Interior sweatband with anti-microbial lining",
      "Precision 3D puffed tonal embroidery",
      "Brass ventilation eyelets"
    ],
    careInstructions: [
      "Spot clean with mild damp cloth",
      "Do not tumble dry or bleach"
    ],
    priceLkr: 1750,
    priceDisplay: "LKR 1,750",
    isAvailable: true
  },
  {
    id: "delegate-tee-white",
    name: "DELEGATE TEE",
    variant: "PURE IVORY",
    category: "APPAREL",
    images: [
      "/assets/catalyst-merch/del-white-front.png"
    ],
    description: "Minimalist off-white edition tailored in luxury heavyweight slub cotton. Features the understated Catalyst seal in samurai crimson and gold foil on the chest with a clean tailored silhouette.",
    options: {
      sizes: ["S", "M", "L", "XL"]
    },
    tag: "#LimitedEdition",
    claimStatus: "LIMITED EDITION",
    claimEligibility: "Catalyst 7.0 Delegates & OC",
    pickupLocation: "Catalyst Registration Hall · SLIIT Campus",
    materialDetails: [
      "260 GSM Premium Combed Slub Cotton",
      "Soft-wash peach skin finish for everyday comfort",
      "Subtle crimson & gold foil chest seal",
      "Drop-shoulder contemporary boxy fit"
    ],
    careInstructions: [
      "Gentle machine wash at 30°C",
      "Wash inside out",
      "Medium iron on reverse"
    ],
    priceLkr: 2850,
    priceDisplay: "LKR 2,850",
    isAvailable: true
  },
  {
    id: "stickers-bushido",
    name: "STICKER PACK",
    variant: "BUSHIDO SET",
    category: "COLLECTIBLES",
    images: [
      "/assets/catalyst-merch/stickers-pack-1.png"
    ],
    description: "Curated collector sheet of weatherproof die-cut vinyl stickers with matte laminate finish, highlighting traditional ukiyo-e motifs, Catalyst samurai emblems, and Japanese typography.",
    tag: "#CollectorPack",
    claimStatus: "IN STOCK",
    claimEligibility: "All Catalyst Seminar Attendees",
    pickupLocation: "Welcome Kit Handout",
    materialDetails: [
      "6 Premium Die-Cut Vinyl Decals",
      "Matte UV-resistant laminate coating",
      "Waterproof & scratch-proof adhesive",
      "Residue-free clean peel backing"
    ],
    priceLkr: 650,
    priceDisplay: "LKR 650",
    isAvailable: true
  },
  {
    id: "stickers-shinobi",
    name: "STICKER PACK",
    variant: "SHINOBI SET",
    category: "COLLECTIBLES",
    images: [
      "/assets/catalyst-merch/stickers-pack-2.png"
    ],
    description: "Custom holographic & matte vinyl decal set designed for laptops, skateboards, and bottles. Scratch-resistant, UV-proof, and precision laser-cut.",
    tag: "#CollectorPack",
    claimStatus: "IN STOCK",
    claimEligibility: "All Catalyst Seminar Attendees",
    pickupLocation: "Welcome Kit Handout",
    materialDetails: [
      "Holographic & stealth matte elements",
      "High-tack outdoor grade adhesive",
      "Precision die-cut borders",
      "Fade-resistant Japanese ink printing"
    ],
    priceLkr: 750,
    priceDisplay: "LKR 750",
    isAvailable: true
  },
  {
    id: "wristband-beige",
    name: "WOVEN WRISTBAND",
    variant: "SANDSTONE BEIGE",
    category: "ACCESSORIES",
    images: [
      "/assets/catalyst-merch/wristband-beige.png"
    ],
    description: "Jacquard woven festival band crafted from recycled satin threads. Accented with an antique brushed gold slide-lock and embossed Catalyst 7.0 coordinates.",
    tag: "#Accessory",
    claimStatus: "BADGE ESSENTIAL",
    claimEligibility: "Official Event Accreditation Required",
    pickupLocation: "Check-in Desk · Entrance Gates",
    materialDetails: [
      "High-density Jacquard micro-woven satin",
      "Laser-welded anti-fray edges",
      "Brushed antique gold alloy locking bead",
      "Serialised commemorative identifier"
    ],
    priceLkr: 450,
    priceDisplay: "LKR 450",
    isAvailable: true
  },
  {
    id: "wristband-purple",
    name: "WOVEN WRISTBAND",
    variant: "IMPERIAL PURPLE",
    category: "ACCESSORIES",
    images: [
      "/assets/catalyst-merch/wristband-purple.png"
    ],
    description: "Commemorative imperial purple edition woven with shimmering silver metallic threads, honoring the delegate spirit of AIESEC in SLIIT.",
    tag: "#Accessory",
    claimStatus: "VIP & LEADERSHIP",
    claimEligibility: "Leadership Track & Organizing Committee",
    pickupLocation: "Leadership Plenary Entrance",
    materialDetails: [
      "Royal purple thread woven with metallic silver",
      "Adjustable brushed zinc slider bead",
      "Water-resistant and durable across multi-day wear",
      "Soft-touch skin-friendly weave"
    ],
    priceLkr: 550,
    priceDisplay: "LKR 550",
    isAvailable: true
  },
  {
    id: "special-series-1",
    name: "SPECIAL SERIES",
    variant: "EDITION I",
    category: "SPECIAL SERIES",
    images: [
      "/assets/catalyst-merch/catalyst-s1.png"
    ],
    description: "Exclusive commemorative release crafted specifically for Catalyst 7.0 delegates. Features bespoke insignia and numbered authenticity seal.",
    tag: "#ExclusiveDrop",
    claimStatus: "ARCHIVAL RUN",
    claimEligibility: "AIESEC in SLIIT Catalyst 7.0 Members",
    pickupLocation: "Catalyst Souvenir Pavilion",
    materialDetails: [
      "Archival-grade collector edition packaging",
      "Numbered certificate of authenticity",
      "Custom commemorative branding"
    ],
    priceLkr: 3450,
    priceDisplay: "LKR 3,450",
    isAvailable: true
  },
  {
    id: "special-series-2",
    name: "SPECIAL SERIES",
    variant: "EDITION II",
    category: "SPECIAL SERIES",
    images: [
      "/assets/catalyst-merch/catalyst-s2.png"
    ],
    description: "Limited archival release celebrating leadership through connection. A signature souvenir of the two-day Catalyst experience.",
    tag: "#ExclusiveDrop",
    claimStatus: "ARCHIVAL RUN",
    claimEligibility: "AIESEC in SLIIT Catalyst 7.0 Members",
    pickupLocation: "Catalyst Souvenir Pavilion",
    materialDetails: [
      "Curated festival showcase collectible",
      "Special Edition 7.0 iconography",
      "Commemorative packaging"
    ],
    priceLkr: 3650,
    priceDisplay: "LKR 3,650",
    isAvailable: true
  }
];

export const CATEGORIES: ProductCategory[] = [
  'ALL',
  'APPAREL',
  'ACCESSORIES',
  'COLLECTIBLES',
  'SPECIAL SERIES'
];

export function getProductById(id: string): MerchProduct | undefined {
  return MERCH_PRODUCTS.find((p) => p.id === id);
}

export function getRelatedProducts(currentId: string, limit: number = 3): MerchProduct[] {
  const current = getProductById(currentId);
  if (!current) return MERCH_PRODUCTS.slice(0, limit);

  const sameCategory = MERCH_PRODUCTS.filter(
    (p) => p.id !== currentId && p.category === current.category
  );
  const otherCategories = MERCH_PRODUCTS.filter(
    (p) => p.id !== currentId && p.category !== current.category
  );

  return [...sameCategory, ...otherCategories].slice(0, limit);
}
