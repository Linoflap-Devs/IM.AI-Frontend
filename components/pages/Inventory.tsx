"use client";
/* Imports */
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ArrowUpDown, CalendarIcon, CheckIcon, ChevronsUpDown, CircleHelp } from "lucide-react";
import Link from "next/link";
import { useGlobalStore } from "@/store/useStore";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";
import { useI18nStore } from "@/store/usei18n";
import axios from "axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import { DateTimePicker } from "../ui/datetime-picker";
import { Calendar } from "../ui/calendar";
import { format, set } from "date-fns";
import { DatePicker } from "../ui/datepicker";
import { Collapsible } from "@radix-ui/react-collapsible";
import { CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
/* Msc */
const formSchema = z.object({
    productName: z
        .number()
        .min(1, { message: "Select a product." }
    ),
    quantity: z.coerce.number().min(1, {
        message: "Quantity cannot be less than 1",
    }),   
    supplier: z.coerce.number().min(1, {
        message: "Supplier cannot be empty",
    }),
    batchNo: z.coerce.string().min(1, {
        message: "Batch No cannot be empty",
    }),
    expiry: z.date().optional(),    
});

const discrepancySchema = z.object({
    reason: z.string().min(1, { message: "Select a reason." }),
    quantity: z.coerce.number().min(1, { message: "Enter a quantity." })
});

function Inventory() {
    const session = useSession();
    const userData = session.data?.data;
    const userId = userData?.id;
    const { toast } = useToast();
    const [inventoryDataOverview, setInventoryDataOverview] =
        useState<InventoryDataOverview>({
            "Available Products": 0,
            "Restocks Needed": 0,
            "Critical Stocks": 0,
            "Out of Stocks": 0,
            "Near-Expiry Products": 0,
            "Expired Products": 0
        });
        
    const { globalCompanyState, globalBranchState } = useGlobalStore();
    const [activeFilter, setActiveFilter] = useState<{column: string, value: string} | null>(null);
    const [openDialog, setOpenDialog] = useState(false);

    const [discrepancies, setDiscrepancies] = useState<{id: number, reason: string, quantity: number}[] | null>(null);
    const [discrepancyCount, setDiscrepancyCount] = useState(0);

    const [discrepancyReason, setDiscrepancyReason] = useState("");
    const [discrepancyAmount, setDiscrepancyAmount] = useState("");

    axios.defaults.headers.common[
        "Authorization"
    ] = `Bearer ${session.data?.token}`;

    const {
        locale,
        Pricei18n,
        ProdNamei18n,
        ThresValuei18n,
        Availi18n,
        Expiryi18n,
        Quantityi18n,
        Categoryi18n,
        Producti18n,
        Addi18n,
        Uniti18n,
        PickADatei18n,
        Uploadi18n,
        Imagei18n,
        localeExtended,
        Stocksi18n,
        AddStocksi18n,
        ReStockImmediatelyi18n,
        PleaseSelectACompanyOrABranchi18n,
        SuccessfullyAddedTheProducti18n,
        Successi18n,
        BatchNo,
        InventoryI18n
    } = useI18nStore();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            expiry: undefined
        }
    });

    const discrepancyForm = useForm<z.infer<typeof discrepancySchema>>({
        resolver: zodResolver(discrepancySchema),
        defaultValues: {
            reason: "",
            quantity: 0
        }
    });

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

    const getStocksquery = useQuery({
        queryKey: ["getStocks", globalCompanyState !== "all" ? globalCompanyState : userData?.companyId],
        enabled: session.data?.token !== undefined,
        queryFn: async () => {
            let outOfStocks: number = 0;
            let availableProducts: number = 0;
            let restocksNeeded: number = 0;
            let criticalLevel: number = 0;
            let nearExpiry: number = 0;
            let expired: number = 0
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
                    `${process.env.NEXT_PUBLIC_API_URL}/stocks/getStocks/cId/${companyId}/bId/${branchId}`
                );
                response.data.map((stock: any) => {
                    if (
                        stock.Total_Quantity === 0 ||
                        stock.Total_Quantity === null
                    ) {
                        outOfStocks += 1;
                    } else {
                        availableProducts += 1;
                    }
                    if (stock.Total_Quantity <= stock.ReorderLevel) {
                        restocksNeeded += 1;
                    }
                    if ((stock.Total_Quantity <= stock.CriticalLevel) && (stock.Total_Quantity > 0)) {
                        criticalLevel += 1;
                    }
                    if (stock.Expired > 0 ) {
                        expired += 1
                    }
                    if (stock.NearExpiry > 0 ) {
                        nearExpiry += 1
                    }

                });
                setInventoryDataOverview(() => {
                    return {
                        "Available Products": availableProducts,
                        "Restocks Needed": restocksNeeded,
                        "Critical Stocks": criticalLevel,
                        "Out of Stocks": outOfStocks,
                        "Near-Expiry Products": nearExpiry,
                        "Expired Products": expired
                    };
                });
                return response.data;
            }
        },
        refetchOnWindowFocus: false
    });

    const getSuppliersQuery = useQuery({
        queryKey: ["getSuppliers"],
        enabled: session.data?.token !== undefined,
        queryFn: async () => {
            if (session.data?.token !== undefined) {
                const companyId =
                    globalCompanyState !== "all"
                        ? globalCompanyState
                        : userData?.companyId;
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/supplier/getSuppliers/cId/${companyId}`
                );
                return response.data;
            }
        },
    });

    const addBatchMutation = useMutation({
        mutationFn: async (data: z.infer<typeof formSchema>) => {
            console.log(data, discrepancies);
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/batch/addBatch`,
                {
                    batchNo: data.batchNo,
                    expDate: data.expiry,
                    productId: data.productName,
                    quantity: data.quantity,
                    supplierId: data.supplier ,
                    companyId: globalCompanyState !== "all" ? globalCompanyState : userData?.companyId,
                    branchId: globalBranchState !== "all" ? globalBranchState : userData?.branchId,
                    discrepancies: JSON.stringify(discrepancies || []),
                    uId: userId
                },
            )

            // const stockResponse = await axios.post(
            //     `${process.env.NEXT_PUBLIC_API_URL}/stocks/addStocks`,
            //     {
            //         productId: data.productName,
            //         expiryDate: data.expiry,
            //         quantity: data.quantity,
            //         branchId: globalBranchState !== "all" ? globalBranchState : userData?.branchId,
            //         batchId: response.data.Id,
            //         discrepancies: discrepancies || [],
            //         uId: userId
            //     }
            // )
            return {batch: response.data}
        },
        onSuccess: () => {
            setOpenDialog(false);
            form.reset();
            getStocksquery.refetch();
            toast({
                title: "Success",
                description: "Stock added successfully."
            })
        },
        onError: (error: any) => {
            console.log(error);
            toast({
                variant: "destructive",
                title: "Oops!",
                description: error.response.data.message,
            })
        }
    })

    function addDiscrepancy(values: z.infer<typeof discrepancySchema>) {
        console.log(values);
        setDiscrepancyCount(discrepancyCount + 1);
        discrepancyForm.trigger();
        const validate = discrepancySchema.safeParse(values);

        if(!validate.success) {
            console.log(validate.error.issues);
            return;
        }

        setDiscrepancies((prev) => [
            ...(prev || []), 
            {
                id: discrepancyCount, 
                reason: getAdjustmentTypes.data?.find((option: any) => option.value == values.reason)?.value, 
                quantity: values.quantity
            }
        ]);

        discrepancyForm.reset();
    }

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values, globalCompanyState !== "all" ? globalCompanyState : userData?.companyId, globalBranchState !== "all" ? globalBranchState : userData?.branchId);
        toast({
            title: `${SuccessfullyAddedTheProducti18n[locale]}`,
            description: Successi18n[locale],
        });
        addBatchMutation.mutate(values);
    }

    const columns: ColumnDef<InventoryDataTable>[] = [
        
        {
            accessorKey: "ProductId",
            id: "id"
        },
        {
            accessorKey: "Name",
            header: ProdNamei18n[locale],
            cell: ({ row }) => {
                const id = row.getValue("id");

                return (
                    <div className="scroll-animation flex w-[250px] justify-center overflow-hidden">
                        {userData?.role <= 2 ? (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Link
                                            className="w-full text-nowrap p-0 font-medium hover:text-primary hover:underline"
                                            href={`/home/inv&products/${id}`}
                                        >
                                            {row.getValue("Name")}
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {row.getValue("Name")}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ) : (
                            <div className="w-full overflow-hidden truncate text-clip">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <h1 className="hover:cursor-pointer">
                                                {row.getValue("Name")}
                                            </h1>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            {row.getValue("Name")}
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: "BranchName",
            header: "Branch"
        },
        {
            accessorKey: "Total_Quantity",
            header: ({ column }) => {
                return (
                    <div className="flex justify-end">
                        <Button
                            variant="ghost"
                            className="hover:bg-gray-300"
                            onClick={() =>
                                column.toggleSorting(
                                    column.getIsSorted() === "asc"
                                )
                            }
                        >
                            {Quantityi18n[locale]}
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                );
            },
            cell: ({ row }) => {
                const quantity: number = row.getValue("Total_Quantity");
                return <div className="text-right">{quantity || 0}</div>;
            },
        },
        {
            accessorKey: "Valid",
            header: () => <div className="text-right">Valid</div>,
            cell: ({ row }) => {
                const quantity: number = row.getValue("Valid");
                return <div className={`text-right ${ quantity > 0 && "text-green-600 font-semibold"  || "" }`}>{quantity || 0}</div>;
            }
        },
        {
            accessorKey: "NearExpiry",
            header: () => <div className="text-right">Near Expiry</div>,
            cell: ({ row }) => {
                const quantity: number = row.getValue("NearExpiry");
                return <div className={`text-right ${ quantity > 0 && "text-yellow-600 font-semibold"  || "" }`}>{quantity || 0}</div>;
            }
        },
        {
            accessorKey: "Expired",
            header: () => <div className="text-right">Expired</div>,
            cell: ({ row }) => {
                const quantity: number = row.getValue("Expired");
                return <div className={`text-right ${ quantity > 0 && "text-red-600 font-semibold"  || "" }`}>{quantity || 0}</div>;
            }
        },
        {
            accessorKey: "availability",
            header: ({ column, table }) => {
                return (
                    <div className="flex flex-col items-center">
                        <Button
                            variant="ghost"
                            className="hover:bg-gray-300"
                            onClick={() => {
                                table
                                    .getColumn("quantity")
                                    ?.toggleSorting(
                                        table
                                            .getColumn("quantity")
                                            ?.getIsSorted() === "asc"
                                    );
                            }}
                        >
                            {Availi18n[locale]}
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                );
            },
            cell: ({ row }) => {
                const quantity: number = row.getValue("Total_Quantity");
                const reorderLevel: number = row.getValue("ReorderLevel");
                const criticalLevel: number = row.getValue("CriticalLevel");

                return (
                    <div
                        className={`mx-auto w-[10rem] rounded px-1 text-center font-semibold ${quantity <= criticalLevel
                                ? "bg-destructive text-red-200"
                                : quantity <= reorderLevel
                                    ? "bg-orange-600 text-orange-200"
                                    : "bg-green-700 text-green-300"
                            }`}
                    >
                        {quantity <= criticalLevel
                            ? ReStockImmediatelyi18n[locale]
                            : quantity <= reorderLevel
                                ? "Need to Re-Stock"
                                : "In-Stock"}
                    </div>
                );
            },
        },
        {
            accessorKey: "ReorderLevel",
        },
        {
            accessorKey: "CriticalLevel",
        },
    ];

    const discrepancyColumns: ColumnDef<any>[] = [
        {
            accessorKey: "id",
            header: "Id",
            enableHiding: true
        },
        {
            accessorKey: "reason",
            header: "Reason",
            cell: ({ row }) => {
                return (
                    getAdjustmentTypes.data?.find((option: any) => option.value == row.getValue("reason"))?.label
                )
            }
        },
        {
            accessorKey: "quantity",
            header: "Quantity"
        },
        {   
            id: "actions",
            cell: ({ row }) => {
                return (
                    <Button variant="outline" size="sm" type="button" onClick={() => setDiscrepancies((prev) => {
                        return (prev || []).filter((discrepancy) => discrepancy.id !== row.getValue("id"))
                    })}>
                        X
                    </Button>
                )
            }
        }

    ]

    // filters = [

    // ]

    useEffect(() => {
        getStocksquery.refetch();
    }, [globalBranchState, globalCompanyState]);
    if (globalBranchState === "all" && globalCompanyState === "all") {
        return (
            <Card className="mx-3 mb-3 flex flex-1 items-center justify-center">
                {PleaseSelectACompanyOrABranchi18n[locale]}
            </Card>
        );
    }

    const handleCloseDialog = () => {
        setOpenDialog(!openDialog);
        form.reset();
        discrepancyForm.reset();
        setDiscrepancies(null);
        setDiscrepancyCount(0);
        setDiscrepancyReason("");
    }

    return (
        <div className="mx-3 mb-3 flex flex-1 flex-col gap-3">
            {userData && userData.role <= 3 && (
                <Card className="flex justify-between p-4 gap-4">
                    {Object.keys(inventoryDataOverview).map((key, index) => {
                        const bgColor = (value: string) => {
                            if(value == "Available Products") return "bg-green-100 text-green-800"
                            if(value == "Restocks Needed") return "bg-yellow-100 text-yellow-800"
                            if(value == "Critical Stocks") return "bg-orange-100 text-orange-800"
                            if(value == "Out of Stocks") return "bg-red-100 text-red-800"
                            if(value == "Near-Expiry Products") return "bg-yellow-50 text-yellow-600"
                            if(value == "Expired Products") return "bg-gray-200 text-gray-600"
                        }

                        const filter = () => {
                            if (key === "Available Products") return { column: "Total_Quantity", value: ">0" };
                            if (key === "Restocks Needed") return { column: "Quantity", value: "<10" };
                            if (key === "Critical Stocks") return { column: "Quantity", value: "<5" };
                            if (key === "Out of Stocks") return { column: "Total_Quantity", value: "0" };
                            if (key === "Near-Expiry Products") return { column: "NearExpiry", value: ">0" };
                            if (key === "Expired Products") return { column: "Expired", value: ">0" };
                        }
                        return (
                            <Card
                                key={index}
                                className={`bg-color flex  w-1/4 flex-col p-5 border-0 ${bgColor(key)}`}
                                onClick={() => {
                                    const newFilter = filter();
                                    const filterValue = (currentFilter: any) => {
                                        if (currentFilter?.column === newFilter?.column && currentFilter.value === newFilter?.value) {
                                            return null;
                                        }
                                        return newFilter || null;
                                    }
                                    setActiveFilter(filterValue);
                                    console.log(activeFilter)
                                    
                                }}
                            >
                                <h3 className="text-base">{key}</h3>
                                <p className="text-4xl font-bold">
                                    {
                                        inventoryDataOverview[
                                        key as keyof InventoryDataOverview
                                        ]
                                    }
                                </p>
                            </Card>
                        );
                    })}
                </Card>
            )}
            <Dialog open={openDialog} onOpenChange={handleCloseDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-2xl m-0">{AddStocksi18n[locale]}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(
                                onSubmit
                            )}
                            className="space-y-3"
                        >
                            <FormField
                                control={form.control}
                                name="batchNo"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col items-center">
                                        <div className="flex w-full items-center justify-between">
                                            <FormLabel className="text-lg">
                                                {
                                                    BatchNo[
                                                    locale
                                                    ]
                                                }
                                            </FormLabel>
                                            <FormControl className="w-[60%]">
                                                <Input
                                                    type="text"
                                                    placeholder={
                                                        BatchNo[
                                                        locale
                                                        ]
                                                    }
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </div>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="productName"
                                render={({ field }) => (
                                    <FormItem className="col-span-4 sm:col-span-4">
                                    <div className="flex w-full items-center justify-between">
                                        <FormLabel className="text-lg">Product</FormLabel>
                                                
                                        <Popover modal={true}>
                                            <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                variant="outline"
                                                role="combobox"
                                                type="button"
                                                className={
                                                    `w-[60%] justify-between px-3
                                                    ${!field.value && "text-muted-foreground"}`
                                                }
                                                >
                                                {field.value
                                                    ? getStocksquery?.data?.find(
                                                        (stock: any) => stock.ProductId === field.value
                                                    )?.Name
                                                    : "Select Product"}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-full p-0">
                                            <Command>
                                                <CommandInput
                                                placeholder="Search product..."
                                                className="h-9"
                                                />
                                                <CommandList>
                                                <CommandEmpty>No framework found.</CommandEmpty>
                                                <CommandGroup>
                                                    {getStocksquery?.data?.map((stock: any) => (
                                                    <CommandItem
                                                        value={stock.Name}
                                                        key={stock.ProductId}
                                                        onSelect={() => {
                                                        form.setValue("productName", stock.ProductId)
                                                        }}
                                                    >
                                                        {stock.Name}
                                                        <CheckIcon
                                                        className={
                                                            `ml-auto h-4 w-4 
                                                            ${stock.ProductId === field.value
                                                            ? "opacity-100"
                                                            : "opacity-0"}`
                                                        }
                                                        />
                                                    </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                                </CommandList>
                                            </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <FormMessage className="text-xs text-right w-full" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="expiry"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col items-center">
                                        <div className="flex w-full items-center justify-between">
                                            <FormLabel className="text-lg">
                                                {
                                                    "Expiry Date"
                                                }
                                            </FormLabel>
                                            <DatePicker className="w-[60%]" date={field.value} setDate={field.onChange}></DatePicker>
                                        </div>
                                        <FormMessage className="text-xs text-right w-full" />
                                    </FormItem>
                                )}
                            /> 
                            <FormField
                                control={form.control}
                                name="quantity"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col items-center">
                                        <div className="flex w-full items-center justify-between">
                                            <FormLabel className="text-lg">
                                                {
                                                    "Quantity"
                                                }
                                            </FormLabel>
                                            <FormControl className="w-[60%]">
                                                <Input
                                                    type="number"
                                                    placeholder={
                                                        "Quantity"
                                                    }
                                                    {...field}
                                                />
                                            </FormControl>
                                        </div>
                                        <FormMessage className="text-xs text-right w-full" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="supplier"
                                render={({ field }) => (
                                    <FormItem className="col-span-4 sm:col-span-4">
                                    <div className="flex w-full items-center justify-between">
                                        <FormLabel className="text-lg">Supplier</FormLabel>
                                                
                                        <Popover modal={true}>
                                            <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                variant="outline"
                                                role="combobox"
                                                type="button"
                                                className={
                                                    `w-[60%] justify-between px-3
                                                    ${!field.value && "text-muted-foreground"}`
                                                }
                                                >
                                                {field.value
                                                    ? getSuppliersQuery?.data?.find(
                                                        (stock: any) => stock.SupplierId === field.value
                                                    )?.SupplierName
                                                    : "Select Supplier"}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-full p-0">
                                            <Command>
                                                <CommandInput
                                                placeholder="Search supplier..."
                                                className="h-9"
                                                />
                                                <CommandList>
                                                <CommandEmpty>No framework found.</CommandEmpty>
                                                <CommandGroup>
                                                    {getSuppliersQuery?.data?.map((stock: any) => (
                                                    <CommandItem
                                                        value={stock.SupplierName}
                                                        key={stock.SupplierId}
                                                        onSelect={() => {
                                                        form.setValue("supplier", stock.SupplierId)
                                                        }}
                                                    >
                                                        {stock.SupplierName}
                                                        <CheckIcon
                                                        className={
                                                            `ml-auto h-4 w-4 
                                                            ${stock.SupplierId === field.value
                                                            ? "opacity-100"
                                                            : "opacity-0"}`
                                                        }
                                                        />
                                                    </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                                </CommandList>
                                            </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <FormMessage className="text-xs text-right w-full" />
                                    </FormItem>
                                )}
                            />
                            <div className="pb-2 border-b"></div>
                            <div className="w-full">
                                <Collapsible>
                                    <CollapsibleTrigger className="w-full">
                                        <div className="flex justify-between items-center w-full">
                                            <div className="flex gap-2 items-center">
                                                <h1 className="text-lg">Discrepancies {discrepancies?.length ? `(${discrepancies?.length})` : ""}</h1>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <span className="text-black/[.70]"><CircleHelp size={16} color="currentColor"></CircleHelp></span>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Use this to account for missing items, expired or damaged products in the batch.</p>
                                                        </TooltipContent>

                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                            <ChevronsUpDown className="h-4 w-4" />
                                        </div>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="px-2">
                                        {
                                            discrepancies?.length ? (
                                                <>
                                                    <DataTable
                                                        columns={discrepancyColumns}
                                                        data={discrepancies}
                                                        visibility={{id: false}}
                                                    ></DataTable>
                                                </>
                                                
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-4 mt-2 gap-2 border rounded">
                                                    <p className="text-black/[.70]">No discrepancies.</p>
                                                </div>
                                            )
                                        }
                                        <div className="mt-4 w-full">
                                            <Form {...discrepancyForm}>
                                                <form onSubmit={discrepancyForm.handleSubmit(addDiscrepancy)}>
                                                    <div className="flex gap-4 items-end w-full">
                                                        <FormField
                                                            control={discrepancyForm.control}
                                                            name="reason"
                                                            render={({ field }) => (
                                                                <FormItem className="w-2/5">
                                                                    <FormLabel>Reason</FormLabel>
                                                                    <Select
                                                                            value={field.value?.toString()}
                                                                            onValueChange={field.onChange}
                                                                        >
                                                                            <FormControl>
                                                                                <SelectTrigger>
                                                                                    <SelectValue
                                                                                        placeholder="Discrepancy"
                                                                                    >
                                                                                        {getAdjustmentTypes.data?.find((option: any) => option.value == field.value)?.label}
                                                                                    </SelectValue>
                                                                                </SelectTrigger>
                                                                            </FormControl>
                                                                            <SelectContent>
                                                                                {getAdjustmentTypes.data?.map((option: any, index: number) => (
                                                                                    <SelectItem key={index} value={option.value.toString()}>
                                                                                        {option.label}
                                                                                    </SelectItem>
                                                                                ))}
                                                                            </SelectContent>    
                                                                        </Select>
                                                                        <div className="h-[1.5rem]">
                                                                            <FormMessage className="" />
                                                                        </div>
                                                                        
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={discrepancyForm.control}
                                                            name="quantity"
                                                            render={({ field }) => (
                                                                <FormItem className="w-2/5">
                                                                    <FormLabel>Quantity</FormLabel>
                                                                    <Input
                                                                        type="number"
                                                                        value={field.value || ""}
                                                                        onChange={field.onChange}
                                                                    />
                                                                    <div className="h-[1.5rem]">
                                                                        <FormMessage className="" />
                                                                    </div>
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <div className="w-1/5 flex flex-col items-end">
                                                            <Button
                                                                type="button"
                                                                onClick={() => addDiscrepancy(discrepancyForm.getValues())}
                                                                variant="secondary"
                                                                size="sm"
                                                                className="w-full"
                                                            >
                                                                +
                                                            </Button>
                                                            <div className="h-[1.5rem]">
                                                               
                                                            </div>
                                                        </div>
                                                    </div>
                                                </form>
                                            </Form>
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>
                            </div>
                            <DialogFooter>
                                <div className="flex justify-end mt-4">
                                    <Button type="submit" onClick={() => console.log(form.formState)}>
                                        {`${Addi18n[locale]}`}
                                    </Button>
                                </div>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
            <Card className={`flex flex-1 flex-col gap-3 p-3`}>
                {userData && userData.role <= 3 && (
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-semibold">
                            {InventoryI18n[locale]}
                        </h1>
                        <div className="flex gap-3">
                            <Button 
                                onClick={() => {
                                    console.log(globalBranchState)
                                    globalBranchState == "all" ? 
                                    toast({title: "Please select a branch", variant: "destructive"}) :
                                    setOpenDialog(true)  
                                }}
                                type="button"
                            >
                                {AddStocksi18n[locale]}
                            </Button>
                        </div>
                    </div>
                )}
                {userData && (
                    <DataTable
                        visibility={{
                            id: true,
                            action: userData.role == 4 && false,
                            ReorderLevel: false,
                            CriticalLevel: false,
                        }}
                        filtering={true}
                        columnsToSearch={["Name", "BranchName", "id"]}
                        activeFilter={activeFilter}
                        resetSortBtn={true}
                        pageSize={userData.role >= 4 ? 12 : 9}
                        data={getStocksquery.data || []}
                        pagination={true}
                        columns={columns}
                        isLoading={getStocksquery.isLoading}
                    />
                )}
            </Card>
        </div>
    );
}

export default Inventory;
