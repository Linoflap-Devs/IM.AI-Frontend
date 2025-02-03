"use client";;
import { ChevronsUpDown } from "lucide-react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { CheckIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import * as React from "react";
import { useGlobalStore } from "@/store/useStore";
import { ScrollArea } from "./ui/scroll-area";

export default function ProductDropDown({
    disabled = false,
    externalState,
    setExternalState,
}: {
    disabled?: boolean;
    externalState: any[];
    setExternalState: React.Dispatch<React.SetStateAction<any[]>>;
}) {
    const session = useSession();
    const { globalBranchState, globalCompanyState } = useGlobalStore();
    const userData = session.data?.data;
    const [openBranch, setOpenBranch] = useState(false);
    const [open, setOpen] = useState(false);
    const [productList, setProductList] = useState<ComboBox[]>([]);
    const getProductsQuery = useQuery({
        queryKey: ["GetProducts"],
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
                    `${process.env.NEXT_PUBLIC_API_URL}/product/getProducts/cId/${companyId}/bId/${branchId}/`,
                    {
                        headers: {
                            Authorization: `Bearer ${session.data?.token}`,
                        },
                    }
                );
                const productList = response.data.map((item: any) => {
                    return {
                        value: item.ProductId,
                        label: item.Name,
                    };
                });
                setProductList((prev) => {
                    return [...prev, ...productList];
                });
                return productList;
            }
        },
    });

    return (
        <Popover open={openBranch} onOpenChange={setOpenBranch}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[200px] justify-between"
                >
                    Select Products
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput
                        placeholder="Search Products..."
                        className="h-9"
                    />
                    <CommandEmpty>No Products found.</CommandEmpty>
                    <ScrollArea className="h-96">
                        <CommandGroup>
                            {productList.map((product) => (
                                <CommandItem
                                    key={product.value}
                                    value={product.value}
                                    onSelect={() => {
                                        if (product.value !== "0") {
                                            if (
                                                externalState?.includes(product)
                                            ) {
                                                setExternalState((prev) => {
                                                    return prev.filter(
                                                        (item) =>
                                                            item.value !==
                                                            product.value
                                                    );
                                                });
                                            } else {
                                                setExternalState((prev) => {
                                                    return [...prev, product];
                                                });
                                            }
                                            setOpenBranch(false);
                                            setOpen(false);
                                        }
                                    }}
                                >
                                    <p className="line-clamp-1">
                                        {product.label}
                                    </p>
                                    <CheckIcon
                                        strokeWidth={2}
                                        size={32}
                                        className={cn(
                                            "ml-auto h-4 w-4",
                                            externalState?.includes(product)
                                                ? "opacity-100"
                                                : "opacity-0"
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </ScrollArea>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
