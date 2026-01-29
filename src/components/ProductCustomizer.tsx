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

interface ProductCustomizerProps {
  onAddToCart: (item: CartItem) => void;
}

const shirtColors = [
  { name: 'White', value: '#FFFFFF', border: true },
  { name: 'Black', value: '#000000' },
  { name: 'Cream', value: '#F5E6D3' },
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
};

export function ProductCustomizer({ onAddToCart }: ProductCustomizerProps) {
  const [selectedShirtColor, setSelectedShirtColor] = useState(shirtColors[0]);
  const [selectedEmbroideryColor, setSelectedEmbroideryColor] = useState(
    embroideryColorsByShirt['White'][0]
  );
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSizeGuideImage, setSelectedSizeGuideImage] = useState(BlackPink_IMG_9123);
  const [sizeGuideToastId, setSizeGuideToastId] = useState<string | number | null>(null);
  const [selectedSize, setSelectedSize] = useState('Medium');
  const basePrice = 20.00;

  const getAvailableEmbroideryColors = () => {
    return embroideryColorsByShirt[selectedShirtColor.name] || [];
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

  const SizeGuideToast = ({ toastId }: { toastId: string | number }) => (
    <div className="bg-white rounded-lg shadow-lg max-w-md mr-2 relative">
      <button
        onClick={() => toast.dismiss(toastId)}
        className="absolute top-2 bg-white -right-1 mr-2 p-1 rounded-full shadow-md"
        aria-label="Close"
      >
        <X className="w-8 h-8" />
      </button>
      <img
        src={selectedSizeGuideImage}
        alt="Size Guide"
        className="w-full h-auto rounded-lg"
      />
      <Button variant="secondary"
              className="mt-4 p-2 gap-2"
              onClick={() => setSelectedSizeGuideImage(BlackPink_IMG_9123)}>
        Small
      </Button>
      <Button variant="secondary"
              className="mt-4 p-2 gap-2"
              onClick={() => setSelectedSizeGuideImage(BlackPink_IMG_9125)}>
        Medium
      </Button>
      <Button variant="secondary"
              className="mt-4 p-2 gap-2"
              onClick={() => setSelectedSizeGuideImage(BlackPink_IMG_9128)}>
        Large
      </Button>
    </div>
  );

  const handleSizeGuide = () => {
    const toastId = toast.custom((t) => <SizeGuideToast toastId={t} />, {
      duration: Infinity,
    });
    setSizeGuideToastId(toastId);
  };

  // Update the toast when the size guide image changes
  useEffect(() => {
    if (sizeGuideToastId !== null) {
      toast.dismiss(sizeGuideToastId);
      const toastId = toast.custom((t) => <SizeGuideToast toastId={t} />, {
        duration: Infinity,
      });
      setSizeGuideToastId(toastId);
    }
  }, [selectedSizeGuideImage]);

  // Auto-cycle images every 3 seconds for the current variant
  useEffect(() => {
    const images = getCurrentImages();
    if (!images || images.length <= 1) return;
    const id = setInterval(() => {
      setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, 3000);
    return () => clearInterval(id);
  }, [selectedShirtColor.name, selectedEmbroideryColor.name]);

  return (
    <>
      <Toaster />
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
            <p className="text-2xl text-blue-600 mb-6">R{basePrice.toFixed(2)}</p>
            
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
                    <SelectItem value="Small">Small</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Large">Large</SelectItem>
                    <SelectItem value="XL">XL</SelectItem>
                    <SelectItem value="XXL">XXL</SelectItem>
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
            </div>

            {/* Product Features */}
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
          >
            Add to Cart - R{basePrice.toFixed(2)}
          </Button>
        </div>
      </div>
    </>
  );
}
