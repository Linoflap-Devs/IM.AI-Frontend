"use client"

import { useQuery } from "@tanstack/react-query"
import { Card } from "../ui/card"
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useGlobalStore } from "@/store/useStore";
import axios from "axios";
import { TransactionProducts } from "./TransactionProducts";
import LoaderComponent from "../Loader";
import { TransactionDetailsPanel } from "./TransactionDetailsPanel";

interface TransactionDetailsProps {

    transactionId: string
}

export function TransactionDetails({transactionId}: TransactionDetailsProps) {
    const session = useSession();
    const userData = session.data?.data;
    const status = session.status;
    const [tabState, setTabState] = useState<string>("overview");
    const { globalCompanyState, globalBranchState, globalBranchName, fromReportDate, toReportDate, productPurchaseDateRange } = useGlobalStore();

    const transactionDetailQuery = useQuery({
        queryKey: ["transactionDetail", transactionId],
        enabled: session.status === 'authenticated',
        queryFn: async () => {
            if (session.data?.token !== undefined) {
                const companyId =
                    globalCompanyState !== "all"
                        ? globalCompanyState
                        : userData?.companyId;
                const branchId =
                    globalBranchState !== "all"
                        ? globalBranchState
                        : userData?.branchId;
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/transaction/getTransaction/tId/${transactionId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${session.data?.token}`,
                        },
                    }
                );
                console.log(response.data)
                if(!response.data) return null
                return response.data;
            }
        },

    })

    return (
        <div className="mx-3 h-full pb-3">
            <Card className="p-4 h-full">
                <div>
                    <span className="font-bold text-2xl">Transaction #{transactionId}</span>
                </div>

                <div className="my-3 flex gap-3">
                    {
                        !(transactionDetailQuery.isLoading) && transactionDetailQuery.data ? (
                            <>
                                <TransactionProducts data={transactionDetailQuery.data} className="w-2/3"/>
                                <TransactionDetailsPanel refData={transactionDetailQuery.data} className="w-1/3"/>
                            </>
                        ):(
                            <div className="w-full border h-full rounded flex items-center justify-center">
                                <LoaderComponent></LoaderComponent>
                            </div>
                        )
                    }
                    
                </div>
            </Card>
        </div>
    )
}
