"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { addDays, format } from "date-fns";
import { ArrowUpDown, Calendar as CalendarIcon, Loader } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { commafy } from "commafy-anything";
import { useGlobalStore } from "@/store/useStore";
import { useSession } from "next-auth/react";
import { useI18nStore } from "@/store/usei18n";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";
import { useEffect } from "react";
import {
    Tag,
    UserRound,
    ShoppingBasket,
    ReceiptJapaneseYen,
    Loader2,
    JapaneseYen,
} from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDistance } from "date-fns";
import { FC } from "react";
import { PackageOpen } from "lucide-react";

function Dashboard() {
    const session = useSession();
    const userData = session.data?.data;
    const [cartTableData, setCartTableData] = useState<CartInformation[]>([]);
    axios.defaults.headers.common[
        "Authorization"
    ] = `Bearer ${session.data?.token}`;
    const [date, setDate] = useState<DateRange | undefined>({
        from: addDays(new Date(Date.now()), -7),
        to: new Date(Date.now()),
    });
    const { lowQuantityStocks, globalCompanyState, globalBranchState } =
        useGlobalStore();
    const {
        Useri18n,
        locale,
        salesOverviewi18n,
        storeActivityi18n,
        topSellingProducti18n,
        leastSellingProducti18n,
        cartsi18n,
        localeExtended,
        Batteryi18n,
        Statusi18n,
        InUsei18n,
        LowBatteryi18n,
        Availablei18n,
        Chargingi18n,
        Maintenancei18n,
        ProductSoldi18n,
        Salesi18n,
        Gainsi18n,
        Purchasesi18n,
        ActivePromoi18n,
        CartIssuesi18n,
        Customeri18n,
        NewProductsi18n,
        Namei18n,
        Pricei18n,
        Soldi18n,
        SeeAlli18n,
        PleaseSelectACompanyOrABranchi18n,
        QuantitySoldi18n
    } = useI18nStore();


    const cartQuery = useQuery({
        queryKey: ["getCart"],
        enabled:
            session.data?.token !== undefined &&
            [3, 4].includes(userData?.role),
        queryFn: async () => {
            console.log("wow");
            if (
                session.data?.token !== undefined &&
                [3, 4].includes(userData?.role)
            ) {
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
                setCartTableData(response.data);
                return response.data;
            }
        },
    });
    const getStoreActivity = useQuery({
        queryKey: ["getStoreActivity"],
        enabled:
            (session.data?.token !== undefined &&
                globalBranchState !== "all") ||
            globalCompanyState !== "all",
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
                    `${process.env.NEXT_PUBLIC_API_URL}/transaction/getStoreActivityDashboard/cId/${companyId}/bId/${branchId}/from/${from}/to/${to}`
                );
                return response.data;
            }
        },
    });
    const getDashboardData = useQuery({
        queryKey: ["getDashboardData"],
        enabled:
            (session.data?.token !== undefined &&
                globalBranchState !== "all") ||
            globalCompanyState !== "all",
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
                    `${process.env.NEXT_PUBLIC_API_URL}/transaction/getDashboardData/cId/${companyId}/bId/${branchId}/from/${from}/to/${to}`
                );
                return response.data;
            }
        },
    });
    const cartColumns: ColumnDef<CartInformation>[] = [
        {
            accessorKey: "PushCartId",
            header: cartsi18n[locale],
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
                        className={`mx-auto w-[70px] text-center rounded px-3 py-1 font-semibold text-white ${battery <= 10
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
                        className={`mx-auto rounded py-1 px-2 font-semibold text-center w-[8.9rem]  ${statusValue == Chargingi18n[locale]
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
                const user: string = row.getValue("Costumer") || "No User";
                return <div className="text-center font-semibold">{user}</div>;
            },
        },
        {
            accessorKey: "status",
        },
    ];
    const tspColoumns: ColumnDef<TopSellingProduct>[] = [
        {
            accessorKey: "Name",
            header: () => Namei18n[locale],
            cell: ({ row }) => {
                const id = row.getValue("Name");
                return userData?.role <= 2 ? (
                    <Link
                        className="h-fit p-0 font-medium hover:text-primary hover:underline"
                        href={`/home/inventory/${id}`}
                    >
                        {row.getValue("Name")}
                    </Link>
                ) : (
                    <div>{row.getValue("Name")}</div>
                );
            },
        },
        {
            accessorKey: "Price",
            header: () => {
                return <p className="text-center">{Pricei18n[locale]}</p>;
            },
            cell: ({ row }) => {
                return (
                    <div className="text-center">
                        <span className="font-bold">JP¥</span>{" "}
                        {row.getValue("Price") || 0}
                    </div>
                );
            },
        },
        {
            accessorKey: "TotalSale",
            header: () => {
                return <p className="text-center">{Soldi18n[locale]}</p>;
            },
            cell: ({ row }) => {
                return (
                    <div className="text-center">
                        {row.getValue("TotalSale")}{" "}
                        <span className="font-bold">PCS</span>
                    </div>
                );
            },
        },
    ];

    useEffect(() => {
        getStoreActivity.refetch();
        getDashboardData.refetch();
    }, [date, globalBranchState, globalCompanyState]);

    if (globalBranchState === "all" && globalCompanyState === "all") {
        return (
            <Card className="mx-3 mb-3 flex flex-1 items-center justify-center">
                {PleaseSelectACompanyOrABranchi18n[locale]}
            </Card>
        );
    }
    return (
        <div className="mx-3 mb-3 grid w-full flex-1 auto-rows-min gap-3">
            <div className="flex items-center gap-2">
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
                                <span>Pick a date</span>
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
                {date?.from instanceof Date && date?.to instanceof Date ? (
                    <Card className="ml-5 flex items-center px-2 py-[3px]">
                        <h1 className="text-center text-base">
                            {formatDistance(date?.from, date?.to, {
                                includeSeconds: false,
                                addSuffix: false,
                            })}{" "}
                            from {format(date?.from, "LLL dd, y")}
                        </h1>
                    </Card>
                ) : null}
            </div>
            {/* Left */}
            {userData && userData.role <= 3 && (
                <>
                    <Card className="col-start-1 col-end-6 row-start-2 row-end-3 p-3">
                        <div className="flex flex-row items-center justify-between">
                            <h1 className="text-2xl font-semibold">
                                {salesOverviewi18n[locale]}
                            </h1>
                        </div>
                        <div className="flex h-max items-center justify-around pt-4">
                            <StoreActivityCard
                                title={ProductSoldi18n[locale]}
                                dataKey="Total_Quantity"
                                icon={<PackageOpen />}
                                isFetching={getStoreActivity.isFetching}
                                isLoading={getStoreActivity.isLoading}
                                data={getDashboardData.data?.salesOverview}
                            />
                            <StoreActivityCard
                                title={Salesi18n[locale]}
                                dataKey="Price"
                                icon={<JapaneseYen />}
                                isFetching={getStoreActivity.isFetching}
                                isLoading={getStoreActivity.isLoading}
                                data={getDashboardData.data?.salesOverview}
                            />
                            <StoreActivityCard
                                title={Gainsi18n[locale]}
                                dataKey="PricePurchase"
                                icon={<JapaneseYen />}
                                isFetching={getStoreActivity.isFetching}
                                isLoading={getStoreActivity.isLoading}
                                data={getDashboardData.data?.salesOverview}
                            />
                        </div>
                    </Card>
                    <Card className="col-start-1 col-end-6 row-start-3 row-end-4 p-3">
                        <div className="flex flex-row items-center justify-between">
                            <h1 className="text-2xl font-semibold">
                                {storeActivityi18n[locale]}
                            </h1>
                        </div>
                        <div className="flex h-max items-center justify-around pt-4">
                            <StoreActivityCard
                                title={Purchasesi18n[locale]}
                                dataKey="Purchases"
                                icon={<ReceiptJapaneseYen />}
                                isFetching={getStoreActivity.isFetching}
                                isLoading={getStoreActivity.isLoading}
                                data={getStoreActivity.data}
                            />
                            <StoreActivityCard
                                title={ActivePromoi18n[locale]}
                                dataKey="ActivePromo"
                                icon={<Tag />}
                                isFetching={getStoreActivity.isFetching}
                                isLoading={getStoreActivity.isLoading}
                                data={getStoreActivity.data}
                            />
                            <StoreActivityCard
                                title={CartIssuesi18n[locale]}
                                dataKey="CartIssue"
                                icon={<ShoppingBasket />}
                                isFetching={getStoreActivity.isFetching}
                                isLoading={getStoreActivity.isLoading}
                                data={getStoreActivity.data}
                            />
                            <StoreActivityCard
                                title={Customeri18n[locale]}
                                dataKey="Customer"
                                icon={<UserRound />}
                                isFetching={getStoreActivity.isFetching}
                                isLoading={getStoreActivity.isLoading}
                                data={getStoreActivity.data}
                            />
                        </div>
                    </Card>
                    <Card className="col-start-1 col-end-6 row-start-4 row-end-7 p-3">
                        <div className="flex flex-row items-center justify-between">
                            <h1 className="text-2xl font-semibold">
                                {topSellingProducti18n[locale]}
                            </h1>
                            <div className="flex flex-row items-center gap-2">
                                <Button
                                    variant={"link"}
                                    className="h-fit p-0 text-sm"
                                >
                                    {SeeAlli18n[locale]}
                                </Button>
                            </div>
                        </div>
                        <div className="pt-2">
                            <DataTable
                                isLoading={getDashboardData.isFetching}
                                columns={tspColoumns}
                                data={getDashboardData.data?.topSelling || []}
                                pageSize={5}
                            />
                        </div>
                    </Card>
                </>
            )}
            {/* For Personell Role */}
            {userData && userData.role > 3 && (
                <>
                    <Card className="col-start-1 col-end-6 row-start-2 row-end-4 p-3">
                        <div className="flex flex-row items-center justify-between">
                            <h1 className="font-semibold">
                                {cartsi18n[locale]}
                            </h1>
                            <div className="flex flex-row items-center gap-2">
                                <Button
                                    variant={"link"}
                                    className="h-fit p-0 text-sm"
                                >
                                    {SeeAlli18n[locale]}
                                </Button>
                            </div>
                        </div>
                        <div className="pt-2">
                            <DataTable
                                isLoading={cartQuery.isLoading}
                                columns={cartColumns}
                                pageSize={4}
                                data={cartTableData}
                                visibility={{
                                    FirstName: false,
                                    LastName: false,
                                    status: false,
                                }}
                            />
                        </div>
                    </Card>
                    <Card className="col-start-1 col-end-6 row-start-4 row-end-6 p-3">
                        <div className="flex flex-row items-center justify-between">
                            <h1 className="font-semibold">
                                {topSellingProducti18n[locale]}
                            </h1>
                            <div className="flex flex-row items-center gap-2">
                                <Button
                                    variant={"link"}
                                    className="h-fit p-0 text-sm"
                                >
                                    {SeeAlli18n[locale]}
                                </Button>
                            </div>
                        </div>
                        <div className="pt-2">
                            <DataTable
                                columns={tspColoumns}
                                pageSize={5}
                                data={getDashboardData.data?.topSelling || []}
                            />
                        </div>
                    </Card>
                </>
            )}
            {/* Right */}
            <Card className="col-start-6 col-end-8 row-start-2 row-end-4 px-3 pb-3 pt-2">
                <div className="flex items-center justify-between">
                    <h1 className="font-semibold">{NewProductsi18n[locale]}</h1>
                    <Button variant={"link"} className="h-fit p-0 text-sm">
                        {SeeAlli18n[locale]}
                    </Button>
                </div>
                {!getStoreActivity.isSuccess ? (
                    <div className="flex w-full flex-1 items-center justify-center py-12 pt-2">
                        <Loader className="animate-spin" />
                    </div>
                ) : getStoreActivity.data.NewProducts.length === 0 ? (
                    <div className="flex w-full items-center justify-center py-12 pt-2">
                        <p>No Records</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3 pt-2">
                        {getStoreActivity.data.NewProducts.map(
                            (item: any, index: number) => {
                                return (
                                    <Card
                                        key={index}
                                        className="flex items-center justify-between p-2"
                                    >
                                        <h1 className="font-semibold">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <h1 className="w-40 truncate font-semibold hover:cursor-pointer">
                                                            {item.Name}
                                                        </h1>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{item.Name}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </h1>
                                        <Badge className="h-min bg-green-700 p-1 px-4 text-xs">
                                            ¥ {item.Price}
                                        </Badge>
                                    </Card>
                                );
                            }
                        )}
                    </div>
                )}
            </Card>
            <Card className="col-start-6 col-end-8 row-start-4 row-end-7 px-3 pb-3 pt-2">
                <div className="flex items-center justify-between">
                    <h1 className="font-semibold">
                        {leastSellingProducti18n[locale]}
                    </h1>
                    <Button variant={"link"} className="h-fit p-0 text-sm">
                        {SeeAlli18n[locale]}
                    </Button>
                </div>
                {!getDashboardData.isSuccess ? (
                    <div className="flex w-full flex-1 items-center justify-center py-12 pt-2">
                        <Loader className="animate-spin" />
                    </div>
                ) : getDashboardData.data.leastSelling.length === 0 ? (
                    <div className="flex w-full items-center justify-center py-12 pt-2">
                        <p>No Products</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3 pt-2">
                        {getDashboardData.data.leastSelling.map(
                            (item: any, index: number) => {
                                return (
                                    <Card
                                        key={index}
                                        className="flex items-center justify-between p-2"
                                    >
                                        <div>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <h1 className="w-40 truncate font-semibold text-red-700 hover:cursor-pointer">
                                                            {item.Name}
                                                        </h1>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{item.Name}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                            <p className="text-xs text-gray-600">
                                                {QuantitySoldi18n[locale]}: {item.TotalSale}
                                            </p>
                                        </div>
                                        <p className="h-min w-24 rounded-full bg-red-600 p-1 px-4 text-center text-xs font-semibold text-red-200">
                                            ¥ {item.Price || 0}
                                        </p>
                                    </Card>
                                );
                            }
                        )}
                    </div>
                )}
            </Card>
        </div>
    );
}

export default Dashboard;

interface StoreActivityCardProps {
    title: string;
    dataKey: string;
    icon: JSX.Element;
    isFetching: boolean;
    isLoading: boolean;
    data: { [key: string]: number };
}
const StoreActivityCard: FC<StoreActivityCardProps> = ({
    title,
    dataKey,
    icon,
    isFetching,
    isLoading,
    data,
}) => {
    console.log(title, data)
    return (
        <Card className="flex w-52 flex-col items-center gap-3 py-2">
            <h1 className="text-start font-medium">{title}</h1>
            <div className="flex items-center gap-1">
                {icon}
                {isLoading ? (
                    <Loader2 className="animate-spin" size={30} />
                ) : (
                    <p className="text-3xl font-bold">
                        {data[dataKey] || 0}
                    </p>
                )}
            </div>
        </Card>
    );
};
