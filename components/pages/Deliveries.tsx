"use client"
import { useI18nStore } from "@/store/usei18n";
import { Card } from "../ui/card";
import { useGlobalStore } from "@/store/useStore";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../ui/data-table";
import { format } from "date-fns";
import { Truck } from "lucide-react";
import { ArrowUpDown } from "lucide-react";
import { Button } from "../ui/button";

export default function Deliveries() {
    const session = useSession();
    const userData = session.data?.data;
    axios.defaults.headers.common[
        "Authorization"
    ] = `Bearer ${session.data?.token}`;

    const {
        globalBranchState,
        globalCompanyState
    } = useGlobalStore()

    const {
        locale,
        Deliveries,

    } = useI18nStore()


    const batchQuery = useQuery({
        queryKey: ["deliveries", globalBranchState, globalCompanyState],
        enabled: globalBranchState !== "all",
        queryFn: async () => {
            const companyId =
                globalCompanyState !== "all"
                    ? globalCompanyState
                    : userData?.companyId;
            const branchId =
                globalBranchState !== "all"
                    ? globalBranchState
                    : userData?.branchId;
            const res = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/batch/getBatches?cId=${companyId}&bId=${branchId}`,
                {
                    headers: {
                        Authorization: `Bearer ${session.data?.token}`,
                    },
                }
            )

            return res.data.sort((a: any, b: any) => new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime())
        }
    })

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "BatchNo",
            header: "Batch No",
        },
        {
            accessorKey: "ProductName",
            header: "Product Name",
            // cell: ({row}) => {
            //     return (
            //         <span className="p-1 rounded bg-blue-200 text-blue-800 font-semibold">{row.getValue("ProductName")}</span>)
            // }
        },
        {
            accessorKey: "CategoryName",
            header: ({ column, table }) => {
                return (
                    <div className="flex items-start">
                        <Button
                            variant="ghost"
                            className="hover:bg-gray-300"
                            onClick={() => {
                                table
                                    .getColumn("CategoryName")
                                    ?.toggleSorting(
                                        table
                                            .getColumn("CategoryName")
                                            ?.getIsSorted() === "asc"
                                    );
                            }}
                        >
                            Category
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                );
            },
            cell: ({ row }) => {
                return (
                    <span className="p-1 rounded bg-blue-200 text-blue-800 font-semibold">
                        {row.getValue("CategoryName")}
                    </span>
                );
            },
        },
        {
            accessorKey: "Quantity",
            header: () => <p className="text-end">Quantity</p>,
            cell: ({ row }) => <p className="text-end">{row.getValue("Quantity")}</p>
        },
        {
            accessorKey: "ExpirationDate",
            header: ({ column, table }) => {
                return (
                    <div className="flex items-start">
                        <Button
                            variant="ghost"
                            className="hover:bg-gray-300"
                            onClick={() => {
                                table
                                    .getColumn("ExpirationDate")
                                    ?.toggleSorting(
                                        table
                                            .getColumn("ExpirationDate")
                                            ?.getIsSorted() === "asc"
                                    );
                            }}
                        >
                            Expiration Date
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                );
            },
            cell: ({ row }) => {
                return (
                    <p>
                        {format(new Date(row.getValue("ExpirationDate")), "MMM dd, yyyy")}
                    </p>
                );
            },
        },
        {
            accessorKey: "SupplierName",
            header: "Supplier"
        },
        {
            accessorKey: "LocationStatusName",
            header: "Location Status",
            cell: ({ row }) => {
                const classes = (status: string) => {
                    if (status == "On Display") return "bg-green-100 text-green-800";
                    if (status == "In Storage") return "bg-orange-100 text-orange-800";
                    return "bg-gray-100 text-gray-800"
                }
                return (
                    <span className={`p-1 font-semibold rounded text-sm ${classes(row.getValue("LocationStatusName"))}`}>
                        {row.getValue("LocationStatusName") || "Unknown"}
                    </span>
                );
            }
        },
        {
            accessorKey: "CreatedAt",
            header: "Date",
            cell: ({ row }) => <p>{format(new Date(row.getValue("CreatedAt")), "MMM dd, yyyy | hh:mm a")}</p>
        }
    ]

    return (

        <Card className="mx-3 mb-3 flex w-full flex-col gap-2 p-3">
            <p className="text-2xl font-semibold">Batches</p>

            {
                (globalBranchState === "all") ? (
                    <div className="w-full h-full flex flex-col justify-center items-center text-muted-foreground">
                        <Truck size={50} strokeWidth={1} />
                        <p className="text-xl ">Select a branch to show its deliveries.</p>
                    </div>
                ) : (
                    <DataTable
                        isLoading={batchQuery.isLoading}
                        columns={columns}
                        data={batchQuery.data || []}
                        pagination={true}
                        columnsToSearch={["ProductName", "SupplierName", "LocationStatusName", "BatchNo"]}
                        filtering={true}
                    >

                    </DataTable>
                )
            }
        </Card>
    )
}