"use client";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Card } from "../ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowUpRight } from "lucide-react";
import { useI18nStore } from "@/store/usei18n";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, UseQueryResult } from "@tanstack/react-query";
import axios from "axios";
import { useGlobalStore } from "@/store/useStore";
import { useEffect, useState } from "react";

import { CalendarIcon } from "lucide-react";
import { addDays, format } from "date-fns";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "../ui/use-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../ui/alert-dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { Sheet, SheetContent, SheetHeader } from "../ui/sheet";
import { useStore } from "zustand";

function TransactionHistory() {
    const session = useSession();
    const userData = session.data?.data;
    const { globalBranchState, globalCompanyState } = useGlobalStore();
    const {
        Actioni18n,
        locale,
        DateTimei18n,
        cartsi18n,
        Carti18n,
        Customeri18n,
        TransactionStatusi18n,
        TransactionHistoryi18n,
        IDi18n,
        ReferenceNumberi18n,
        localeExtended,
        Downloadi18n,
        AllowTransferi18n,
        Successi18n,
        Cancelledi18n,
        OnGoingi18n,
        TransferPermittedi18n,
        SuccesfullyPermittedCartContentTransferi18n,
        Continuei18n,
        DoYouWantToAllowThisCartToTransferItsTransactionsi18n,
        Canceli18n,
        Itemsi18n,
        Datei18n,
        PleaseSelectACompanyOrABranchi18n,
        RetailPrice,
        PurchasePrice,
        CurrencyMarker,
        Quantityi18n
    } = useI18nStore();

    const {
        fromReportDate, toReportDate, setFromReportDate, setToReportDate
    } = useGlobalStore();

    const [open, setOpen] = useState<boolean>(false)
    const [transferableId, setTransferableId] = useState<number>();
    const [transferModal, setTransferModal] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<string>()
    const [selectedTransactionParent, setSelectedTransactionParent] = useState<any>()

    const [date, setDate] = useState<DateRange | undefined>({
        from: fromReportDate,
        to: toReportDate,
    });
    /* QUeries */
    axios.defaults.headers.common[
        "Authorization"
    ] = `Bearer ${session.data?.token}`;
    const transferMutation = useMutation({
        mutationFn: async (data: number | undefined) => {
            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/transaction/editTransferStatus/id/${data}`
            );
        },
        mutationKey: ["transfer flagged cart"],
        onSuccess: () => {
            transactionQuery.refetch();
            toast({
                title: TransferPermittedi18n[locale],
                description: SuccesfullyPermittedCartContentTransferi18n[locale],
            });
        },
    });
    const transactionQuery: UseQueryResult<TransactionTableData[]> = useQuery({
        queryKey: [`transaction`, format(new Date(date?.from!), 'yyyy-MM-dd'), format(new Date(date?.to!), 'yyyy-MM-dd')],
        enabled: session.data?.token !== undefined,
        retryOnMount: true,
        /* refetchInterval: 10000, */
        queryFn: async () => {
            if (session.data?.token !== undefined) {
                const companyId =
                    globalCompanyState !== "all"
                        ? globalCompanyState
                        : userData?.companyId;
                const branchId =
                    globalBranchState !== "all"
                        ? globalBranchState
                        : userData?.branchId;
                const from = format(new Date(date?.from!), 'yyyy-MM-dd');
                const to = format(addDays(new Date(date?.to!), 1), 'yyyy-MM-dd');

                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/transaction/getTransactions/cId/${companyId}/bId/${branchId}/from/${from}/to/${to}`
                );
                return response.data;
            }
        },
    });

    const getTransactionQuery = useQuery({
        queryKey: ["GetTransaction", selectedTransaction],
        enabled: selectedTransaction !== undefined,
        queryFn: async () => {
            if (session.data?.token !== undefined) {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/transaction/getTransaction/rNo/${selectedTransaction}`
                );
                return response.data;
            }
        }
    })
    const columns: ColumnDef<TransactionTableData>[] = [
        {
            accessorKey: "ReferenceNumber",
            header: ReferenceNumberi18n[locale],
            cell: ({ row }) => {
                return (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant={"link"}
                                    className=" decoration-black m-0 p-0"
                                    onClick={() => {
                                        setSelectedTransaction(row.getValue("ReferenceNumber"))
                                        setSelectedTransactionParent({
                                            ReferenceNumber: row.getValue("ReferenceNumber"),
                                            CreatedAt: row.getValue("CreatedAt"),
                                            Price: row.getValue("Price")
                                        })
                                        setOpen(true)
                                    }}
                                >
                                    <div className="flex justify-start items-center text-black">
                                        <span className="">{row.getValue("ReferenceNumber")}</span>
                                        <ArrowUpRight className="ml-2 h-4 w-4"></ArrowUpRight>
                                    </div>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                View Transaction Details
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                );
            },
        },
        {
            accessorKey: "CreatedAt",
            header: ({ column }) => {
                return (
                    <div className="flex flex-col">
                        <Button
                            variant="ghost"
                            className="text-center hover:bg-gray-300"
                            onClick={() => {
                                column.toggleSorting(
                                    column.getIsSorted() === "asc"
                                );
                            }}
                        >
                            {DateTimei18n[locale]}
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                );
            },
            cell: ({ row }) => {
                const dateVal = row.getValue("CreatedAt");
                if (dateVal !== null) {
                    const date: Date = new Date(
                        (row.getValue("CreatedAt") as string)
                            .replace("T", " ")
                            .replace("Z", "")
                    );
                    const formattedDate = date.toLocaleDateString(locale, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    });
                    const formattedTime = date.toLocaleTimeString(locale, {
                        hour: "numeric",
                        minute: "numeric",
                        hour12: true,
                    });

                    return (
                        <div className="text-center">
                            {formattedDate} | {formattedTime}
                        </div>
                    );
                } else {
                    return null;
                }
            },

        },
        {
            accessorKey: "PushCartId",
            header: () => (
                <div className="text-center">{`${Carti18n[locale]} ${IDi18n[locale]}`}</div>
            ),
            cell: ({ row }) => {
                return (
                    <div className="text-center">
                        {row.getValue("PushCartId")}
                    </div>
                );
            },
        },
        {
            accessorKey: "Costumer",
            header: () => (
                <div className="text-center">{Customeri18n[locale]}</div>
            ),
            cell: ({ row }) => {
                return (
                    <div className="text-center">
                        {row.getValue("Costumer")}
                    </div>
                );
            },
        },
        {
            accessorKey: "TransactionStatus",
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
                            {TransactionStatusi18n[locale]}
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                );
            },
            cell: ({ row }) => {
                const status: string = row.getValue("TransactionStatus");
                const statusObject = {
                    Success: "text-green-400",
                    Cancelled: "text-red-600",
                    "On-Going": "text-orange-400",
                };
                return (
                    <div
                        className={`text-center text-md font-semibold ${statusObject[status as keyof typeof statusObject]
                            }`}
                    >
                        {status}
                    </div>
                );
            },
        },
        {
            accessorKey: "asd",
            header: () => (
                <div className="text-center">{Actioni18n[locale]}</div>
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex justify-center gap-2">
                        <Button
                            className="h-max px-3 py-1"
                            disabled={
                                row.getValue("TransactionStatus") ===
                                "Success" ||
                                row.getValue("TransferableTransaction") == true
                            }
                            onClick={() => {
                                setTransferableId(
                                    row.getValue("TransactionId")
                                );
                                setTransferModal(true);
                            }}
                        >
                            {AllowTransferi18n[locale]}
                        </Button>
                    </div>
                );
            },
        },
        {
            accessorKey: "TransactionId",
        },
        {
            accessorKey: "TransferableTransaction",
        },
    ];


    const transactionDetailColumns: ColumnDef<any>[] = [
        {
            accessorKey: "Name",
            header: "Product Name"
        },
        {
            accessorKey: "Price",
            header: () => {
                return (
                    <div className="text-end">
                        {RetailPrice[locale]}
                    </div>
                );
            },
            cell: ({ row }) => {
                return (
                    <div className="text-end">
                        <span className="font-bold">{CurrencyMarker[locale]}</span>
                        {parseInt(row.getValue("Price")).toFixed(2)}
                    </div>
                );
            },
        },
        {
            accessorKey: "Quantity",
            header: () => {
                return (
                    <div className="text-end">
                        {Quantityi18n[locale]}
                    </div>
                );
            },
            cell: ({ row }) => {
                return (
                    <div className="text-end">
                        {row.getValue("Quantity")}
                    </div>
                );
            },
        }
    ]

    useEffect(() => {
        transactionQuery.refetch();
    }, [globalBranchState, globalCompanyState, date]);

    useEffect(() => {
        setDate({ from: fromReportDate, to: toReportDate });
    }, [fromReportDate, toReportDate]);

    const handleDateChange = (val: DateRange | undefined) => {
        setDate(val);
        setFromReportDate(val?.from || new Date());
        setToReportDate(val?.to || new Date());
    }

    return (
        <div className="mx-3 flex flex-1">
            <AlertDialog open={transferModal} onOpenChange={setTransferModal}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {AllowTransferi18n[locale]}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {DoYouWantToAllowThisCartToTransferItsTransactionsi18n[locale]}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{Canceli18n[locale]}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                transferMutation.mutate(transferableId);
                            }}
                        >
                            {Continuei18n[locale]}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <Card className="mb-3 flex flex-1 flex-col gap-3 p-3">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">
                        {TransactionHistoryi18n[locale]}
                    </h1>
                    <div className="align-center flex gap-2">
                        <Button className="bg-green-400 hover:bg-green-400/70">
                            {Downloadi18n[locale]}
                        </Button>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="date"
                                    variant={"outline"}
                                    className={cn(
                                        "w-[300px] justify-start text-left font-normal",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date?.from ? (
                                        date.to ? (
                                            <>
                                                {format(
                                                    date.from,
                                                    "LLL dd, y",
                                                    {
                                                        locale: localeExtended[
                                                            locale
                                                        ],
                                                    }
                                                )}{" "}
                                                -{" "}
                                                {format(date.to, "LLL dd, y", {
                                                    locale: localeExtended[
                                                        locale
                                                    ],
                                                })}
                                            </>
                                        ) : (
                                            format(date.from, "LLL dd, y")
                                        )
                                    ) : (
                                        <span>Pick a date</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-auto p-0"
                                align="start"
                            >
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={date?.from}
                                    selected={date}
                                    onSelect={handleDateChange}
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
                <DataTable
                    filtering={true}
                    columnsToSearch={["ReferenceNumber", "PushCartId"]}
                    resetSortBtn={true}
                    pageSize={11}
                    data={transactionQuery.data ?? []}
                    pagination={true}
                    columns={columns}
                    visibility={{
                        TransactionId: false,
                        TransferableTransaction: false,
                    }}
                    isLoading={transactionQuery.isPending}
                />
            </Card>
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent className="w-[600px] sm:w-lg max-w-[600px]">
                    <SheetHeader>
                        <h1 className="text-2xl font-semibold">
                            Transaction Details
                        </h1>
                    </SheetHeader>

                    <div className="flex w-full flex-col gap-3 py-5">
                        {
                            selectedTransactionParent && (
                                <div className="flex flex-col gap-4 border-b pb-4">
                                    <div className="flex flex-row justify-between items-center border-b pb-2">
                                        <p className="">Reference Number</p>
                                        <p className="font-semibold text-right p-1">{selectedTransactionParent.ReferenceNumber || ""}</p>
                                    </div>
                                    <div className="flex flex-row justify-between items-center border-b pb-2">
                                        <p className="">Transaction Date</p>
                                        <p className="font-semibold text-right p-1">{format(new Date(selectedTransactionParent.CreatedAt), "MMM dd, yyyy | hh:mm a")}</p>
                                    </div>
                                    <div className="flex flex-row justify-between items-center">
                                        <p className="">Total Price</p>
                                        <p className="font-semibold text-right p-1">{CurrencyMarker[locale]}{parseInt(selectedTransactionParent.Price || "0").toFixed(2)}</p>
                                    </div>
                                </div>
                            )
                        }
                        <p className="font-semibold">Items</p>
                        <DataTable
                            columns={transactionDetailColumns}
                            pagination={true}
                            data={getTransactionQuery.data ?? []}
                            pageSize={10}
                            filtering={true}
                            isLoading={getTransactionQuery.isLoading}
                            columnsToSearch={["Name", "PushCartId"]}
                        />
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}

export default TransactionHistory;
