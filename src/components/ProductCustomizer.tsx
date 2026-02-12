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

const SizeGuide = 'https://images.persuasive.online/Hero%20Images/SizeGuide.jpg';

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
  'White-Blue': [
    'https://images.persuasive.online/White%20Shirt%20Blue%20Embroidery/IMG_9166.jpg',
    'https://images.persuasive.online/White%20Shirt%20Blue%20Embroidery/IMG_9168.jpg',
    'https://images.persuasive.online/White%20Shirt%20Blue%20Embroidery/IMG_9172.jpg',
    'https://images.persuasive.online/White%20Shirt%20Blue%20Embroidery/IMG_9175.jpg',
    'https://images.persuasive.online/White%20Shirt%20Blue%20Embroidery/IMG_9185.jpg',
    'https://images.persuasive.online/White%20Shirt%20Blue%20Embroidery/IMG_9239.jpg',
    'https://images.persuasive.online/White%20Shirt%20Blue%20Embroidery/IMG_9241.jpg',
    'https://images.persuasive.online/White%20Shirt%20Blue%20Embroidery/IMG_9244.jpg',
    'https://images.persuasive.online/White%20Shirt%20Blue%20Embroidery/IMG_9249.jpg',
  ],
  'Black-Pink': [
    'https://images.persuasive.online/Black%20Shirt%20Pink%20Embroidery/IMG_9123.jpg',
    'https://images.persuasive.online/Black%20Shirt%20Pink%20Embroidery/IMG_9125.jpg',
    'https://images.persuasive.online/Black%20Shirt%20Pink%20Embroidery/IMG_9128.jpg',
    'https://images.persuasive.online/Black%20Shirt%20Pink%20Embroidery/IMG_9133.jpg',
    'https://images.persuasive.online/Black%20Shirt%20Pink%20Embroidery/IMG_9217.jpg',
    'https://images.persuasive.online/Black%20Shirt%20Pink%20Embroidery/IMG_9221.jpg',
    'https://images.persuasive.online/Black%20Shirt%20Pink%20Embroidery/IMG_9222.jpg',
    'https://images.persuasive.online/Black%20Shirt%20Pink%20Embroidery/IMG_9224.jpg',
    'https://images.persuasive.online/Black%20Shirt%20Pink%20Embroidery/IMG_9228.jpg',
    'https://images.persuasive.online/Black%20Shirt%20Pink%20Embroidery/IMG_9233.jpg',
  ],
  'Black-Red': [
    'https://images.persuasive.online/Black%20Shirt%20Red%20Embroidery/IMG_9196.jpg',
    'https://images.persuasive.online/Black%20Shirt%20Red%20Embroidery/IMG_9198.jpg',
    'https://images.persuasive.online/Black%20Shirt%20Red%20Embroidery/IMG_9207.jpg',
    'https://images.persuasive.online/Black%20Shirt%20Red%20Embroidery/IMG_9209.jpg',
    'https://images.persuasive.online/Black%20Shirt%20Red%20Embroidery/IMG_9211.jpg',
    'https://images.persuasive.online/Black%20Shirt%20Red%20Embroidery/IMG_9212.jpg',
    'https://images.persuasive.online/Black%20Shirt%20Red%20Embroidery/IMG_9288.jpg',
    'https://images.persuasive.online/Black%20Shirt%20Red%20Embroidery/IMG_9292.jpg',
    'https://images.persuasive.online/Black%20Shirt%20Red%20Embroidery/IMG_9293.jpg',
    'https://images.persuasive.online/Black%20Shirt%20Red%20Embroidery/IMG_9295.jpg',
    'https://images.persuasive.online/Black%20Shirt%20Red%20Embroidery/IMG_9297.jpg',
    'https://images.persuasive.online/Black%20Shirt%20Red%20Embroidery/IMG_9300.jpg',
    'https://images.persuasive.online/Black%20Shirt%20Red%20Embroidery/IMG_9301.jpg',
  ],
  'Cream-Red': [
    'https://images.persuasive.online/Cream%20Shirt%20Red%20Embroidery/IMG_9150.jpg',
    'https://images.persuasive.online/Cream%20Shirt%20Red%20Embroidery/IMG_9153.jpg',
    'https://images.persuasive.online/Cream%20Shirt%20Red%20Embroidery/IMG_9159.jpg',
    'https://images.persuasive.online/Cream%20Shirt%20Red%20Embroidery/IMG_9266.jpg',
    'https://images.persuasive.online/Cream%20Shirt%20Red%20Embroidery/IMG_9269.jpg',
    'https://images.persuasive.online/Cream%20Shirt%20Red%20Embroidery/IMG_9280.jpg',
    'https://images.persuasive.online/Cream%20Shirt%20Red%20Embroidery/IMG_9282.jpg',
  ],
  'Grey-Yellow': [
    'https://images.persuasive.online/Grey%20Shirt%20Yellow%20Embroidery/IMG_9812.jpg',
    'https://images.persuasive.online/Grey%20Shirt%20Yellow%20Embroidery/IMG_9813.jpg',
    'https://images.persuasive.online/Grey%20Shirt%20Yellow%20Embroidery/IMG_9814.jpg',
    'https://images.persuasive.online/Grey%20Shirt%20Yellow%20Embroidery/IMG_9815.jpg',
    'https://images.persuasive.online/Grey%20Shirt%20Yellow%20Embroidery/IMG_9816.jpg',
    'https://images.persuasive.online/Grey%20Shirt%20Yellow%20Embroidery/IMG_9817.jpg',
    'https://images.persuasive.online/Grey%20Shirt%20Yellow%20Embroidery/IMG_9818.jpg',
    'https://images.persuasive.online/Grey%20Shirt%20Yellow%20Embroidery/IMG_9820.jpg',
    'https://images.persuasive.online/Grey%20Shirt%20Yellow%20Embroidery/IMG_9821.jpg',
    'https://images.persuasive.online/Grey%20Shirt%20Yellow%20Embroidery/IMG_9823.jpg',
    'https://images.persuasive.online/Grey%20Shirt%20Yellow%20Embroidery/IMG_9900.jpg',
    'https://images.persuasive.online/Grey%20Shirt%20Yellow%20Embroidery/IMG_9903.jpg',
    'https://images.persuasive.online/Grey%20Shirt%20Yellow%20Embroidery/IMG_9905.jpg',
    'https://images.persuasive.online/Grey%20Shirt%20Yellow%20Embroidery/IMG_9911.jpg',
    'https://images.persuasive.online/Grey%20Shirt%20Yellow%20Embroidery/IMG_9913.jpg',
    'https://images.persuasive.online/Grey%20Shirt%20Yellow%20Embroidery/IMG_9915.jpg',
    'https://images.persuasive.online/Grey%20Shirt%20Yellow%20Embroidery/IMG_9916.jpg',
    'https://images.persuasive.online/Grey%20Shirt%20Yellow%20Embroidery/IMG_9918.jpg',
    'https://images.persuasive.online/Grey%20Shirt%20Yellow%20Embroidery/IMG_9919.jpg',
  ],
  'Mint Green-Teal': [
    'https://images.persuasive.online/Mint%20Green%20Shirt%20Teal%20Embroidery/IMG_9789.jpg',
    'https://images.persuasive.online/Mint%20Green%20Shirt%20Teal%20Embroidery/IMG_9791.jpg',
    'https://images.persuasive.online/Mint%20Green%20Shirt%20Teal%20Embroidery/IMG_9792.jpg',
    'https://images.persuasive.online/Mint%20Green%20Shirt%20Teal%20Embroidery/IMG_9793.jpg',
    'https://images.persuasive.online/Mint%20Green%20Shirt%20Teal%20Embroidery/IMG_9797.jpg',
    'https://images.persuasive.online/Mint%20Green%20Shirt%20Teal%20Embroidery/IMG_9798.jpg',
    'https://images.persuasive.online/Mint%20Green%20Shirt%20Teal%20Embroidery/IMG_9800.jpg',
    'https://images.persuasive.online/Mint%20Green%20Shirt%20Teal%20Embroidery/IMG_9804.jpg',
    'https://images.persuasive.online/Mint%20Green%20Shirt%20Teal%20Embroidery/IMG_9805.jpg',
    'https://images.persuasive.online/Mint%20Green%20Shirt%20Teal%20Embroidery/IMG_9866.jpg',
    'https://images.persuasive.online/Mint%20Green%20Shirt%20Teal%20Embroidery/IMG_9867.jpg',
    'https://images.persuasive.online/Mint%20Green%20Shirt%20Teal%20Embroidery/IMG_9870.jpg',
    'https://images.persuasive.online/Mint%20Green%20Shirt%20Teal%20Embroidery/IMG_9872.jpg',
    'https://images.persuasive.online/Mint%20Green%20Shirt%20Teal%20Embroidery/IMG_9873.jpg',
    'https://images.persuasive.online/Mint%20Green%20Shirt%20Teal%20Embroidery/IMG_9874.jpg',
    'https://images.persuasive.online/Mint%20Green%20Shirt%20Teal%20Embroidery/IMG_9875.jpg',
    'https://images.persuasive.online/Mint%20Green%20Shirt%20Teal%20Embroidery/IMG_9876.jpg',
    'https://images.persuasive.online/Mint%20Green%20Shirt%20Teal%20Embroidery/IMG_9877.jpg',
  ],
  'Pale Blue-Orange': [
    'https://images.persuasive.online/Pale%20Blue%20Shirt%20Orange%20Embroidery/IMG_9765.jpg',
    'https://images.persuasive.online/Pale%20Blue%20Shirt%20Orange%20Embroidery/IMG_9768.jpg',
    'https://images.persuasive.online/Pale%20Blue%20Shirt%20Orange%20Embroidery/IMG_9772.jpg',
    'https://images.persuasive.online/Pale%20Blue%20Shirt%20Orange%20Embroidery/IMG_9773.jpg',
    'https://images.persuasive.online/Pale%20Blue%20Shirt%20Orange%20Embroidery/IMG_9778.jpg',
    'https://images.persuasive.online/Pale%20Blue%20Shirt%20Orange%20Embroidery/IMG_9782.jpg',
    'https://images.persuasive.online/Pale%20Blue%20Shirt%20Orange%20Embroidery/IMG_9827.jpg',
    'https://images.persuasive.online/Pale%20Blue%20Shirt%20Orange%20Embroidery/IMG_9829.jpg',
    'https://images.persuasive.online/Pale%20Blue%20Shirt%20Orange%20Embroidery/IMG_9830.jpg',
    'https://images.persuasive.online/Pale%20Blue%20Shirt%20Orange%20Embroidery/IMG_9835.jpg',
    'https://images.persuasive.online/Pale%20Blue%20Shirt%20Orange%20Embroidery/IMG_9841.jpg',
    'https://images.persuasive.online/Pale%20Blue%20Shirt%20Orange%20Embroidery/IMG_9844.jpg',
  ],
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
