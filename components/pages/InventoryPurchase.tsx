import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { addDays, format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import type { ChartOptions, ChartData } from "chart.js";
import { Line } from "react-chartjs-2";
import { faker } from "@faker-js/faker/locale/en";
import { Skeleton } from "../ui/skeleton";
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
import { Card } from "../ui/card";
import { useGlobalStore } from "@/store/useStore";
import { useI18nStore } from "@/store/usei18n";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const labels = ["January", "February", "March", "April", "May", "June", "July"];

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface InventoryPurchaseProps {
    transactions: any[];
}

function InventoryPurchase({transactions}: InventoryPurchaseProps) {
    const session = useSession();
    const userData = session.data?.data;
    const {
        locale,
        localeExtended,
        BranchNamei18n,
        PurchaseDatei18n,
        QuantitySoldi18n,
        TotalCosti18n,
        Viewi18n,
    } = useI18nStore();
    const { purchasePerfTableData, globalCompanyState, globalBranchState, fromReportDate, toReportDate, setProductPurchaseDateRange, productPurchaseDateRange } =
        useGlobalStore();
    const options: ChartOptions<"line"> = {
        responsive: true as boolean,
        aspectRatio: 2 as number,
        plugins: {
            legend: {
                position: "top" as const,
            },
            title: {
                display: true as boolean,
                text: "Product Performance" as string,
                font: {
                    size: 24 as number,
                    weight: "600" as string,
                },
            },
        },
    };
    const data: ChartData<"line"> = {
        labels,
        datasets: [
            {
                label: "Sales",
                data: labels.map(() =>
                    faker.number.int({ min: 10000, max: 20000 })
                ),
                borderColor: "rgb(255, 99, 132)",
                backgroundColor: "rgba(255, 99, 132, 0.5)",
            },
        ],
    };
    const [date, setDate] = useState<DateRange | undefined>({
        from: addDays(new Date(Date.now()), -7),
        to: new Date(Date.now()),
    });

    const coloumn: ColumnDef<PurchaseHistory>[] = [
        {
            accessorKey: "BranchName",
            header: BranchNamei18n[locale],
        },
        {
            accessorKey: "UpdatedAt",
            header: PurchaseDatei18n[locale],
            cell: ({ row }) => {
                return format(new Date(row.getValue("UpdatedAt")), "MMM dd, yyyy | hh:mm a");
            }
        },
        {
            accessorKey: "Quantity",
            header: QuantitySoldi18n[locale],
        },
        {
            accessorKey: "Price",
            header: TotalCosti18n[locale],
        },
        {
            id: "Total",
            header: "Total",
            cell: ({ row }) => {
                const price: number = row.getValue("Price");
                const quantity: number = row.getValue("Quantity");
                return price * quantity
            }
        }
    ];
    const [loadingState, setLoadingState] = useState(true);
    setTimeout(() => {
        setLoadingState(false);
    }, 1500);
    return (
        <div>
            <div className="flex">
                <div className="w-4/6 border-r px-2 py-3">
                    <DataTable
                        data={transactions}
                        columns={coloumn}
                        pagination={true}
                        pageSize={9}
                        filtering={true}
                        coloumnToFilter="storeName"
                    />
                </div>
                <div className="w-2/6">
                    <div className="flex flex-row items-center justify-end gap-2 py-5">
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
                                    {productPurchaseDateRange.from ? (
                                        productPurchaseDateRange.to ? (
                                            <>
                                                {format(
                                                    productPurchaseDateRange.from,
                                                    "LLL dd, y",
                                                    {
                                                        locale: localeExtended[
                                                            locale
                                                        ],
                                                    }
                                                )}{" "}
                                                -{" "}
                                                {format(productPurchaseDateRange.to, "LLL dd, y", {
                                                    locale: localeExtended[
                                                        locale
                                                    ],
                                                })}
                                            </>
                                        ) : (
                                            format(productPurchaseDateRange.from, "LLL dd, y")
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
                                    defaultMonth={productPurchaseDateRange.from}
                                    selected={productPurchaseDateRange}
                                    onSelect={(range) => {
                                        setProductPurchaseDateRange({
                                            from: range?.from || new Date(),
                                            to: range?.to || new Date(),
                                        })
                                    }}
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>
                        <Button
                            onClick={() => {
                                console.log(date);
                            }}
                        >
                            {Viewi18n[locale]}
                        </Button>
                    </div>
                    <div className="m-4">
                        <Card>
                            {loadingState ? (
                                <Skeleton className="h-[450px]" />
                            ) : (
                                <Line options={options} data={data} />
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InventoryPurchase;
