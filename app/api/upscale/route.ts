import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
// Use require to avoid ESM default export issues with Jimp v0.x/v1.x in Next.js
const Jimp = require('jimp');

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { imageId, imageUrl } = body;

        if (!imageUrl || !imageId) {
            return NextResponse.json({ error: 'Image URL and ID are required' }, { status: 400 });
        }

        console.log(`[Upscale] Starting for ${imageId}...`);

        // 1. Fetch Image
        // Jimp can read directly from URL
        console.log(`[Upscale] Reading image from ${imageUrl}...`);
        const image = await Jimp.read(imageUrl);

        // 2. Upscale with Jimp
        // Target: 4K (roughly 4096px width)
        console.log('[Upscale] Resizing to 4K...');
        image
            .resize(4096, Jimp.AUTO) // Resize width to 4096, maintain aspect ratio
            .quality(90);            // Set high quality

        const upscaledBuffer = await image.getBufferAsync(Jimp.MIME_PNG);

        // 3. Upload to Supabase
        const fileName = `upscales/${session.user.email}/${imageId}-4k-${Date.now()}.png`;

        const { data: uploadData, error: uploadError } = await supabaseAdmin
            .storage
            .from('logos')
            .upload(fileName, upscaledBuffer, {
                contentType: 'image/png',
                upsert: true
            });

        if (uploadError) {
            throw new Error(`Upload failed: ${uploadError.message}`);
        }

        // 4. Get Public URL
        const { data: { publicUrl } } = supabaseAdmin
            .storage
            .from('logos')
            .getPublicUrl(fileName);

        return NextResponse.json({
            success: true,
            upscaledUrl: publicUrl
        });

    } catch (error: any) {
        console.error('UPSCALE ERROR:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
