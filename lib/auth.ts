import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { SupabaseAdapter } from "@auth/supabase-adapter"

export const authOptions: NextAuthOptions = {
    // Adapter synchronizes users to Supabase 'users'/'profiles'
    adapter: SupabaseAdapter({
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
        secret: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    }),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        // Kept for testing purposes
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (credentials?.email === "test@example.com" && credentials.password === "password") {
                    return { id: "1", name: "Test User", email: "test@example.com" }
                }
                return null
            }
        }),
    ],
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: '/auth/signin',
    },
    callbacks: {
        async session({ session, token }) {
            if (session?.user && token.sub) {
                // @ts-ignore
                session.user.id = token.sub
            }
            return session
        },
    },
    debug: true,
}
