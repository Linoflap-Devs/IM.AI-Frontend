/* Without a defined matcher, this one line applies next-auth to the entire project */
import { withAuth } from "next-auth/middleware";

export default withAuth({
    pages: {
        signIn: "/",
    },
});
export const config = {
    matcher: ["/home", "/home/:path*"],
};

