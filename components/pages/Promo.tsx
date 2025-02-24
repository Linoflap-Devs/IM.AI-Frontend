"use client";
import { useGlobalStore } from "@/store/useStore";
import { ColumnDef } from "@tanstack/react-table";
import { Card } from "../ui/card";
import { DataTable } from "../ui/data-table";
import { Button } from "../ui/button";
import { ArrowUpDown, Trash2, BookOpen, Pencil } from "lucide-react";
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
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
import { format } from "date-fns";

function Promo() {
    const session = useSession();
    const userData = session.data?.data;
    const [date, setDate] = useState<Date>();
    const [promoProductDatalist, setPromoProductDatalist] = useState<
        PromoProductDataList[]
    >([]);
    const [open, setOpen] = useState(false);
    const { globalCompanyState, globalBranchState } = useGlobalStore();
    const [openDialAdd, setOpenDialAdd] = useState<boolean>();
    const [openDial, setOpenDial] = useState<boolean>();
    const [indexToDel, setIndexToDel] = useState<number>(0);
    const [selectedPromo, setSelectedPromo] = useState<string>("");
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const [selectedPromoDetail, setSelectedPromoDetail] = useState<any>({})
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
        SuccesfullyEditedPromoi18n,
        Failedi18n,
        PleaseUseADifferentPromoCodei18n,
        SuccesfullyDeletedPromoi18n,
        ProdNamei18n,
        ConfirmDeletion
    } = useI18nStore();
    const addPromoFormSchema = z.object({
        name: z.string().min(2).max(50),
        discount: z.string().min(1).max(90),
        start: z.date(),
        expiry: z.date(),
        products: z.array(z.any()).min(1, { message: "Required at least one" }),
    }).refine((data) => data.start < data.expiry, {
        message: "Start date must be before the Expiry Date",
        path: ["start"]
    });
    const addPromoForm = useForm<z.infer<typeof addPromoFormSchema>>({
        resolver: zodResolver(addPromoFormSchema),
        defaultValues: {
            name: "",
            discount: "",
            start: undefined,
            expiry: undefined,
            products: undefined
        },
    });

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
        queryKey: ["promoDetails", selectedPromo],
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
            console.log(userData)
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

            const startDate = format(new Date(data.start), "yyyy-MM-dd HH:mm:ss")
            const endDate = format(new Date(data.expiry), "yyyy-MM-dd HH:mm:ss")

            console.log(startDate, endDate)

            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/promo/addPromo`,
                {
                    startDate: startDate,
                    endDate: endDate,
                    name: data.name,
                    category: data.category,
                    percentage: data.discount,
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

    const editPromoMutation = useMutation({
        mutationKey: ['editPromo'],
        mutationFn: async (data: any) => {
            const editData = {
                id: selectedPromo,
                name: data.name,
                startDate: data.start,
                endDate: data.expiry,
                percentage: data.discount,
                products: data.products.map((product: any) => product.value)
            }
            console.log(editData)
            await axios.patch(
                `${process.env.NEXT_PUBLIC_API_URL}/promo/editPromo`,
                editData
            )
        },
        onSuccess: (data) => {
            promoQuery.refetch();
            toast({
                title: Successi18n[locale],
                description: SuccesfullyEditedPromoi18n[locale],
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
    })
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

    const handleRowEdit = (row: any) => {
        console.log(row.original)
        setSelectedPromo(row.original.PromoId)
        setIsEditMode(true)
        const details = {
            name: row.original.Name,
            discount: row.original.Percentage,
            start: new Date(row.original.StartDate),
            expiry: new Date(row.original.EndDate),
            // start: undefined,
            // expiry: undefined,
            products: promoDetailsQuery.data?.map((product: any) => { return { label: product.Name, value: product.ProductId } }) ?? []
        }
        setSelectedPromoDetail(details)
        console.log(details)
        addPromoForm.reset(details)
        setOpenDialAdd(true)
    }

    useEffect(() => {
        console.log(selectedPromoDetail)
    }, [selectedPromoDetail])

    useEffect(() => {
        promoQuery.refetch();
    }, [globalCompanyState, globalBranchState]);

    useEffect(() => {
        console.log(selectedPromo)
        promoDetailsQuery.refetch();
    }, [selectedPromo]);

    useEffect(() => {
        if (promoDetailsQuery.data && isEditMode) {
            // Set products in the form once data is fetched
            const labelValue = promoDetailsQuery.data.map((item: any) => {
                return {
                    label: item.Name,
                    value: item.ProductId.toString()
                }
            })
            setSelectedPromoDetail((prev: any) => ({
                ...prev,
                products: labelValue, // Use the queried products
            }));

            addPromoForm.setValue("products", labelValue); // Update form directly
        }
    }, [promoDetailsQuery.data, isEditMode]);

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
                const hasStarted = new Date(row.getValue("StartDate")) < new Date()
                const hasEnded = new Date(row.getValue("EndDate")) < new Date()
                const isActive = hasStarted && !hasEnded
                return <div className="text-center"><span className={`p-1 rounded ${hasEnded ? "bg-red-200 text-red-800" : hasStarted ? "bg-green-200 text-green-800" : "bg-orange-200 text-orange-800"}`}>{hasEnded ? "Expired" : hasStarted ? "Active" : "Inactive"}</span></div>;
            },
            sortingFn: (rowA, rowB) => {
                // Helper function to get status
                const getStatus = (row: any) => {
                    const hasStarted = new Date(row.getValue("StartDate")) < new Date()
                    const hasEnded = new Date(row.getValue("EndDate")) < new Date()
                    if (hasEnded) return 2  // Expired
                    if (hasStarted) return 1 // Active
                    return 3                 // Inactive
                }

                const statusA = getStatus(rowA)
                const statusB = getStatus(rowB)

                return statusA - statusB
            }
        },
        {
            accessorKey: "StartDate",
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
                            {"Start Date"}
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                );
            },
            cell: ({ row }) => {

                const isActive = new Date(row.getValue("StartDate")) < new Date();

                return (
                    <div className={`text-center ${isActive ? "text-green-500" : "text-red-500"}`}>
                        {format(new Date(row.getValue("StartDate")), "MMM dd, yyyy | HH:mm aa")}
                    </div>
                );
            },
        },
        {
            accessorKey: "EndDate",
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

                const isExpired = new Date() > new Date(row.getValue("EndDate"));

                return (
                    <div className={`text-center ${isExpired ? "text-red-500" : "text-green-500"}`}>
                        {format(new Date(row.getValue("EndDate")), "MMM dd, yyyy | HH:mm aa")}
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
                            onClick={() => {
                                setOpen(true);
                                setSelectedPromo(row.getValue("PromoId"));
                            }}
                            className="h-max px-1 py-1"
                        >
                            <BookOpen size={20} strokeWidth={1.25} />
                        </Button>
                        {
                            userData.role == "3" && (
                                <Button
                                    className="h-max px-1 py-1"
                                    onClick={() => {
                                        handleRowEdit(row)
                                    }}
                                >
                                    <Pencil size={20} strokeWidth={1.25}></Pencil>
                                </Button>
                            )
                        }
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
                    </div>
                );
            },
        },
    ];
    const columnsProductList: ColumnDef<PromoProductDataList>[] = [
        { accessorKey: "Name", header: ProdNamei18n[locale] },
    ];
    function onSubmit(values: z.infer<typeof addPromoFormSchema>) {
        if (isEditMode) {
            editPromoMutation.mutate(values)
        }
        else {
            promoMutation.mutate(values);
        }
    }

    return (
        <div className="mx-3 mb-3 flex flex-1 gap-3">

            <Card className="flex flex-1 flex-col gap-3 p-3">
                <div className="flex items-center justify-between pb-2">
                    <h1 className="text-2xl font-semibold">
                        {PromoListi18n[locale]}
                    </h1>
                    {userData?.role == "3" && (
                        <div>
                            <Dialog
                                open={openDialAdd}
                                onOpenChange={setOpenDialAdd}
                            >
                                <DialogTrigger
                                    onClick={() => {
                                        setIsEditMode(false)
                                        addPromoForm.reset({
                                            name: "",
                                            discount: "",
                                            start: undefined,
                                            expiry: undefined,
                                            products: []
                                        })
                                    }}
                                    className="rounded-lg bg-primary px-2 py-2 font-medium text-white"
                                >
                                    {AddPromoi18n[locale]}
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader className="gap-5">
                                        <DialogTitle className="text-2xl">
                                            {isEditMode ? "Edit Promo" : AddPromoi18n[locale]}
                                        </DialogTitle>
                                        <div className="mt-5">
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
                                                                <FormLabel className="text-lg">
                                                                    {
                                                                        PromoNamei18n[
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
                                                                <FormLabel className="text-lg">
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
                                                                            placeholder={SelectProductsIncludedToThePromoi18n[locale]}
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
                                                                <FormLabel className="text-lg">
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
                                                        name="start"
                                                        render={({ field }) => (
                                                            <FormItem className="flex flex-col gap-2 pt-2">
                                                                <FormLabel className="text-lg">
                                                                    {
                                                                        "Start Date"
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
                                                                </div>
                                                                <FormMessage />
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
                                                                <FormLabel className="text-lg">
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

                                                        <Button type="submit">
                                                            {isEditMode ? "Update" : Submiti18n[locale]}
                                                        </Button>
                                                    </div>
                                                </form>
                                            </Form>
                                        </div>
                                    </DialogHeader>
                                </DialogContent>
                            </Dialog>
                        </div>
                    )}
                </div>
                <DataTable
                    columns={columnsPromoList}
                    pagination={true}
                    data={promoQuery.data ?? []}
                    isLoading={promoQuery.isPending}
                    filtering={true}
                    columnsToSearch={["Name", "EndDate", "StartDate","Percentage"]}
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
                            columnsToSearch={["Name","Percentage"]}
                        />
                    </div>
                </SheetContent>
            </Sheet>
            <AlertDialog open={openDial} onOpenChange={setOpenDial}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {ConfirmDeletion[locale]}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {AlertDialogue1i18n[locale]}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>
                            {Canceli18n[locale]}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            disabled={!openDial}
                            onClick={() => {
                                promoDeleteMutation.mutate(indexToDel);
                            }}
                        >
                            {Continuei18n[locale]}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export default Promo;
