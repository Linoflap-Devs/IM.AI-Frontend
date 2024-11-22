import Products from "@/components/pages/Products";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { NextAuthOpt } from "@/app/util/NextAuthOpt";
async function page({ params }: { params: { productId: string } }) {

    const session = await getServerSession(NextAuthOpt);
    const userData = session?.data;
    if (userData) {
        if (userData.role >= 3) {
            notFound();
        }
    }

    return (
            <Products productId={params.productId} />
    );
}

export default page;

