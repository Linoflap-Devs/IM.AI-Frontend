"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { useToast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";
import { useI18nStore } from "@/store/usei18n";
import { useGlobalStore } from "@/store/useStore";
import axios from "axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import BranchDropDown from "../BranchDropDown";

const formSchema = z.object({
    productName: z.string().min(2).max(50),
    price: z.string().min(2).max(50),
    barcode: z.string().min(2).max(50),
    actualWeight: z.string().min(2).max(50),
    netWeight: z.string().min(2).max(50),
    category: z.string().min(1),
    imgFile: z
        .instanceof(File, { message: "Please select add an image" })
        .refine(
            (file) => {
                if (file.type.startsWith("image")) {
                    return true;
                }
                return false;
            },
            { message: "Please select a valid file format" }
        ),
    lowStocklvl: z.string().min(1, { message: "Required" }),
    criticalStocklvl: z.string().min(1, { message: "Required" }),
    unit: z.string().min(1, { message: "Required" }),
});

export default function Product() {
    const session = useSession();
    const userData = session.data?.data;
    const { toast } = useToast();
    axios.defaults.headers.common[
        "Authorization"
    ] = `Bearer ${session.data?.token}`;
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedBranch, setSelectedBranch] = useState("all");
    const [open, setOpen] = useState(false);
    const productUnits = [
        { value: "Box", label: "Box" },
        { value: "Can", label: "Can" },
        { value: "Piece", label: "Piece" },
        { value: "Bottle", label: "Bottle" },
        { value: "Pouch", label: "Pouch" },
        { value: "Cup", label: "Cup" },
        { value: "Pack", label: "Pack" },
    ];
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    });
    const {
        locale,
        ProdNamei18n,
        Categoryi18n,
        Producti18n,
        Downloadi18n,
        Datai18n,
        Addi18n,
        Uploadi18n,
        Imagei18n,
        Gramsi18n,
        ActualWeighti18n,
        ProdWeighti18n,
        Barcodei18n,
        NetWeighti18n,
        LowStockLvli18n,
        CriticalStockLvli18n,
        Branchi18n,
        Pricei18n,
        ProductListi18n,
        Emaili18n,
        SelectAUniti18n,
        AllBranchi18n,
        AddingProductUnsuccessfuli18n,
        ThereWasAnErrorAddingProductPleaseTryAgainLateri18n,
        SuccessAddingProducti18n,
        SuccesfullyAddedProducti18n,
        Uniti18n,
    } = useI18nStore();
    const { globalBranchState, globalCompanyState } = useGlobalStore();

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
                return response.data;
            }
        },
    });
    const getCategoriesQuery = useQuery({
        queryKey: ["GetCategories"],
        enabled: session.data?.token !== undefined,
        queryFn: async () => {
            if (session.data?.token !== undefined) {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/product/getCategories`
                );
                const categories = response.data.map((item: any) => {
                    return {
                        id: `${item.CategoryId}`,
                        name: item.Name,
                    };
                });
                return categories;
            }
        },
    });
    const addProductMutation = useMutation({
        mutationKey: ["AddProduct"],
        mutationFn: async (data: any) => {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/product/addProduct`,
                data
            );
            return response.data;
        },
        onError: (data) => {
            console.error(data);
            toast({
                variant: "destructive",
                title: AddingProductUnsuccessfuli18n[locale],
                description:
                    ThereWasAnErrorAddingProductPleaseTryAgainLateri18n[locale],
            });
        },
        onSuccess: (data) => {
            toast({
                title: SuccessAddingProducti18n[locale],
                description: SuccesfullyAddedProducti18n[locale],
            });
        },
        onSettled: async () => {
            getProductsQuery.refetch();
            setOpen(false);
            form.reset();
        },
    });
    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values);
        addProductMutation.mutate({
            price: values.price,
            companyId: userData?.companyId,
            branchId: selectedBranch,
            productName: values.productName,
            barcode: values.barcode,
            actualWeight: values.actualWeight,
            netWeight: values.netWeight,
            category: values.category,
            lowlvlStock: values.lowStocklvl,
            critLvlStock: values.criticalStocklvl,
            unit: values.unit,
        });
    }
    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "Name",
            header: ProdNamei18n[locale],
        },

        {
            accessorKey: "Price",
            header: ({ column }) => {
                return (
                    <div className="flex flex-col items-center">
                        {Pricei18n[locale]}
                        <span className="font-bold">JP¥</span>
                    </div>
                );
            },
            cell: ({ row }) => {
                return (
                    <div className="text-center">¥{row.getValue("Price")}</div>
                );
            },
        },
        {
            accessorKey: "ActualWeight",
            header: ({ column }) => {
                return (
                    <div className="flex flex-col items-center">
                        {ActualWeighti18n[locale]}
                        <span className="font-bold">{Gramsi18n[locale]}</span>
                    </div>
                );
            },
            cell: ({ row }) => {
                return (
                    <div className="text-center">
                        {row.getValue("ActualWeight")}g
                    </div>
                );
            },
        },
        {
            accessorKey: "ProductWeight",
            header: ({ column }) => {
                return (
                    <div className="flex flex-col items-center">
                        {ProdWeighti18n[locale]}
                        <span className="font-bold">{Gramsi18n[locale]}</span>
                    </div>
                );
            },
            cell: ({ row }) => {
                return (
                    <div className="text-center">
                        {row.getValue("ProductWeight")}g
                    </div>
                );
            },
        },
        {
            accessorKey: "BarCode",
            header: Barcodei18n[locale],
        },
    ];
    useEffect(() => {
        getProductsQuery.refetch();
    }, [globalBranchState, globalCompanyState]);
    return (
        <Card className="mx-3 mb-3 flex w-full flex-col gap-2 p-3">
            {userData && userData.role <= 3 && (
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">
                        {ProductListi18n[locale]}
                    </h1>
                    <div className="flex items-center gap-3">
                        <Button className="bg-green-400">
                            {`${Downloadi18n[locale]} ${Datai18n[locale]}`}
                        </Button>
                        <AlertDialog open={open} onOpenChange={setOpen}>
                            <AlertDialogTrigger asChild>
                                <Button
                                    onClick={() => {
                                        form.reset();
                                    }}
                                    variant="default"
                                >
                                    {`${Addi18n[locale]} ${Producti18n[locale]}`}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="flex items-center justify-between text-2xl">
                                        {`${Addi18n[locale]} ${Producti18n[locale]}`}
                                        <AlertDialogCancel>X</AlertDialogCancel>
                                    </AlertDialogTitle>
                                    <Form {...form}>
                                        <form
                                            onSubmit={form.handleSubmit(
                                                onSubmit
                                            )}
                                            className="space-y-3"
                                        >
                                            {userData?.role == 2 && (
                                                <div className="flex items-center justify-between">
                                                    <label className="text-lg font-medium">
                                                        {Branchi18n[locale]}
                                                    </label>
                                                    <BranchDropDown
                                                        className="w-[277.19px]"
                                                        defaultValue={
                                                            AllBranchi18n[
                                                                locale
                                                            ]
                                                        }
                                                        externalState={
                                                            selectedBranch
                                                        }
                                                        setExternalState={
                                                            setSelectedBranch
                                                        }
                                                    />
                                                </div>
                                            )}
                                            <FormField
                                                control={form.control}
                                                name="productName"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-col items-center">
                                                        <div className="flex w-full items-center justify-between">
                                                            <FormLabel className="text-lg">
                                                                {
                                                                    ProdNamei18n[
                                                                        locale
                                                                    ]
                                                                }
                                                            </FormLabel>
                                                            <FormControl className="w-[60%]">
                                                                <Input
                                                                    placeholder={
                                                                        ProdNamei18n[
                                                                            locale
                                                                        ]
                                                                    }
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                        </div>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="price"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-col items-center">
                                                        <div className="flex w-full items-center justify-between">
                                                            <FormLabel className="text-lg">
                                                                {
                                                                    Pricei18n[
                                                                        locale
                                                                    ]
                                                                }
                                                            </FormLabel>
                                                            <FormControl className="w-[60%]">
                                                                <Input
                                                                    type="number"
                                                                    placeholder={
                                                                        Pricei18n[
                                                                            locale
                                                                        ]
                                                                    }
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                        </div>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="category"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-col items-center">
                                                        <div className="flex w-full items-center justify-between">
                                                            <FormLabel className="text-lg">
                                                                {
                                                                    Categoryi18n[
                                                                        locale
                                                                    ]
                                                                }
                                                            </FormLabel>
                                                            <Select
                                                                onValueChange={
                                                                    field.onChange
                                                                }
                                                                defaultValue={
                                                                    field.value
                                                                }
                                                            >
                                                                <FormControl className="w-[60%]">
                                                                    <SelectTrigger>
                                                                        <SelectValue
                                                                            placeholder={
                                                                                Categoryi18n[
                                                                                    locale
                                                                                ]
                                                                            }
                                                                        />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    {getCategoriesQuery.data.map(
                                                                        (
                                                                            item: any,
                                                                            index: number
                                                                        ) => {
                                                                            return (
                                                                                <SelectItem
                                                                                    key={
                                                                                        index
                                                                                    }
                                                                                    value={item.id.toString()}
                                                                                >
                                                                                    {selectedCategory
                                                                                        ? selectedCategory
                                                                                        : item.name}
                                                                                </SelectItem>
                                                                            );
                                                                        }
                                                                    )}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="barcode"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-col items-center">
                                                        <div className="flex w-full items-center justify-between">
                                                            <FormLabel className="text-lg">
                                                                {
                                                                    Barcodei18n[
                                                                        locale
                                                                    ]
                                                                }
                                                            </FormLabel>
                                                            <FormControl className="w-[60%]">
                                                                <Input
                                                                    type="number"
                                                                    placeholder={
                                                                        Barcodei18n[
                                                                            locale
                                                                        ]
                                                                    }
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                        </div>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="actualWeight"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-col items-center">
                                                        <div className="flex w-full items-center justify-between">
                                                            <FormLabel className="text-lg">
                                                                {
                                                                    ActualWeighti18n[
                                                                        locale
                                                                    ]
                                                                }
                                                                <span className="text-sm">
                                                                    (
                                                                    {
                                                                        Gramsi18n[
                                                                            locale
                                                                        ]
                                                                    }
                                                                    )
                                                                </span>
                                                            </FormLabel>
                                                            <FormControl className="w-[60%]">
                                                                <Input
                                                                    placeholder={
                                                                        ActualWeighti18n[
                                                                            locale
                                                                        ]
                                                                    }
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                        </div>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="netWeight"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-col items-center">
                                                        <div className="flex w-full items-center justify-between">
                                                            <FormLabel className="text-lg">
                                                                {
                                                                    NetWeighti18n[
                                                                        locale
                                                                    ]
                                                                }
                                                                <span className="text-sm">
                                                                    (
                                                                    {
                                                                        Gramsi18n[
                                                                            locale
                                                                        ]
                                                                    }
                                                                    )
                                                                </span>
                                                            </FormLabel>
                                                            <FormControl className="w-[60%]">
                                                                <Input
                                                                    placeholder={
                                                                        NetWeighti18n[
                                                                            locale
                                                                        ]
                                                                    }
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                        </div>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="unit"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-col items-center">
                                                        <div className="flex w-full items-center justify-between">
                                                            <FormLabel className="text-lg">
                                                                {
                                                                    Uniti18n[
                                                                        locale
                                                                    ]
                                                                }
                                                            </FormLabel>
                                                            <Select
                                                                onValueChange={
                                                                    field.onChange
                                                                }
                                                                defaultValue={
                                                                    field.value
                                                                }
                                                            >
                                                                <FormControl className="w-[60%]">
                                                                    <SelectTrigger>
                                                                        <SelectValue
                                                                            placeholder={
                                                                                SelectAUniti18n[
                                                                                    locale
                                                                                ]
                                                                            }
                                                                        />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    {productUnits.map(
                                                                        (
                                                                            item,
                                                                            index
                                                                        ) => {
                                                                            return (
                                                                                <SelectItem
                                                                                    key={
                                                                                        index
                                                                                    }
                                                                                    value={
                                                                                        item.value
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        item.label
                                                                                    }
                                                                                </SelectItem>
                                                                            );
                                                                        }
                                                                    )}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <div className="flex items-center justify-center">
                                                <FormField
                                                    control={form.control}
                                                    name="lowStocklvl"
                                                    render={({ field }) => (
                                                        <FormItem className="flex flex-col items-center">
                                                            <div className="flex w-full flex-col items-center justify-between">
                                                                <FormLabel className="text-lg">
                                                                    {
                                                                        LowStockLvli18n[
                                                                            locale
                                                                        ]
                                                                    }
                                                                </FormLabel>
                                                                <FormControl className="w-[80%]">
                                                                    <Input
                                                                        type="number"
                                                                        placeholder={
                                                                            LowStockLvli18n[
                                                                                locale
                                                                            ]
                                                                        }
                                                                        {...field}
                                                                    />
                                                                </FormControl>
                                                            </div>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="criticalStocklvl"
                                                    render={({ field }) => (
                                                        <FormItem className="flex flex-col items-center">
                                                            <div className="flex w-full flex-col items-center justify-between">
                                                                <FormLabel className="text-lg">
                                                                    {
                                                                        CriticalStockLvli18n[
                                                                            locale
                                                                        ]
                                                                    }
                                                                </FormLabel>
                                                                <FormControl className="w-[80%]">
                                                                    <Input
                                                                        type="number"
                                                                        placeholder={
                                                                            CriticalStockLvli18n[
                                                                                locale
                                                                            ]
                                                                        }
                                                                        {...field}
                                                                    />
                                                                </FormControl>
                                                            </div>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <FormField
                                                control={form.control}
                                                name="imgFile"
                                                render={({ field }) => (
                                                    <FormItem className="">
                                                        <div className="mx-auto flex w-3/4 flex-col items-center justify-between rounded border py-5">
                                                            <FormLabel className="text-lg">
                                                                {`${Uploadi18n[locale]} ${Imagei18n[locale]}`}
                                                            </FormLabel>
                                                            <FormControl className="w-[60%]">
                                                                <Input
                                                                    className="transition-all hover:scale-[1.05] hover:cursor-pointer hover:bg-primary active:scale-100"
                                                                    accept="image/*"
                                                                    type="file"
                                                                    multiple={
                                                                        false
                                                                    }
                                                                    // required
                                                                    onChange={(
                                                                        e
                                                                    ) => {
                                                                        field.onChange(
                                                                            e
                                                                                .target
                                                                                .files
                                                                                ? e
                                                                                      .target
                                                                                      .files[0]
                                                                                : null
                                                                        );
                                                                    }}
                                                                />
                                                            </FormControl>
                                                        </div>
                                                        <FormMessage className="text-center" />
                                                    </FormItem>
                                                )}
                                            />
                                            <div className="flex justify-end">
                                                <Button type="submit">
                                                    {`${Addi18n[locale]}`}
                                                </Button>
                                            </div>
                                        </form>
                                    </Form>
                                </AlertDialogHeader>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            )}
            <div>
                <DataTable
                    filtering={true}
                    coloumnToFilter="Name"
                    resetSortBtn={true}
                    pageSize={12}
                    data={getProductsQuery.data ? getProductsQuery.data : []}
                    pagination={true}
                    columns={columns}
                />
            </div>
        </Card>
    );
}
