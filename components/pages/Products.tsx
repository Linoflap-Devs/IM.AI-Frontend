"use client";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import InventoryPurchase from "@/components/pages/InventoryPurchase";
import ProductView from "@/components/pages/ProductView";
import { useI18nStore } from "@/store/usei18n";
import { useSession } from "next-auth/react";
import { useGlobalStore } from "@/store/useStore";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { ArrowLeft, ArrowLeftIcon, Loader } from "lucide-react";
import { ProductBatches } from "./ProductBatches";
import { format } from "date-fns";
import { Button } from "../ui/button";
import { getMonthDifferenceArray, monthlyTotal } from "@/lib/dateoperators";
import { toast } from "../ui/use-toast";
import { capitalFirst } from "@/app/util/Helpers";

function Products(productId: { productId: string}) {
    const session = useSession();
    const userData = session.data?.data;
    const status = session.status;
    const userName = `${capitalFirst(userData?.firstName)} ${capitalFirst(userData?.lastName)}`;
    const userId = userData?.id;
    const [tabState, setTabState] = useState<string>("overview");
    const { globalCompanyState, globalBranchState, globalBranchName, fromReportDate, toReportDate, productPurchaseDateRange } = useGlobalStore();
    const {
        locale,
        Overviewi18n,
        Purchasesi18n,
    } = useI18nStore();

    const router = useRouter();

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

    const lookupProductTransactions = useQuery({
        queryKey: ["lookupProductTransactions", productId.productId],
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
                const fromDate = format(new Date(productPurchaseDateRange.from), "yyyy-MM-dd HH:mm:ss");
                const toDate = format(new Date(productPurchaseDateRange.to), "yyyy-MM-dd HH:mm:ss");
                console.log(companyId, branchId, productId.productId);
                console.log(`${process.env.NEXT_PUBLIC_API_URL}/transaction/getTransactionsProduct?cId=${companyId}&bId=${branchId}&pId=${productId.productId}`)
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/transaction/getProductSales?cId=${companyId}&bId=${branchId}&from=${fromDate}&to=${toDate}&pId=${productId.productId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${session.data?.token}`,
                        },
                    }
                )

                return response.data
            }
        }
    })

    const getAdjustmentTypes = useQuery({
        queryKey: ["getAdjustmentTypes"],
        enabled: session.status === 'authenticated',
        queryFn: async () => {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/stocks/getStockAdjustmentTypes`,
                {
                    headers: {
                        Authorization: `Bearer ${session.data?.token}`,
                    },
                }
            );
            return response.data.map((item: any) => { return {value: item.StockAdjustmentTypeId, label: item.StockAdjustmentType}});
        },
    })

    useEffect(() => {
        lookupProductBatches.refetch();
        lookupProductTransactions.refetch();
    }, [globalBranchState])

    useEffect(() =>  {
        lookupProductTransactions.refetch();
    }, [productPurchaseDateRange, globalBranchState])

    
    return (
        <Card className="mx-3 p-3">
            {/* <p>{format(new Date(productPurchaseDateRange.from), "MMM dd, yyyy")} - {format(new Date(productPurchaseDateRange.to), "MMM dd, yyyy")}</p> */}
            <div className="flex gap-2 items-center">
                <Button onClick={() => router.back()} variant={"ghost"}><ArrowLeft /></Button>
                <h1 className="p-2 text-2xl font-semibold">Product ID: {productId.productId}</h1>
                <span className="p-2 ms-2 bg-blue-200 text-blue-800 w-max rounded text-sm">{globalBranchName == "Select Branch" || globalBranchName == "" ? "All Branches" : globalBranchName}</span>
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
                    {userData?.role <= 3 && (
                        <span
                            className={`   border-b p-2 py-3 hover:cursor-pointer hover:bg-slate-300 ${
                                tabState == "batches" &&
                                "border-primary border-b-2"
                            }`}
                            onClick={() => {
                                setTabState("batches");
                            }}
                        >
                            {"Batches"}
                        </span>
                    )}
                    {userData?.role <= 3 && (
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
                {tabState == "overview" && (
                    !(lookupProduct.isLoading) && !(lookupProductBatches.isLoading)
                     ? (
                        <ProductView product={lookupProduct.data} batches={lookupProductBatches.data} />
                    ) : (
                        <div className="flex flex-col items-center py-6">
                            <p className="text-center text-gray-300">Loading...</p>
                            <Loader size={40} className="animate-spin" />
                        </div>
                    )
                )}
                {tabState == "purchase" && (
                    !(lookupProductTransactions.isLoading) && (
                        <InventoryPurchase transactions={lookupProductTransactions.data}></InventoryPurchase>
                    )
                )}
                {tabState== "batches" && (
                    !(lookupProductBatches.isLoading) && !(getAdjustmentTypes.isLoading) && (
                        <ProductBatches 
                            batches={lookupProductBatches.data} 
                            refetchMethod={lookupProductBatches.refetch} 
                            batchRefetchMethod={lookupProductBatches.refetch}
                            user={userId} 
                            adjustmentTypeOptions={getAdjustmentTypes.data}
                        >

                        </ProductBatches>
                    )
                )}
            </div>
        </Card>
    );
}

export default Products;
