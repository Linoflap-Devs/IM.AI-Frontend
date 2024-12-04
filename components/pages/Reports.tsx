"use client";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { faker } from "@faker-js/faker/locale/en";
import { Skeleton } from "../ui/skeleton";
import { DataTable } from "../ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import type { ChartOptions, ChartData } from "chart.js";
import { useGlobalStore } from "@/store/useStore";
import { useSession } from "next-auth/react";
import { useI18nStore } from "@/store/usei18n";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover";
import { addDays, format } from "date-fns";
/* import { CalendarIcon, Calendar } from "lucide-react"; */
import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { ArrowUpDown, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
const labels = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

function Reports() {
    const session = useSession();
    const userData = session.data?.data;
    const currentPath = usePathname();
    
    const {
        locale,
        localeExtended,
        PickADatei18n,
        Profiti18n,
        Salesi18n,
        Producti18n,
        IDi18n,
        ProdNamei18n,
        Categoryi18n,
        Revenuei18n,
        Viewi18n,
        Downloadi18n,
        SalesReporti18n,
        ReferenceNumberi18n,
        Pricei18n,
        Itemsi18n,
        Datei18n,
        PleaseSelectACompanyOrABranchi18n
    } = useI18nStore();
    const { globalCompanyState, globalBranchState } = useGlobalStore();
    const [date, setDate] = useState<DateRange | undefined>({
        from: addDays(new Date(Date.now()), -7),
        to: new Date(Date.now()),
    });
    const getSales = useQuery({
        queryKey: ["getSales"],
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
                const from = date?.from?.toISOString();
                const to = date?.to?.toISOString();
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/transaction/getSales/cId/${companyId}/bId/${branchId}/from/${from}/to/${to}`
                );
                return response.data;
            }
        },
    });
    const getMonthlySales = useQuery({
        queryKey: ["getMonthlySales"],
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
                    `${process.env.NEXT_PUBLIC_API_URL}/transaction/getMonthlySales/cId/${companyId}/bId/${branchId}`
                );
                console.log(response.data);
                return response.data[0]
                    ? response.data[0]
                    : [
                          {
                              January: 0,
                              February: 0,
                              March: 0,
                              April: 0,
                              May: 0,
                              June: 0,
                              July: 0,
                              August: 0,
                              September: 0,
                              October: 0,
                              November: 0,
                              December: 0,
                          },
                      ];
            }
        },
    });

    const options: ChartOptions<"line"> = {
        responsive: true as boolean,
        aspectRatio: 5 as number,
        plugins: {
            legend: {
                position: "top" as const,
            },
            /* title: {
                display: true as boolean,
                text: (`${Salesi18n[locale]} Report` as string),
                font: {
                    size: 20 as number,
                    weight: "600" as string,
                },
            }, */
        },
    };
    const column: ColumnDef<ProductPerformance>[] = [
        {
            accessorKey: "ReferenceNumber",
            header: ReferenceNumberi18n[locale],
        },
        {
            accessorKey: "Price",
            header: ({ table }) => {
                return (
                    <div className="flex justify-end">
                        {Pricei18n[locale]}
                    </div>
                );
            },
            cell: ({ row }) => {
                return (
                    <div className="text-end">
                        <span className="font-bold">¥</span>
                        {parseInt(row.getValue("Price")).toFixed(2)}
                    </div>
                );
            },
        },
        {
            accessorKey: "Quantity",
            header: () => {
                return <div className="text-center">{Itemsi18n[locale]}</div>;
            },
            cell: ({ row }) => {
                return (
                    <div className="text-center">
                        {row.getValue("Quantity")}
                    </div>
                );
            },
        },
        {
            accessorKey: "CreatedAt",
            header: ({ table }) => {
                return (
                    <div className="flex justify-center">
                        {" "}
                        <Button
                            variant="ghost"
                            className="hover:bg-gray-300"
                            onClick={() => {
                                table
                                    .getColumn("CreatedAt")
                                    ?.toggleSorting(
                                        table
                                            .getColumn("CreatedAt")
                                            ?.getIsSorted() === "asc"
                                    );
                            }}
                        >
                            {Datei18n[locale]}
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
                } else {
                    return null;
                }
            },
        },
    ];
    const data: ChartData<"line"> = {
        labels: labels,
        datasets: [
            {
                label: Salesi18n[locale],
                data: Object.values(getMonthlySales.data || {}).map(
                    (val) => val
                ) as number[],
                borderColor: "rgb(53, 162, 235)",
                backgroundColor: "rgba(53, 162, 235, 0.5)",
            },
        ],
    };
    useEffect(() => {
        getSales.refetch();
        getMonthlySales.refetch();
    }, [globalBranchState, globalCompanyState, date]);
    return (
        <div className="mx-3 mb-3 flex flex-1">
            <Card className="flex flex-1 flex-col gap-3 p-3">
                <Card className="p-4">
                    {globalBranchState === "all" &&
                    globalCompanyState === "all" ? (
                        <div className="flex h-[284px] w-[1466px] items-center justify-center">
                            <h1 className="text-center text-2xl font-bold">
                                {PleaseSelectACompanyOrABranchi18n[locale]}
                            </h1>
                        </div>
                    ) : (
                        <>
                            <h1 className="py-1 text-xl font-bold">
                                {SalesReporti18n[locale]}
                            </h1>
                            <Line options={options} data={data} />
                        </>
                    )}
                </Card>
                <div className="align-center flex gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant="outline"
                                className={cn(
                                    "w-[300px] justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date?.from ? (
                                    date.to ? (
                                        <>
                                            {format(date.from, "LLL dd, y", {
                                                locale: localeExtended[locale],
                                            })}{" "}
                                            -{" "}
                                            {format(date.to, "LLL dd, y", {
                                                locale: localeExtended[locale],
                                            })}
                                        </>
                                    ) : (
                                        format(date.from, "LLL dd, y")
                                    )
                                ) : (
                                    <span>{PickADatei18n[locale]}</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
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
                    <Button
                        className="bg-green-500 hover:bg-green-600"
                        onClick={() => {
                            console.log(currentPath);
                        }}
                    >
                        {Downloadi18n[locale]}
                    </Button>
                </div>
                <DataTable
                    isLoading={getSales.isPending}
                    pagination={true}
                    data={getSales.data || []}
                    columns={column}
                    pageSize={5}
                    resetSortBtn={true}
                    filtering={true}
                    columnsToSearch={["ReferenceNumber", "CreatedAt"]}
                />
            </Card>
        </div>
    );
}

export default Reports;
