import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { priceId, planName } = body; // e.g., 'price_H5ggY...', 'PRO'

        if (!priceId) {
            return NextResponse.json({ error: 'Price ID is required' }, { status: 400 });
        }

        // Create Checkout Session
        const checkoutSession = await stripe.checkout.sessions.create({
            mode: 'subscription', // or 'payment' for one-time credits
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${process.env.NEXTAUTH_URL}/dashboard?payment=success`,
            cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/billing?payment=cancelled`,
            client_reference_id: (session.user as any).id, // Pass User ID to webhook
            metadata: {
                userId: (session.user as any).id,
                email: session.user.email,
                planName: planName || 'PRO'
            },
            customer_email: session.user.email,
        });

        return NextResponse.json({ sessionId: checkoutSession.id, url: checkoutSession.url });

    } catch (error: any) {
        console.error('STRIPE CHECKOUT ERROR:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
