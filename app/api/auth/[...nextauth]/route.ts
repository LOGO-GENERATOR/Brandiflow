import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
// import GoogleProvider from "next-auth/providers/google"
// import { SupabaseAdapter } from "@auth/supabase-adapter"

export const authOptions: NextAuthOptions = {
    // adapter: SupabaseAdapter({
    //   url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    //   secret: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    // }),
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                // TODO: Validate credentials against Supabase 'profiles' or Auth
                // For now, returning a mock user to allow initial setup
                if (credentials?.email === "test@example.com" && credentials.password === "password") {
                    return { id: "1", name: "Test User", email: "test@example.com" }
                }
                return null
            }
        }),
        // User can enable Google Provider here
        /*
        GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        */
    ],
    session: {
        strategy: "jwt",
    },
    pages: {
        // signIn: '/auth/signin',
    },
    callbacks: {
        async session({ session, token }) {
            if (session?.user) {
                // session.user.id = token.sub
            }
            return session
        },
    },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
