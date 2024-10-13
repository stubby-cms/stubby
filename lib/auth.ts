import { getServerSession, User, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import { timingSafeEqual, pbkdf2Sync } from "crypto";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email ",
          placeholder: "Enter your email",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user) return null;

        const salt = user.salt;
        const hash = user.hash;

        if (!salt || !hash) return null;

        const encryptHash = pbkdf2Sync(
          credentials.password,
          salt!,
          10000,
          512,
          "sha512",
        );

        if (timingSafeEqual(encryptHash, Buffer.from(hash, "hex"))) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
          } as User;
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: `/login`,
    verifyRequest: `/login`,
    error: "/login", // Error code passed in query string as ?error=
  },
  session: { strategy: "jwt" },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.user = user;
      }
      return token;
    },
    session: async ({ session, token }) => {
      session.user = {
        ...session.user,
        // @ts-expect-error
        id: token.sub,
      };
      return session;
    },
  },
};

export interface SessionData {
  user: {
    id: string;
    name: string;
    username: string;
    email: string;
    image: string;
  };
  expires: string;
  id: string;
}

export function getSession() {
  return getServerSession(authOptions) as Promise<SessionData | null>;
}
