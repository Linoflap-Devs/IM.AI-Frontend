"use client"
import { ColumnDef } from "@tanstack/react-table";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import InventoryPurchase from "@/components/pages/InventoryPurchase";
import ProductView from "@/components/pages/ProductView";
import { useI18nStore } from "@/store/usei18n";
import { useSession } from "next-auth/react";
import { useGlobalStore } from "@/store/useStore";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import axios from "axios";
import { ArrowsUpFromLine, Box, Ellipsis, Loader, Pencil, Trash } from "lucide-react";
import { addDays, format } from "date-fns";
import { DataTable } from "../ui/data-table";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Button } from "../ui/button";
import { 
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
 } from "../ui/dialog";
import { useToast } from "../ui/use-toast";

interface ProductBatchesProps {
    batches: any[];
    refetchMethod: () => void
}

export async function ProductBatches({batches, refetchMethod}: ProductBatchesProps) {

    const [moveDialogOpen, setMoveDialogOpen] = useState(false);
    const { toast } = useToast();

    const toDisplayMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await axios.patch(
                `${process.env.NEXT_PUBLIC_API_URL}/batch/displayBatch`,
                {
                    id: id
                }
            );

            return response.data;
        },
        onSuccess: (data) => {
            console.log("Success", data)
            toast({
                title: "Success!",
                description: `${data.BatchNo} has been moved to Display.`,
            })
            refetchMethod();
        },
        onError: (error) => {
            console.log("Failed", error.message)
        }
    })

    const toStoreMutation = useMutation({
        mutationFn: async (id: string) => {
            const response =  await axios.patch(
                `${process.env.NEXT_PUBLIC_API_URL}/batch/storeBatch`,
                {
                    id: id
                }
            );

            return response.data
        },
        onSuccess: (data) => {
            console.log("Success")
            toast({
                title: "Success!",
                description: `${data.BatchNo} has been moved to Storage.`,
            })
            refetchMethod();
        },
        onError: (error) => {
            console.log("Failed", error.message)
        }
    })

    const column: ColumnDef<any>[] = [
        {
            accessorKey: "BatchNo",
            header: "Batch Name",
        },
        {
            accessorKey: "Quantity",
            header: () => <p className="text-end">Quantity</p>,
            cell: ({ row }) => {
                return <p className="text-end">{row.getValue("Quantity") || 0}</p>
            }
        },
        {
            accessorKey: "Initial",
            header: () => <p className="text-end">Initial Qty</p> ,
            cell: ({ row }) => {
                return <p className="text-end">{row.getValue("Initial") || 0}</p>
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
            accessorKey: "Supplier",
            header: "Supplier",
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
                    <span className={`p-1 font-semibold rounded text-sm ${status == "In-Stock" ? "bg-green-100 text-green-800" : status== "Near-Expiry" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}>
                       {status}
                    </span>
                );
            }
        },
        {
            accessorKey: "LocationStatus",
            header: "Location",
            cell: ({ row }) => {
                const classes = (status: string) => {
                    if (status == "On Display") return "bg-green-100 text-green-800";
                    if (status == "In Storage") return "bg-orange-100 text-orange-800";
                    return "bg-gray-100 text-gray-800"
                }
                return (
                    <span className={`p-1 font-semibold rounded text-sm ${classes(row.getValue("LocationStatus"))}`}>
                       {row.getValue("LocationStatus") || "Unknown"}
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
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }: any) => {
              const record = row.original;
              return (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <Ellipsis className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {
                        row.getValue("LocationStatus") == "In Storage" ? (
                            <DropdownMenuItem
                            onClick={() => {
                                toDisplayMutation.mutate(record.Id)
                            }}
                            >
                                <div className="flex justify-between w-full items-center">
                                    <p>Move to Shelves</p>
                                    <ArrowsUpFromLine size={12} color="currentColor" />  
                                </div>
                            </DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem
                            onClick={() => {
                                toStoreMutation.mutate(record.Id)
                            }}
                            >
                                <div className="flex justify-between w-full items-center">
                                    <p>Move to Storage</p>
                                    <Box size={12} color="currentColor" />  
                                </div>
                            </DropdownMenuItem>
                        )
                    }
                    <DropdownMenuItem
                      onClick={() => {
                       
                      }}
                      className="font-medium text-red-500"
                    >
                      <div className="flex justify-between w-full items-center">
                          <p>Delete</p>
                          <Trash size={12} color="currentColor" />  
                        </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            },
        }
    ];

    return (
        <>
            
            {/* <Dialog
                open={moveDialogOpen}
                onOpenChange={setMoveDialogOpen}
            >  
                <DialogContent>
                    Hello
                </DialogContent>
            </Dialog> */}
            <div className="w-full mt-4">
                <DataTable
                    data={batches}
                    columns={column}
                    filtering={true}
                    pagination={true}
                    columnsToSearch={["BatchNo", "BranchName", "Supplier"]}
                    pageSize={10}
                />


            </div>
        </>
    )
}