import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

export const NextAuthOpt: AuthOptions = {
    secret: process.env.NEXTAUTH_SECRET as string,
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: {
                    label: "Username:",
                    type: "text",
                    placeholder: "Email",
                },
                password: {
                    label: "Password:",
                    type: "password",
                    placeholder: "Password",
                },
            },
            async authorize(credentials) {
                try {
                    const data = await axios(
                        `${process.env.API_URL}/UserAdmin/login`,
                        {
                            method: "POST",
                            data: JSON.stringify(credentials),
                            headers: {
                                "Content-Type": "application/json",
                            },
                        }
                    );
                    if (data.status !== 200) {
                        // credentials are invalid
                        return null;
                    }
                    const user = data.data;
                    return {
                        jwt: user.jwt,
                        data: {
                            firstName: user.firstname,
                            lastName: user.lastname,
                            email: user.email,
                            role: user.role,
                            id: user.id,
                            branchId: user.branchId,
                            companyId: user.companyId,
                        },
                    };
                } catch (error) {
                    return null;
                }

                // This is where you need to retrieve user data
                // to verify credentials
                // Docs :https://next-auth.js.org/configuration/providers/credentials
                /* Get admin account */
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ user, token }) {
            if (user) {
                token.sessionToken = user.jwt;
                token.data = user.data;
            }
            return token;
        },
        async session({ session, token }) {
            if (token.sessionToken) {
                session.token = token.sessionToken;
            }
            session.data = token.data;

            return session;
        },
    },

    pages: {
        signIn: "/",
    },
};