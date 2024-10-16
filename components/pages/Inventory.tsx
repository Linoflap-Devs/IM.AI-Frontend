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
import { ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { useGlobalStore } from "@/store/useStore";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";
import { useI18nStore } from "@/store/usei18n";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
/* Msc */
const formSchema = z.object({
    productName: z
        .string()
        .min(2, { message: "Product Name cannot be less than 2 characters" }),
    price: z.coerce.number().min(1, {
        message: "Price cannot be less than 1",
    }),
    quantity: z.coerce.number().min(1, {
        message: "Quantity cannot be less than 1",
    }),
});

function Inventory() {
    const session = useSession();
    const userData = session.data?.data;
    const { toast } = useToast();
    const [inventoryDataOverview, setInventoryDataOverview] =
        useState<InventoryDataOverview>({
            "Available Products": 0,
            "Out of Stocks": 0,
            "Critical Stocks": 0,
            "Restocks Needed": 0,
        });
    const { globalCompanyState, globalBranchState } = useGlobalStore();

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
    } = useI18nStore();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    });
    const getStocksquery = useQuery({
        queryKey: ["getStocks"],
        enabled: session.data?.token !== undefined,
        queryFn: async () => {
            let outOfStocks: number = 0;
            let availableProducts: number = 0;
            let restocksNeeded: number = 0;
            let criticalLevel: number = 0;
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
                    if (stock.Total_Quantity <= stock.CriticalLevel) {
                        criticalLevel += 1;
                    }
                });
                setInventoryDataOverview(() => {
                    return {
                        "Out of Stocks": outOfStocks,
                        "Available Products": availableProducts,
                        "Critical Stocks": criticalLevel,
                        "Restocks Needed": restocksNeeded,
                    };
                });
                return response.data;
            }
        },
    });
    function onSubmit(values: z.infer<typeof formSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        console.log(values);
        toast({
            title: `${SuccessfullyAddedTheProducti18n[locale]} ${values.productName.charAt(0).toUpperCase() +
                values.productName.slice(1)
                }`,
            description: Successi18n[locale],
        });
    }
    const columns: ColumnDef<InventoryDataTable>[] = [
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
                                            href={`/home/inventory/${id}`}
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
            accessorKey: "Total_Quantity",
            header: ({ column }) => {
                return (
                    <div className="flex flex-col items-center">
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
                return <div className="text-center">{quantity || 0}</div>;
            },
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
    return (
        <div className="mx-3 mb-3 flex flex-1 flex-col gap-3">
            {userData && userData.role <= 3 && (
                <Card className="flex justify-between p-3">
                    {Object.keys(inventoryDataOverview).map((key, index) => {
                        return (
                            <Card
                                key={index}
                                className={`bg-color flex h-48 w-48 flex-col items-center gap-7 p-5`}
                            >
                                <h3 className="text-base font-bold">{key}</h3>
                                <p className="text-6xl font-bold">
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
            <Card className={`flex flex-1 flex-col gap-3 p-3`}>
                {userData && userData.role <= 3 && (
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-semibold">
                            {Stocksi18n[locale]}
                        </h1>
                        <div className="flex gap-3">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="default">
                                        {AddStocksi18n[locale]}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="flex items-center justify-between text-2xl">
                                            {AddStocksi18n[locale]}
                                            <AlertDialogCancel>
                                                X
                                            </AlertDialogCancel>
                                        </AlertDialogTitle>
                                        <Form {...form}>
                                            <form
                                                onSubmit={form.handleSubmit(
                                                    onSubmit
                                                )}
                                                className="space-y-3"
                                            >
                                                <FormField
                                                    control={form.control}
                                                    name="productName"
                                                    render={({ field }) => (
                                                        <FormItem className="flex flex-col items-center">
                                                            <div className="flex w-full items-center justify-between">
                                                                <FormLabel className="text-lg">
                                                                    {
                                                                        ProdNamei18n[
                                                                        locale
                                                                        ]
                                                                    }
                                                                </FormLabel>
                                                                <FormControl className="w-[60%]">
                                                                    <Input
                                                                        placeholder={
                                                                            ProdNamei18n[
                                                                            locale
                                                                            ]
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
                                                    control={form.control}
                                                    name="price"
                                                    render={({ field }) => (
                                                        <FormItem className="flex flex-col items-center">
                                                            <div className="flex w-full items-center justify-between">
                                                                <FormLabel className="text-lg">
                                                                    {
                                                                        Pricei18n[
                                                                        locale
                                                                        ]
                                                                    }
                                                                </FormLabel>
                                                                <FormControl className="w-[60%]">
                                                                    <Input
                                                                        type="number"
                                                                        placeholder={
                                                                            Pricei18n[
                                                                            locale
                                                                            ]
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
                                                    control={form.control}
                                                    name="quantity"
                                                    render={({ field }) => (
                                                        <FormItem className="flex flex-col items-center">
                                                            <div className="flex w-full items-center justify-between">
                                                                <FormLabel className="text-lg">
                                                                    {
                                                                        Quantityi18n[
                                                                        locale
                                                                        ]
                                                                    }
                                                                </FormLabel>
                                                                <FormControl className="w-[60%]">
                                                                    <Input
                                                                        type="number"
                                                                        placeholder={
                                                                            Quantityi18n[
                                                                            locale
                                                                            ]
                                                                        }
                                                                        {...field}
                                                                    />
                                                                </FormControl>
                                                            </div>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <div className="flex justify-end">
                                                    <Button type="submit">
                                                        {`${Addi18n[locale]}`}
                                                    </Button>
                                                </div>
                                            </form>
                                        </Form>
                                    </AlertDialogHeader>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                )}
                {userData && (
                    <DataTable
                        visibility={{
                            id: false,
                            action: userData.role == 4 && false,
                            ReorderLevel: false,
                            CriticalLevel: false,
                        }}
                        filtering={true}
                        coloumnToFilter="Name"
                        resetSortBtn={true}
                        pageSize={userData.role >= 4 ? 12 : 8}
                        data={getStocksquery.data || []}
                        pagination={true}
                        columns={columns}
                    />
                )}
            </Card>
        </div>
    );
}

export default Inventory;
