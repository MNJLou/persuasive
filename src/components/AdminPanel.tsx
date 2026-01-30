import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ArrowLeft, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';

interface StockItem {
  color: string;
  size: string;
  stock: number;
}

interface AdminPanelProps {
  onBack: () => void;
}

export function AdminPanel({ onBack }: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [stockData, setStockData] = useState<StockItem[]>([]);

  // Check if already authenticated
  useEffect(() => {
    const auth = sessionStorage.getItem('adminAuth');
    if (auth === 'true') {
      setIsAuthenticated(true);
      loadStockData();
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        sessionStorage.setItem('adminAuth', 'true');
        setIsAuthenticated(true);
        loadStockData();
        toast.success('Logged in successfully');
      } else {
        toast.error('Invalid password');
      }
    } catch (error) {
      toast.error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStockData = async () => {
    try {
      const res = await fetch('/api/admin/stock');
      if (res.ok) {
        const data = await res.json();
        setStockData(data.stock || []);
      }
    } catch (error) {
      console.error('Failed to load stock data:', error);
    }
  };

  const updateStock = async (color: string, size: string, change: number) => {
    try {
      const res = await fetch('/api/admin/stock', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ color, size, change }),
      });

      if (res.ok) {
        loadStockData();
        toast.success('Stock updated');
      } else {
        toast.error('Failed to update stock');
      }
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const setStockAmount = async (color: string, size: string, amount: number) => {
    try {
      const res = await fetch('/api/admin/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ color, size, stock: amount }),
      });

      if (res.ok) {
        loadStockData();
        toast.success('Stock set');
      } else {
        toast.error('Failed to set stock');
      }
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth');
    setIsAuthenticated(false);
    setPassword('');
  };

  // Login Form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={onBack}
            >
              Back to Home
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  const colorCombinations = [
    'White-Blue',
    'Black-Pink',
    'Black-Red',
    'Cream-Red',
    'Grey-Yellow',
    'Mint Green-Teal',
    'Pale Blue-Orange',
  ];
  const sizes = ['Small', 'Medium', 'Large', 'XL', 'XXL'];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </button>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>

        <h1 className="text-3xl font-bold mb-8">Stock Management</h1>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Color</th>
                  <th className="text-left py-3 px-4">Size</th>
                  <th className="text-center py-3 px-4">Stock</th>
                  <th className="text-center py-3 px-4">Actions</th>
                  <th className="text-center py-3 px-4">Set Amount</th>
                </tr>
              </thead>
              <tbody>
                {colorCombinations.map((colorCombo) =>
                  sizes.map((size) => {
                    const item = stockData.find(
                      (s) => s.color === colorCombo && s.size === size
                    );
                    const stock = item?.stock || 0;

                    return (
                      <tr key={`${colorCombo}-${size}`} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{colorCombo}</td>
                        <td className="py-3 px-4">{size}</td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`font-semibold ${
                              stock === 0
                                ? 'text-red-600'
                                : stock < 5
                                ? 'text-yellow-600'
                                : 'text-green-600'
                            }`}
                          >
                            {stock}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateStock(colorCombo, size, -1)}
                              disabled={stock === 0}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateStock(colorCombo, size, 1)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <Input
                              type="number"
                              min="0"
                              className="w-20"
                              placeholder="0"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  const value = parseInt(
                                    (e.target as HTMLInputElement).value
                                  );
                                  if (!isNaN(value)) {
                                    setStockAmount(colorCombo, size, value);
                                    (e.target as HTMLInputElement).value = '';
                                  }
                                }
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}