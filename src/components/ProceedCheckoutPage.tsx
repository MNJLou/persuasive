import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { CartItem } from '../App';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

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

  const [isProcessing, setIsProcessing] = useState(false);

  const handlePay = async () => {
  console.log("=== HANDLE PAY CLICKED ===");
  
  // Validate form first
  if (!formData.firstName || !formData.surname || !formData.email || !formData.cellphone) {
    toast.error('Please fill in all required billing details');
    return;
  }

  if (!formData.streetAddress || !formData.suburb || !formData.city || !formData.postcode) {
    toast.error('Please fill in all required delivery address fields');
    return;
  }

  setIsProcessing(true);

  try {
    console.log("Calling API with amount:", Math.round(total * 100));
    
    // Store order data in localStorage for the success page
    const orderData = {
      cartItems,
      formData,
      total,
      subtotal,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('pendingOrder', JSON.stringify(orderData));
    
    const res = await fetch("/api/yoco/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: Math.round(total * 100), // Convert to cents
      }),
    });

    console.log("Response status:", res.status);

    if (!res.ok) {
      const errorData = await res.json();
      console.error("❌ API Error:", errorData);
      toast.error(errorData.error || "Failed to create checkout");
      setIsProcessing(false);
      localStorage.removeItem('pendingOrder');
      return;
    }

    const data = await res.json();
    console.log("✅ Checkout response:", data);

    // Verify we got a valid checkout response
    if (!data.id || !data.redirectUrl) {
      console.error("❌ INVALID CHECKOUT RESPONSE:", data);
      toast.error("Invalid checkout session");
      setIsProcessing(false);
      localStorage.removeItem('pendingOrder');
      return;
    }

    // Redirect to Yoco's hosted checkout page
    console.log("🚀 Redirecting to:", data.redirectUrl);
    window.location.href = data.redirectUrl;
    
  } catch (err) {
    console.error("💥 Checkout error:", err);
    toast.error("Could not start payment: " + (err instanceof Error ? err.message : 'Unknown error'));
    setIsProcessing(false);
    localStorage.removeItem('pendingOrder');
  }
};

  const subtotal = cartItems.reduce((total, item) => total + item.price, 0);
  const total = subtotal;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    if (!formData.firstName || !formData.surname || !formData.email || !formData.cellphone) {
      toast.error('Please fill in all required billing details');
      return;
    }

    if (!formData.streetAddress || !formData.suburb || !formData.city || !formData.postcode) {
      toast.error('Please fill in all required delivery address fields');
      return;
    }

    try {
      setIsProcessing(true);

      // TODO: Implement payment processing with your preferred payment gateway
      toast.info('Payment processing not yet configured. Please implement your payment gateway.');
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error instanceof Error ? error.message : 'An error occurred during checkout');
    } finally {
      setIsProcessing(false);
    }
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
            <div className="flex justify-between font-semibold text-blue-600 mt-2">
              <span>Total</span>
              <span>R{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Shipping Note */}
        <div className="lg:col-span-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> The displayed price does not include shipping costs. Shipping fees will be calculated after your order is confirmed, and payment details will be emailed to you.
          </p>
        </div>

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
            type="button"
            size="lg"
            className="flex-1"
            disabled={isProcessing}
            onClick={handlePay}
          >
            {isProcessing ? 'Processing...' : `Complete Order (R${total.toFixed(2)})`}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={onBack}
            className="flex-1"
            disabled={isProcessing}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
