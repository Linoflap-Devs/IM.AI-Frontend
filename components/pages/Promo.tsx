"use client";
import { useGlobalStore } from "@/store/useStore";
import { ColumnDef } from "@tanstack/react-table";
import { Card } from "../ui/card";
import { DataTable } from "../ui/data-table";
import { Button } from "../ui/button";
import { ArrowUpDown, Trash2, BookOpen } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useEffect, useState } from "react";
import { useI18nStore } from "@/store/usei18n";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery, UseQueryResult } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import { toast } from "../ui/use-toast";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import MultipleSelector from "../ui/multi-select";
import { DateTimePicker } from "@/components/ui/datetime-picker";

function Promo() {
    const session = useSession();
    const userData = session.data?.data;
    const [date, setDate] = useState<Date>();
    const [promoProductDatalist, setPromoProductDatalist] = useState<
        PromoProductDataList[]
    >([]);
    const [open, setOpen] = useState(false);
    const { globalCompanyState, globalBranchState } = useGlobalStore();
    const {
        locale,
        Namei18n,
        Categoryi18n,
        Percentagei18n,
        PromoCodei18n,
        Actioni18n,
        IDi18n,
        PromoProducti18n,
        PromoListi18n,
        AlertDialogue1i18n,
        AlertDialogue2i18n,
        Canceli18n,
        AddPromoi18n,
        Continuei18n,
        Submiti18n,
        Discounti18n,
        SelectPromoNamei18n,
        SelectCategoryi18n,
        EnterPercDisci18n,
        EnterPromoCodei18n,
        Expiryi18n,
        PromoNamei18n,
        Statusi18n,
        EnterPromoNamei18n,
        SelectProductsIncludedToThePromoi18n,
        Producti18n,
        Expiredi18n,
        Activei18n,
        Successi18n,
        SuccesfullyAddedNewPromoi18n,
        Failedi18n,
        PleaseUseADifferentPromoCodei18n,
        SuccesfullyDeletedPromoi18n
    } = useI18nStore();
    const addPromoFormSchema = z.object({
        name: z.string().min(2).max(50),
        discount: z.string().min(1).max(90),
        expiry: z.date(),
        products: z.array(z.any()).min(1, { message: "Required at least one" }),
    });
    const addPromoForm = useForm<z.infer<typeof addPromoFormSchema>>({
        resolver: zodResolver(addPromoFormSchema),
    });
    const [openDialAdd, setOpenDialAdd] = useState<boolean>();
    const [openDial, setOpenDial] = useState<boolean>();
    const [indexToDel, setIndexToDel] = useState<number>(0);
    const [selectedPromo, setSelectedPromo] = useState<string>("");
    /* Queries */
    //Axios Configuration
    axios.defaults.headers.common[
        "Authorization"
    ] = `Bearer ${session.data?.token}`;
    const productQuery = useQuery({
        queryKey: ["productOpt"],
        enabled:
            session.status === "authenticated" && userData?.branchId !== null,
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
                    `${process.env.NEXT_PUBLIC_API_URL}/product/getProducts/cId/${companyId}/bId/${branchId}`
                );
                return response.data.map((product: any) => {
                    return { value: product.ProductId, label: product.Name };
                });
            }
        },
    });
    const promoDetailsQuery = useQuery({
        queryKey: ["promoDetails"],
        enabled: selectedPromo !== "",
        queryFn: async () => {
            if (session.data?.token !== undefined) {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/promo/getPromoProducts/pId/${selectedPromo}`
                );
                return response.data;
            }
        },
    });
    const promoQuery: UseQueryResult<PromoDataList[]> = useQuery({
        queryKey: ["promo"],
        enabled: session.status === "authenticated",
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
                    `${process.env.NEXT_PUBLIC_API_URL}/promo/getPromo/cId/${companyId}/bId/${branchId}`
                );
                return response.data;
            }
        },
    });
    const promoMutation = useMutation({
        mutationKey: ["addPromo"],
        mutationFn: async (data: any) => {
            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/promo/addPromo`,
                {
                    expiry: data.expiry,
                    name: data.name,
                    category: data.category,
                    percentage: data.discount,
                    promoCode: data.promoCode,
                    companyId: userData?.companyId,
                    branchId: userData?.branchId,
                    products: data.products.map(
                        (product: any) => product.value
                    ),
                }
            );
        },
        onSuccess: () => {
            promoQuery.refetch();
            toast({
                title: Successi18n[locale],
                description: SuccesfullyAddedNewPromoi18n[locale],
            });
            setTimeout(() => {
                setOpenDialAdd(false);
                addPromoForm.reset();
            });
        },
        onError: (data) => {
            console.log(data);
            toast({
                title: Failedi18n[locale],
                description: PleaseUseADifferentPromoCodei18n[locale],
            });
        },
    });
    const promoDeleteMutation = useMutation({
        mutationKey: ["deletePromo"],
        mutationFn: async (data: any) => {
            await axios.delete(
                `${process.env.NEXT_PUBLIC_API_URL}/promo/deletePromo/id/${data}`
            );
        },
        onSuccess: () => {
            promoQuery.refetch();
            toast({
                title: Successi18n[locale],
                description: SuccesfullyDeletedPromoi18n[locale],
            });
        },
    });
    /* Coloumn Definitions */
    const columnsPromoList: ColumnDef<PromoDataList>[] = [
        { accessorKey: "PromoId", header: IDi18n[locale] },
        {
            accessorKey: "Name",
            header: () => {
                return <div className="text-center">{PromoNamei18n[locale]}</div>;
            },
            cell: ({ row }) => {
                return (
                    <div className="text-center">{row.getValue("Name")}</div>
                );
            },
        },
        {
            accessorKey: "Percentage",
            header: () => {
                return <div className="text-center">{Discounti18n[locale]}(%)</div>;
            },
            cell: ({ row }) => {
                return (
                    <div className="text-center">
                        {row.getValue("Percentage")}%
                    </div>
                );
            },
        },
        {
            accessorKey: "Status",
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
                const status =
                    new Date(row.getValue("Expiry")) < new Date()
                        ? Expiredi18n[locale]
                        : Activei18n[locale];
                return <div className="text-center">{status}</div>;
            },
        },
        {
            accessorKey: "Expiry",
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
                            {Expiryi18n[locale]}
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                );
            },
            cell: ({ row }) => {
                const expiryDate: Date = new Date(row.getValue("Expiry"));
                return (
                    <div className="text-center">
                        {expiryDate.toLocaleDateString(locale, {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}
                    </div>
                );
            },
        },
        {
            accessorKey: "action",
            header: () => {
                return <div className="text-center">{Actioni18n[locale]}</div>;
            },
            cell: ({ row }) => {
                return (
                    <div className="flex justify-center gap-3">
                        <Button
                            variant={"destructive"}
                            className="h-full px-1 py-1"
                            onClick={() => {
                                setIndexToDel(row.getValue("PromoId"));
                                setOpenDial((prev) => {
                                    return !prev;
                                });
                            }}
                        >
                            <Trash2 size={20} strokeWidth={1.25} />
                        </Button>
                        <Button
                            onClick={() => {
                                setOpen(true);
                                setSelectedPromo(row.getValue("PromoId"));
                            }}
                            className="h-max px-1 py-1"
                        >
                            <BookOpen size={20} strokeWidth={1.25} />
                        </Button>
                    </div>
                );
            },
        },
    ];
    const columnsProductList: ColumnDef<PromoProductDataList>[] = [
        { accessorKey: "Name", header: Namei18n[locale] },
    ];
    function onSubmit(values: z.infer<typeof addPromoFormSchema>) {
        promoMutation.mutate(values);
    }
    useEffect(() => {
        promoQuery.refetch();
    }, [globalCompanyState, globalBranchState]);
    useEffect(() => {
        promoDetailsQuery.refetch();
    }, [selectedPromo]);
    return (
        <div className="mx-3 mb-3 flex flex-1 gap-3">
            <Card className="flex flex-1 flex-col gap-3 p-3">
                <div className="flex items-center justify-between pb-2">
                    <h1 className="text-2xl font-semibold">
                        {PromoListi18n[locale]}
                    </h1>
                    {userData?.role == "3" && (
                        <div>
                            <AlertDialog
                                open={openDialAdd}
                                onOpenChange={setOpenDialAdd}
                            >
                                <AlertDialogTrigger
                                    onClick={() => addPromoForm.reset()}
                                    className="rounded-lg bg-primary px-2 py-2 font-medium text-white"
                                >
                                    {AddPromoi18n[locale]}
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            {AddPromoi18n[locale]}
                                        </AlertDialogTitle>
                                        <div>
                                            <Form {...addPromoForm}>
                                                <form
                                                    onSubmit={addPromoForm.handleSubmit(
                                                        onSubmit
                                                    )}
                                                    className="space-y-4"
                                                >
                                                    <FormField
                                                        control={
                                                            addPromoForm.control
                                                        }
                                                        name="name"
                                                        render={({ field }) => (
                                                            <FormItem className="flex flex-col gap-3">
                                                                <FormLabel>
                                                                    {
                                                                        Namei18n[
                                                                            locale
                                                                        ]
                                                                    }
                                                                </FormLabel>
                                                                <div>
                                                                    <FormControl>
                                                                        <Input
                                                                            placeholder={
                                                                                EnterPromoNamei18n[locale]
                                                                            }
                                                                            {...field}
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </div>
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={
                                                            addPromoForm.control
                                                        }
                                                        name="products"
                                                        render={({ field }) => (
                                                            <FormItem className="flex flex-col gap-3">
                                                                <FormLabel>
                                                                    {Producti18n[locale]}
                                                                </FormLabel>
                                                                <div>
                                                                    <FormControl>
                                                                        <MultipleSelector
                                                                            value={
                                                                                field.value
                                                                            }
                                                                            onChange={
                                                                                field.onChange
                                                                            }
                                                                            defaultOptions={
                                                                                productQuery.data ||
                                                                                []
                                                                            }
                                                                            placeholder= {SelectProductsIncludedToThePromoi18n[locale]}
                                                                            emptyIndicator={
                                                                                <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                                                                                    Products
                                                                                    No
                                                                                    More{" "}
                                                                                    {
                                                                                        ":("
                                                                                    }
                                                                                </p>
                                                                            }
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </div>
                                                            </FormItem>
                                                        )}
                                                    />
                                                    {/* <FormField
                                                        control={
                                                            addPromoForm.control
                                                        }
                                                        name="category"
                                                        render={({ field }) => (
                                                            <FormItem className="flex flex-col gap-3">
                                                                <FormLabel>
                                                                    {
                                                                        Categoryi18n[
                                                                            locale
                                                                        ]
                                                                    }
                                                                </FormLabel>
                                                                <div>
                                                                    <FormControl>
                                                                        <Select
                                                                            onValueChange={
                                                                                field.onChange
                                                                            }
                                                                            defaultValue={
                                                                                field.value
                                                                            }
                                                                        >
                                                                            <SelectTrigger>
                                                                                <SelectValue
                                                                                    placeholder={
                                                                                        SelectCategoryi18n[
                                                                                            locale
                                                                                        ]
                                                                                    }
                                                                                />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                <SelectGroup>
                                                                                    <SelectLabel>
                                                                                        {
                                                                                            Categoryi18n[
                                                                                                locale
                                                                                            ]
                                                                                        }
                                                                                    </SelectLabel>
                                                                                    <SelectItem value="Dairy">
                                                                                        Dairy
                                                                                    </SelectItem>
                                                                                    <SelectItem value="Cereal">
                                                                                        Cereal
                                                                                    </SelectItem>
                                                                                    <SelectItem value="Snacks">
                                                                                        Snacks
                                                                                    </SelectItem>
                                                                                    <SelectItem value="Drinks">
                                                                                        Drinks
                                                                                    </SelectItem>
                                                                                </SelectGroup>
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </div>
                                                            </FormItem>
                                                        )}
                                                    /> */}
                                                    <FormField
                                                        control={
                                                            addPromoForm.control
                                                        }
                                                        name="discount"
                                                        render={({ field }) => (
                                                            <FormItem className="flex flex-col gap-3">
                                                                <FormLabel>
                                                                    {
                                                                        Discounti18n[
                                                                            locale
                                                                        ]
                                                                    }
                                                                </FormLabel>
                                                                <div>
                                                                    <FormControl>
                                                                        <Input
                                                                            placeholder={
                                                                                EnterPercDisci18n[
                                                                                    locale
                                                                                ]
                                                                            }
                                                                            min={
                                                                                1
                                                                            }
                                                                            max={
                                                                                90
                                                                            }
                                                                            type="number"
                                                                            {...field}
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </div>
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={
                                                            addPromoForm.control
                                                        }
                                                        name="expiry"
                                                        render={({ field }) => (
                                                            <FormItem className="flex flex-col gap-2 pt-2">
                                                                <FormLabel>
                                                                    {
                                                                        Expiryi18n[
                                                                            locale
                                                                        ]
                                                                    }
                                                                </FormLabel>
                                                                <div>
                                                                    {/* <Popover>
                                                                        <PopoverTrigger
                                                                            asChild
                                                                        >
                                                                            <FormControl>
                                                                                <Button
                                                                                    variant={
                                                                                        "outline"
                                                                                    }
                                                                                    className={cn(
                                                                                        "w-[240px] pl-3 text-left font-normal",
                                                                                        !field.value &&
                                                                                            "text-muted-foreground"
                                                                                    )}
                                                                                >
                                                                                    {field.value ? (
                                                                                        format(
                                                                                            field.value,
                                                                                            "PPP"
                                                                                        )
                                                                                    ) : (
                                                                                        <span>
                                                                                            Pick
                                                                                            a
                                                                                            date
                                                                                        </span>
                                                                                    )}
                                                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                                                </Button>
                                                                            </FormControl>
                                                                        </PopoverTrigger>
                                                                        <PopoverContent
                                                                            className="w-auto p-0"
                                                                            align="start"
                                                                        >
                                                                            <Calendar
                                                                                mode="single"
                                                                                selected={
                                                                                    field.value
                                                                                }
                                                                                onSelect={
                                                                                    field.onChange
                                                                                }
                                                                                initialFocus
                                                                            />
                                                                        </PopoverContent>
                                                                    </Popover> */}
                                                                    <DateTimePicker
                                                                        granularity="minute"
                                                                        hourCycle={
                                                                            12
                                                                        }
                                                                        jsDate={
                                                                            field.value
                                                                        }
                                                                        onJsDateChange={
                                                                            field.onChange
                                                                        }
                                                                    />
                                                                    <FormMessage />
                                                                </div>
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <div className="flex justify-end gap-3 pt-3">
                                                        <AlertDialogCancel>
                                                            {Canceli18n[locale]}
                                                        </AlertDialogCancel>
                                                        <Button type="submit">
                                                            {Submiti18n[locale]}
                                                        </Button>
                                                    </div>
                                                </form>
                                            </Form>
                                        </div>
                                    </AlertDialogHeader>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    )}
                </div>
                <DataTable
                    columns={columnsPromoList}
                    pagination={true}
                    data={promoQuery.data ?? []}
                    isLoading={promoQuery.isPending}
                    filtering={true}
                    columnsToSearch={["Name"]}
                    pageSize={10}
                    visibility={{ PromoId: false }}
                />
            </Card>
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent className="w-[40rem] sm:w-[37rem]">
                    <div className="flex w-full flex-col gap-3 py-5">
                        <h1 className="text-2xl font-semibold">
                            {PromoProducti18n[locale]}
                        </h1>
                        <DataTable
                            columns={columnsProductList}
                            pagination={true}
                            data={promoDetailsQuery.data ?? []}
                            pageSize={10}
                            filtering={true}
                            columnsToSearch={["name"]}
                        />
                    </div>
                </SheetContent>
            </Sheet>
            <AlertDialog open={openDial} onOpenChange={setOpenDial}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {AlertDialogue2i18n[locale]}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {AlertDialogue1i18n[locale]}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction
                            disabled={!openDial}
                            onClick={() => {
                                promoDeleteMutation.mutate(indexToDel);
                            }}
                        >
                            {Continuei18n[locale]}
                        </AlertDialogAction>
                        <AlertDialogCancel>
                            {Canceli18n[locale]}
                        </AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export default Promo;
