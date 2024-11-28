import Products from "@/components/pages/Products";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { NextAuthOpt } from "@/app/util/NextAuthOpt";
import { TransactionDetails } from "@/components/pages/TransactionDetails";
async function page({ params }: { params: { transactionId: string } }) {

    const session = await getServerSession(NextAuthOpt);
    const userData = session?.data;
    if (userData) {
        if (userData.role >= 3) {
            notFound();
        }
    }

    return (
            <TransactionDetails transactionId={params.transactionId} />
    );
}

export default page;

