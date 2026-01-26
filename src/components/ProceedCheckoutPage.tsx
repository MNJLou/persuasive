import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { CartItem } from '../App';
import { ArrowLeft } from 'lucide-react';

interface ProceedCheckoutPageProps {
  cartItems: CartItem[];
  onBack: () => void;
}

interface FormData {
  firstName: string;
  surname: string;
  email: string;
  cellphone: string;
  country: string;
  streetAddress: string;
  apartment: string;
  suburb: string;
  city: string;
  postcode: string;
}

export function ProceedCheckoutPage({ cartItems, onBack }: ProceedCheckoutPageProps) {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    surname: '',
    email: '',
    cellphone: '',
    country: '',
    streetAddress: '',
    apartment: '',
    suburb: '',
    city: '',
    postcode: '',
  });

  const subtotal = cartItems.reduce((total, item) => total + item.price, 0);
  const taxRate = 0.15;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
  };

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Cart</span>
      </button>

      {/* Order Summary Box */}
      <div className="border border-gray-300 rounded-lg p-4 mb-8 bg-white">
        <h3 className="font-semibold text-lg mb-3">Order Summary</h3>
        <div className="space-y-2">
          {cartItems.map((item) => (
            <div key={item.id} className="flex justify-between text-sm text-gray-700">
              <span>
                {item.shirtColor} shirt with {item.embroideryColor} embroidery ({item.size})
              </span>
              <span>R{item.price.toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t border-gray-200 pt-2 mt-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>R{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax (15%)</span>
              <span>R{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-blue-600 mt-2">
              <span>Total</span>
              <span>R{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Billing Details Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Billing Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <Input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="John"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Surname
              </label>
              <Input
                type="text"
                name="surname"
                value={formData.surname}
                onChange={handleInputChange}
                placeholder="Doe"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="john@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cell Phone Number
              </label>
              <Input
                type="tel"
                name="cellphone"
                value={formData.cellphone}
                onChange={handleInputChange}
                placeholder="+27 12 345 6789"
                required
              />
            </div>
          </div>
        </div>

        {/* Address Details Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Delivery Address</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country / Region
              </label>
              <select
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a country</option>
                <option value="South Africa">South Africa</option>
                <option value="Namibia">Namibia</option>
                <option value="Botswana">Botswana</option>
                <option value="Zimbabwe">Zimbabwe</option>
                <option value="Lesotho">Lesotho</option>
                <option value="Eswatini">Eswatini</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address
              </label>
              <Input
                type="text"
                name="streetAddress"
                value={formData.streetAddress}
                onChange={handleInputChange}
                placeholder="123 Main Street"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apartment, Suite, Etc. (Optional)
              </label>
              <Input
                type="text"
                name="apartment"
                value={formData.apartment}
                onChange={handleInputChange}
                placeholder="Apt. 4B"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Suburb
              </label>
              <Input
                type="text"
                name="suburb"
                value={formData.suburb}
                onChange={handleInputChange}
                placeholder="Suburb name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Town / City
              </label>
              <Input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Johannesburg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Post Code
              </label>
              <Input
                type="text"
                name="postcode"
                value={formData.postcode}
                onChange={handleInputChange}
                placeholder="2000"
                required
              />
            </div>
          </div>
        </div>

        {/* Full Width Submit Button */}
        <div className="lg:col-span-2 flex gap-4 pt-4">
          <Button
            type="submit"
            size="lg"
            className="flex-1"
          >
            Complete Order
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={onBack}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
