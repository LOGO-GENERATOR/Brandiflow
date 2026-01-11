import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
    try {
        const body = await req.text();
        const signature = (await headers()).get('stripe-signature') as string;

        let event: Stripe.Event;

        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } catch (err: any) {
            console.error(`Webhook signature verification failed.`, err.message);
            return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
        }

        console.log(`[Stripe Webhook] Event received: ${event.type}`);

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            const userId = session.metadata?.userId || session.client_reference_id;
            const planName = session.metadata?.planName || 'PRO';

            if (!userId) {
                console.error('Missing userId in webhook metadata');
                return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
            }

            console.log(`[Payment Success] Upgrading user ${userId} to ${planName}`);

            // Update User Profile
            const { error: updateError } = await supabaseAdmin
                .from('profiles')
                .update({
                    billing_plan: planName,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId);

            if (updateError) {
                console.error('Failed to update profile:', updateError);
                throw new Error('Database update failed');
            }

            // Log Transaction (Optional, creating a 'transactions' table is good practice)
            // For now, we trust the profile update.
        }

        return NextResponse.json({ received: true });

    } catch (error: any) {
        console.error('WEBHOOK ERROR:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
