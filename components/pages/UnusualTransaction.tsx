"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Card } from "../ui/card";
import { DataTable } from "../ui/data-table";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../ui/button";
import { useI18nStore } from "@/store/usei18n";
import { ArrowUpDown } from "lucide-react";
export default function UnusualTransaction() {
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
        
    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "Cart ID",
            header: () => <div className="text-center">{CartIDi18n[locale]}</div>,
            cell: ({ row }) => {
                const cartID: string = row.getValue("Cart ID");
                return <div className="text-center">{cartID}</div>;
            },
        },
        {
            accessorKey: "User",
            header: () => <div className="text-center">{Useri18n[locale]}</div>,
            cell: ({ row }) => {
                const user: string = row.getValue("User");
                return <div className="text-center">{user}</div>;
            },
        },
        {
            accessorKey: "Note",
            header: () => <div className="text-center">{Notesi18n[locale]}</div>,
            cell: ({ row }) => {
                const note: string = row.getValue("Note");
                return <div className="text-center">{note}</div>;
            },
        },
        {
            accessorKey: "Status",
            header: () => <div className="text-center">{Statusi18n[locale]}</div>,
            cell: ({ row }) => {
                const status: string = row.getValue("Status");
                return (
                    <div
                        className={`text-center text-md font-semibold ${
                            status === "Resolved"
                                ? "text-green-400 "
                                : status === "Unresolved"
                                ? "text-red-600 "
                                : "text-orange-400 "
                        }`}
                    >
                        {status}
                    </div>
                );
            },
        },
        {
            accessorKey: "Remarks",
            header: () => <div className="text-center">{Remarksi18n[locale]}</div>,
            cell: ({ row }) => {
                const remarks: string = row.getValue("Remarks");
                return <div className="text-center">{remarks}</div>;
            },
        },
        {
            accessorKey: "Action",
            header: () => <div className="text-center">{Actioni18n[locale]}</div>,
            cell: ({ row }) => {
                const UnTransactionId = row.getValue("UnTransactionId");
                return (
                    <div className="flex justify-center gap-3">
                        <Button
                            disabled={row.getValue("Status") !== "Unresolved"}
                            variant="outline"
                            onClick={() => {
                                console.log(UnTransactionId);
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
            accessorKey: "Date",
            header: ({ column }) => (
                <div className="flex flex-col items-center">
                    <Button
                        variant="ghost"
                        className="hover:bg-gray-300"
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
                const date: Date = row.getValue("Date");
                return (
                    <div className="text-center">
                        {date.toLocaleDateString(locale, {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}
                    </div>
                );
            },
        },
        {
            accessorKey: "UnTransactionId",
        },
    ];
    const getUnusualTransaction = useQuery({
        queryKey: ["getUnusualTransaction"],
        queryFn: async () => {
            return [
                {
                    User: "Juan Dela Cruz",
                    "Cart ID": "Cart-001-01",
                    Note: "Product Switch",
                    Remarks: "N/A",
                    Status: "Unresolved",
                    Date: new Date("2024-09-23"),
                },
                {
                    User: "Juan Dela Cruz",
                    "Cart ID": "Cart-001-01",
                    Note: "Product Switch",
                    Remarks: "Accidental",
                    Status: "Fake",
                    Date: new Date("2024-09-23"),
                },
                {
                    User: "Juan Dela Cruz",
                    "Cart ID": "Cart-001-01",
                    Note: "Product Switch",
                    Remarks: "Accidental",
                    Status: "Resolved",
                    Date: new Date("2024-09-23"),
                },
                {
                    User: "Juan Dela Cruz",
                    "Cart ID": "Cart-001-01",
                    Note: "Product Switch",
                    Remarks: "Accidental",
                    Status: "Resolved",
                    Date: new Date("2024-09-23"),
                },
                {
                    User: "Juan Dela Cruz",
                    "Cart ID": "Cart-001-01",
                    Note: "Product Switch",
                    Remarks: "Accidental",
                    Status: "Resolved",
                    Date: new Date("2024-09-23"),
                },
                {
                    User: "Juan Dela Cruz",
                    "Cart ID": "Cart-001-01",
                    Note: "Product Switch",
                    Remarks: "Accidental",
                    Status: "Resolved",
                    Date: new Date("2024-09-23"),
                },
                {
                    User: "Juan Dela Cruz",
                    "Cart ID": "Cart-001-01",
                    Note: "Product Switch",
                    Remarks: "Accidental",
                    Status: "Resolved",
                    Date: new Date("2024-09-23"),
                },
                {
                    User: "Juan Dela Cruz",
                    "Cart ID": "Cart-001-01",
                    Note: "Product Switch",
                    Remarks: "Accidental",
                    Status: "Resolved",
                    Date: new Date("2024-09-23"),
                },
                {
                    User: "Juan Dela Cruz",
                    "Cart ID": "Cart-001-01",
                    Note: "Product Switch",
                    Remarks: "Accidental",
                    Status: "Resolved",
                    Date: new Date("2024-09-23"),
                },
                {
                    User: "Juan Dela Cruz",
                    "Cart ID": "Cart-001-01",
                    Note: "Product Switch",
                    Remarks: "Accidental",
                    Status: "Resolved",
                    Date: new Date("2024-09-23"),
                },
                {
                    User: "Juan Dela Cruz",
                    "Cart ID": "Cart-001-01",
                    Note: "Product Switch",
                    Remarks: "Accidental",
                    Status: "Resolved",
                    Date: new Date("2024-09-23"),
                },
                {
                    User: "Juan Dela Cruz",
                    "Cart ID": "Cart-001-01",
                    Note: "Product Switch",
                    Remarks: "Accidental",
                    Status: "Resolved",
                    Date: new Date("2024-09-23"),
                },
                {
                    User: "Juan Dela Cruz",
                    "Cart ID": "Cart-001-01",
                    Note: "Product Switch",
                    Remarks: "Accidental",
                    Status: "Unresolved",
                    Date: new Date("2024-09-23"),
                },
            ];
        },
    });
    return (
        <div className="flex w-full flex-1">
            <Card className="mx-3 mb-3 flex w-full flex-1 flex-col gap-3 p-3">
                <h1 className="text-2xl font-semibold">{UnusualTransactioni18n[locale]}</h1>
                <DataTable
                    isLoading={getUnusualTransaction.isLoading}
                    filtering={true}
                    pagination={true}
                    columnsToSearch={["Cart ID"]}
                    data={getUnusualTransaction.data || []}
                    columns={columns}
                    visibility={{ UnTransactionId: false }}
                />
            </Card>
        </div>
    );
}
