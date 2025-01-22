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
import { ArrowsUpFromLine, ArrowUpDown, Box, Clock, Ellipsis, Loader, Loader2, MessageSquareText, Pencil, SquarePen, Text, Trash } from "lucide-react";
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
import { capitalFirst } from "@/app/util/Helpers";
import { Input } from "../ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "../ui/select";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProductBatchesProps {
    batches: any[];
    refetchMethod: () => void;
    batchRefetchMethod: () => void;
    user: number
    adjustmentTypeOptions?: {label: string, value: string}[]
}

export function ProductBatches({batches, refetchMethod, user, adjustmentTypeOptions = [], batchRefetchMethod}: ProductBatchesProps) {

    // Adjust Quantity States
    const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
    const [adjustmentLoading, setAdjustmentLoading] = useState(false);
    const [currentQuantity, setCurrentQuantity] = useState<number>(0);
    const [currentLocation, setCurrentLocation] = useState<string>("");

    // Adjust Sheet States
    const [adjustSheetOpen, setAdjustSheetOpen] = useState(false);
    const [adjustmentSheetLoading, setAdjustmentSheetLoading] = useState(false);

    const [sheetOpen, setSheetOpen] = useState(false);
    const [selectedBatchId, setSelectedBatchId] = useState<string>();
    const [selectedBatchName, setSelectedBatchName] = useState<string>();
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

    const adjustQuantityFormSchema = z.object({
        operation: z.string(),
        quantity: z.coerce.number(),
        adjustmentType: z.string(),
        notes: z.string()
    })

    const adjustQuantityForm = useForm<z.infer<typeof adjustQuantityFormSchema>>({
        resolver: zodResolver(adjustQuantityFormSchema),
        defaultValues: {
            operation: "",
            quantity: undefined,
            adjustmentType: "",
            notes: ""
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
    
    const adjustmentHistoryQuery = useQuery({
        queryKey: ["batchAdjustmentHistory", selectedBatchId],
        enabled: selectedBatchId !== "",
        queryFn: async () => {
            console.log("Adjustment History Query", selectedBatchId)
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/stocks/getStockAdjustments/bId/${selectedBatchId}`,
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
                    userId: user
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

    const adjustmentMutation = useMutation({
        mutationFn: async (data: any) => {
            setAdjustmentLoading(true)
            return await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/stocks/addStockAdjustments`,
                {
                    bId: selectedBatchId,
                    initial: currentQuantity,
                    quantity: data.operation == '+' ? data.quantity : -data.quantity,
                    adjustmentType: data.adjustmentType,
                    notes: data.notes,
                    uId: user,
                    location: currentLocation
                }
            )
        },
        onSuccess: (data: any) => {
            setAdjustmentLoading(false)
            setAdjustDialogOpen(false)
            adjustQuantityForm.reset()
            batchRefetchMethod();
            adjustmentHistoryQuery.refetch();
            toast({
                title: "Success",
                description: "Adjustment successful."
            })
        },
        onError: (error: any) => {
            setAdjustmentLoading(false)
            toast({
                title: "Oops!",
                description: error.message
            })
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

    function onAdjustQuantitySubmit(data: z.infer<typeof adjustQuantityFormSchema>) {
        console.log(data)
        adjustmentMutation.mutate(data)
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
            header: ({table}) => {
                return (
                    <Button
                        variant="ghost"
                        className="flex items-center gap-1 justify-center mx-0 px-0"
                        onClick={ () => {
                            table.getColumn("ExpirationDate")?.toggleSorting(
                                table.getColumn("ExpirationDate")?.getIsSorted() === 'asc'
                            )
                        }}
                    >
                        <span>Expiration Date</span>
                        <ArrowUpDown size={16} />                            
                    </Button>
                )
            },
            cell: ({ row, cell }) => {
                return <span className={`${new Date(row.getValue("ExpirationDate")) < new Date() ? "text-red-500" : new Date(row.getValue("ExpirationDate")) <= addDays(new Date(), 30) ? "text-yellow-500" : "text-green-500"}`}>{format(new Date(row.getValue("ExpirationDate")), "MMM dd, yyyy")}</span>;
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
                const status: string =  row.getValue("Quantity") == 0 ? "Completed"
                                        : new Date(expiry) < new Date() 
                                        ? "Expired" 
                                        : new Date(expiry) <= addDays(new Date(), 30) 
                                        ? "Near-Expiry" 
                                        : "In-Stock";
                return (
                    <span className={`p-1 font-semibold rounded text-sm ${status == "Completed" ? "bg-blue-100 text-blue-800" : status == "In-Stock" ? "bg-green-100 text-green-800" : status== "Near-Expiry" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}>
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
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() => {
                            setSelectedBatchId(row.getValue("batchId"))
                            setSelectedBatchName(row.getValue("BatchNo"))
                            setCurrentQuantity(row.getValue("Quantity"))
                            setCurrentLocation(row.getValue("LocationStatus"))
                            setAdjustDialogOpen(true)
                        }}
                    >
                        <div className="flex justify-between w-full items-center">
                            <p>Adjust Quantity</p>
                            <SquarePen size={12} color="currentColor" />  
                        </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => {
                            setSelectedBatchId(row.getValue("batchId"))
                            setSelectedBatchName(row.getValue("BatchNo"))
                            setAdjustSheetOpen(true)
                        }}
                    >
                        <div className="flex justify-between w-full items-center">
                            <p>Adjustment History</p>
                            <Clock size={12} color="currentColor" />  
                        </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator /> 
                    <DropdownMenuItem
                      onClick={() => {
                        // wala pang delete function maam 
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

    const adjustmentColumns: ColumnDef<any>[] = [
        {
            accessorKey: "AdjustmentType",
            header: "Reason",

        },
        {
            accessorKey: "Initial",
            header: "Quantity",
            cell: ({ row }) => {
                return (
                    <p className="text-end">
                        {row.getValue("Initial")}
                    </p>
                );
            }
        },
        {
            accessorKey: "Quantity",
            header: "Adjustment",
            cell: ({ row }) => {
                const isPositive = parseInt(row.getValue("Quantity")) > 0 ? true : false;

                return (
                    <p className="text-end">
                        <span className={`py-1 px-2 rounded ${isPositive ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"}`}>
                            {isPositive ? `+` : `-`} {Math.abs(row.getValue("Quantity"))}
                        </span>
                        
                    </p>
                )
            }
        },
        {
            accessorKey: "Total",
            header: "Total",
            cell: ({ row }) => {
                return (
                    <p className="text-end">
                        {row.getValue("Total")}
                    </p>
                );
            }
        },
        {
            accessorKey: "FirstName",
            enableHiding: true
        },
        {
            accessorKey: "LastName",
            enableHiding: true
        },
        {
            id: "User",
            header: "User",
            cell: ({ row }) => {
                return `${capitalFirst(row.getValue("FirstName"))} ${capitalFirst(row.getValue("LastName"))}`;
            }
        },
        {
            accessorKey: "Location",
            header: "Location",
            cell: ({ row }) => {
                const classes = (status: string) => {
                    if (status == "On Display") return "bg-green-100 text-green-800";
                    if (status == "In Storage") return "bg-orange-100 text-orange-800";
                    return "bg-gray-100 text-gray-800"
                }
                return (
                    <span className={`p-1 font-semibold rounded text-sm ${classes(row.getValue("Location"))}`}>
                       {row.getValue("Location") || "Unknown"}
                    </span>
                );
            }
        },
        {
            accessorKey: "CreatedAt",
            header: "Date",
            cell: ({ row }) => {
                return format(new Date(row.getValue("CreatedAt")), "MMM dd, yyyy | hh:mm a");
            }
        },
        {
            accessorKey: "Notes",
            header: "Remarks",
            cell: ({row}) => {
                return (
                    <TooltipProvider delayDuration={0}>
                        <Tooltip>
                            <TooltipTrigger>
                                <Button variant="outline">
                                    <div className="flex items-center gap-2">
                                        <Text size={16} />
                                        <span>Hover</span>
                                    </div>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" align="end">
                            <p className="max-w-[200px]">{row.getValue("Notes")}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )
            }
        }
    ]
    return (
        <>
            
            <Dialog
                open={adjustDialogOpen}
                onOpenChange={() => {
                    setAdjustDialogOpen(false)
                    adjustQuantityForm.reset()
                }}
            >  
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Adjust Quantity</DialogTitle>
                        <p className="text-black/[.7]">Batch {selectedBatchName}</p>
                    </DialogHeader>
                    <Form {...adjustQuantityForm}>
                        <form
                            onSubmit={adjustQuantityForm.handleSubmit(onAdjustQuantitySubmit)}
                            className="space-y-3"
                        >
                            <FormField
                                control={adjustQuantityForm.control}
                                name="operation"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col items-center">
                                         <div className="flex w-full items-center justify-between">
                                            <FormLabel className="">
                                                Adjustment Type
                                            </FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                
                                            >
                                                <FormControl className="w-[60%]">
                                                    <SelectTrigger>
                                                        <SelectValue
                                                            placeholder="Select type of adjustment"
                                                        />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="+">Add Quantity</SelectItem>
                                                    <SelectItem value="-">Remove Quantity</SelectItem>
                                                </SelectContent>
                                            </Select>
                                         </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={adjustQuantityForm.control}
                                name="adjustmentType"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col items-center">
                                        <div className="flex w-full items-center justify-between">
                                            <FormLabel className="">
                                                Reason
                                            </FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <FormControl className="w-[60%]">
                                                    <SelectTrigger>
                                                        <SelectValue
                                                            placeholder="Select reason for adjustment"
                                                        >
                                                            {adjustmentTypeOptions.find(option => option.value == field.value)?.label}
                                                        </SelectValue>
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {adjustmentTypeOptions.map((option, index) => (
                                                        <SelectItem key={index} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={adjustQuantityForm.control}
                                name="quantity"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col items-center">
                                        <div className="flex w-full items-center justify-between">
                                            <FormLabel className="">
                                                Amount
                                            </FormLabel>
                                            <FormControl className="w-[60%]">
                                                <Input
                                                    type="number"
                                                    placeholder={
                                                        "Amount to add/remove"
                                                    }
                                                    {...field}
                                                />
                                            </FormControl>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={adjustQuantityForm.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col items-center pt-3 border-t">
                                        <div className="flex w-full items-center justify-between pb-3">
                                            <FormLabel className="">
                                                Adjustment Remarks
                                            </FormLabel>
                                           
                                        </div>
                                        <FormControl className="w-full">
                                            <Textarea
                                                placeholder="Enter remarks..."
                                                className="resize-none w-full"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            
                            <div className="flex justify-end">
                                <Button type="submit" disabled={adjustmentLoading}>
                                    {adjustmentLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
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
                                            <p className="text-sm font-semibold">{`${capitalFirst(remark.FirstName)} ${capitalFirst(remark.LastName)}`}</p>
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
            <Sheet open={adjustSheetOpen} onOpenChange={setAdjustSheetOpen}>
                <SheetContent className="w-[1000px] sm:w-lg max-w-[1000px] flex flex-col">
                    <SheetHeader className="border-b pb-2">
                        <h1 className="text-2xl font-semibold">
                            Adjustment History
                        </h1>
                        <p className="text-muted-foreground">Batch: {selectedBatchName}</p>
                    </SheetHeader>
                    <div className="flex w-full flex-1 overflow-y-scroll flex-col gap-3 py-5 px-1">
                        {
                            adjustmentHistoryQuery.isLoading ? 
                            <LoaderComponent></LoaderComponent> :
                            adjustmentHistoryQuery.data?.length > 0 ? (
                                <DataTable
                                    columns={adjustmentColumns}
                                    pagination={true}
                                    data={adjustmentHistoryQuery.data ?? []}
                                    pageSize={10}
                                    filtering={true}
                                    columnsToSearch={["StockAdjustmentType", "FirstName", "LastName"]}
                                    visibility={
                                        {
                                            FirstName: false,
                                            LastName: false
                                        }
                                    }
                                />
                            ):(
                                <div className="flex h-full w-full items-center justify-center">
                                    <p>No adjustments.</p>
                                </div>
                            )
                        }
                    </div>
                </SheetContent>
            </Sheet>
        </>
    )
}