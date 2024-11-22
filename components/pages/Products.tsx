"use client";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import InventoryPurchase from "@/components/pages/InventoryPurchase";
import ProductView from "@/components/pages/ProductView";
import { useI18nStore } from "@/store/usei18n";
import { useSession } from "next-auth/react";
import { useGlobalStore } from "@/store/useStore";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import axios from "axios";
import { Loader } from "lucide-react";

function Products(productId: { productId: string}) {
    const session = useSession();
    const userData = session.data?.data;
    const status = session.status;
    const [tabState, setTabState] = useState<string>("overview");
    const { globalCompanyState, globalBranchState, globalBranchName } = useGlobalStore();
    const {
        locale,
        Overviewi18n,
        Purchasesi18n,
    } = useI18nStore();

    axios.defaults.headers.common[
        "Authorization"
    ] = `Bearer ${session.data?.token}`;


    const lookupProduct = useQuery({
        queryKey: ["lookupProduct", productId.productId],
        enabled: session.status === 'authenticated',
        queryFn: async () => {
            console.log(productId)
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
                    `${process.env.NEXT_PUBLIC_API_URL}/product/getProduct/cId/${companyId}/bId/${branchId}/pId/${productId.productId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${session.data?.token}`,
                        },
                    }
                );
                console.log(response.data)
                if(!response.data) return null
                return response.data[0];
            }
        }
    })

    const lookupProductBatches =  useQuery({
        queryKey: ["lookupProductBatches", productId.productId],
        enabled: session.status === 'authenticated',
        queryFn:  async () => {
            if (session.data?.token !== undefined) {
                const companyId =
                    globalCompanyState !== "all"
                        ? globalCompanyState
                        : userData?.companyId;
                const branchId =
                    globalBranchState !== "all"
                        ? globalBranchState
                        : "all";
                console.log(companyId, branchId, productId.productId);
                console.log(`${process.env.NEXT_PUBLIC_API_URL}/batch/getBatchesProduct/cId/${companyId}/bId/${branchId}/pId/${productId.productId}`)
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/batch/getBatchesProduct?cId=${companyId}&bId=${branchId}&pId=${productId.productId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${session.data?.token}`,
                        },
                    }
                );
                return response.data;
            }
        },
    })

    useEffect(() => {
        lookupProductBatches.refetch();
    }, [globalBranchState])

    
    return (
        <Card className="mx-3 p-3">
            <div className="flex flex-col">
                <h1 className="p-2 text-2xl font-semibold">Product ID: {productId.productId} <span className="p-2 ms-2 bg-blue-200 text-blue-800 w-max rounded text-sm" onClick={() => console.log(session.data)}>{globalBranchName == "Select Branch" || globalBranchName == "" ? "All Branches" : globalBranchName}</span></h1>
            </div>
            <div className="p-2">
                <div className="flex gap-2 border-b">
                    <span
                        className={`border-b p-2 py-3 hover:cursor-pointer hover:bg-slate-300 ${
                            tabState == "overview" &&
                            "border-primary border-b-2"
                        }`}
                        onClick={() => {
                            setTabState("overview");
                        }}
                    >
                        {Overviewi18n[locale]}
                    </span>
                    {userData?.role <= 2 && (
                        <span
                            className={`   border-b p-2 py-3 hover:cursor-pointer hover:bg-slate-300 ${
                                tabState == "purchase" &&
                                "border-primary border-b-2"
                            }`}
                            onClick={() => {
                                setTabState("purchase");
                            }}
                        >
                            {Purchasesi18n[locale]}
                        </span>
                    )}
                </div>
                {tabState == "overview" ? (
                    !(lookupProduct.isLoading) && !(lookupProductBatches.isLoading)
                     ? (
                        <ProductView product={lookupProduct.data} batches={lookupProductBatches.data} />
                    ) : (
                        <div className="flex flex-col items-center">
                            <p className="text-center text-gray-300">Loading...</p>
                            <Loader size={40} className="animate-spin" />

                        </div>
                    )
                ) : (
                    <InventoryPurchase />
                )}
            </div>
        </Card>
    );
}

export default Products;
