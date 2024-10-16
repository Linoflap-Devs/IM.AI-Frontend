import UserActivity from "@/components/pages/UserActivity";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { NextAuthOpt } from "@/app/util/NextAuthOpt";
async function page() {
       const session = await getServerSession(NextAuthOpt);
       const userData = session?.data;
       if (userData) {
           if (userData.role >= 2) {
               notFound();
           }
       }
    return (
        <div className="flex w-full flex-1">
            <UserActivity />
        </div>
    );
}

export default page;
