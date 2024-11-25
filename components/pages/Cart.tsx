"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useGlobalStore } from "@/store/useStore";
import { useI18nStore } from "@/store/usei18n";
import { useMutation, useQuery, UseQueryResult } from "@tanstack/react-query";
import axios from "axios";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { useSession } from "next-auth/react";
import { Textarea } from "../ui/textarea";
import { toast } from "../ui/use-toast";

function Cart() {
    const session = useSession();
    const userData = session.data?.data;
    const [open, setOpen] = useState(false);
    const [openAddReport, setOpenAddReport] = useState(false);
    const [cartReportId, setCartReportId] = useState<number>();
    const [cartReports, setCartReports] = useState<Array<any>>([]);
    const [reportMessage, setReportMessage] = useState<string>("");
    const { globalBranchState, globalCompanyState } = useGlobalStore();
    const [transferableId, setTransferableId] = useState<number>();
    const [transferModal, setTransferModal] = useState(false);
    /* Queries */
    //Axios Config
    axios.defaults.headers.common[
        "Authorization"
    ] = `Bearer ${session.data?.token}`;

    const cartQuery: UseQueryResult<CartInformation[]> = useQuery({
        queryKey: ["getCart"],
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
                    `${process.env.NEXT_PUBLIC_API_URL}/pushCart/getPushCart/cId/${companyId}/bId/${branchId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${session.data?.token}`,
                        },
                    }
                );
                return response.data;
            }
        },
    });
    const reportQuery = useQuery({
        queryKey: ["Cart-reports"],
        enabled: false,
        queryFn: async () => {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/pushCart/getPushCartReport`,
                {
                    cartId: cartReportId,
                }
            );
            setCartReports(response.data);

            return response.data;
        },
    });
    const addReportMutation = useMutation({
        mutationFn: async (data: {
            cartId: number | undefined;
            report: string;
        }) => {
            axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/pushCart/addPushCartReport`,
                data
            );
        },
        onSuccess: () => {
            toast({
                title: CartReportedi18n[locale],
                description: SuccesfullySentACartReporti18n[locale],
            });
            setCartReportId(0);
            setOpenAddReport(false);
            setReportMessage("");
        },
        onError: (data) => {
            console.error(data);
        },
    });
    const transferMutation = useMutation({
        mutationFn: async (data: number | undefined) => {
            console.log(data);
            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/transaction/editTransferStatus/id/${data}`
            );
        },
        mutationKey: ["transfer flagged cart"],
        onSuccess: () => {
            cartQuery.refetch();
            toast({
                title: TransferPermittedi18n[locale],
                description: SuccesfullyPermittedCartContentTransferi18n[locale],
            });
        },
    });
    /* Effects */
    useEffect(() => {
        reportQuery.refetch();
    }, [cartReportId]);
    useEffect(() => {
        cartQuery.refetch();
    }, [globalBranchState, globalCompanyState]);
    const {
        locale,
        cartsi18n,
        Batteryi18n,
        Statusi18n,
        Actioni18n,
        Reporti18n,
        Useri18n,
        InUsei18n,
        LowBatteryi18n,
        Availablei18n,
        Chargingi18n,
        Maintenancei18n,
        AddReporti18n,
        CartIDi18n,
        Closei18n,
        AddReportForCartIDi18n,
        EnterReporti18n,
        Canceli18n,
        CartReportedi18n,
        SuccesfullySentACartReporti18n,
        TransferPermittedi18n,
        SuccesfullyPermittedCartContentTransferi18n
    } = useI18nStore();
    const columns: ColumnDef<CartInformation>[] = [
        {
            accessorKey: "CartCode",
            header: cartsi18n[locale],
        },
        {
            accessorKey: "TransactionId",
        },
        {
            accessorKey: "Battery",
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
                            {Batteryi18n[locale]}
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                );
            },
            cell: ({ row }) => {
                const battery: number = row.getValue("Battery");
                return (
                    <div
                        className={`mx-auto w-[70px] text-center rounded px-3 py-1 font-semibold text-white ${
                            battery <= 10
                                ? "bg-red-400"
                                : battery <= 50
                                ? "bg-orange-400"
                                : "bg-green-400"
                        }`}
                    >
                        % {battery}
                    </div>
                );
            },
        },
        {
            accessorKey: "PushCartStatusId",
            header: ({ column,table }) => {
                return (
                    <div className="flex flex-col items-center">
                        <Button
                            variant="ghost"
                            className="hover:bg-gray-300"
                            onClick={() => {
                                table
                                    .getColumn("status")
                                    ?.toggleSorting(
                                        table
                                            .getColumn("status")
                                            ?.getIsSorted() === "asc"
                                    );
                            }}
                        >
                            {Statusi18n[locale]}
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                );
            },

            cell: ({ row }) => {
                const status: string = row.getValue("status");
                const statusValObj: {
                    [key: string]: string;
                    Charging: string;
                    LowBattery: string;
                    Available: string;
                    InUse: string;
                    Maintenance: string;
                } = {
                    Charging: Chargingi18n[locale],
                    LowBattery: LowBatteryi18n[locale],
                    Available: Availablei18n[locale],
                    InUse: InUsei18n[locale],
                    Maintenance: Maintenancei18n[locale],
                };
                const statusValue = statusValObj[status];
                return (
                    <div
                        className={`mx-auto rounded py-1 px-2 font-semibold text-center w-[8.9rem]  ${
                            statusValue == Chargingi18n[locale]
                                ? "bg-orange-400 text-white/80"
                                : statusValue == LowBatteryi18n[locale]
                                ? "bg-red-400 text-white/80"
                                : statusValue == Availablei18n[locale]
                                ? "bg-green-400 text-white/80"
                                : statusValue == Maintenancei18n[locale]
                                ? "bg-yellow-400 text-white/80"
                                : "bg-blue-400 text-white/80"
                        }`}
                    >
                        {statusValObj[status]}
                    </div>
                );
            },
        },
        {
            accessorKey: "Costumer",
            header: () => <div className="text-center">{Useri18n[locale]}</div>,
            cell: ({ row }) => {
                const firstname: string = row.getValue("Firstname");
                const lastname: string = row.getValue("LastName");
                const user: string | null =
                    firstname && lastname
                        ? `${row.getValue("Firstname")} ${row.getValue(
                              "LastName"
                          )}`
                        : "No User";
                return <div className="text-center font-semibold">{user}</div>;
            },
        },
        {
            accessorKey: "asd",
            header: () => (
                <div className="text-center">{Actioni18n[locale]}</div>
            ),
            cell: ({ row }) => {
                const firstname: string = row.getValue("Firstname");
                const lastname: string = row.getValue("LastName");
                const user: string | null =
                    firstname && lastname
                        ? `${row.getValue("Firstname")} ${row.getValue(
                              "LastName"
                          )}`
                        : null;
                return (
                    <div className="flex justify-center gap-2">
                        {userData?.role >= 2 && (
                            <Button
                                variant={"outline"}
                                className="h-max px-3 py-1"
                                onClick={() => {
                                    setCartReportId(row.getValue("PushCartId"));
                                    setOpenAddReport(true);
                                }}
                            >
                                {AddReporti18n[locale]}
                            </Button>
                        )}
                        <Button
                            className="h-max px-3 py-1"
                            onClick={() => {
                                setCartReportId(row.getValue("PushCartId"));
                                setOpen(true);
                            }}
                        >
                            {Reporti18n[locale]}
                        </Button>
                    </div>
                );
            },
        },
        {
            accessorKey: "TransferableTransaction",
        },
        {
            accessorKey: "Firstname",
        },
        {
            accessorKey: "LastName",
        },
        {
            accessorKey: "status",
        },
        {
            accessorKey: "PushCartId",
        },
    ];
    return (
        <div className="mx-3 mb-3 flex w-full flex-1">
            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <div className="flex items-center justify-between">
                            <AlertDialogTitle className="flex gap-2 font-semibold">
                                {CartIDi18n[locale]}
                                <h1 className="font-medium italic">
                                    {cartReportId}
                                </h1>
                                {Reporti18n[locale]}
                            </AlertDialogTitle>
                            <AlertDialogCancel>{Closei18n[locale]}</AlertDialogCancel>
                        </div>
                        <div className="z-0 h-40 overflow-auto">
                            {cartReports.length > 0 ? (
                                <div className="flex flex-col items-center">
                                    {cartReports.map(
                                        (item: any, index: number) => {
                                            return (
                                                <div
                                                    key={index}
                                                    className="mb-5 w-full rounded border px-2 py-3 text-center"
                                                >
                                                    <h1 className="font-semibold">
                                                        {Reporti18n[locale]} #:
                                                        {item.RowOrder}
                                                    </h1>
                                                    <p>{item.ReportMessage}</p>
                                                </div>
                                            );
                                        }
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <p>No Reports</p>
                                </div>
                            )}
                        </div>
                    </AlertDialogHeader>
                </AlertDialogContent>
            </AlertDialog>
            <AlertDialog open={openAddReport} onOpenChange={setOpenAddReport}>
                <AlertDialogContent>
                    <AlertDialogHeader className="flex flex-col gap-2">
                        <h1 className="font-semibold">
                            {AddReportForCartIDi18n[locale]} : {cartReportId}
                        </h1>
                        <Textarea
                            placeholder={EnterReporti18n[locale]}
                            className="h-60 text-lg"
                            onChange={(e) => setReportMessage(e.target.value)}
                            value={reportMessage}
                        />
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{Canceli18n[locale]}</AlertDialogCancel>
                        <Button
                            onClick={async () => {
                                addReportMutation.mutate({
                                    cartId: cartReportId,
                                    report: reportMessage,
                                });
                            }}
                        >
                            {AddReporti18n[locale]}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <Card className="flex w-full flex-col gap-3 overflow-auto p-3">
                <h1 className="text-2xl font-semibold">{cartsi18n[locale]}</h1>
                <DataTable
                    pageSize={11}
                    data={cartQuery.data ?? []}
                    pagination={true}
                    resetSortBtn={true}
                    columns={columns}
                    filtering={true}
                    columnsToSearch={["CartCode"]}
                    isLoading={cartQuery.isPending}
                    visibility={{
                        Firstname: false,
                        LastName: false,
                        TransferableTransaction: false,
                        TransactionId: false,
                        status: false,
                        PushCartId: false,
                    }}
                />
            </Card>
        </div>
    );
}

export default Cart;
