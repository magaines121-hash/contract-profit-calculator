import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20',
});

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = (req.body && typeof req.body === 'object') ? req.body : {};
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Missing email' });
    }

    // Figure out your site origin (works on Vercel)
    const proto = (req.headers['x-forwarded-proto'] as string) || 'https';
    const host = (req.headers['x-forwarded-host'] as string) || (req.headers['host'] as string);
    const origin = `${proto}://${host}`;

    // Find or create a Stripe customer for this email
    const existing = await stripe.customers.list({ email, limit: 1 });
    const customer = existing.data[0] ?? await stripe.customers.create({ email });

    // Create a billing portal session
    const portal = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: `${origin}/?portal=done`,
    });

    return res.status(200).json({ url: portal.url });
  } catch (e: any) {
    console.error('Stripe portal error:', e);
    return res.status(500).json({ error: e?.message || 'Stripe error' });
  }
}
