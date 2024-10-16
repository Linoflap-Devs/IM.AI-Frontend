"use client";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
    FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card } from "../ui/card";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus, CheckIcon, ChevronsUpDown, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useI18nStore } from "@/store/usei18n";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useGlobalStore } from "@/store/useStore";
import { toast } from "../ui/use-toast";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "../ui/command";
import { cn } from "@/lib/utils";
import { ToastClose } from "@/components/ui/toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import MultipleSelector from "../ui/multi-select";

interface Supplier {
    id: number;
    name: string;
    contact: number;
    contactPerson: string;
    email: string;
}
const formSchema = z.object({
    companyId: z.number().gte(0, { message: "Company is required" }),
    supplier: z.string().min(2, { message: "Supplier Name required" }).max(50),
    contact: z.string().min(2, { message: "Contact required" }).max(50),
    contactPerson: z
        .string()
        .min(2, { message: "Contact Person Required" })
        .max(50),
    address: z.string().min(10, { message: "Address Required" }).max(70),
    email: z
        .string()
        .email({ message: "Invalid Email" })
        .min(2, { message: "Email Required" })
        .max(50),
    products: z
        .array(z.object({ value: z.number(), label: z.string() }))
        .min(1, { message: "Please Select atleast 1 or more Product" }),
});
export default function Supplier() {
    const session = useSession();
    const userData = session.data?.data;
    axios.defaults.headers.common[
        "Authorization"
    ] = `Bearer ${session.data?.token}`;
    const {
        locale,
        Emaili18n,
        Addressi8n,
        SupplierNamei18n,
        ContactPersoni18n,
        Contacti18n,
        Submiti18n,
        SupplierListi18n,
        Editi18n,
        Deletei18n,
        Actioni18n,
        AddSupplieri18n,
        Companyi18n,
        SelectCompanyi18n,
        ContactNumberi18n,
        ProductSuppliedi18n,
        SelectProducti18n,
        Canceli18n,
        AreYouAbsolutelySurei18n,
        ThisActionCannotBeUndoneThisWillPermanentlyDeleteYourAccountAndRemoveYourDataFromOurServersi18n,
        EditSupplieri18n,
        Hoveri18n,
        PleaseCompleteTheFormToEditTheSupplieri18n,
        PleaseCompleteTheFormToAddASupplieri18n,
    } = useI18nStore();
    const { globalCompanyState, setGlobalCompanyState, globalBranchState } =
        useGlobalStore();
    const [modalFormState, setModalFormState] = useState<boolean>(false);
    const [modalDelState, setModalDelState] = useState<boolean>(false);
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const [removedItems, setRemovedItems] = useState();
    const [formValues, setFormValues] = useState({
        companyId: 0,
        supplier: "",
        contact: "",
        contactPerson: "",
        address: "",
        email: "",
        products: [],
    });
    const [companyOpen, setCompanyOpen] = useState(false);
    const [selectedSupplierId, setSelectedSupplierId] = useState("");
    const getSuppliersQuery = useQuery({
        queryKey: ["getSuppliers"],
        enabled: session.data?.token !== undefined,
        queryFn: async () => {
            if (session.data?.token !== undefined) {
                const companyId =
                    globalCompanyState !== "all"
                        ? globalCompanyState
                        : userData?.companyId;
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/supplier/getSuppliers/cId/${companyId}`
                );
                return response.data;
            }
        },
    });
    const addSupplierMutation = useMutation({
        mutationKey: ["addSupplier"],
        mutationFn: async (data: any) => {
            console.log(data);
            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/supplier/addSupplier`,
                {
                    name: data.supplier,
                    companyId: data.companyId,
                    contact: data.contact,
                    contactPerson: data.contactPerson,
                    email: data.email,
                    address: data.address,
                    productList: data.products,
                }
            );
        },
        onSuccess: () => {
            getSuppliersQuery.refetch();
            toast({
                title: "Success",
                description: `Succesfully Added New Supplier`,
            });
            setModalFormState(false);
        },
        onError: () => {
            toast({
                variant: "destructive",
                title: "There was an error in the Server",
                description: "Please, try again later",
            });
        },
    });
    const editSupplierMutation = useMutation({
        mutationKey: ["editSupplier"],
        /* Workinprogress Backend Frontend */
        mutationFn: async (data: any) => {
            console.log(data);
            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/supplier/editSupplier`,
                {
                    id: selectedSupplierId,
                    name: data.supplier,
                    companyId: globalCompanyState,
                    contact: data.contact,
                    contactPerson: data.contactPerson,
                    email: data.email,
                    address: data.address,
                    productList: data.products,
                    removedItems: removedItems,
                }
            );
        },
        onSuccess: () => {
            toast({
                title: "Success",
                description: `Succesfully Edited ${"supplierName"}`,
            });
            getSuppliersQuery.refetch();
        },
        onError: (e: any) => {
            console.log(e);
        },
    });
    const deleteSupplierMutation = useMutation({
        mutationKey: ["deleteSupplier"],
        mutationFn: async (data: any) => {
            return await axios.delete(
                `${process.env.NEXT_PUBLIC_API_URL}/supplier/deleteSupplier/sId/${data}`
            );
        },
        onSuccess: () => {
            getSuppliersQuery.refetch();
            toast({
                title: "Success",
                description: `Succesfully Deleted ${"supplierName"}`,
            });
        },
        onError: (e: any) => {
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: `Failed to Delete ${"supplierName"}`,
                action: <ToastClose>Remove</ToastClose>,
            });
        },
        onSettled: () => {
            /* resetForm(); */
        },
    });
    const productQuery = useQuery({
        queryKey: ["productOpt"],
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
                    `${process.env.NEXT_PUBLIC_API_URL}/product/getProducts/cId/${companyId}/bId/${branchId}`
                );
                const data = response.data.map((product: any) => {
                    return {
                        label: product.Name,
                        value: product.ProductId,
                    };
                });
                return data;
            }
        },
    });
    const getProductList = useQuery({
        queryKey: ["getProductList"],
        enabled: session.status === "authenticated",
        queryFn: async () => {
            if (session.status === "authenticated") {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/supplier/getSupplierProducts/sId/${selectedSupplierId}`
                );
                const productList = response.data.map((product: any) => {
                    return {
                        value: product.ProductId,
                        label: product.Name,
                    };
                });
                return productList;
            }
        },
    });
    const getCompanyQuery = useQuery({
        queryKey: ["getCompany"],
        enabled: session.status === "authenticated" && userData.role <= 2,
        queryFn: async () => {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/company/getCompanyOptions`,
                {
                    headers: {
                        Authorization: `Bearer ${session.data?.token}`,
                    },
                }
            );

            return response.data;
        },
        refetchOnWindowFocus: false,
    });
    const columns: ColumnDef<Supplier>[] = [
        {
            accessorKey: "SupplierId",
        },
        {
            accessorKey: "CompanyId",
        },
        {
            accessorKey: "SupplierName",
            header: SupplierNamei18n[locale],
            /* cell: ({ row }) => {
                return (
                    <div
                        className="font-semibold hover:cursor-pointer hover:text-primary hover:underline"
                        onClick={() => {
                            setIsEditMode(false);
                            setProductList([]);
                            setSupplierId(`${row.getValue("SupplierId")}`);
                            setSupplierName(row.getValue("SupplierName"));
                            setSupplierContact(row.getValue("Contact"));
                            setSupplierContactPerson(
                                row.getValue("ContactPerson")
                            );
                            setSupplierEmail(row.getValue("Email"));
                            setAddress(row.getValue("Location"));
                            setCompanyId(row.getValue("CompanyId") as number);
                            form.reset({
                                companyId: row.getValue("CompanyId") as number,
                                supplier: row.getValue("SupplierName"),
                                contact: row.getValue("Contact"),
                                contactPerson: row.getValue("ContactPerson"),
                                email: row.getValue("Email"),
                                address: row.getValue("Location"),
                            });
                            setAddState(false);
                            setIsViewMode(true);
                        }}
                    >
                        {row.getValue("SupplierName")}
                    </div>
                );
            }, */
        },
        {
            accessorKey: "Location",
            header: () => {
                return <div className="text-center">{Addressi8n[locale]}</div>;
            },
            cell: ({ row }) => {
                return (
                    <div className="flex justify-center hover:cursor-pointer">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <h1 className="w-fit rounded-sm border px-2 text-center">
                                        {Hoveri18n[locale]}
                                    </h1>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{row.getValue("Location")}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                );
            },
        },
        {
            accessorKey: "Contact",
            header: Contacti18n[locale],
        },
        {
            accessorKey: "ContactPerson",
            header: ContactPersoni18n[locale],
        },
        {
            accessorKey: "Email",
            header: Emaili18n[locale],
        },
        {
            accessorKey: "action",
            header: () => <h1 className="text-center">{Actioni18n[locale]}</h1>,
            cell: ({ row }) => {
                const supplierId: string = row.getValue("SupplierId");
                return (
                    <div className="flex justify-center gap-2">
                        <Button
                            variant={"outline"}
                            onClick={() => {
                                setIsEditMode(true);
                                setModalFormState(true);
                                setSelectedSupplierId(supplierId);
                                setFormValues({
                                    companyId: row.getValue(
                                        "CompanyId"
                                    ) as number,
                                    supplier: row.getValue("SupplierName"),
                                    contact: row.getValue("Contact"),
                                    contactPerson:
                                        row.getValue("ContactPerson"),
                                    email: row.getValue("Email"),
                                    address: row.getValue("Location"),
                                    products: getProductList.data,
                                });
                            }}
                            className="h-max px-4"
                        >
                            {Editi18n[locale]}
                        </Button>
                        <Button
                            variant={"destructive"}
                            onClick={() => {
                                setSelectedSupplierId(supplierId);
                                setModalDelState(true);
                            }}
                            className="h-max px-4"
                        >
                            {Deletei18n[locale]}
                        </Button>
                    </div>
                );
            },
        },
        { accessorKey: "productSupplied" },
    ];
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        values: formValues,
    });
    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values);
        if (isEditMode) {
            editSupplierMutation.mutate(values);
        } else {
            console.log("add");
            addSupplierMutation.mutate(values);
        }
    }
    useEffect(() => {
        getSuppliersQuery.refetch();
        productQuery.refetch();
    }, [globalCompanyState, globalBranchState]);
    useEffect(() => {
        getProductList.refetch();
    }, [selectedSupplierId]);
    return (
        <div className="mx-3 mb-3 flex flex-1 gap-2">
            <Dialog open={modalFormState} onOpenChange={setModalFormState}>
                <DialogContent className="">
                    <DialogHeader>
                        <DialogTitle>
                            {isEditMode
                                ? EditSupplieri18n[locale]
                                : AddSupplieri18n[locale]}
                        </DialogTitle>
                        <DialogDescription>
                            {isEditMode
                                ? PleaseCompleteTheFormToEditTheSupplieri18n[
                                      locale
                                  ]
                                : PleaseCompleteTheFormToAddASupplieri18n[
                                      locale
                                  ]}
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="flex flex-col gap-4"
                        >
                            {userData?.role == 1 && (
                                <FormField
                                    control={form.control}
                                    name="companyId"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center justify-between">
                                            <FormLabel className="text-lg font-semibold">
                                                {Companyi18n[locale]}
                                            </FormLabel>
                                            <div>
                                                <Popover
                                                    open={companyOpen}
                                                    onOpenChange={
                                                        setCompanyOpen
                                                    }
                                                >
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                disabled={
                                                                    isEditMode
                                                                }
                                                                variant="outline"
                                                                role="combobox"
                                                                className={cn(
                                                                    "w-64 justify-between",
                                                                    !field.value &&
                                                                        "text-muted-foreground"
                                                                )}
                                                            >
                                                                {field.value
                                                                    ? (
                                                                          getCompanyQuery.data ||
                                                                          []
                                                                      ).find(
                                                                          (
                                                                              company: any
                                                                          ) =>
                                                                              company.value ===
                                                                              field.value
                                                                      )?.label
                                                                    : "Select Company"}
                                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-64 p-0">
                                                        <Command>
                                                            <CommandInput
                                                                placeholder="Search Company..."
                                                                className="h-9"
                                                            />
                                                            <CommandEmpty>
                                                                No Company Found
                                                            </CommandEmpty>
                                                            <CommandGroup>
                                                                {(
                                                                    getCompanyQuery.data ||
                                                                    []
                                                                ).map(
                                                                    (
                                                                        company: any
                                                                    ) => (
                                                                        <CommandItem
                                                                            value={
                                                                                company.label
                                                                            }
                                                                            key={
                                                                                company.value
                                                                            }
                                                                            onSelect={() => {
                                                                                setCompanyOpen(
                                                                                    false
                                                                                );
                                                                                form.setValue(
                                                                                    "companyId",
                                                                                    company.value
                                                                                );

                                                                                // if (
                                                                                //     company.value ===
                                                                                //     globalCompanyState
                                                                                // ) {
                                                                                //     setGlobalCompanyState(
                                                                                //         "all"
                                                                                //     );
                                                                                // } else if (
                                                                                //     company.value ==
                                                                                //     "all"
                                                                                // ) {
                                                                                //     setGlobalCompanyState(
                                                                                //         "all"
                                                                                //     );
                                                                                // } else {
                                                                                //     setGlobalCompanyState(
                                                                                //         company.value
                                                                                //     );
                                                                                // }
                                                                            }}
                                                                        >
                                                                            {
                                                                                company.label
                                                                            }
                                                                            <CheckIcon
                                                                                className={cn(
                                                                                    "ml-auto h-4 w-4",
                                                                                    company.value ===
                                                                                        field.value
                                                                                        ? "opacity-100"
                                                                                        : "opacity-0"
                                                                                )}
                                                                            />
                                                                        </CommandItem>
                                                                    )
                                                                )}
                                                            </CommandGroup>
                                                        </Command>
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            )}
                            <FormField
                                control={form.control}
                                name="supplier"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <div className="flex items-center justify-between">
                                            <FormLabel className="text-lg font-semibold">
                                                {SupplierNamei18n[locale]}
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    className="w-64"
                                                    placeholder={
                                                        SupplierNamei18n[locale]
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
                                name="contact"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <div className="flex items-center justify-between">
                                            <FormLabel className="text-lg font-semibold">
                                                {ContactNumberi18n[locale]}
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    className="w-64"
                                                    placeholder={
                                                        ContactNumberi18n[
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
                                name="products"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <div className="flex items-center justify-between">
                                            <FormLabel className="text-lg font-semibold text-nowrap">
                                                {ProductSuppliedi18n[locale]}
                                            </FormLabel>
                                            <div>
                                                <FormControl>
                                                    <MultipleSelector
                                                        setRemovedItems={
                                                            setRemovedItems
                                                        }
                                                        className=" w-64 overflow-hidden"
                                                        value={
                                                            isEditMode
                                                                ? getProductList.data
                                                                : field.value
                                                        }
                                                        onChange={
                                                            field.onChange
                                                        }
                                                        defaultOptions={
                                                            productQuery.data
                                                        }
                                                        placeholder={
                                                            (field.value || [])
                                                                .length > 0
                                                                ? "Search Products..."
                                                                : SelectProducti18n[
                                                                      locale
                                                                  ]
                                                        }
                                                        emptyIndicator={
                                                            <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                                                                Products No More
                                                            </p>
                                                        }
                                                    />
                                                </FormControl>
                                            </div>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="contactPerson"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <div className="flex items-center justify-between">
                                            <FormLabel className="text-lg font-semibold">
                                                {ContactPersoni18n[locale]}
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    className="w-64"
                                                    placeholder={
                                                        ContactPersoni18n[
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
                                name="address"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <div className="flex items-center justify-between">
                                            <FormLabel className="text-lg font-semibold">
                                                {Addressi8n[locale]}
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    className="w-64"
                                                    placeholder={
                                                        Addressi8n[locale]
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
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <div className="flex items-center justify-between">
                                            <FormLabel className="text-lg font-semibold">
                                                {Emaili18n[locale]}
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    className="w-64"
                                                    placeholder={
                                                        Emaili18n[locale]
                                                    }
                                                    {...field}
                                                />
                                            </FormControl>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-end gap-2">
                                <Button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setModalFormState(false);
                                    }}
                                    variant={"destructive"}
                                >
                                    {Canceli18n[locale]}
                                </Button>
                                <Button type="submit">
                                    {Submiti18n[locale]}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
            <AlertDialog open={modalDelState} onOpenChange={setModalDelState}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {AreYouAbsolutelySurei18n[locale]}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {
                                ThisActionCannotBeUndoneThisWillPermanentlyDeleteYourAccountAndRemoveYourDataFromOurServersi18n[
                                    locale
                                ]
                            }
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <Button
                            variant={"secondary"}
                            onClick={() => {
                                setModalDelState(false);
                            }}
                        >
                            {Canceli18n[locale]}
                        </Button>
                        <Button
                            variant={"destructive"}
                            onClick={() => {
                                setModalDelState(false);
                                deleteSupplierMutation.mutate(
                                    selectedSupplierId
                                );
                            }}
                        >
                            {Deletei18n[locale]}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <Card className="flex flex-1 flex-col gap-3 p-3">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">
                        {SupplierListi18n[locale]}
                    </h1>
                    <Button
                        className="items-center gap-2"
                        onClick={() => {
                            setIsEditMode(false);
                            setModalFormState(true);
                            form.reset({
                                companyId: userData?.companyId,
                                supplier: "",
                                contact: "",
                                contactPerson: "",
                                address: "",
                                email: "",
                                products: [],
                            });
                        }}
                        variant={"default"}
                    >
                        <Plus />
                        {AddSupplieri18n[locale]}
                    </Button>
                </div>
                <DataTable
                    visibility={{
                        productSupplied: false,
                        SupplierId: false,
                        CompanyId: false,
                    }}
                    filtering={true}
                    coloumnToFilter={"SupplierName"}
                    resetSortBtn={true}
                    pageSize={11}
                    data={getSuppliersQuery.data || []}
                    pagination={true}
                    columns={columns}
                    isLoading={getSuppliersQuery.isLoading}
                />
            </Card>
        </div>
    );
}
