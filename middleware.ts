import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Basic Security Headers (OWASP recommended)
    const headers = new Headers(request.headers);
    const response = NextResponse.next({
        request: {
            headers: headers,
        },
    });

    // 1. HSTS (Force HTTPS) - 1 year
    response.headers.set(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
    );

    // 2. Anti-Clickjacking (X-Frame-Options)
    // Allows embedding only on specific domains if needed, otherwise DENY or SAMEORIGIN
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');

    // 3. Prevent MIME Sniffing
    response.headers.set('X-Content-Type-Options', 'nosniff');

    // 4. Referrer Policy
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // 5. Permissions Policy (Camera, Mic, etc. disabled by default)
    response.headers.set(
        'Permissions-Policy',
        'camera=(), microphone=(), geolocation=(), browsing-topics=()'
    );

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
