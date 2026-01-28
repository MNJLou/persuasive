import { CartItem } from '../App';
import { Button } from './ui/button';
import { Trash2 } from 'lucide-react';

interface CheckoutPageProps {
  cartItems: CartItem[];
  onRemoveFromCart: (itemId: string) => void;
  onProceedCheckout: () => void;
}

export function CheckoutPage({ cartItems, onRemoveFromCart, onProceedCheckout }: CheckoutPageProps) {
  const subtotal = cartItems.reduce((total, item) => total + item.price, 0);
  const total = subtotal;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-96 flex flex-col items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Add some shirts to get started!</p>
          <Button asChild>
            <a href="#" onClick={(e) => {
              e.preventDefault();
              window.history.back();
            }}>Continue Shopping</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Your Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="space-y-6">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex gap-6 border rounded-lg p-6 bg-white shadow-sm"
              >
                {/* Product Image */}
                <div className="flex-shrink-0 w-24 h-24">
                  <img
                    src={item.image}
                    alt="Shirt"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>

                {/* Product Details */}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">Premium Cotton Tee</h3>
                  <div className="text-gray-600 space-y-1">
                    <p>
                      <span className="font-medium">Color:</span> {item.shirtColor}
                    </p>
                    <p>
                      <span className="font-medium">Embroidery:</span>{' '}
                      {item.embroideryColor}
                    </p>
                    <p>
                      <span className="font-medium">Size:</span> {item.size}
                    </p>
                    <p className="text-lg font-semibold text-blue-600 mt-3">
                      R{item.price.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Remove Button */}
                <div className="flex-shrink-0 flex items-center">
                  <button
                    onClick={() => onRemoveFromCart(item.id)}
                    className="p-2 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors"
                    aria-label="Remove from cart"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-lg p-6 sticky top-24">
            <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6 pb-6 border-b">
              <div className="flex justify-between">
                <span className="text-gray-600">Items</span>
                <span className="font-medium">{cartItems.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">R{subtotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between mb-6">
              <span className="text-lg font-bold">Total</span>
              <span className="text-xl font-bold text-blue-600">
                R{total.toFixed(2)}
              </span>
            </div>

            <Button className="w-full mb-3" size="lg" onClick={onProceedCheckout}>
              Proceed to Checkout
            </Button>
            <Button variant="outline" className="w-full" size="lg">
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
