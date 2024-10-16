import TransferOrder from "@/components/pages/TransferOrder";
import React from "react";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { NextAuthOpt } from "@/app/util/NextAuthOpt";
export default async function page() {
    const session = await getServerSession(NextAuthOpt);
    const userData = session?.data;
    if (userData) {
        if (userData.role >= 4) {
            notFound();
        }
    }
    return (
        <div className="flex flex-1">
            <TransferOrder />
        </div>
    );
}
