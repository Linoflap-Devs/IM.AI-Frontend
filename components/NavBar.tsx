"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
    Tag,
    Boxes,
    Home,
    ShoppingCart,
    BarChartBig,
    CircleUser,
    ListChecks,
    LogOut,
    FileClock,
    UsersRound,
    Contact2,
    Truck,
    HandCoins,
    Apple,
    BadgeAlert,
    AlignJustify,
    Package,
    LayoutGrid,
    ArrowLeftRight,
    Package2,
    Barcode,
} from "lucide-react";
import { Toaster } from "./ui/toaster";
import AnimateHeight from "react-animate-height";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useI18nStore } from "@/store/usei18n";
import { Skeleton } from "./ui/skeleton";
import Image from "next/image";

function NavBar() {
    const session = useSession();
    const userData = session.data?.data;
    const currentPath = usePathname();
    const { locale, NBTitle, Logouti18n } = useI18nStore();
    /* Only Uncomment on Final */
    // useEffect(() => {
    //     let inactivityTimer: any;
    //     const resetTimer = () => {
    //         clearTimeout(inactivityTimer);
    //         startTimer();
    //     };
    //     const startTimer = () => {
    //         inactivityTimer = setTimeout(() => {
    //             // Your function to run after 3 minutes of inactivity
    //             handleInactive();
    //         }, /* 3 * 60 * */ 5000); // 3 minutes in milliseconds
    //     };

    //     const handleInactive = () => {
    //         // Your function to run after 3 minutes of inactivity
    //         signOut();
    //     };
    //     const handleActivity = () => {
    //         resetTimer();
    //     };
    //     // Attach event listeners for user activity
    //     window.addEventListener("mousemove", handleActivity);
    //     window.addEventListener("keydown", handleActivity);
    //     // Start the initial timer
    //     startTimer();
    //     // Clean up event listeners on component unmount
    //     return () => {
    //         window.removeEventListener("mousemove", handleActivity);
    //         window.removeEventListener("keydown", handleActivity);
    //         clearTimeout(inactivityTimer);
    //     };
    // }, []);

    const navigationItem = [
        {
            name: {
                en: "Dashboard",
                ja: "ダッシュボード",
            },
            navigation: "dashboard",
            permission: [1, 2, 3, 4],
            icon: <Home />,
        },
        {
            name: {
                en: "Payment",
                ja: "支払い",
            },
            navigation: "payment",
            permission: [4],
            icon: <HandCoins />,
        },
        {
            name: {
                en: "Inventory & Products",
                ja: "在庫",
            },
            icon: <Boxes />,
            navigation: "inv&products",
            permission: [1, 2, 3, 4],
            state: currentPath.includes("inv&products"),
            subNav: [
                
                {
                    name: {
                        en: "Inventory",
                        ja: "在庫",
                    },
                    icon: <Package />,
                    navigation: "inventory",
                    permission: [1, 2, 3, 4],
                },
                {
                    name: {
                        en: "Products",
                        ja: "製品",
                    },
                    icon: <Apple />,
                    navigation: "products",
                    permission: [1, 2, 3, 4],
                },
                {
                    name: {
                        en: "Transfer Stock",
                        ja: "転送",
                    },
                    icon: <ArrowLeftRight />,
                    navigation: "transferorder",
                    permission: [1, 2, 3],
                },
                {
                    name: {
                        en: "Batches",
                        ja: "出荷",
                    },
                    icon: <Barcode />,
                    navigation: "batches",
                    permission: [1, 2, 3],
                },
                {
                    name: {
                        en: "Category",
                        ja: "カデゴリー",
                    },
                    icon: <LayoutGrid />,
                    navigation: "category",
                    permission: [1, 2, 3],
                },
            ],
        },
        {
            name: {
                en: "Manage Carts ",
                ja: "カード管理",
            },
            icon: <ShoppingCart />,
            navigation: "managecarts",
            permission: [1, 2,3, 4],
            state: currentPath.includes("managecarts"),
            subNav: [
                {
                    name: {
                        en: "Carts",
                        ja: "カート",
                    },
                    icon: <AlignJustify />,
                    navigation: "cart",
                    permission: [2, 3, 4],
                },
                {
                    name: {
                        en: "Unusual Transaction",
                        ja: "不正な取引",
                    },
                    icon: <BadgeAlert />,
                    navigation: "unusualtransaction",
                    permission: [3, 4],
                },
            ],
        },
        {
            name: {
                en: "Reports",
                ja: "レポート",
            },
            icon: <BarChartBig />,
            navigation: "reports",
            state: currentPath.includes("reports"),
            permission: [1, 2, 3],
            subNav: [
                {
                    name: {
                        en: "General Report",
                        ja: "一般レポート",
                    },
                    icon: <ListChecks />,
                    navigation: "report",
                    permission: [1, 2, 3],
                },
                {
                    name: {
                        en: "Transaction History",
                        ja: "取引履歴",
                    },
                    icon: <FileClock />,
                    navigation: "transactionhistory",
                    permission: [1, 2, 3],
                },
                {
                    name: {
                        en: "User Activity",
                        ja: "ユーザーのアクティビティ",
                    },
                    icon: <UsersRound />,
                    navigation: "useractivity",
                    permission: [1],
                },
            ],
        },
        {
            name: {
                en: "Suppliers",
                ja: "サプライヤー",
            },
            icon: <CircleUser />,
            navigation: "suppliers",
            permission: [1, 2, 3],
        },
        {
            name: {
                en: "Manage Branches",
                ja: "ストアの管理",
            },
            icon: <ListChecks />,
            navigation: "managestore",
            permission: [1, 2],
        },
        {
            name: {
                en: "Manage Customers",
                ja: "クライアントリスト",
            },
            icon: <Contact2 />,
            navigation: "customerlist",
            permission: [1, 2, 3, 4],
        },
        {
            name: {
                en: "Promos",
                ja: "プロモ",
            },
            icon: <Tag />,
            navigation: "promo",
            permission: [1, 2, 3],
        },
    ];

    return (
        <div className="h-100 mb-3 ml-3 mt-3 flex w-1/5 flex-col gap-8 rounded-lg border bg-white p-[24px] shadow-sm">
            <h1 className="text-lg font-semibold text-primary">
                
                <Link
                    className="flex items-center gap-3 text-2xl font-semibold"
                    href={"/home/dashboard"}
                >
                    <Image src="/imai.png" alt="logo" width={64} height={64} />
                    {NBTitle[locale]}
                </Link>
            </h1>
            <div className="flex h-[97%] flex-col justify-between">
                <ul className="flex flex-col gap-6">
                    {userData ? (
                        navigationItem.map((item, index) => {
                            return item.permission.includes(userData.role) ? (
                                <li key={index} className="flex flex-col gap-1">
                                    <Link
                                        key={index}
                                        href={`/home/${item.navigation}/${
                                            item.subNav
                                                ? item.subNav[0].navigation
                                                : ""
                                        }`}
                                    >
                                        <div
                                            className={`item-center flex gap-3 hover:cursor-pointer font-semibold transition-transform hover:scale-[105%] active:scale-[100%] ${
                                                currentPath.split("/").pop() ===
                                                    item.navigation &&
                                                "text-primary"
                                            }`}
                                            key={index}
                                        >
                                            {item.icon}
                                            {item.name[locale]}
                                        </div>
                                    </Link>
                                    <AnimateHeight
                                        height={item.state ? "auto" : 0}
                                        duration={400}
                                    >
                                        {item.subNav && (
                                            <div
                                                className={`flex flex-col gap-3 pl-4 pt-3`}
                                            >
                                                {item.subNav.map(
                                                    (itemX, indexX) => {
                                                        return itemX.permission.includes(
                                                            userData.role
                                                        ) ? (
                                                            <Link
                                                                className="transition-transform hover:scale-[105%] active:scale-[100%]"
                                                                key={indexX}
                                                                href={`/home/${item.navigation}/${itemX.navigation}`}
                                                            >
                                                                <div
                                                                    className={`item-center flex gap-3 font-semibold ${
                                                                        currentPath
                                                                            .split(
                                                                                "/"
                                                                            )
                                                                            .includes(
                                                                                itemX.navigation
                                                                            ) &&
                                                                        "text-primary"
                                                                    }`}
                                                                >
                                                                    {itemX.icon}
                                                                    {
                                                                        itemX
                                                                            .name[
                                                                            locale
                                                                        ]
                                                                    }
                                                                </div>
                                                            </Link>
                                                        ) : null;
                                                    }
                                                )}
                                            </div>
                                        )}
                                    </AnimateHeight>
                                </li>
                            ) : null;
                        })
                    ) : (
                        <div className="flex flex-col justify-start gap-6">
                            <Skeleton className="w-50 h-8" />
                            <Skeleton className="w-30 h-8" />
                            <Skeleton className="w-25 h-8" />
                            <Skeleton className="w-15 h-8" />
                            <Skeleton className="w-25 h-8" />
                            <Skeleton className="w-15 h-8" />
                        </div>
                    )}
                </ul>
                <Toaster />
                <ul className="flex flex-col gap-5">
                    <li
                        onClick={() => {
                            signOut();
                        }}
                        className="flex gap-3 font-semibold hover:cursor-pointer hover:text-destructive"
                    >
                        <LogOut />
                        {Logouti18n[locale]}
                    </li>
                </ul>
                
            </div>
            
        </div>
    );
}

export default NavBar;
