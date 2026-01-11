import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import potrace from 'potrace';
import Jimp from 'jimp';

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

        console.log(`[Vectorize] Starting for ${imageId}...`);

        // 1. Fetch Image
        const response = await fetch(imageUrl);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 2. Pre-process (Optional but recommended for Potrace)
        // Potrace works best on bitmaps. Jimp can help if we need to resize or threshold.
        // For now, let's feed the buffer directly to potrace (it handles many formats).

        // Wrap potrace in a promise
        const trace = (buf: Buffer): Promise<string> => {
            return new Promise((resolve, reject) => {
                potrace.trace(buf, {
                    color: '#000000', // Basic black trace for now. For color, we'd need multi-pass or Posterize.
                    // Improving quality:
                    threshold: 128,
                    optTolerance: 0.4,
                    turdSize: 100, // Remove speckles
                }, (err, svg) => {
                    if (err) reject(err);
                    else resolve(svg);
                });
            });
        };

        const svgContent = await trace(buffer);
        console.log(`[Vectorize] SVG generated. Length: ${svgContent.length}`);

        // 3. Upload SVG to Supabase
        const fileName = `vectors/${session.user.email}/${imageId}-${Date.now()}.svg`;

        const { data: uploadData, error: uploadError } = await supabaseAdmin
            .storage
            .from('logos')
            .upload(fileName, svgContent, {
                contentType: 'image/svg+xml',
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

        // 5. Update Database (Optional: store vector URL in logos table if column exists)
        // For now just return it.

        return NextResponse.json({
            success: true,
            vectorUrl: publicUrl
        });

    } catch (error: any) {
        console.error('VECTORIZE ERROR:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
