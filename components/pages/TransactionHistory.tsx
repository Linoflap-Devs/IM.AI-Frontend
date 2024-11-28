"use client";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Card } from "../ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
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

function TransactionHistory() {
    const session = useSession();
    const userData = session.data?.data;
    const { globalBranchState, globalCompanyState } = useGlobalStore();
    const {
        Actioni18n,
        locale,
        DateTimei18n,
        cartsi18n,
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
        Canceli18n
    } = useI18nStore();
    const [transferableId, setTransferableId] = useState<number>();
    const [transferModal, setTransferModal] = useState(false);

    const [date, setDate] = useState<DateRange | undefined>({
        from: addDays(new Date(Date.now()), -7),
        to: new Date(Date.now()),
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
        queryKey: [`transaction`],
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
                const from = date?.from?.toISOString();
                const to = date?.to?.toISOString();

                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/transaction/getTransactions/cId/${companyId}/bId/${branchId}/from/${from}/to/${to}`
                );
                return response.data;
            }
        },
    });
    const columns: ColumnDef<TransactionTableData>[] = [
        { 
            accessorKey: "ReferenceNumber", 
            header: ReferenceNumberi18n[locale],
            cell: ({row}) => {
                const id = row.getValue("TransactionId");
                return (
                    <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Link
                                            className="w-full text-nowrap p-0 font-medium hover:text-primary hover:underline"
                                            href={`/home/reports/${id}`}
                                        >
                                            {row.getValue("ReferenceNumber")}
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {row.getValue("ReferenceNumber")}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                );
            } 
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
                const date: Date = new Date(
                    (row.getValue("CreatedAt") as string)
                        .replace("T", " ")
                        .replace("Z", "")
                );
                return (
                    <div className="text-center">
                        {date.toLocaleDateString(locale, {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "numeric",
                            minute: "numeric",
                            hour12: true,
                        })}
                    </div>
                );
            },
        },
        {
            accessorKey: "PushCartId",
            header: () => (
                <div className="text-center">{`${cartsi18n[locale]} ${IDi18n[locale]}`}</div>
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
                        className={`text-center text-md font-semibold ${
                            statusObject[status as keyof typeof statusObject]
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
                                /* setTransferableId(
                                    row.getValue("TransactionId")
                                );
                                setTransferModal(true); */
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
    useEffect(() => {
        transactionQuery.refetch();
    }, [globalBranchState, globalCompanyState, date]);
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
                                    onSelect={setDate}
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
                <DataTable
                    filtering={true}
                    columnsToSearch={["ReferenceNumber"]}
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
        </div>
    );
}

export default TransactionHistory;
