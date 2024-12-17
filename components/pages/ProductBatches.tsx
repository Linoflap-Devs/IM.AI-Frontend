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
import { ArrowsUpFromLine, Box, Ellipsis, Loader, MessageSquareText, Pencil, Trash } from "lucide-react";
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
import { Sheet, SheetContent, SheetHeader } from "../ui/sheet";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Textarea } from "../ui/textarea";
import LoaderComponent from "../Loader";
import { toast } from "../ui/use-toast";

interface ProductBatchesProps {
    batches: any[];
    refetchMethod: () => void
}

export function ProductBatches({batches, refetchMethod}: ProductBatchesProps) {

    const [moveDialogOpen, setMoveDialogOpen] = useState(false);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [selectedBatchId, setSelectedBatchId] = useState<string>();
    const [addLoading, setAddLoading] = useState<boolean>(false);
    const { toast } = useToast();

    const formSchema = z.object({
        remarks: z.string()
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            remarks: ""
        }
    })

    const remarksQuery = useQuery({
        queryKey: ["batchRemarks", selectedBatchId],
        enabled: selectedBatchId !== "",
        queryFn: async () => {
            console.log("Remarks Query", selectedBatchId)
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/batch/getBatchRemarks`,
                {
                    params: {
                        id: selectedBatchId
                    }
                }
            );
            return response.data
        }
    })
    

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
                description: `${data.batch.BatchNo} has been moved to Display.`,
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
                description: `${data.batch.BatchNo} has been moved to Storage.`,
            })
            refetchMethod();
        },
        onError: (error) => {
            console.log("Failed", error.message)
        }
    })

    const addRemarkMutation = useMutation({
        mutationFn: async (data: any) => {
            setAddLoading(true)
            return await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/batch/addBatchRemark`,
                {
                    batchId: selectedBatchId,
                    remark: data.remarks,
                    userId: 3
                }
            )
        },
        onSuccess: (data: any) => {
            remarksQuery.refetch();
            toast({
                title: "Success",
                description: "Remark added successfully"
            })
            setAddLoading(false)
            form.reset()
        },
        onError: (error: any) => {
            console.log(error)
            toast({
                title: "Oops!",
                description: "Adding failed, try again later."
            })
            setAddLoading(false)
        }
    })

    const handleRemarksClick = (id: string) => {
        setSelectedBatchId(id);
        setSheetOpen(true);
        console.log(selectedBatchId)
    }

    function onSubmit(data: z.infer<typeof formSchema>) {
        addRemarkMutation.mutate(data)
    }

    const column: ColumnDef<any>[] = [
        {
            id: "batchId",
            accessorKey: "Id",
            enableHiding: true
        },
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
                                handleRemarksClick(row.getValue("batchId"))
                            }}
                            >
                                <div className="flex justify-between w-full items-center">
                                    <p>View Remarks</p>
                                    <MessageSquareText size={12} color="currentColor" />  
                                </div>
                            </DropdownMenuItem>
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
                    visibility={{
                        batchId: false
                    }}
                    pageSize={10}
                />


            </div>
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent className="w-[600px] sm:w-lg max-w-[600px] flex flex-col">
                    <SheetHeader className="border-b pb-2">
                        <h1 className="text-2xl font-semibold">
                            Batch Remarks
                        </h1>
                        <p className="text-muted-foreground">Batch Id: {selectedBatchId}</p>
                    </SheetHeader>
                    <div className="flex w-full flex-1 overflow-y-scroll flex-col gap-3 py-5 px-3">
                        {
                            remarksQuery.isLoading ? 
                            <LoaderComponent></LoaderComponent> :
                            remarksQuery.data?.length > 0 ? (
                                remarksQuery.data?.map((remark: any, i: number) => {
                                    return (
                                        <div className={`flex flex-col gap-2 ${i == remarksQuery.data.length - 1 ? "" : "border-b pb-2"}`}>
                                            <p className="text-sm font-semibold">{remark.UserId}</p>
                                            <p className="text-sm">{remark.BatchRemarkText}</p>
                                            <p className="text-end text-sm text-muted-foreground">{format(new Date(remark.CreatedAt), "MMM dd, yyyy | hh:mm a")}</p>
                                        </div>
                                    )
                                })
                            ):(
                                <div className="flex h-full w-full items-center justify-center">
                                    <p>No remarks.</p>
                                </div>
                            )
                        }
                    </div>
                    <div className="flex gap-3 py-5 pb-2 border-t w-full">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
                                <FormField
                                    control={form.control}
                                    name="remarks"
                                    render={({ field }) => (
                                        <FormItem className="w-full"> 
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Enter Remarks"
                                                    className="resize-none w-full"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="flex justify-end mt-3">
                                    <Button type="submit" className="" disabled={addLoading}>Submit</Button>
                                </div>
                            </form>
                        </Form>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    )
}