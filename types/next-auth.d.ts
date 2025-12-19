import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string
      role: string
      plan: string
      subdomain: string
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    role: string
    plan: string
    subdomain: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    plan: string
    subdomain: string
  }
}