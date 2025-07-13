import settings from "@/config/app";
import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import axios from "axios";

import CredentialsProvider from "next-auth/providers/credentials";

const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const res = await axios.post(`${settings.services.auth.baseURL}/api/v1/auth/internal`, {
            email: credentials.email,
            password: credentials.password,
            method: "email-pass"
          }, {
            headers: {
              Authorization: `Bearer ${settings.internalApiAccessToken}`
            }
          });

          const data = res.data;
          if (data?.accessToken) {
            return {
              id: data.user.id,
              name: data.user.name,
              email: data.user.email,
              image: data.user.imageURL,
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
              ...data.user,
            };
          }

          return null;
        } catch (error) {
          console.error("Login error", error);
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async signIn({ account, profile, user }) {
      if (account?.provider === "google") {
        try {
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
          if (data?.accessToken) {
            account.accessToken = data.accessToken;
            account.refreshToken = data.refreshToken;
            account.user = data.user;
            return true;
          }

          return false;
        } catch (err) {
          console.error("Auth API failed:", err);
          return false;
        }
      }

      return true;
    },

    async jwt({ token, account, user }) {
      if (account && account.provider === "credentials") {
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
        token.user = user;
      } else if (account && account.user) {
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