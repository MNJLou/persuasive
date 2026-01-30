// Serverless function to handle stock management
let stockData = [
  // White-Blue
  { color: 'White-Blue', size: 'Small', stock: 0 },
  { color: 'White-Blue', size: 'Medium', stock: 3 },
  { color: 'White-Blue', size: 'Large', stock: 3 },
  { color: 'White-Blue', size: 'XL', stock: 2 },
  { color: 'White-Blue', size: 'XXL', stock: 2 },
  // Black-Pink
  { color: 'Black-Pink', size: 'Small', stock: 0 },
  { color: 'Black-Pink', size: 'Medium', stock: 3 },
  { color: 'Black-Pink', size: 'Large', stock: 3 },
  { color: 'Black-Pink', size: 'XL', stock: 2 },
  { color: 'Black-Pink', size: 'XXL', stock: 2 },
  // Black-Red
  { color: 'Black-Red', size: 'Small', stock: 0 },
  { color: 'Black-Red', size: 'Medium', stock: 3 },
  { color: 'Black-Red', size: 'Large', stock: 3 },
  { color: 'Black-Red', size: 'XL', stock: 2 },
  { color: 'Black-Red', size: 'XXL', stock: 2 },
  // Cream-Red
  { color: 'Cream-Red', size: 'Small', stock: 0 },
  { color: 'Cream-Red', size: 'Medium', stock: 2 },
  { color: 'Cream-Red', size: 'Large', stock: 2 },
  { color: 'Cream-Red', size: 'XL', stock: 1 },
  { color: 'Cream-Red', size: 'XXL', stock: 0 },
  // Grey-Yellow
  { color: 'Grey-Yellow', size: 'Small', stock: 0 },
  { color: 'Grey-Yellow', size: 'Medium', stock: 2 },
  { color: 'Grey-Yellow', size: 'Large', stock: 2 },
  { color: 'Grey-Yellow', size: 'XL', stock: 1 },
  { color: 'Grey-Yellow', size: 'XXL', stock: 0 },
  // Mint Green-Teal
  { color: 'Mint Green-Teal', size: 'Small', stock: 0 },
  { color: 'Mint Green-Teal', size: 'Medium', stock: 2 },
  { color: 'Mint Green-Teal', size: 'Large', stock: 2 },
  { color: 'Mint Green-Teal', size: 'XL', stock: 1 },
  { color: 'Mint Green-Teal', size: 'XXL', stock: 0 },
  // Pale Blue-Orange
  { color: 'Pale Blue-Orange', size: 'Small', stock: 0 },
  { color: 'Pale Blue-Orange', size: 'Medium', stock: 2 },
  { color: 'Pale Blue-Orange', size: 'Large', stock: 2 },
  { color: 'Pale Blue-Orange', size: 'XL', stock: 1 },
  { color: 'Pale Blue-Orange', size: 'XXL', stock: 0 },
];

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    // Return current stock data
    res.status(200).json({ stock: stockData });
  } else if (req.method === 'POST') {
    // Set specific stock amount
    const { color, size, stock } = req.body;
    const existing = stockData.find((s) => s.color === color && s.size === size);
    if (existing) {
      existing.stock = stock;
    } else {
      stockData.push({ color, size, stock });
    }
    res.status(200).json({ success: true });
  } else if (req.method === 'PUT') {
    // Update stock by increment/decrement
    const { color, size, change } = req.body;
    const existing = stockData.find((s) => s.color === color && s.size === size);
    if (existing) {
      existing.stock = Math.max(0, existing.stock + change);
      res.status(200).json({ success: true });
    } else {
      res.status(404).json({ error: 'Stock item not found' });
    }
  } else if (req.method === 'DELETE') {
    // Reduce stock by quantity (for purchases)
    const { color, size, quantity } = req.body;
    const existing = stockData.find((s) => s.color === color && s.size === size);
    if (existing) {
      existing.stock = Math.max(0, existing.stock - quantity);
      res.status(200).json({ success: true });
    } else {
      res.status(404).json({ error: 'Stock item not found' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}