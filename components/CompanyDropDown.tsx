"use client";;
import { ChevronsUpDown } from "lucide-react";
import { useSession } from "next-auth/react";
import { findLabelByValue } from "@/app/util/Helpers";
import { useI18nStore } from "@/store/usei18n";
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
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import * as React from "react";
import { useGlobalStore } from "@/store/useStore";
import { useToast } from "@/components/ui/use-toast";

export default function CompanyDropDown({
    disabled = false,
    externalState,
    setExternalState,
    externalBranchState,
    setExternalBranchState,
    external2branchState,
    setExternal2branchState,
    className,
}: {
    externalState?: string;
    setExternalState?: React.Dispatch<React.SetStateAction<string>>;
    externalBranchState?: string;
    setExternalBranchState?: React.Dispatch<React.SetStateAction<string>>;
    external2branchState?: string;
    setExternal2branchState?: React.Dispatch<React.SetStateAction<string>>;
    disabled?: boolean;
    className?: string;
}) {
    const session = useSession();
    const userData = session.data?.data;
    const { toast } = useToast();
    const [companyList, setCompanyList] = useState([
        { value: "all", label: "Select Company" },
    ]);
    const [openCompany, setOpenCompany] = useState(false);
    const [open, setOpen] = useState(false);
    const {
        globalCompanyState,
        setGlobalCompanyState,
        globalBranchState,
        setGlobalBranchState,
    } = useGlobalStore();
    const getCompanyQuery = useQuery({
        queryKey: ["getCompany"],
        enabled: session.status === "authenticated" && userData.role <= 2,
        queryFn: async () => {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/company/getCompanyOptions`,
                { headers: { Authorization: `Bearer ${session.data?.token}` } }
            );
            setCompanyList([
                { value: "all", label: "Select Company" },
                ...response.data,
            ]);
            return response.data;
        },
        refetchOnWindowFocus: false,
    });
    return (
        <Popover open={openCompany} onOpenChange={setOpenCompany}>
            <PopoverTrigger asChild>
                <Button
                    disabled={userData?.companyId || disabled}
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={`group relative w-[200px] justify-between ${cn(className)}`}
                >
                    {globalCompanyState
                        ? findLabelByValue(companyList, globalCompanyState)
                        : "Select Company..."}
                    <div className="group-hover:bg-muted/10 absolute right-1 bg-white">
                        <ChevronsUpDown className=" h-4 w-4 shrink-0 opacity-50" />
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput
                        placeholder="Search Company..."
                        className="h-9"
                    />
                    <CommandEmpty>No Company found.</CommandEmpty>
                    <CommandGroup>
                        {companyList.map((company) => (
                            <CommandItem
                                key={company.value}
                                value={company.value}
                                onSelect={() => {
                                    if (company.value === globalCompanyState) {
                                        setGlobalCompanyState("all");
                                    } else if (company.value == "all") {
                                        setGlobalCompanyState("all");
                                    } else {
                                        setGlobalCompanyState(company.value);
                                    }
                                    setOpenCompany(false);
                                    setGlobalBranchState("all");
                                    setExternalBranchState?.("all");
                                    setExternal2branchState?.("all");
                                }}
                            >
                                {company.label}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
