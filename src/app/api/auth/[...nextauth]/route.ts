import settings from "@/config/app";
import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import axios from "axios";

export const authOptions: AuthOptions = {
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      }),
    ],
  
    session: {
      strategy: "jwt",
    },
  
    callbacks: {
      async signIn({ user, account, profile }) {
        try {
            if (!account) return false;
            const response = await axios.post(`${settings.services.auth.baseURL}/api/v1/auth/internal`, {
                email: profile?.email,
                name: profile?.name,
                imageURL: profile?.image,
                method: "google-oauth",
            }, {
                headers: {
                    Authorization: `Bearer ${settings.internalApiAccessToken}`
                }
            });
    
            const data = response.data;
            const { accessToken, refreshToken, user } = data;
            if (accessToken) {
                account.accessToken = accessToken;
                account.refreshToken = refreshToken;
                account.user = user;
                return true;
            } else {
                console.error("API responded without token");
                return false;
            }
        } catch (err) {
          console.error("Auth API failed:", err);
          return false;
        }
      },
  
      async jwt({ token, account }) {
        if (account && account.user) {
          token.accessToken = account.accessToken;
          token.refreshToken = account.refreshToken;
          token.user = account.user;
        }
  
        return token;
      },
  
      async session({ session, token }) {
        session.user = token.user ?? session.user;
        session = Object.assign({}, session, { accessToken: token.accessToken, refreshToken: token.refreshToken })
        return session;
      },
    },
  
    pages: {
      signIn: "/auth/signin",
      error: "/auth/error",
    },
  };

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };