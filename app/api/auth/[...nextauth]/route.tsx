import NextAuth from "next-auth";
import { NextAuthOpt } from "@/app/util/NextAuthOpt";
/* Augment Interface */

const handler = NextAuth(NextAuthOpt);

export { handler as GET, handler as POST };
