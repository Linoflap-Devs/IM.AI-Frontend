import Supplier from "@/components/pages/Supplier";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { NextAuthOpt } from "@/app/util/NextAuthOpt";
async function page() {
    const session = await getServerSession(NextAuthOpt);
    const userData = session?.data;
    /* Role + 1 to restrict acces*/
    if (userData) {
        if (userData.role >= 3) {
            notFound();
        }
    }
    return (
        <div className="flex w-full flex-1">
            <Supplier />
        </div>
    );
}

export default page;
