"use client"
import { ColumnDef } from "@tanstack/react-table";
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
import { addDays, format } from "date-fns";
import { DataTable } from "../ui/data-table";

interface ProductBatchesProps {
    batches: any[];
}

export async function ProductBatches({batches}: ProductBatchesProps) {
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
        },
        {
            accessorKey: "CreatedAt",
            header: "Date Received",
            cell: ({ row }) => {
                return format(new Date(row.getValue("CreatedAt")), "MMM dd, yyyy | hh:mm a");
            }
        }
    ];

    return (
        <div className="w-full mt-4">
            <DataTable
                data={batches}
                columns={column}
                filtering={true}
                pagination={true}
                coloumnToFilter="BatchNo"
                pageSize={10}
            />
        </div>
    )
}