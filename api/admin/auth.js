export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.body;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD; // Set this in env vars

  if (password === ADMIN_PASSWORD) {
    return res.status(200).json({ success: true });
  }

  return res.status(401).json({ error: 'Invalid password' });
}