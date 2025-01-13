"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Card } from "../ui/card";
import { DataTable } from "../ui/data-table";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "../ui/button";
import { useI18nStore } from "@/store/usei18n";
import { useGlobalStore } from "@/store/useStore";
import { ArrowUpDown } from "lucide-react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { format } from "date-fns";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { headers } from "next/headers";
import { toast } from "../ui/use-toast";


export default function UnusualTransaction() {
    const session = useSession();
    const userData = session.data?.data;
    const role = userData?.role;
    axios.defaults.headers.common[
        "Authorization"
    ] = `Bearer ${session.data?.token}`;

    const { globalBranchState, globalCompanyState } = useGlobalStore();
    const { locale,
            UnusualTransactioni18n,
            CartIDi18n,
            Useri18n,
            Notesi18n,
            Statusi18n,
            Remarksi18n,
            Actioni18n,
            Datei18n,
            Resolvei18n,
            Resolvedi18n,
            Unresolvedi18n,
            Accidentali18n
        } = useI18nStore();
    const [open, setOpen] = useState(false);
    const [selectedUnusualTransaction, setSelectedUnusualTransaction] = useState("")
    const [resolveLoading, setResolveLoading] = useState(false)
        
    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "CartCode",
            header: () => <div className="">{CartIDi18n[locale]}</div>,
            cell: ({ row }) => {
                const cartID: string = row.getValue("CartCode");
                return <div className="">{cartID}</div>;
            },
        },
        {
            accessorKey: "UserName",
            header: () => <div className="">{Useri18n[locale]}</div>,
            cell: ({ row }) => {
                const user: string = row.getValue("UserName");
                return <div className="">{user}</div>;
            },
        },
        {
            accessorKey: "Status",
            header: () => <div className="">{Statusi18n[locale]}</div>,
            cell: ({ row }) => {
                const status: string = row.getValue("Status");
                return (
                    <span
                        className={` text-md font-semibold rounded p-1 ${
                            status === "Resolved"
                                ? "text-green-800 bg-green-100"
                                : status === "Unresolved"
                                ? "text-red-800 bg-red-100"
                                : "text-orange-800 bg-orange-100"
                        }`}
                    >
                        {status}
                    </span>
                );
            },
        },
        {
            accessorKey: "Remarks",
            header: () => <div className="">{Remarksi18n[locale]}</div>,
            cell: ({ row }) => {
                const remarks: string = row.getValue("Remarks");
                return <div className="">{remarks}</div>;
            },
        },
        {
            accessorKey: "CreatedAt",
            header: ({ column }) => (
                <div className="">
                    <Button
                        variant="ghost"
                        className="hover:bg-gray-300 text-start p-0"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                    >
                        {Datei18n[locale]}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            ),
            cell: ({ row }) => {
                
                return <p>{format(new Date(row.getValue("CreatedAt")), "MMM dd, yyyy | hh:mm a")}</p>
            },
        },
        {
            accessorKey: "Action",
            header: () => <div className="">{Actioni18n[locale]}</div>,
            cell: ({ row }) => {
                const UnTransactionId: string = row.getValue("UnusualTransactionId");
                return (
                    <div className="flex gap-3">
                        <Button
                            disabled={row.getValue("Status") !== "Unresolved"}
                            variant="outline"
                            onClick={() => {
                                setSelectedUnusualTransaction(UnTransactionId)
                                setOpen(true)
                            }}
                            className="h-max px-1 py-1"
                        >
                            Resolve
                        </Button>
                    </div>
                );
            },
        },
        {
            id: "UnusualTransactionId",
            accessorKey: "UnusualTransactionId",
        },
        
    ];
    const getUnusualTransaction = useQuery({
        queryKey: ["getUnusualTransaction"],
        enabled: session.data?.token !== undefined,
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
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/pushCart/getUnusualTransactions/cId/${companyId}/bId/${branchId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${session.data?.token}`,
                        },
                    }
                );
                return response.data.data;
            }
        },
    });

    const resolveMutation = useMutation({
        mutationFn: async (data: any) => {
            setResolveLoading(true)
            const response = await axios.patch(
                `${process.env.NEXT_PUBLIC_API_URL}/pushCart/resolveUnusualTransaction/utId/${selectedUnusualTransaction}`,
                {
                    headers: {
                        Authorization: `Bearer ${session.data?.token}`,
                    }
                }
            )
            return response.data
        },

        onSuccess: (data: any) => {
            setResolveLoading(false)
            toast({
                title: "Success",
                description: data.message
            })
            setOpen(false)
            getUnusualTransaction.refetch();
        },
        onError: (data) => {
            setResolveLoading(false)
            toast({
                title: "Oops!",
                description: data.message
            })
        }
    })

    const handleResolve = (id: string) => {
        resolveMutation.mutate({
            UnusualTransactionId: id
        })
    }
    return (
        <div className="flex w-full flex-1">
            <Dialog
                open={open}
                onOpenChange={(open) => {
                    setOpen(false);
                }}
            >
                <DialogContent>
                    <DialogTitle>Resolve Unusual Transaction</DialogTitle>
                    <div>
                        Proceed to resolve Unusual Transaction #{selectedUnusualTransaction}? 
                    </div>
                    <DialogFooter>
                        <Button variant={'outline'} disabled={resolveLoading}>Cancel</Button>
                        <Button variant={'default'} onClick={() => handleResolve(selectedUnusualTransaction)} disabled={resolveLoading}>Resolve</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Card className="mx-3 mb-3 flex w-full flex-1 flex-col gap-3 p-3">
                <h1 className="text-2xl font-semibold">{UnusualTransactioni18n[locale]}</h1>
                <DataTable
                    isLoading={getUnusualTransaction.isLoading}
                    filtering={true}
                    pagination={true}
                    columnsToSearch={["Cart ID"]}
                    data={getUnusualTransaction.data || []}
                    columns={columns}
                    visibility={{ UnusualTransactionId: false }}
                />
            </Card>
        </div>
    );
}
