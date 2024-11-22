"use client";
import { ChevronsUpDown } from "lucide-react";
import { useSession } from "next-auth/react";
import { findLabelByValue } from "@/app/util/Helpers";
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
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import * as React from "react";
import { useGlobalStore } from "@/store/useStore";
import { useToast } from "@/components/ui/use-toast";

export default function BranchDropDown({
    className,
    disabled = false,
    externalState,
    setExternalState,
    removeOption,
    defaultValue = "Select Branch",
}: {
    className?: string;
    disabled?: boolean;
    externalState?: string;
    setExternalState?: React.Dispatch<React.SetStateAction<string>>;
    removeOption?: string[];
    defaultValue?: string;
}) {
    const session = useSession();
    const userData = session.data?.data;
    const { toast } = useToast();
    const [openBranch, setOpenBranch] = useState(false);
    const [open, setOpen] = useState(false);
    const { globalCompanyState, globalBranchState, setGlobalBranchState, setGlobalBranchName } =
        useGlobalStore();
    const getBranchQuery = useQuery({
        queryKey: ["getBranch"],
        enabled:
            session.status === "authenticated" &&
            userData.role <= 2 &&
            globalCompanyState !== "all",
        queryFn: async () => {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/branch/getBranchesOption/cId/${globalCompanyState}`,
                {
                    headers: {
                        Authorization: `Bearer ${session.data?.token}`,
                    },
                }
            );
            setBranchList([
                { value: "all", label: defaultValue },
                ...response.data.filter((obj: any) => {
                    return !removeOption?.includes(obj.value);
                }),
            ]);
            return response.data;
        },
        refetchOnWindowFocus: false,
    });
    const [branchList, setBranchList] = useState<ComboBox[]>([
        { value: "all", label: defaultValue },
    ]);
    useEffect(() => {
        getBranchQuery.refetch();
    }, [globalCompanyState]);
    return (
        <Popover open={openBranch} onOpenChange={setOpenBranch}>
            <PopoverTrigger asChild>
                <Button
                    disabled={globalCompanyState === "all" || disabled}
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={`w-[200px] group justify-between overflow-hidden relative ${className}`}
                >
                    {!externalState
                        ? globalBranchState
                            ? findLabelByValue(branchList, globalBranchState)
                            : "Select Branch..."
                        : externalState
                        ? findLabelByValue(branchList, externalState)
                        : "Select Branch..."}
                    <div className="group-hover:bg-muted/10 absolute right-1 bg-white">
                        <ChevronsUpDown className=" h-4 w-4 shrink-0 opacity-50" />
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent className={"w-[200px] p-0"}>
                <Command>
                    <CommandInput
                        placeholder="Search Branch..."
                        className="h-9"
                    />
                    <CommandEmpty>No Branch found.</CommandEmpty>
                    <CommandGroup>
                        {branchList.map((branch) => (
                            <CommandItem
                                key={branch.value}
                                value={branch.value}
                                onSelect={() => {
                                    const value = branch.value;
                                    if (!setExternalState) {
                                        if (
                                            branch.value === globalBranchState
                                        ) {
                                            setGlobalBranchState("all");
                                        } else if (
                                            globalCompanyState === "all"
                                        ) {
                                            setGlobalBranchState("all");
                                        } else {
                                            setGlobalBranchState(value);
                                            setGlobalBranchName(branch.label)
                                        }
                                        setOpenBranch(false);
                                    } else {
                                        if (branch.value === externalState) {
                                            setExternalState("all");
                                        } else if (
                                            globalCompanyState === "all"
                                        ) {
                                            setExternalState("all");
                                        } else {
                                            setExternalState(value);
                                        }
                                        setOpenBranch(false);
                                    }
                                }}
                            >
                                {branch.label}
                            
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
