import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from './ui/sonner';
import { CartItem } from '../App';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

// Import Black + Pink Embroidery
import BlackPink_IMG_9123 from '../Shirt_Black_Pink_Embroidery/IMG_9123.jpg';
import BlackPink_IMG_9125 from '../Shirt_Black_Pink_Embroidery/IMG_9125.jpg';
import BlackPink_IMG_9128 from '../Shirt_Black_Pink_Embroidery/IMG_9128.jpg';
import BlackPink_IMG_9133 from '../Shirt_Black_Pink_Embroidery/IMG_9133.jpg';
import BlackPink_IMG_9217 from '../Shirt_Black_Pink_Embroidery/IMG_9217.jpg';
import BlackPink_IMG_9221 from '../Shirt_Black_Pink_Embroidery/IMG_9221.jpg';
import BlackPink_IMG_9222 from '../Shirt_Black_Pink_Embroidery/IMG_9222.jpg';
import BlackPink_IMG_9224 from '../Shirt_Black_Pink_Embroidery/IMG_9224.jpg';
import BlackPink_IMG_9228 from '../Shirt_Black_Pink_Embroidery/IMG_9228.jpg';
import BlackPink_IMG_9233 from '../Shirt_Black_Pink_Embroidery/IMG_9233.jpg';

// Import Black + Red Embroidery
import BlackRed_IMG_9196 from '../Shirt_Black_Red_Embroidery/IMG_9196.jpg';
import BlackRed_IMG_9198 from '../Shirt_Black_Red_Embroidery/IMG_9198.jpg';
import BlackRed_IMG_9207 from '../Shirt_Black_Red_Embroidery/IMG_9207.jpg';
import BlackRed_IMG_9209 from '../Shirt_Black_Red_Embroidery/IMG_9209.jpg';
import BlackRed_IMG_9211 from '../Shirt_Black_Red_Embroidery/IMG_9211.jpg';
import BlackRed_IMG_9212 from '../Shirt_Black_Red_Embroidery/IMG_9212.jpg';
import BlackRed_IMG_9288 from '../Shirt_Black_Red_Embroidery/IMG_9288.jpg';
import BlackRed_IMG_9292 from '../Shirt_Black_Red_Embroidery/IMG_9292.jpg';
import BlackRed_IMG_9293 from '../Shirt_Black_Red_Embroidery/IMG_9293.jpg';
import BlackRed_IMG_9295 from '../Shirt_Black_Red_Embroidery/IMG_9295.jpg';
import BlackRed_IMG_9297 from '../Shirt_Black_Red_Embroidery/IMG_9297.jpg';
import BlackRed_IMG_9300 from '../Shirt_Black_Red_Embroidery/IMG_9300.jpg';
import BlackRed_IMG_9301 from '../Shirt_Black_Red_Embroidery/IMG_9301.jpg';

// Import Cream + Red Embroidery
import CreamRed_IMG_9150 from '../Shirt_Cream_Red_Embroidery/IMG_9150.jpg';
import CreamRed_IMG_9153 from '../Shirt_Cream_Red_Embroidery/IMG_9153.jpg';
import CreamRed_IMG_9159 from '../Shirt_Cream_Red_Embroidery/IMG_9159.jpg';
import CreamRed_IMG_9266 from '../Shirt_Cream_Red_Embroidery/IMG_9266.jpg';
import CreamRed_IMG_9269 from '../Shirt_Cream_Red_Embroidery/IMG_9269.jpg';
import CreamRed_IMG_9280 from '../Shirt_Cream_Red_Embroidery/IMG_9280.jpg';
import CreamRed_IMG_9282 from '../Shirt_Cream_Red_Embroidery/IMG_9282.jpg';

// Import White + Blue Embroidery
import WhiteBlue_IMG_9166 from '../Shirt_White_Blue_Embroidery/IMG_9166.jpg';
import WhiteBlue_IMG_9168 from '../Shirt_White_Blue_Embroidery/IMG_9168.jpg';
import WhiteBlue_IMG_9172 from '../Shirt_White_Blue_Embroidery/IMG_9172.jpg';
import WhiteBlue_IMG_9175 from '../Shirt_White_Blue_Embroidery/IMG_9175.jpg';
import WhiteBlue_IMG_9185 from '../Shirt_White_Blue_Embroidery/IMG_9185.jpg';
import WhiteBlue_IMG_9239 from '../Shirt_White_Blue_Embroidery/IMG_9239.jpg';
import WhiteBlue_IMG_9241 from '../Shirt_White_Blue_Embroidery/IMG_9241.jpg';
import WhiteBlue_IMG_9244 from '../Shirt_White_Blue_Embroidery/IMG_9244.jpg';
import WhiteBlue_IMG_9249 from '../Shirt_White_Blue_Embroidery/IMG_9249.jpg';

// Import Grey + Yellow Embroidery
import GreyYellow_IMG_9812 from '../Grey Shirt Yellow Embroidery/IMG_9812.jpg';
import GreyYellow_IMG_9813 from '../Grey Shirt Yellow Embroidery/IMG_9813.jpg';
import GreyYellow_IMG_9814 from '../Grey Shirt Yellow Embroidery/IMG_9814.jpg';
import GreyYellow_IMG_9815 from '../Grey Shirt Yellow Embroidery/IMG_9815.jpg';
import GreyYellow_IMG_9816 from '../Grey Shirt Yellow Embroidery/IMG_9816.jpg';
import GreyYellow_IMG_9817 from '../Grey Shirt Yellow Embroidery/IMG_9817.jpg';
import GreyYellow_IMG_9818 from '../Grey Shirt Yellow Embroidery/IMG_9818.jpg';
import GreyYellow_IMG_9820 from '../Grey Shirt Yellow Embroidery/IMG_9820.jpg';
import GreyYellow_IMG_9821 from '../Grey Shirt Yellow Embroidery/IMG_9821.jpg';
import GreyYellow_IMG_9823 from '../Grey Shirt Yellow Embroidery/IMG_9823.jpg';
import GreyYellow_IMG_9900 from '../Grey Shirt Yellow Embroidery/IMG_9900.jpg';
import GreyYellow_IMG_9903 from '../Grey Shirt Yellow Embroidery/IMG_9903.jpg';
import GreyYellow_IMG_9905 from '../Grey Shirt Yellow Embroidery/IMG_9905.jpg';
import GreyYellow_IMG_9911 from '../Grey Shirt Yellow Embroidery/IMG_9911.jpg';
import GreyYellow_IMG_9913 from '../Grey Shirt Yellow Embroidery/IMG_9913.jpg';
import GreyYellow_IMG_9915 from '../Grey Shirt Yellow Embroidery/IMG_9915.jpg';
import GreyYellow_IMG_9916 from '../Grey Shirt Yellow Embroidery/IMG_9916.jpg';
import GreyYellow_IMG_9918 from '../Grey Shirt Yellow Embroidery/IMG_9918.jpg';
import GreyYellow_IMG_9919 from '../Grey Shirt Yellow Embroidery/IMG_9919.jpg';

// Import Mint Green + Teal Embroidery
import MintGreenTeal_IMG_9789 from '../Mint Green Shirt Teal Embroidery/IMG_9789.jpg';
import MintGreenTeal_IMG_9791 from '../Mint Green Shirt Teal Embroidery/IMG_9791.jpg';
import MintGreenTeal_IMG_9792 from '../Mint Green Shirt Teal Embroidery/IMG_9792.jpg';
import MintGreenTeal_IMG_9793 from '../Mint Green Shirt Teal Embroidery/IMG_9793.jpg';
import MintGreenTeal_IMG_9797 from '../Mint Green Shirt Teal Embroidery/IMG_9797.jpg';
import MintGreenTeal_IMG_9798 from '../Mint Green Shirt Teal Embroidery/IMG_9798.jpg';
import MintGreenTeal_IMG_9800 from '../Mint Green Shirt Teal Embroidery/IMG_9800.jpg';
import MintGreenTeal_IMG_9804 from '../Mint Green Shirt Teal Embroidery/IMG_9804.jpg';
import MintGreenTeal_IMG_9805 from '../Mint Green Shirt Teal Embroidery/IMG_9805.jpg';
import MintGreenTeal_IMG_9866 from '../Mint Green Shirt Teal Embroidery/IMG_9866.jpg';
import MintGreenTeal_IMG_9867 from '../Mint Green Shirt Teal Embroidery/IMG_9867.jpg';
import MintGreenTeal_IMG_9870 from '../Mint Green Shirt Teal Embroidery/IMG_9870.jpg';
import MintGreenTeal_IMG_9872 from '../Mint Green Shirt Teal Embroidery/IMG_9872.jpg';
import MintGreenTeal_IMG_9873 from '../Mint Green Shirt Teal Embroidery/IMG_9873.jpg';
import MintGreenTeal_IMG_9874 from '../Mint Green Shirt Teal Embroidery/IMG_9874.jpg';
import MintGreenTeal_IMG_9875 from '../Mint Green Shirt Teal Embroidery/IMG_9875.jpg';
import MintGreenTeal_IMG_9876 from '../Mint Green Shirt Teal Embroidery/IMG_9876.jpg';
import MintGreenTeal_IMG_9877 from '../Mint Green Shirt Teal Embroidery/IMG_9877.jpg';

// Import Pale Blue + Orange Embroidery
import PaleBlueOrange_IMG_9765 from '../Pale Blue Shirt Orange Embroidery/IMG_9765.jpg';
import PaleBlueOrange_IMG_9768 from '../Pale Blue Shirt Orange Embroidery/IMG_9768.jpg';
import PaleBlueOrange_IMG_9772 from '../Pale Blue Shirt Orange Embroidery/IMG_9772.jpg';
import PaleBlueOrange_IMG_9773 from '../Pale Blue Shirt Orange Embroidery/IMG_9773.jpg';
import PaleBlueOrange_IMG_9778 from '../Pale Blue Shirt Orange Embroidery/IMG_9778.jpg';
import PaleBlueOrange_IMG_9782 from '../Pale Blue Shirt Orange Embroidery/IMG_9782.jpg';
import PaleBlueOrange_IMG_9827 from '../Pale Blue Shirt Orange Embroidery/IMG_9827.jpg';
import PaleBlueOrange_IMG_9829 from '../Pale Blue Shirt Orange Embroidery/IMG_9829.jpg';
import PaleBlueOrange_IMG_9830 from '../Pale Blue Shirt Orange Embroidery/IMG_9830.jpg';
import PaleBlueOrange_IMG_9835 from '../Pale Blue Shirt Orange Embroidery/IMG_9835.jpg';
import PaleBlueOrange_IMG_9841 from '../Pale Blue Shirt Orange Embroidery/IMG_9841.jpg';
import PaleBlueOrange_IMG_9844 from '../Pale Blue Shirt Orange Embroidery/IMG_9844.jpg';

import SizeGuide from '../Hero_Images/SizeGuide.jpg';

interface ProductCustomizerProps {
  onAddToCart: (item: CartItem) => void;
}

const shirtColors = [
  { name: 'White', value: '#FFFFFF', border: true },
  { name: 'Black', value: '#000000' },
  { name: 'Cream', value: '#F5E6D3' },
  { name: 'Grey', value: '#9CA3AF' },
  { name: 'Mint Green', value: '#A7F3D0' },
  { name: 'Pale Blue', value: '#BAE6FD' },
];

const embroideryColorsByShirt: { [key: string]: typeof embroideryColors } = {
  'White': [
    { name: 'Blue', value: '#2563EB' },
  ],
  'Black': [
    { name: 'Pink', value: '#EC4899' },
    { name: 'Red', value: '#DC2626' },
  ],
  'Cream': [
    { name: 'Red', value: '#DC2626' },
  ],
  'Grey': [
    { name: 'Yellow', value: '#EAB308' },
  ],
  'Mint Green': [
    { name: 'Teal', value: '#14B8A6' },
  ],
  'Pale Blue': [
    { name: 'Orange', value: '#FB923C' },
  ],
};

const embroideryColors = [
  { name: 'Black', value: '#000000' },
  { name: 'White', value: '#FFFFFF', border: true },
  { name: 'Gold', value: '#D97706' },
  { name: 'Red', value: '#DC2626' },
  { name: 'Royal Blue', value: '#2563EB' },
  { name: 'Silver', value: '#9CA3AF' },
];

// Image mappings by shirt and embroidery color combination
const shirtImagesByVariant: { [key: string]: string[] } = {
  'White-Blue': [WhiteBlue_IMG_9166, WhiteBlue_IMG_9168, WhiteBlue_IMG_9172, WhiteBlue_IMG_9175, WhiteBlue_IMG_9185, WhiteBlue_IMG_9239, WhiteBlue_IMG_9241, WhiteBlue_IMG_9244, WhiteBlue_IMG_9249],
  'Black-Pink': [BlackPink_IMG_9123, BlackPink_IMG_9125, BlackPink_IMG_9128, BlackPink_IMG_9133, BlackPink_IMG_9217, BlackPink_IMG_9221, BlackPink_IMG_9222, BlackPink_IMG_9224, BlackPink_IMG_9228, BlackPink_IMG_9233],
  'Black-Red': [BlackRed_IMG_9196, BlackRed_IMG_9198, BlackRed_IMG_9207, BlackRed_IMG_9209, BlackRed_IMG_9211, BlackRed_IMG_9212, BlackRed_IMG_9288, BlackRed_IMG_9292, BlackRed_IMG_9293, BlackRed_IMG_9295, BlackRed_IMG_9297, BlackRed_IMG_9300, BlackRed_IMG_9301],
  'Cream-Red': [CreamRed_IMG_9150, CreamRed_IMG_9153, CreamRed_IMG_9159, CreamRed_IMG_9266, CreamRed_IMG_9269, CreamRed_IMG_9280, CreamRed_IMG_9282],
  'Grey-Yellow': [GreyYellow_IMG_9812, GreyYellow_IMG_9813, GreyYellow_IMG_9814, GreyYellow_IMG_9815, GreyYellow_IMG_9816, GreyYellow_IMG_9817, GreyYellow_IMG_9818, GreyYellow_IMG_9820, GreyYellow_IMG_9821, GreyYellow_IMG_9823, GreyYellow_IMG_9900, GreyYellow_IMG_9903, GreyYellow_IMG_9905, GreyYellow_IMG_9911, GreyYellow_IMG_9913, GreyYellow_IMG_9915, GreyYellow_IMG_9916, GreyYellow_IMG_9918, GreyYellow_IMG_9919],
  'Mint Green-Teal': [MintGreenTeal_IMG_9789, MintGreenTeal_IMG_9791, MintGreenTeal_IMG_9792, MintGreenTeal_IMG_9793, MintGreenTeal_IMG_9797, MintGreenTeal_IMG_9798, MintGreenTeal_IMG_9800, MintGreenTeal_IMG_9804, MintGreenTeal_IMG_9805, MintGreenTeal_IMG_9866, MintGreenTeal_IMG_9867, MintGreenTeal_IMG_9870, MintGreenTeal_IMG_9872, MintGreenTeal_IMG_9873, MintGreenTeal_IMG_9874, MintGreenTeal_IMG_9875, MintGreenTeal_IMG_9876, MintGreenTeal_IMG_9877],
  'Pale Blue-Orange': [PaleBlueOrange_IMG_9765, PaleBlueOrange_IMG_9768, PaleBlueOrange_IMG_9772, PaleBlueOrange_IMG_9773, PaleBlueOrange_IMG_9778, PaleBlueOrange_IMG_9782, PaleBlueOrange_IMG_9827, PaleBlueOrange_IMG_9829, PaleBlueOrange_IMG_9830, PaleBlueOrange_IMG_9835, PaleBlueOrange_IMG_9841, PaleBlueOrange_IMG_9844],
};

// Stock count: shirt-embroidery-size combination
const stockCounts: { [key: string]: number } = {
  'White-Blue-Small': 5,
  'White-Blue-Medium': 8,
  'White-Blue-Large': 6,
  'White-Blue-XL': 3,
  'White-Blue-XXL': 0,
  'Black-Pink-Small': 4,
  'Black-Pink-Medium': 7,
  'Black-Pink-Large': 5,
  'Black-Pink-XL': 2,
  'Black-Pink-XXL': 1,
  'Black-Red-Small': 6,
  'Black-Red-Medium': 9,
  'Black-Red-Large': 4,
  'Black-Red-XL': 0,
  'Black-Red-XXL': 2,
  'Cream-Red-Small': 3,
  'Cream-Red-Medium': 5,
  'Cream-Red-Large': 7,
  'Cream-Red-XL': 4,
  'Cream-Red-XXL': 0,
  'Grey-Yellow-Small': 8,
  'Grey-Yellow-Medium': 10,
  'Grey-Yellow-Large': 6,
  'Grey-Yellow-XL': 3,
  'Grey-Yellow-XXL': 1,
  'Mint Green-Teal-Small': 5,
  'Mint Green-Teal-Medium': 6,
  'Mint Green-Teal-Large': 4,
  'Mint Green-Teal-XL': 2,
  'Mint Green-Teal-XXL': 0,
  'Pale Blue-Orange-Small': 7,
  'Pale Blue-Orange-Medium': 8,
  'Pale Blue-Orange-Large': 5,
  'Pale Blue-Orange-XL': 1,
  'Pale Blue-Orange-XXL': 3,
};

export function ProductCustomizer({ onAddToCart }: ProductCustomizerProps) {
  const [selectedShirtColor, setSelectedShirtColor] = useState(shirtColors[0]);
  const [selectedEmbroideryColor, setSelectedEmbroideryColor] = useState(
    embroideryColorsByShirt['White'][0]
  );
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [selectedSize, setSelectedSize] = useState('Medium');
  const [stockData, setStockData] = useState<{ color: string; size: string; stock: number }[]>([]);
  const basePrice = 550.00;

  
  // Load stock data on mount
  useEffect(() => {
    loadStock();
  }, []);

  const loadStock = async () => {
    try {
      const res = await fetch('/api/admin/stock');
      if (res.ok) {
        const data = await res.json();
        setStockData(data.stock || []);
      }
    } catch (error) {
      console.error('Failed to load stock:', error);
      // Fallback to showing all items as available if API fails
    }
  };

  const getStockKey = (size: string) => {
    return `${selectedShirtColor.name}-${selectedEmbroideryColor.name}-${size}`;
  };

  const getStock = (size: string) => {
    // Find stock for this specific combination
    const stockItem = stockData.find(
      item => 
        item.color === `${selectedShirtColor.name}-${selectedEmbroideryColor.name}` && 
        item.size === size
    );
    return stockItem?.stock ?? 999; // Return 999 if not found (unlimited stock)
  };

  const isOutOfStock = (size: string) => {
    const stock = getStock(size);
    return stock === 0;
  };


  const getVariantKey = () => {
    return `${selectedShirtColor.name}-${selectedEmbroideryColor.name}`;
  };

  const getCurrentImages = () => {
    return shirtImagesByVariant[getVariantKey()] || [];
  };

  const getCurrentImage = () => {
    const images = getCurrentImages();
    return images[selectedImageIndex] || images[0];
  };

  const getAvailableEmbroideryColors = () => {
    return embroideryColorsByShirt[selectedShirtColor.name] || [];
  };


  const handleShirtColorChange = (color: typeof shirtColors[0]) => {
    setSelectedShirtColor(color);
    setSelectedImageIndex(0);
    // Reset embroidery color to first available for new shirt color
    const availableColors = embroideryColorsByShirt[color.name];
    if (availableColors && availableColors.length > 0) {
      setSelectedEmbroideryColor(availableColors[0]);
    }
  };

  const handleEmbroideryColorChange = (color: typeof embroideryColors[0]) => {
    setSelectedEmbroideryColor(color);
    setSelectedImageIndex(0);
  };

  const handleSizeGuide = () => {
    setShowSizeGuide(!showSizeGuide);
  };

  const handleAddToCart = () => {
    const cartItem: CartItem = {
      id: '',
      shirtColor: selectedShirtColor.name,
      embroideryColor: selectedEmbroideryColor.name,
      size: selectedSize,
      price: basePrice,
      image: getCurrentImage(),
    };
    onAddToCart(cartItem);
    toast.success('Added to cart!', {
      description: `${selectedShirtColor.name} shirt with ${selectedEmbroideryColor.name} embroidery`,
    });
  };



  return (
    <>
      <Toaster />
      
      {/* Size Guide Modal */}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Image */}
        <div className="order-1">
          <div className="relative group">
            <div 
              className="aspect-square rounded-2xl overflow-hidden shadow-lg transition-colors duration-300"
              style={{ backgroundColor: selectedShirtColor.value }}
            >
              <img
                src={getCurrentImage()}
                alt="Premium Cotton T-Shirt"
                className="w-full h-full object-cover"
              />
              
              {/* (Arrows removed) images will auto-cycle every 3 seconds */}
            </div>
          </div>
          
          {/* Thumbnail Gallery */}
          <div className="relative py-2 w-full overflow-hidden">
            <div className="flex gap-2 overflow-x-auto scroll-smooth max-w-full">
              {getCurrentImages().map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Shirt variant ${index + 1}`}
                  className="w-20 h-20 flex-shrink-0 rounded-2xl object-cover cursor-pointer"
                  onClick={() => setSelectedImageIndex(index)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="order-2 flex flex-col">
          <div className="flex-1">
            <h2 className="text-3xl lg:text-4xl mb-2">Premium Cotton Tee</h2>
            <p className="text-2xl text-blue-600 mb-2">R{basePrice.toFixed(2)}</p>
            <b className="text text-green-600 font-semibold mb-6 "> Buy 2 shirts & get FREE shipping!</b>
            
            <p className="text-gray-600 mb-8">
              Crafted from 100% organic cotton, this premium t-shirt offers unparalleled comfort and durability. 
              Customize it with your choice of shirt color and embroidery color to make it uniquely yours.
            </p>

            {/* Shirt Color Selection */}
            <div className="mb-8">
              <label className="block mb-3">
                Shirt Color: <span className="text-gray-900">{selectedShirtColor.name}</span>
              </label>
              <div className="flex flex-wrap gap-3">
                {shirtColors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => handleShirtColorChange(color)}
                    className={`relative w-12 h-12 rounded-full transition-all ${
                      color.border ? 'border-2 border-gray-300' : ''
                    } ${
                      selectedShirtColor.name === color.name
                        ? 'ring-2 ring-blue-600 ring-offset-2 scale-110'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                    aria-label={`Select ${color.name}`}
                  >
                    {selectedShirtColor.name === color.name && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Check
                          className="w-5 h-5"
                          style={{
                            color: color.name === 'White' ? '#000000' : '#FFFFFF',
                          }}
                        />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Embroidery Color Selection */}
            <div className="mb-8">
              <label className="block mb-3">
                Embroidery Color: <span className="text-gray-900">{selectedEmbroideryColor.name}</span>
              </label>
              <div className="flex flex-wrap gap-3">
                {getAvailableEmbroideryColors().map((color: typeof embroideryColors[0]) => (
                  <button
                    key={color.name}
                    onClick={() => handleEmbroideryColorChange(color)}
                    className={`relative w-12 h-12 rounded-full transition-all ${
                      color.border ? 'border-2 border-gray-300' : ''
                    } ${
                      selectedEmbroideryColor.name === color.name
                        ? 'ring-2 ring-blue-600 ring-offset-2 scale-110'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                    aria-label={`Select ${color.name} embroidery`}
                  >
                    {selectedEmbroideryColor.name === color.name && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Check
                          className="w-5 h-5"
                          style={{
                            color: color.name === 'White' ? '#000000' : '#FFFFFF',
                          }}
                        />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Size Selection Dropdown */}
              <div className="mt-6 mb-4 py-4">
                <label className="block mb-2 font-medium">Size: <span className="text-gray-900">{selectedSize}</span></label>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Select a size" />
                  </SelectTrigger>
                  <SelectContent>
                    {['Small', 'Medium', 'Large', 'XL', 'XXL'].map((size) => {
                      const stock = getStock(size);
                      const outOfStock = isOutOfStock(size);
                      return (
                        <SelectItem key={size} value={size} disabled={outOfStock}>
                          <span className={outOfStock ? 'line-through' : ''}>
                            {size}
                          </span>
                          <span className="ml-2 text-gray-600">
                            ({stock} in stock)
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleSizeGuide}
                variant="secondary"
                className="mt-4 p-2 pr-4 gap-2"
              >
                Size Guide
              </Button>
              {showSizeGuide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full relative">
            <img
              src={SizeGuide}
              alt="Size Guide"
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      )}
            </div>
            <div className="mb-8 p-4 bg-gray-100 rounded-lg">
              <h3 className="mb-3">Product Features</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• 100% organic cotton</li>
                <li>• Custom embroidery available</li>
                <li>• Pre-shrunk fabric</li>
                <li>• Unisex fit</li>
                <li>• Machine washable</li>
              </ul>
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            size="lg"
            className="w-full"
            disabled={isOutOfStock(selectedSize)}
          >
            {isOutOfStock(selectedSize) ? 'Out of Stock' : `Add to Cart - R${basePrice.toFixed(2)}`}
          </Button>
        </div>
      </div>
    </>
  );
}
