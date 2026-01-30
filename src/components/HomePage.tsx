import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';
import { useMemo } from 'react';

// Import all hero images
import IMG_9319 from '../Hero_Images/IMG_9319.jpg';
import IMG_9322 from '../Hero_Images/IMG_9322.jpg';
import IMG_9328 from '../Hero_Images/IMG_9328.jpg';
import IMG_9332 from '../Hero_Images/IMG_9332.jpg';
import IMG_9334 from '../Hero_Images/IMG_9334.jpg';
import IMG_9338 from '../Hero_Images/IMG_9338.jpg';
import IMG_9350 from '../Hero_Images/IMG_9350.jpg';
import IMG_9353 from '../Hero_Images/IMG_9353.jpg';
import IMG_9359 from '../Hero_Images/IMG_9359.jpg';
import IMG_9362 from '../Hero_Images/IMG_9362.jpg';
import IMG_9364 from '../Hero_Images/IMG_9364.jpg';
import IMG_9369 from '../Hero_Images/IMG_9369.jpg';
import IMG_9372 from '../Hero_Images/IMG_9372.jpg';
import IMG_9380 from '../Hero_Images/IMG_9380.jpg';
import IMG_9383 from '../Hero_Images/IMG_9383.jpg';
import IMG_9399 from '../Hero_Images/IMG_9399.jpg';
import IMG_9454 from '../Hero_Images/IMG_9454.jpg';
import IMG_9457 from '../Hero_Images/IMG_9457.jpg';
import IMG_9459 from '../Hero_Images/IMG_9459.jpg';
import IMG_9461 from '../Hero_Images/IMG_9461.jpg';
import IMG_9474 from '../Hero_Images/IMG_9474.jpg';

const ALL_IMAGES = [
  IMG_9319, IMG_9322, IMG_9328, IMG_9332, IMG_9334, IMG_9338, IMG_9350,
  IMG_9353, IMG_9359, IMG_9362, IMG_9364, IMG_9369, IMG_9372, IMG_9380,
  IMG_9383, IMG_9399, IMG_9454, IMG_9457, IMG_9459, IMG_9461, IMG_9474,
];

interface HomePageProps {
  onShopNow: () => void;
}

export function HomePage({ onShopNow }: HomePageProps) {
  // Get 4 random images for the grid
  const randomImages = useMemo(() => {
    const shuffled = [...ALL_IMAGES].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 4);
  }, []);
  return (
    <div className="min-h-screen">

      {/* Hero Section with Image Background */}
      <section className="relative h-screen flex items-center justify-center overflow-y-hidden">
        {/* Image Background */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src={ALL_IMAGES[0]}
            alt="Hero background"
            className="w-full h-full object-cover"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl mb-6">Persuasive</h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200">
            Express yourself with premium, customizable apparel
          </p>
          <Button
            onClick={onShopNow}
            size="lg"
            className="bg-white text-black hover:bg-gray-100"
          >
            Shop Now <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <p className="text-2xl md:text-xl py-4 mb-8 text-gray-200">
            <b>Buy 2 and get free shipping</b>
          </p>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1.5 h-3 bg-white rounded-full mt-2" />
          </div>
        </div>
      </section>

      {/* Brand Story Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl mb-6">Your Style, Your Way</h2>
            <p className="text-xl text-gray-600">
              At Persuasive, we believe that great clothing should be as unique as you are. 
              Choose your colors, add your personal touch, and wear something truly yours.
            </p>
          </div>

          {/* Image Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {randomImages.map((image, index) => (
              <div key={index} className="group relative aspect-[3/4] overflow-y-hidden rounded-2xl shadow-lg">
                <img
                  src={image}
                  alt="Custom apparel showcase"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <h3 className="text-2xl mb-3">Fully Customizable</h3>
              <p className="text-gray-600">
                Choose from multiple shirt colors and embroidery options to create your perfect look
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-2xl mb-3">Premium Quality</h3>
              <p className="text-gray-600">
                100% organic cotton ensures comfort, durability, and a perfect fit every time
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl mb-3">Fast Delivery</h3>
              <p className="text-gray-600">
                Your custom creation ships within 3-5 business days, ready to wear
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl mb-6">Ready to Create Your Look?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Start customizing your perfect t-shirt today
          </p>
          <Button
            onClick={onShopNow}
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-100"
          >
            Customize Your Shirt <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>
    </div>
  );
}
