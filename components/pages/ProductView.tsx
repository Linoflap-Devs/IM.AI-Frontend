"use client"
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { DataTable } from "@/components/ui/data-table";
import { useI18nStore } from "@/store/usei18n";
import { Card, CardHeader } from "../ui/card";
import { Doughnut,} from "react-chartjs-2";
import { Chart, ArcElement } from "chart.js";
import { Loader } from "lucide-react";
import { addDays, format } from "date-fns";
Chart.register(ArcElement)
type SupplyInfo = {
    storeName: string;
    stockInHand: number;
};

interface ProductViewProps {
    product: any;
    batches: any[];
}
/* Query */

function ProductView({product, batches}: ProductViewProps) {
    const {
        locale,
        localeExtended,
        PrimaryDetailsi18n,
        SupplierDetailsi18n,
        ProductIDi18n,
        OpeningStocksi18n,
        RemainingStocksi18n,
        ThresholStockValuei18n,
        StoreNamei18n,
        StockInHandi18n,
        Categoryi18n,
        Expiryi18n,
        Contacti18n,
    } = useI18nStore();
    const productInfo = {
        productName: "Maggi",
        productId: "03298",
        category: "Instant Food",
        thresholdValue: "304",
        supplier: "LinoFlap",
        supplierContact: "9797979797",
        openingStock: "32",
        remainingStock: "34",
        onTheWay: "15",
    };
    const supplyData: Array<SupplyInfo> = [
        { storeName: "Landers", stockInHand: 10 },
        { storeName: "SM", stockInHand: 10 },
        { storeName: "Super 8", stockInHand: 10 },
        { storeName: "S&R", stockInHand: 10 },
        { storeName: "Save More", stockInHand: 10 },
        { storeName: "Save More", stockInHand: 10 },
        { storeName: "Save More", stockInHand: 10 },
        { storeName: "Save More", stockInHand: 10 },
        { storeName: "Save More", stockInHand: 10 },
        { storeName: "Save More", stockInHand: 10 },
        { storeName: "Save More", stockInHand: 10 },
        { storeName: "Save More", stockInHand: 10 },
    ];
    const column: ColumnDef<any>[] = [
        {
            accessorKey: "BatchNo",
            header: "Batch Name",
        },
        {
            accessorKey: "Quantity",
            header: "Quantity",
            cell: ({ row }) => {
                return row.getValue("Quantity") || 0
            }
        },
        {
            accessorKey: "ExpirationDate",
            header: "Expiration Date",
            cell: ({ row, cell }) => {
                return format(new Date(row.getValue("ExpirationDate")), "MMM dd, yyyy");
            }
        },
        {
            accessorKey: "BranchName",
            header: "Branch",
        },
        {
            id: "Status",
            header: "Status",
            cell: ({ row }) => {
                const expiry: string = row.getValue("ExpirationDate");
                const status: string = new Date(expiry) < new Date() 
                                        ? "Expired" 
                                        : new Date(expiry) <= addDays(new Date(), 30) 
                                        ? "Near-Expiry" 
                                        : "In-Stock";
                return (
                    <span className={`p-1 font-semibold text-sm ${status == "In-Stock" ? "bg-green-100 text-green-800" : status== "Near-Expiry" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}>
                       {status}
                    </span>
                );
            }
        }
    ];

    console.log("Batches", batches)

    const totalQuantity = (batches || []).reduce((total: number, batch: any) => {
        return total + (batch.Quantity || 0);
    }, 0)

    const stockStatusCount = (batches || []).reduce((totals: any, batch: any) => {
        const expDate = new Date(batch.ExpirationDate)
        const quantity = batch.Quantity || 0

        if (expDate < new Date()) {
            totals.expired += quantity;
        } else if (expDate <= addDays(new Date(), 30)) {
            totals.expiring += quantity;
        } else {
            totals.inStock += quantity;
        }
        return totals;
    }, { expired: 0, expiring: 0, inStock: 0 });

    console.log(stockStatusCount)

    if(!product) {
        return (
            "Loading..."
        )
    }
   
    return (
         <div className="flex flex-col gap-3 mb-3">
            <div className="gap-3 flex w-full py-4">
                <div className="flex flex-col w-2/3 gap-3">
                    <Card className="p-4">
                        <div className="flex gap-4 ">
                            <Image
                                alt="productImg"
                                src="https://placehold.co/300x300"
                                width="150"
                                height="150"
                                unoptimized={true}
                            />
                            <div className="flex flex-col justify-between">
                                <div className="flex flex-col">
                                    <h1 className="text-lg font-bold text-gray-600">
                                        {product.Name}
                                    </h1>
                                    <span className="p-2 bg-blue-100 text-blue-800 rounded text-sm w-max">{product.Category}</span>
                                </div>
                                <p className="text-3xl font-bold">PHP{parseInt(product.Price).toFixed(2)}</p>
                            </div>
                        </div>
                    </Card>
                    <div className="flex gap-3 h-full">
                        <Card className="p-4 w-1/2">
                            <CardHeader className="p-0  mb-3">
                                <span className="font-bold text-lg">Product Information</span>
                            </CardHeader>
                            <div className="flex flex-col gap-4 ">
                                <div className="flex flex-row justify-between border-b pb-2">
                                    <p className="">Barcode</p>
                                    <p className="font-semibold text-right">{product.BarCode}</p>
                                </div>
                                <div className="flex flex-row justify-between border-b pb-2">
                                    <p className="">Gross Weight</p>
                                    <p className="font-semibold text-right">{product.ProductWeight}</p>
                                </div>
                                <div className="flex flex-row justify-between">
                                    <p className="">Net Weight</p>
                                    <p className="font-semibold text-right">{product.ActualWeight}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4 w-1/2">
                            <CardHeader className="p-0  mb-3">
                                <span className="font-bold text-lg">Stock Information</span>
                            </CardHeader>
                            <div className="flex flex-col gap-4 ">
                                <div className="flex flex-row justify-between border-b pb-2">
                                    <p className="">Total In-Stock</p>
                                    <p className={`font-semibold text-right p-1 rounded ${totalQuantity < product.CriticalLevel ? "bg-red-200 text-red-800" : totalQuantity < product.ReorderLevel ? "bg-yellow-200 text-yellow-800" : ""}`}>{totalQuantity}</p>
                                </div>
                                <div className="flex flex-row justify-between border-b pb-2">
                                    <p className="">Low Stock Threshold</p>
                                    <p className="font-semibold text-right">{product.ReorderLevel || "N/A"} </p>
                                </div>
                                <div className="flex flex-row justify-between">
                                    <p className="">Critical Stock Threshold</p>
                                    <p className="font-semibold text-right">{product.CriticalLevel || "N/A"}</p>
                                </div>
                            </div>
                        
                        </Card>
                        
                    </div>
                </div>
                <div className="w-1/3 h-full flex">
                    <Card className="p-4 w-full">
                        <CardHeader className="p-0  mb-3">
                            <span className="font-bold text-lg">Stock Status</span>
                        </CardHeader>
                        <div className="h-[185px] w-full flex justify-center">
                            <Doughnut 
                                data={{
                                    labels: ["In-Stock", "Near-Expiry", "Expired"],
                                    datasets: [
                                        {
                                            data: [stockStatusCount.inStock, stockStatusCount.expiring, stockStatusCount.expired],
                                            backgroundColor: ["#86efac", "#fde047", "#fca5a5"],
                                            hoverOffset: 4,
                                            
                                        }
                                    ],
                                }}
                                options={{
                                    plugins: {
                                        legend: {
                                            display: false
                                        }
                                    }
                                }}
                                />
                        </div>
                        <div className="flex flex-col gap-3 mt-1 ">
                                <div className="flex flex-row justify-between items-center border-b pb-2">
                                    <p className="">In-Stock</p>
                                    <span className="font-semibold text-right bg-green-200 text-green-800 rounded p-1">{stockStatusCount.inStock}</span>
                                </div>
                                <div className="flex flex-row justify-between items-center border-b pb-2">
                                    <p className="">Near-Expiry</p>
                                    <span className="font-semibold text-right bg-yellow-200 text-yellow-800 rounded p-1">{stockStatusCount.expiring}</span>
                                </div>
                                <div className="flex flex-row justify-between items-center">
                                    <p className="">Expired</p>
                                    <span className="font-semibold text-right bg-red-200 text-red-800 rounded p-1">{stockStatusCount.expired}</span>
                                </div>
                        </div>
                    </Card>
                </div>    
            </div>
            
            <div className="flex flex-col border-t pt-4 px-2">
                <h1 className="font-bold" onClick={() => {console.log(batches)}}>Recent Batches</h1>
                {
                    batches ? (
                        <DataTable
                            data={batches}
                            columns={column}
                            pageSize={2}
                        />
                    ):(
                        <div className="flex flex-col items-center">
                            <p className="text-center text-gray-300">Loading...</p>
                            <Loader size={40} className="animate-spin" />

                        </div>
                    )
                }
            </div>
        </div>
            
    );
}

export default ProductView;
