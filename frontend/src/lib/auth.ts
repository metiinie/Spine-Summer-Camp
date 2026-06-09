import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

// @ts-expect-error NextAuth beta typing issue with moduleResolution: bundler
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const backendUrl = process.env.BACKEND_URL || "http://localhost:4000";
          console.log('[NextAuth] Attempting login...');
          console.log('[NextAuth] Backend URL:', backendUrl);
          console.log('[NextAuth] Email:', credentials?.email);
          
          // Only send email and password (filter out NextAuth internal fields)
          const loginPayload = {
            email: credentials?.email,
            password: credentials?.password,
          };
          
          const res = await fetch(`${backendUrl}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(loginPayload),
          });

          console.log('[NextAuth] Response status:', res.status);
          console.log('[NextAuth] Response OK:', res.ok);

          if (!res.ok) {
            const errorText = await res.text();
            console.log('[NextAuth] Error response:', errorText);
            return null;
          }

          const data = await res.json();
          console.log('[NextAuth] Login successful:', data.email);
          // Assuming the NestJS backend returns { id, email, role, token }
          return {
            id: data.id,
            email: data.email,
            role: data.role,
            accessToken: data.token,
          };
        } catch (error) {
          console.error('[NextAuth] Exception:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.id = user.id;
        token.accessToken = (user as { accessToken?: string }).accessToken;
      }
      return token;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
        (session as { accessToken?: unknown }).accessToken = token.accessToken;
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
  },
});


