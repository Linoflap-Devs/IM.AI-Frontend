"use client";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Card } from "../ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

import { useI18nStore } from "@/store/usei18n";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useGlobalStore } from "@/store/useStore";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { addDays, format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

function UserActivity() {
    const session = useSession();
    const { userActivityTableData, setUserActivityTableData } =
        useGlobalStore();
    const {
        locale,
        UserActivityi18n,
        DateTimei18n,
        Customeri18n,
        Activityi18n,
        Emaili18n,
        PickADatei18n,
        localeExtended,
        Viewi18n,
        Downloadi18n,
    } = useI18nStore();

    const [date, setDate] = useState<DateRange | undefined>({
        from: addDays(new Date(Date.now()), -7),
        to: new Date(Date.now()),
    });
    axios.defaults.headers.common[
        "Authorization"
    ] = `Bearer ${session.data?.token}`;

    const userActivityQuery: UseQueryResult<UserActivity[]> = useQuery({
        queryKey: ["userActivity"],
        queryFn: async () => {
            if (session.data?.token !== undefined) {
                const from = date?.from?.toISOString();
                const to = date?.to?.toISOString();

                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/clientActivity/getclientActivity/from/${from}/to/${to}`
                );
                setUserActivityTableData(response.data);
                return response.data;
            }
        },
    });
    const columns: ColumnDef<UserActivity>[] = [
        {
            accessorKey: "CreatedAt",
            header: ({ column }) => {
                return (
                    <div className="flex flex-col">
                        <Button
                            variant="ghost"
                            className="text-center hover:bg-gray-300"
                            onClick={() =>
                                column.toggleSorting(
                                    column.getIsSorted() === "asc"
                                )
                            }
                        >
                            {DateTimei18n[locale]}
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                );
            },
            cell: ({ row }) => {
                const date: Date = new Date(
                    (row.getValue("CreatedAt") as String)
                        .replace("T", " ")
                        .replace("Z", " ")
                );

                return (
                    <div className="text-center">
                        {date.toLocaleDateString(locale, {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "numeric",
                            minute: "numeric",
                            second: "numeric",
                            hour12: true,
                        })}
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
            accessorKey: "Activity",
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
                            {Activityi18n[locale]}
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                );
            },
            cell: ({ row }) => {
                return (
                    <div className="text-center">
                        {row.getValue("Activity")}
                    </div>
                );
            },
        },
        {
            accessorKey: "Email",
            header: () => (
                <div className="text-center">{Emaili18n[locale]}</div>
            ),
            cell: ({ row }) => {
                return (
                    <div className="text-center">{row.getValue("Email")}</div>
                );
            },
        },
    ];
    useEffect(() => {
        userActivityQuery.refetch();
    },[date]);
    return (
        <div className="mx-3 mb-3 flex w-full flex-1">
            <Card className="flex w-full flex-col gap-3 p-3">
                <div className="align-center flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">
                        {UserActivityi18n[locale]}
                    </h1>
                    <div className="align-center flex justify-between gap-2">
                        <Button
                            className="bg-green-500 hover:bg-green-600"
                            onClick={() => {
                                console.log("poiuytghj");
                            }}
                        >
                            {Downloadi18n[locale]}
                        </Button>
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
                                        <span>{PickADatei18n[locale]}</span>
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
                    coloumnToFilter={"Costumer"}
                    resetSortBtn={true}
                    pageSize={8}
                    data={userActivityQuery.data ?? []}
                    pagination={true}
                    columns={columns}
                    isLoading={userActivityQuery.isPending}
                />
            </Card>
        </div>
    );
}

export default UserActivity;
