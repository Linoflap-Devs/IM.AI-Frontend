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
import { useEffect, useState } from "react";
import { addDays, differenceInCalendarMonths, differenceInCalendarWeeks, format, getDay, getWeekOfMonth } from "date-fns";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
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
import { get } from "http";
import { dailyTotal, getDayDifferenceArray, getMonthDifferenceArray, getMonthIndex, getWeekDifferenceArray, monthlyTotal, weeklyTotal } from "@/lib/dateoperators";
import LoaderComponent from "../Loader";



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
        Pricei18n,
        Quantityi18n,
        CurrencyMarker
    } = useI18nStore();
    const { purchasePerfTableData, globalCompanyState, globalBranchState, fromReportDate, toReportDate, setProductPurchaseDateRange, productPurchaseDateRange } =
        useGlobalStore();
    const options: ChartOptions<"line"> = {
        elements: {
            point: {
                hitRadius: 50,
                hoverRadius: 10
            }
        },
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

    const [chartMode, setChartMode] = useState("");
    const [chartLabels, setChartLabels] = useState<string[]>([]);
    const [chartData, setChartData] = useState<number[]>([]);

    useEffect(() => {
        const startDate = new Date(productPurchaseDateRange.from);
        const endDate = new Date(productPurchaseDateRange.to);

        const startMonth = startDate.getMonth();
        const endMonth = endDate.getMonth();

        const startWeek = getWeekOfMonth(startDate);
        const endWeek = getWeekOfMonth(endDate);

        if(startMonth !== endMonth) {
            const months = getMonthDifferenceArray(productPurchaseDateRange.from, productPurchaseDateRange.to)
            setChartLabels(months)
            setChartMode("month");
            setChartData(monthlyTotal(transactions, months))
        }


        else if(startWeek !== endWeek) {
            const weeks = getWeekDifferenceArray(productPurchaseDateRange.from, productPurchaseDateRange.to)
            setChartLabels(weeks.map((week) => `Week ${week}`))
            setChartMode("week");
            setChartData(weeklyTotal(transactions, weeks))
        }

        else if(startWeek === endWeek && startMonth === endMonth) {
            const days = getDayDifferenceArray(productPurchaseDateRange.from, productPurchaseDateRange.to)
            setChartMode("day");
            setChartLabels(days)
            setChartData(dailyTotal(transactions, days))
        }

    }, [productPurchaseDateRange, transactions])

    const data: ChartData<"line"> = {
        labels: chartLabels,
        datasets: [
            {
                label: "Sales (PHP)",
                data: chartData,
                borderColor: "rgb(59, 130, 246)",
                backgroundColor: "rgb(59, 130, 246)",
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
            header: () => <div className="text-end">{Quantityi18n[locale]}</div>,
            cell: ({ row }) => {
                return (
                    <p className="text-end">{parseInt(row.getValue("Quantity"))}</p>
                )
            }
        },
        {
            accessorKey: "Price",
            header: () => <div className="text-end">{Pricei18n[locale]}</div>,
            cell: ({ row }) => {
                return (
                    <p className="text-end">{CurrencyMarker[locale]}{parseInt(row.getValue("Price")).toFixed(2)}</p>
                )
            }
        },
        {
            id: "Total",
            header: () => <div className="text-end">{TotalCosti18n[locale]}</div>,
            cell: ({ row }) => {
                const price = parseInt(row.getValue("Price"))
                const quantity = parseInt(row.getValue("Quantity"))
                return (
                    <p className="text-end">{CurrencyMarker[locale]}{(price * quantity).toFixed(2)}</p>
                )
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
                        columnsToSearch={["BranchName"]}
                    />
                </div>
                <div className="w-2/6 px-4">
                    <div className="flex flex-row items-center justify-end gap-2 py-5">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="date"
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
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
                                    <span className="ml-auto text-gray-500">
                                        <ChevronDown size={16} color="currentColor"></ChevronDown>
                                    </span>
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
                        {/* <Button
                            onClick={() => {
                                console.log(date);
                            }}
                        >
                            {Viewi18n[locale]}
                        </Button> */}
                    </div>
                    <div className="">
                        <Card className="p-1">
                            {loadingState ? (
                               <LoaderComponent />
                            ) : (
                                <>
                                    <Line options={options} data={data} />
                                </>
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InventoryPurchase;
