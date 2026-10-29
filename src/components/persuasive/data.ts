// ============================================================
// PERSUASIVE — product + brand data (shared)
// Tee/hero photos come from the live CDN; cap photos are local (public/caps).
// ============================================================

const CDN = 'https://images.persuasive.online';

export interface ColorOption {
  name: string;
  value: string;
  border?: boolean;
}

// ---------------- HERO / lifestyle imagery ----------------
export const HERO_IMAGES = [
  'Hero%20Images/IMG_9319.jpg', 'Hero%20Images/IMG_9322.jpg', 'Hero%20Images/IMG_9328.jpg',
  'Hero%20Images/IMG_9332.jpg', 'Hero%20Images/IMG_9334.jpg', 'Hero%20Images/IMG_9338.jpg',
  'Hero%20Images/IMG_9350.jpg', 'Hero%20Images/IMG_9353.jpg', 'Hero%20Images/IMG_9359.jpg',
  'Hero%20Images/IMG_9362.jpg', 'Hero%20Images/IMG_9364.jpg', 'Hero%20Images/IMG_9369.jpg',
  'Hero%20Images/IMG_9372.jpg', 'Hero%20Images/IMG_9380.jpg', 'Hero%20Images/IMG_9383.jpg',
  'Hero%20Images/IMG_9399.jpg', 'Hero%20Images/IMG_9454.jpg', 'Hero%20Images/IMG_9457.jpg',
  'Hero%20Images/IMG_9459.jpg', 'Hero%20Images/IMG_9461.jpg', 'Hero%20Images/IMG_9474.jpg',
].map((p) => `${CDN}/${p}`);

export const SIZE_GUIDE = `${CDN}/Hero%20Images/SizeGuide.jpg`;

// ---------------- TEE config ----------------
export const sleevedShirtColors: ColorOption[] = [
  { name: 'White', value: '#FFFFFF', border: true },
  { name: 'Black', value: '#0c0c0c' },
  { name: 'Cream', value: '#F5E6D3' },
  { name: 'Grey', value: '#9CA3AF' },
  { name: 'Mint Green', value: '#A7F3D0' },
  { name: 'Pale Blue', value: '#BAE6FD' },
];

export const sleevelessShirtColors: ColorOption[] = [
  { name: 'Grey Sleeveless', value: '#9CA3AF' },
  { name: 'Pale Blue Sleeveless', value: '#BAE6FD' },
];

export const embroideryColorsByShirt: { [key: string]: ColorOption[] } = {
  White: [{ name: 'Blue', value: '#2563EB' }],
  Black: [{ name: 'Pink', value: '#EC4899' }, { name: 'Red', value: '#DC2626' }],
  Cream: [{ name: 'Red', value: '#DC2626' }],
  Grey: [{ name: 'Yellow', value: '#EAB308' }],
  'Mint Green': [{ name: 'Teal', value: '#14B8A6' }],
  'Pale Blue': [{ name: 'Orange', value: '#FB923C' }],
  'Grey Sleeveless': [{ name: 'Yellow', value: '#EAB308' }],
  'Pale Blue Sleeveless': [{ name: 'Green', value: '#10B981' }],
};

function teeImgs(folder: string, files: string[]) {
  return files.map((f) => `${CDN}/${folder}/${f}`);
}

export const shirtImagesByVariant: { [key: string]: string[] } = {
  'White-Blue': teeImgs('White%20Shirt%20Blue%20Embroidery',
    ['IMG_9166.jpg', 'IMG_9168.jpg', 'IMG_9172.jpg', 'IMG_9175.jpg', 'IMG_9185.jpg', 'IMG_9239.jpg', 'IMG_9241.jpg', 'IMG_9244.jpg', 'IMG_9249.jpg']),
  'Black-Pink': teeImgs('Black%20Shirt%20Pink%20Embroidery',
    ['IMG_9123.jpg', 'IMG_9125.jpg', 'IMG_9128.jpg', 'IMG_9133.jpg', 'IMG_9217.jpg', 'IMG_9221.jpg', 'IMG_9222.jpg', 'IMG_9224.jpg', 'IMG_9228.jpg', 'IMG_9233.jpg']),
  'Black-Red': teeImgs('Black%20Shirt%20Red%20Embroidery',
    ['IMG_9196.jpg', 'IMG_9198.jpg', 'IMG_9207.jpg', 'IMG_9209.jpg', 'IMG_9211.jpg', 'IMG_9212.jpg', 'IMG_9288.jpg', 'IMG_9292.jpg', 'IMG_9293.jpg', 'IMG_9295.jpg', 'IMG_9297.jpg', 'IMG_9300.jpg', 'IMG_9301.jpg']),
  'Cream-Red': teeImgs('Cream%20Shirt%20Red%20Embroidery',
    ['IMG_9150.jpg', 'IMG_9153.jpg', 'IMG_9159.jpg', 'IMG_9266.jpg', 'IMG_9269.jpg', 'IMG_9280.jpg', 'IMG_9282.jpg']),
  'Grey-Yellow': teeImgs('Grey%20Shirt%20Yellow%20Embroidery',
    ['IMG_9812.jpg', 'IMG_9813.jpg', 'IMG_9814.jpg', 'IMG_9815.jpg', 'IMG_9816.jpg', 'IMG_9817.jpg', 'IMG_9818.jpg', 'IMG_9820.jpg', 'IMG_9821.jpg', 'IMG_9823.jpg', 'IMG_9900.jpg', 'IMG_9903.jpg', 'IMG_9905.jpg', 'IMG_9911.jpg', 'IMG_9913.jpg', 'IMG_9915.jpg', 'IMG_9916.jpg', 'IMG_9918.jpg', 'IMG_9919.jpg']),
  'Mint Green-Teal': teeImgs('Mint%20Green%20Shirt%20Teal%20Embroidery',
    ['IMG_9789.jpg', 'IMG_9791.jpg', 'IMG_9792.jpg', 'IMG_9793.jpg', 'IMG_9797.jpg', 'IMG_9798.jpg', 'IMG_9800.jpg', 'IMG_9804.jpg', 'IMG_9805.jpg', 'IMG_9866.jpg', 'IMG_9867.jpg', 'IMG_9870.jpg', 'IMG_9872.jpg', 'IMG_9873.jpg', 'IMG_9874.jpg', 'IMG_9875.jpg', 'IMG_9876.jpg', 'IMG_9877.jpg']),
  'Pale Blue-Orange': teeImgs('Pale%20Blue%20Shirt%20Orange%20Embroidery',
    ['IMG_9765.jpg', 'IMG_9768.jpg', 'IMG_9772.jpg', 'IMG_9773.jpg', 'IMG_9778.jpg', 'IMG_9782.jpg', 'IMG_9827.jpg', 'IMG_9829.jpg', 'IMG_9830.jpg', 'IMG_9835.jpg', 'IMG_9841.jpg', 'IMG_9844.jpg']),
  'Grey Sleeveless-Yellow': teeImgs('Grey%20Shirt%20Yellow%20Embroidery%20Sleeveless',
    ['IMG_9846.jpg', 'IMG_9847.jpg', 'IMG_9848.jpg', 'IMG_9849.jpg', 'IMG_9851.jpg', 'IMG_9857.jpg', 'IMG_9858.jpg', 'IMG_9861.jpg', 'IMG_9862.jpg', 'IMG_9864.jpg', 'IMG_9865.jpg']),
  'Pale Blue Sleeveless-Green': teeImgs('Pale%20Blue%20Shirt%20Green%20Embroidery%20Sleeveless',
    ['IMG_9883.jpg', 'IMG_9884.jpg', 'IMG_9885.jpg', 'IMG_9886.jpg', 'IMG_9888.jpg', 'IMG_9889.jpg', 'IMG_9892.jpg', 'IMG_9893.jpg', 'IMG_9895.jpg', 'IMG_9897.jpg', 'IMG_9898.jpg']),
};

export const TEE_SIZES = ['Small', 'Medium', 'Large', 'XL', 'XXL'];

export function teePrice(shirtName: string) {
  return shirtName.includes('Sleeveless') ? 450.0 : 550.0;
}

// ---------------- CAP config (NEW) ----------------
// One size, R200. Two colourways with fixed matched embroidery.
export interface Colorway {
  name: string;       // display, e.g. "White / Black"
  key: string;        // stock/cart key, e.g. "White"
  value: string;      // swatch colour
  border?: boolean;
  embroidery: ColorOption;
  images: string[];
}

export const capColorways: Colorway[] = [
  {
    name: 'White / Black',
    key: 'White',
    value: '#f3f1ea',
    border: true,
    embroidery: { name: 'Blue', value: '#2563EB' },
    images: ['/caps/cap_white_1.jpeg', '/caps/cap_white_2.jpeg'],
  },
  {
    name: 'Black / Black',
    key: 'Black',
    value: '#0c0c0c',
    embroidery: { name: 'Pink', value: '#EC4899' },
    images: ['/caps/cap_black_1.jpeg', '/caps/cap_black_2.jpeg'],
  },
];

export const CAP_PRICE = 150.0;

// ---------------- CROP TOP config (NEW) ----------------
// One size, always available. Two colourways with fixed matched Pink
// embroidery — each carries its own name + price (unlike the cap).
export interface CropTop {
  name: string;        // colourway display, e.g. "White"
  key: string;         // stock/cart key, e.g. "White"
  value: string;       // swatch colour
  border?: boolean;
  productName: string; // heading + cart title, e.g. "Oversized Crop Top"
  price: number;
  embroidery: ColorOption;
  images: string[];
}

function cdnImgs(folder: string, files: string[]) {
  return files.map((f) => `${CDN}/${encodeURIComponent(folder)}/${encodeURIComponent(f)}`);
}

export const CROP_TOP_SIZES = ['XS', 'Small', 'Medium', 'Large'];

export const cropTopColorways: CropTop[] = [
  {
    name: 'White',
    key: 'White',
    value: '#FFFFFF',
    border: true,
    productName: 'Oversized Crop Top',
    price: 450.0,
    embroidery: { name: 'Pink', value: '#EC4899' },
    images: cdnImgs('Crop Top White Pink Embroidery', ['White Pink Front.jpeg', 'White Pink Back.jpeg']),
  },
  {
    name: 'Black',
    key: 'Black',
    value: '#0c0c0c',
    productName: 'Crop Top',
    price: 400.0,
    embroidery: { name: 'Pink', value: '#EC4899' },
    images: cdnImgs('Crop Top Black Pink Embroidery', ['Black Pink Front.jpeg', 'Black Pink Back.jpeg']),
  },
];

// ---------------- FEATURED SHIRTS (Delusional, Persuasive Angel) ----------------
// Single-colourway graphic shirts, tee sizes, unlimited stock. `key` is the
// cart colour, deliberately not a plain colour name so the stock decrement
// (keyed colour-thread) can never match a regular tee's stock row.
export interface FeaturedShirt {
  id: 'delusional' | 'angel';
  tabLabel: string;
  productName: string;
  key: string;
  colorName: string;
  value: string;
  border?: boolean;
  price: number;
  print: ColorOption;
  blurb: string;
  features: string[];
  images: string[];
}

export const featuredShirts: FeaturedShirt[] = [
  {
    id: 'delusional',
    tabLabel: 'Delusional',
    productName: 'Persuasive Delusional',
    key: 'Delusional Black',
    colorName: 'Black',
    value: '#0c0c0c',
    price: 499.0,
    print: { name: 'Pale Blue', value: '#93C5FD' },
    blurb: 'A cut-off black tee with a small stacked PER·SUA·SIVE print on the chest. Quiet on the front, loud in the attitude.',
    features: ['Heavyweight cotton', 'Cut-off sleeves', 'Stacked PER·SUA·SIVE print', 'Relaxed fit', 'Machine washable'],
    images: [1, 2, 3, 4].map((n) => `${CDN}/Persuasive%20Delusional/${n}.jpeg`),
  },
  {
    id: 'angel',
    tabLabel: 'Persuasive Angel',
    productName: 'Persuasive Angel',
    key: 'Angel White',
    colorName: 'White',
    value: '#FFFFFF',
    border: true,
    price: 599.0,
    print: { name: 'Black', value: '#0c0c0c' },
    blurb: 'An oversized white tee carrying a full-back cherub illustration, signed Johannesburg, South Africa.',
    features: ['Heavyweight cotton', 'Oversized fit', 'Full-back cherub graphic', 'Johannesburg print', 'Machine washable'],
    images: [1, 2, 3].map((n) => `${CDN}/Persuasive%20Angel/${n}.jpeg`),
  },
];

export const BRAND_CITY = 'Johannesburg';
