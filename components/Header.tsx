"use client";
import { Globe } from "lucide-react";
import { Card } from "./ui/card";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { capitalFirst } from "@/app/util/Helpers";
import { useI18nStore } from "@/store/usei18n";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect, useState } from "react";
import { CheckIcon } from "lucide-react";
import { useGlobalStore } from "@/store/useStore";
import BranchDropDown from "./BranchDropDown";
import CompanyDropDown from "./CompanyDropDown";
import { Breadcrumb, BreadcrumbList } from "./ui/breadcrumb";

function Header() {
    const session = useSession();
    const userData = session.data?.data;
    const currentPath = usePathname();
    const { locale, setLocale, localeName, Companyi18n, Branchi18n } =
        useI18nStore();
    const { setGlobalCompanyState, setGlobalBranchState } = useGlobalStore();
    const [open, setOpen] = useState(false);
    const Language = [
        {
            value: "en",
            label: "🇺🇸 English",
        },
        {
            value: "ja",
            label: "🇯🇵 Japanese",
        },
    ];
    function headerType() {
        console.log("header type: ", currentPath);
        const pathMap = {
            dashboard: { en: "Dashboard", ja: "ダッシュボード" },
            inventory: { en: "Inventory", ja: "在庫" },
            cart: { en: "Carts", ja: "カート" },
            reports: { en: "Reports", ja: "レポート" },
            suppliers: { en: "Suppliers", ja: "サプライヤー" },
            managestore: { en: "Branches", ja: "店舗管理" },
            manageuser: { en: "Manage User", ja: "ユーザー管理" },
            customerlist: { en: "Customers", ja: "クライアントリスト" },
            promo: { en: "Promo", ja: "プロモーション" },
            products: { en: "Products", ja: "製品" },
            transferorder: { en: "Transfer Stock", ja: "在庫転送" },
            category: { en: "Category", ja: "カテゴリー" },
            report: { en: "Report", ja: "レポート" },
            transactionhistory: { en: "Transaction History", ja: "取引履歴" },
            unusualtransaction: { en: "Unusual Transaction", ja: "異常取引" },
            /* Children */
            
        };
        const title =
            pathMap[
                Object.keys(pathMap).find((key) => {
                    let slug = currentPath.slice(currentPath.lastIndexOf("/") + 1);
                    console.log(slug)
                    return slug.includes(key)
                }
                ) as keyof typeof pathMap
            ];
        return title ? (
            <div className="text-xl font-semibold">{title[locale]}</div>
        ) : null;
    }
    useEffect(() => {
        if (session.status === "authenticated" && userData.role === 2) {
            setGlobalCompanyState(userData?.companyId);
        }
        if (session.status === "authenticated" && userData.role >= 3) {
            setGlobalBranchState(userData?.branchId);
        }
    }, [session]);
    function hideFilter(params: any, forbiddenParams: string[]) {
        /* const forbiddenParams = ["createacc", "managestore", "useractivity"]; */
        return !forbiddenParams.some((param) => params.includes(param));
    }
    return (
        <Card className="m-3 flex items-center justify-between px-8 py-5">
            <div className="flex flex-row items-center gap-2">
                <Breadcrumb>
                    <BreadcrumbList>{headerType()}</BreadcrumbList>
                </Breadcrumb>
            </div>
            <div className="flex justify-start gap-10">
                {session.status === "authenticated" &&
                    userData.role <= 2 &&
                    hideFilter(currentPath, ["createacc", "useractivity"]) && (
                        <div className="flex items-center gap-2">
                            <label className="text-lg font-medium">
                                {Companyi18n[locale]}
                            </label>
                            <CompanyDropDown />
                        </div>
                    )}

                {session.status === "authenticated" &&
                    userData.role <= 3 &&
                    hideFilter(currentPath, [
                        "createacc",
                        "useractivity",
                        "suppliers",
                        "managestore",
                    ]) && (
                        <div className="flex items-center gap-2">
                            <label className="text-lg font-medium">
                                {Branchi18n[locale]}
                            </label>
                            <BranchDropDown className="w-[20rem]" />
                        </div>
                    )}
            </div>
            <div className="flex items-center gap-10">
                <div className="flex items-center gap-2">
                    {userData && (
                        <h1 className="rounded bg-primary p-2 py-1 text-xl font-semibold text-white shadow-lg">
                            {`${capitalFirst(userData.firstName)} 
                        ${capitalFirst(userData.lastName)}`}
                        </h1>
                    )}
                </div>
                <div className="align-center flex items-center gap-4">
                    <Globe size={32} />
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={open}
                                className="w-[200px] justify-between"
                            >
                                {locale
                                    ? localeName[locale]
                                    : "Select Language"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0">
                            <Command>
                                <CommandGroup>
                                    {Language.map((language) => (
                                        <CommandItem
                                            key={language.value}
                                            value={language.value}
                                            onSelect={(currentValue) => {
                                                setOpen(false);
                                                setLocale(
                                                    currentValue as locale
                                                );
                                            }}
                                        >
                                            {language.label}
                                            <CheckIcon
                                                className={cn(
                                                    "ml-auto h-4 w-4",
                                                    locale === language.value
                                                        ? "opacity-100"
                                                        : "opacity-0"
                                                )}
                                            />
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
        </Card>
    );
}

export default Header;
