import ManageUser from "@/components/pages/ManageUser";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { NextAuthOpt } from "@/app/util/NextAuthOpt";
async function page() {
    const session = await getServerSession(NextAuthOpt);
    const userData = session?.data;
    /* Role + 1 to restrict acces*/
    if (userData) {
        if (userData.role >= 4) {
            notFound();
        }
    }
    return (
        <div>
            <ManageUser />
        </div>
    );
}

export default page;
