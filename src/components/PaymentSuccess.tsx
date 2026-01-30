import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface OrderData {
  cartItems: Array<{
    shirtColor: string;
    embroideryColor: string;
    size: string;
    price: number;
  }>;
  formData: {
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
  };
  total: number;
  subtotal: number;
}

interface PaymentSuccessProps {
  onBackToHome: () => void;
  onContinueShopping: () => void;
}

export function PaymentSuccess({ onBackToHome, onContinueShopping }: PaymentSuccessProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');

  useEffect(() => {
  const sendOrderEmail = async () => {
    console.log("🔍 PaymentSuccess useEffect triggered");
    
    try {
      // Get the payment status from URL params
      const params = new URLSearchParams(window.location.search);
      const paymentStatus = params.get('payment');
      
      console.log("🔍 Payment status from URL:", paymentStatus);
      console.log("🔍 Full URL:", window.location.href);

      if (paymentStatus === 'success') {
        console.log("✅ Payment status is success");
        setStatus('success');
        
        // Get order data from localStorage
        const orderDataJson = localStorage.getItem('pendingOrder');
        console.log("🔍 Order data from localStorage:", orderDataJson ? "Found" : "Not found");
        
        if (orderDataJson) {
          const orderData: OrderData = JSON.parse(orderDataJson);
          console.log("📦 Order data:", orderData);

          console.log("📧 About to send email to /api/send-email");
          
          // Send confirmation email
          const emailRes = await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: orderData.formData.email,
              firstName: orderData.formData.firstName,
              surname: orderData.formData.surname,
              cellphone: orderData.formData.cellphone,
              streetAddress: orderData.formData.streetAddress,
              apartment: orderData.formData.apartment,
              suburb: orderData.formData.suburb,
              city: orderData.formData.city,
              postcode: orderData.formData.postcode,
              country: orderData.formData.country,
              cartItems: orderData.cartItems,
              total: orderData.total,
              subtotal: orderData.subtotal,
            }),
          });

          console.log("📧 Email API response status:", emailRes.status);
          const emailResponseData = await emailRes.json();
          console.log("📧 Email API response data:", emailResponseData);

          if (emailRes.ok) {
  console.log('✅ Order confirmation email sent');
  toast.success('Order confirmation email sent!');
  
  // Reduce stock for purchased items
  for (const item of orderData.cartItems) {
    const colorCombo = `${item.shirtColor}-${item.embroideryColor}`;
    await fetch('/api/admin/stock', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        color: colorCombo,
        size: item.size,
        quantity: 1,
      }),
    });
  }
} else {
            console.error('❌ Failed to send email:', emailResponseData);
            toast.error('Order successful, but email notification failed');
          }

          // Clear the stored order data
          localStorage.removeItem('pendingOrder');
          console.log("🗑️ Cleared pendingOrder from localStorage");
        } else {
          console.warn("⚠️ No order data found in localStorage");
        }
        
        // NOW clean up the URL after processing
        window.history.replaceState({}, '', window.location.pathname);
        console.log("🧹 Cleaned up URL");
        
      } else if (paymentStatus === 'cancelled' || paymentStatus === 'failed') {
        console.log("❌ Payment was cancelled or failed");
        setStatus('failed');
        window.history.replaceState({}, '', window.location.pathname);
      } else {
        console.log("⚠️ No payment status in URL, defaulting to success");
        setStatus('success');
      }
    } catch (error) {
      console.error('💥 Error processing payment success:', error);
      setStatus('success');
    }
  };

  sendOrderEmail();
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
      <div className="flex gap-4">
        <Button onClick={onBackToHome} size="lg" variant="outline">
          Return to Home
        </Button>
        <Button onClick={onContinueShopping} size="lg">
          Continue Shopping
        </Button>
      </div>
    </div>
  );
}