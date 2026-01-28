import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from './ui/button';

interface PaymentSuccessProps {
  onBackToHome: () => void;
  onContinueShopping: () => void;
}

export function PaymentSuccess({ onBackToHome, onContinueShopping }: PaymentSuccessProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');

  useEffect(() => {
    // Get the payment status from URL params
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('status');

    if (paymentStatus === 'success') {
      setStatus('success');
    } else if (paymentStatus === 'cancelled' || paymentStatus === 'failed') {
      setStatus('failed');
    } else {
      // Default to success if no status (Yoco redirects without params by default)
      setStatus('success');
    }
  }, []);

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-4" />
        <p className="text-lg text-gray-600">Processing your payment...</p>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <XCircle className="w-24 h-24 text-red-500 mb-6" />
        <h1 className="text-3xl font-bold mb-4">Payment Failed</h1>
        <p className="text-gray-600 mb-8 text-center max-w-md">
          Your payment was not successful. Please try again or contact support if the problem persists.
        </p>
        <Button onClick={onBackToHome} size="lg">
          Return to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <CheckCircle className="w-24 h-24 text-green-500 mb-6" />
      <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
      <p className="text-gray-600 mb-2 text-center max-w-md">
        Thank you for your order. You will receive a confirmation email shortly.
      </p>
      <p className="text-sm text-gray-500 mb-8">
        Your order is being processed and will be shipped soon.
      </p>
      <Button onClick={onBackToHome} size="lg">
        Return to Home
      </Button>
      <Button onClick={onContinueShopping} size="lg" className="mt-4">
        Continue Shopping
      </Button>
    </div>
  );
}