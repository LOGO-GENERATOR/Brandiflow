import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { removeBackground } from '@imgly/background-removal-node';

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

        console.log(`Processing background removal for logo ${imageId}...`);

        // 1. Fetch image from URL
        // @imgly/background-removal-node can take a URL directly, but fetching it first might be safer for local node env handling
        // Let's try passing the URL directly first as per docs, or fetch as blob if needed.
        // Actually, fetching as blob avoids CORS issues sometimes if handled server side.

        const blobResponse = await fetch(imageUrl);
        if (!blobResponse.ok) throw new Error("Failed to fetch source image");
        const blob = await blobResponse.blob();

        // 2. Process with @imgly
        // Configure to be more robust
        const config = {
            debug: true,
            progress: (key: string, current: number, total: number) => {
                console.log(`[RemoveBG] ${key}: ${current}/${total}`);
            }
        };

        console.log("Starting background removal process...");
        const processedBlob = await removeBackground(blob, config);
        console.log("Background removal complete.");
        const buffer = Buffer.from(await processedBlob.arrayBuffer());

        // 3. Upload to Supabase
        const userId = (session.user as any).id;
        const fileName = `${userId}/transparent-${Date.now()}.png`;

        const { error: uploadError } = await supabaseAdmin
            .storage
            .from('LOGOS')
            .upload(fileName, buffer, {
                contentType: 'image/png',
                upsert: false
            });

        if (uploadError) {
            console.error('Storage Upload Error:', uploadError);
            throw new Error('Failed to upload transparent image');
        }

        const { data: publicUrlData } = supabaseAdmin
            .storage
            .from('LOGOS')
            .getPublicUrl(fileName);

        const transparentImageUrl = publicUrlData.publicUrl;

        // 4. Save to Database (Optional: Update original record or create new one?)
        // For now, let's just return the URL so the user can download it. 
        // Or better, save it as a variation? 
        // Let's keep it simple: Return the URL. The user wants to "download" it primarily.

        return NextResponse.json({ success: true, transparentImageUrl });

    } catch (error: any) {
        console.error('REMOVE-BG ERROR:', error);
        return NextResponse.json({ error: error.message || 'Background removal failed' }, { status: 500 });
    }
}
