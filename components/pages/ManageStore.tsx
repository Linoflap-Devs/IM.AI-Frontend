"use client";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "../ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Input } from "../ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "../ui/use-toast";
import { useEffect, useState } from "react";
import { useI18nStore } from "@/store/usei18n";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useGlobalStore } from "@/store/useStore";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { set } from "date-fns";

const fileSchema = z.object({
    name: z.string(),
    size: z.number(),
});
const formSchema = z.object({
    companyId: z.coerce.number().min(1).max(50),
    branchName: z.string({ required_error: "Branch name is required" }).min(1, { message: "Store name is required" }).max(50),
    fullAddress: z.string({ required_error: "Address is required" }).min(1, { message: "Address is required" }).max(100),
    contact: z.coerce.string({ required_error: "Contact is required" }).min(1, { message: "Contact is required" }).max(50),
    contactPerson: z.string({ required_error: "Contact person is required" }).min(1, { message: "Contact person is required" }).max(50),
    tinNumber: z.coerce.string({ required_error: "TIN Number is required" }).min(9, { message: "TIN Number is required" }).max(12),
    imgFile: fileSchema.required(),
    /* imgFile: z.instanceof(File), */
});
function ManageStore() {
    const session = useSession();
    const userData = session.data?.data;
    const { globalCompanyState } = useGlobalStore();
    const [editStoreIndex, setEditStoreIndex] = useState<number | null>(null);
    const [editStoreId, setEditStoreId] = useState<number | null>(null);
    const [filteredStoreBranches, setFilteredStoreBranches] = useState<
        StoreBranches[]
    >([]);
    const [storeIdToDel, setStoreIdToDel] = useState<number | null>(null);
    const {
        locale,
        Namei18n,
        Editi18n,
        Removei18n,
        AddStorei18n,
        AddStoreMsgi8n,
        StoreNamei8n,
        AddStoreNamei8n,
        Addressi8n,
        AddAddressi8n,
        ContactNumberi8n,
        AddContactNumberi8n,
        ContactPersoni8n,
        AddContactPersoni8n,
        Uploadi18n,
        Imagei18n,
        Canceli18n,
        CompanyIdi8n,
        AddCompanyIdi8n,
        Continuei18n,
        AlertDialogue1i18n,
        Searchi18n,
        BranchListi18n,
        AddBranchi18n,
        Contacti18n,
        AreYouAbsolutelySurei18n,
        Savei18n,
        TINNumber,
        Deletei18n,
        Addi18n,
        ConfirmDeletion,
        ConfirmDeleteMessage,
        Update
    } = useI18nStore();
    const [isOpenDial, setIsOpenDial] = useState<boolean>(false);
    const [isOpenDelDial, setIsOpenDelDial] = useState<boolean>(false);

    // pagination

    const pageSize = 5;
    const [page, setPage] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(filteredStoreBranches.length / pageSize);
    // Get current items
    const indexOfLastItem = page * pageSize;
    const indexOfFirstItem = indexOfLastItem - pageSize;
    const currentItems = filteredStoreBranches.slice(indexOfFirstItem, indexOfLastItem);

    // Change page
    const goToPage = (pageNumber: number) => {
        setPage(pageNumber);
    };


    axios.defaults.headers.common[
        "Authorization"
    ] = `Bearer ${session.data?.token}`;

    const storeQuery: UseQueryResult<StoreBranches[] | []> = useQuery({
        queryKey: ["getStore"],
        enabled: session.data?.token !== undefined,
        queryFn: async () => {
            if (session.data?.token !== undefined) {
                const companyId =
                    globalCompanyState !== "all"
                        ? globalCompanyState
                        : userData?.companyId;



                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/branch/getbranches/cId/${companyId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${session.data?.token}`,
                        },
                    }
                );
                console.log('Fetched Store Data:', response)
                setFilteredStoreBranches(response.data);
                return response.data;
            }
        },
    });
    const companiesQuery = useQuery({
        queryKey: ["getCompanies"],
        enabled: session.status === "authenticated" && userData?.role <= 2,
        queryFn: async () => {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/company/getCompanyOptions`,
                {
                    headers: {
                        Authorization: `Bearer ${session.data?.token}`
                    }
                }
            );
            console.log("Companies Data:", response.data);
            return response.data;
        }
    });

    const addStore = useMutation({
        mutationKey: ["addstore"],
        mutationFn: async (newStore: any) => {
            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/branch/addbranches`,
                {
                    companyId: newStore.companyId,
                    name: newStore.branchName,
                    address: newStore.fullAddress,
                    contact: newStore.contact,
                    contactPerson: newStore.contactPerson,
                    tinNumber: newStore.tinNumber,
                    imgLink: "sample Link",
                },
                {
                    headers: {
                        Authorization: `Bearer ${session.data?.token}`,
                    },
                }
            );
        },
        onSuccess: () => {
            storeQuery.refetch();
            form.reset();
            toast({
                title: "Success",
                description: `Succesfully added a new branch.`,
            });
            setIsOpenDial(false);
        },
        onError: (e: any) => {
            console.log(e);
            toast({
                title: "Failed",
                description: `There was an error adding a new branch please try again later.`,
            });
        },
    });
    const editStoreMutation = useMutation({
        mutationKey: ["editstore"],
        mutationFn: async (newStore: any) => {
            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/branch/editBranch`,
                {
                    id: (editStoreIndex ?? 0) + 1,
                    companyId: newStore.companyId,
                    name: newStore.branchName,
                    address: newStore.fullAddress,
                    contact: newStore.contact,
                    contactPerson: newStore.contactPerson,
                    tinNumber: newStore.tinNumber,
                    imgLink: "sample Link",
                }
            );
        },
        onSuccess: () => {
            toast({
                title: "Success",
                description: `Succesfully updated the branch.`,
            });
            setEditStoreIndex(null);
            setEditStoreId(null);
            form.reset();
            storeQuery.refetch();
            setIsOpenDial(false);
        },
    });
    const deleteStoreMutation = useMutation({
        mutationKey: ["deletestore"],
        mutationFn: async (id: number) => {
            const response = await axios.delete(
                `${process.env.NEXT_PUBLIC_API_URL}/branch/deletebranch/id/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${session.data?.token}`,
                    },
                }
            );
        },
        onSuccess: () => {
            storeQuery.refetch();
            toast({
                title: "Success",
                description: `Succesfully deleted the branch.`,
            });
        },
    });
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        values: {
            companyId: userData?.companyId,
            branchName: "",
            fullAddress: "",
            contact: "",
            contactPerson: "",
            tinNumber: "",
            imgFile: new File([], ""),
        },
    });
    function onSubmit(values: z.infer<typeof formSchema>) {
        if (editStoreId !== null || editStoreIndex !== null) {
            editStoreMutation.mutate(values);
        } else {
            addStore.mutate(values);
        }
    }
    useEffect(() => {
        // This effect runs whenever the modal opens (isOpenDial) and when the store is being edited (editStoreIndex or editStoreId)
        if (isOpenDial) {
            // If you're editing an existing store, fetch the companyId from the store
            if (editStoreId !== null) {
                const store = filteredStoreBranches.find((store: StoreBranches) => store.BranchId === editStoreId);
                const companyID = store?.CompanyId;

                // Prefill the companyId from globalCompanyState or the store's companyId if editing
                const companyIdToUse = globalCompanyState !== "all" ? globalCompanyState : companyID;

                // Set the form's companyId value
                form.setValue("companyId", companyIdToUse || userData?.companyId || 0);

                // Prefill other form fields based on the selected store
                form.setValue("contact", store?.Contact ? String(store.Contact) : ""); // Ensure contact is a string
                form.setValue("contactPerson", store?.ContactPerson || "");
                form.setValue("fullAddress", store?.Address || "");
                form.setValue("branchName", store?.Name || "");
                form.setValue("tinNumber", store?.TIN || "");
            } else {
                // If no store is being edited, just set the companyId based on the global state or user data
                form.setValue("companyId", globalCompanyState !== "all" ? globalCompanyState : userData?.companyId || 0);
            }
        }
    }, [isOpenDial, editStoreId, filteredStoreBranches, globalCompanyState, userData?.companyId, form]);


    function searchHandler(e: any) {
        setFilteredStoreBranches(() => {
            return (
                storeQuery.data?.filter((item: any) => {
                    return item.Name.toLowerCase().includes(
                        e.target.value.toLowerCase()
                    );
                }) || []
            );
        });
    }
    useEffect(() => {
        storeQuery.refetch();
    }, [globalCompanyState]);
    return (
        <div className="mx-3 mb-3 flex flex-1">
            <Card className="flex flex-1 flex-col gap-2 p-3">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-3">
                        <h1 className="text-2xl font-semibold">
                            {BranchListi18n[locale]}
                        </h1>

                    </div>

                    <div className="flex w-auto self-start justify-end gap-3">

                        <Dialog
                            open={isOpenDial}
                            onOpenChange={(open) => { setIsOpenDial(open), form.reset(), setEditStoreIndex(null); setEditStoreId(null); }}
                        >
                            <DialogTrigger
                                onClick={() => {
                                    setIsOpenDial(true);
                                    form.reset();
                                }}
                                className="rounded border-0 bg-primary px-4 py-2 text-white"
                            >
                                {AddBranchi18n[locale]}
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        {editStoreIndex !== null
                                            ? `${Editi18n[locale]}: ${filteredStoreBranches.find((store: StoreBranches) => store.BranchId == editStoreId)?.Name}`
                                            : AddBranchi18n[locale]}
                                    </DialogTitle>
                                    {/* <DialogDescription>
                                        {AddStoreMsgi8n[locale]}
                                    </DialogDescription> */}
                                    <Form {...form}>
                                        <form
                                            onSubmit={form.handleSubmit(
                                                onSubmit
                                            )}
                                            className="space-y-3"
                                        >
                                            {session.status ===
                                                "authenticated" &&
                                                userData?.role <= 3 && (
                                                    <FormField
                                                        control={form.control}
                                                        name="companyId"
                                                        render={({ field }) => {
                                                            // Define the company type
                                                            type CompanyOption = {
                                                                value: string;
                                                                label: string;
                                                            };

                                                            // Find the selected company label to display
                                                            const selectedCompany = companiesQuery.data?.find(
                                                                (company: CompanyOption) => Number(company.value) === field.value
                                                            );
                                                            const selectedCompanyLabel = selectedCompany?.label || AddCompanyIdi8n[locale];

                                                            return (
                                                                <FormItem className="flex flex-col items-center">
                                                                    <div className="flex w-full items-center justify-between">
                                                                        <FormLabel className="text-lg">
                                                                            {CompanyIdi8n[locale]}
                                                                        </FormLabel>
                                                                        <FormControl className="w-[50%]">
                                                                            <Select
                                                                                disabled={userData?.companyId !== null}
                                                                                value={field.value?.toString() || ""}
                                                                                onValueChange={(value) => {
                                                                                    field.onChange(parseInt(value));
                                                                                }}
                                                                            >
                                                                                <SelectTrigger className="w-full max-w-[278px]">
                                                                                    <span>{selectedCompanyLabel}</span>
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                    {companiesQuery.data?.map((company: CompanyOption) => (
                                                                                        <SelectItem
                                                                                            key={company.value}
                                                                                            value={company.value}
                                                                                        >
                                                                                            {company.label}
                                                                                        </SelectItem>
                                                                                    ))}
                                                                                </SelectContent>
                                                                            </Select>
                                                                        </FormControl>
                                                                    </div>
                                                                    <FormMessage className="text-xs w-full text-end" />
                                                                </FormItem>
                                                            );
                                                        }}
                                                    />
                                                )}
                                            <FormField
                                                control={form.control}
                                                name="branchName"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-col items-center">
                                                        <div className="flex w-full items-center justify-between">
                                                            <FormLabel className="text-lg">
                                                                {
                                                                    StoreNamei8n[
                                                                    locale
                                                                    ]
                                                                }
                                                            </FormLabel>
                                                            <FormControl className="w-[60%]">
                                                                <Input
                                                                    placeholder={
                                                                        AddStoreNamei8n[
                                                                        locale
                                                                        ]
                                                                    }
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                        </div>
                                                        <FormMessage className="text-xs w-full text-end" />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="fullAddress"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-col items-center">
                                                        <div className="flex w-full items-center justify-between">
                                                            <FormLabel className="text-lg">
                                                                {
                                                                    Addressi8n[
                                                                    locale
                                                                    ]
                                                                }
                                                            </FormLabel>
                                                            <FormControl className="w-[60%]">
                                                                <Input
                                                                    placeholder={
                                                                        AddAddressi8n[
                                                                        locale
                                                                        ]
                                                                    }
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                        </div>
                                                        <FormMessage className="text-xs w-full text-end" />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="contact"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-col items-center">
                                                        <div className="flex w-full items-center justify-between">
                                                            <FormLabel className="text-lg">
                                                                {
                                                                    ContactNumberi8n[
                                                                    locale
                                                                    ]
                                                                }
                                                            </FormLabel>
                                                            <FormControl className="w-[60%]">
                                                                <Input
                                                                    type="number"
                                                                    placeholder={
                                                                        AddContactNumberi8n[
                                                                        locale
                                                                        ]
                                                                    }
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                        </div>
                                                        <FormMessage className="text-xs w-full text-end" />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="contactPerson"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-col items-center">
                                                        <div className="flex w-full items-center justify-between">
                                                            <FormLabel className="text-lg">
                                                                {
                                                                    ContactPersoni8n[
                                                                    locale
                                                                    ]
                                                                }
                                                            </FormLabel>
                                                            <FormControl className="w-[60%]">
                                                                <Input
                                                                    placeholder={
                                                                        AddContactPersoni8n[
                                                                        locale
                                                                        ]
                                                                    }
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                        </div>
                                                        <FormMessage className="text-xs w-full text-end" />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="tinNumber"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-col items-center">
                                                        <div className="flex w-full items-center justify-between">
                                                            <FormLabel className="text-lg">
                                                                {
                                                                    TINNumber[locale]
                                                                }
                                                            </FormLabel>
                                                            <FormControl className="w-[60%]">
                                                                <Input
                                                                    placeholder={
                                                                        TINNumber[locale]
                                                                    }
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                        </div>
                                                        <FormMessage className="text-xs w-full text-end" />
                                                    </FormItem>
                                                )}
                                            />
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
                                                                    required
                                                                    accept=".jpg, .jpeg, .png, .svg, .gif, .mp4"
                                                                    type="file"
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

                                                        <FormMessage className="text-xs w-full text-center" />
                                                    </FormItem>
                                                )}
                                            />
                                            <div className="flex justify-end gap-5">
                                                <Button type="submit">
                                                    {editStoreIndex === null
                                                        ? Addi18n[locale]
                                                        : Update[locale]}
                                                </Button>
                                            </div>
                                        </form>
                                    </Form>
                                </DialogHeader>
                            </DialogContent>
                        </Dialog>
                    </div>


                    <AlertDialog
                        open={isOpenDelDial}
                        onOpenChange={setIsOpenDelDial}
                    >
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    {ConfirmDeletion[locale]}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    {ConfirmDeleteMessage[locale]}
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>
                                    {Canceli18n[locale]}
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => {
                                        if (storeIdToDel) {
                                            deleteStoreMutation.mutate(
                                                storeIdToDel
                                            );
                                        }
                                    }}
                                >
                                    {Continuei18n[locale]}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>

                <div className="flex justify-between mt-3">
                    <Input
                        onChange={searchHandler}
                        className="w-3/2"
                        placeholder={
                            Searchi18n[locale] + " " + Namei18n[locale]
                        }
                    />
                    <div className="flex gap-2">

                        {/* <Button
                            onClick={() => {
                                setIsOpenDial(true);
                                form.reset();
                            }}
                            variant={page === 1 ? "default" : "default"}
                        >
                            Previous
                        </Button>

                        <Button
                            onClick={() => {
                                setIsOpenDial(true);
                                form.reset();
                            }}
                            variant={page === 1 ? "default" : "default"}
                        >
                            Next
                        </Button> */}
                        {filteredStoreBranches.length > 0 && (
                            <div className="flex items-center justify-center gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => goToPage(page - 1)}
                                    disabled={page === 1}
                                >
                                    Previous
                                </Button>

                                {/* Page Numbers */}
                                {/* <div className="flex gap-2">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((singlePage) => (
                                        <Button
                                            key={singlePage}
                                            variant={singlePage === page ? "default" : "outline"}
                                            onClick={() => goToPage(singlePage)}
                                            className={`min-w-8 `}
                                        >
                                            {singlePage}
                                        </Button>
                                    ))}
                                </div> */}

                                 {/* Page Numbers */}
                                <div className="flex gap-2">
                                    {(() => {
                                        const totalPagesToShow = 3; // Number of page buttons to show
                                        let startPage = Math.max(1, page - Math.floor(totalPagesToShow / 2));
                                        let endPage = Math.min(totalPages, startPage + totalPagesToShow - 1);

                                        // Adjust startPage if endPage is at the limit
                                        if (endPage - startPage + 1 < totalPagesToShow) {
                                            startPage = Math.max(1, endPage - totalPagesToShow + 1);
                                        }

                                        return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((singlePage) => (
                                            <Button
                                                key={singlePage}
                                                variant={singlePage === page ? "default" : "outline"}
                                                onClick={() => goToPage(singlePage)}
                                                className={`min-w-8`}
                                            >
                                                {singlePage}
                                            </Button>
                                        ));
                                    })()}
                                </div>


                                <Button
                                    variant="outline"
                                    onClick={() => goToPage(page + 1)}
                                    disabled={page === totalPages}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="my flex flex-1 flex-col items-center">
                    <ScrollArea className="my-auto h-[710px] w-full">
                        <div className="flex flex-col gap-7">
                            {storeQuery.isPending ? (
                                <Loader2
                                    size={40}
                                    className="mx-auto mt-28 animate-spin"
                                />
                            ) : (
                                currentItems.map((item, index) => {
                                    return (
                                        <Card
                                            key={index}
                                            className="flex items-center justify-between"
                                        >
                                            <div className="flex">
                                                <Image
                                                    className="h-auto rounded"
                                                    height={2013.333}
                                                    width={320}
                                                    src="https://placehold.co/600x400"
                                                    alt={"Place Image"}
                                                />
                                                <div className="flex flex-col justify-between p-10">
                                                    <h1 className="text-xl font-bold">
                                                        {item.Name}
                                                    </h1>
                                                    <p className="text-sm font-medium text-gray-500">
                                                        {Addressi8n[locale]}:{" "}
                                                        {item.Address}
                                                    </p>
                                                    <p className="text-sm font-medium text-gray-500">
                                                        {
                                                            ContactPersoni8n[
                                                            locale
                                                            ]
                                                        }
                                                        : {item.ContactPerson}
                                                    </p>
                                                    <p className="text-sm font-medium text-gray-500">
                                                        {Contacti18n[locale]}:{" "}
                                                        {item.Contact}
                                                    </p>
                                                    <p className="text-sm font-medium text-gray-500">
                                                        {TINNumber[locale]}:{" "}
                                                        {item.TIN || "N/A"}
                                                    </p>
                                                </div>
                                            </div>
                                            <div
                                                id="action"
                                                className="flex flex-col gap-2 p-5"
                                            >
                                                <Button
                                                    className="border-green-400 text-green-400 hover:text-green-400"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setIsOpenDial(true);
                                                        setEditStoreIndex(
                                                            index
                                                        );
                                                        setEditStoreId(item.BranchId)
                                                    }}
                                                >
                                                    {Editi18n[locale]}
                                                </Button>
                                                <Button
                                                    onClick={() => {
                                                        setIsOpenDelDial(true);
                                                        setStoreIdToDel(
                                                            item.BranchId
                                                        );
                                                    }}
                                                    variant="destructive"
                                                >
                                                    {Deletei18n[locale]}
                                                </Button>
                                            </div>
                                        </Card>
                                    );
                                })
                            )}
                        </div>
                    </ScrollArea>
                    <div className="flex items-end justify-end text-end w-full">
                        <p className="text-end">Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredStoreBranches.length)} of <span className="font-bold">{filteredStoreBranches.length}</span> items</p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
export default ManageStore;
