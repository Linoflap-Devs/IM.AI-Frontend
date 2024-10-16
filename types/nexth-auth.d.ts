import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT, JWT } from "next-auth/jwt";

interface SessionData {
    email: string;
    id: number;
    jwt: string;
    role: number;
}

declare module "next-auth" {
    interface Session extends DefaultSession {
        token: {};
        data: any;
    }
    interface User extends DefaultUser {
        id?: number | string;
        jwt: JWT;
        data: any;
    }
}
declare module "next-auth/jwt" {
    interface JWT extends DefaultJWT {
        role: number;
    }
}
