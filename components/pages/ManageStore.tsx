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

const fileSchema = z.object({
    name: z.string(),
    size: z.number(),
});
const formSchema = z.object({
    companyId: z.string().min(1).max(50),
    branchName: z.string().min(2).max(50),
    fullAddress: z.string().min(2).max(100),
    contact: z.coerce.string().min(1),
    contactPerson: z.string().min(2).max(50),
    tinNumber: z.coerce.string().min(9).max(12),
    imgFile: fileSchema.required(),
    /* imgFile: z.instanceof(File), */
});
function ManageStore() {
    const session = useSession();
    const userData = session.data?.data;
    const { globalCompanyState } = useGlobalStore();
    const [editStoreIndex, setEditStoreIndex] = useState<number | null>(null);
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
        Deletei18n
    } = useI18nStore();
    const [isOpenDial, setIsOpenDial] = useState<boolean>(false);
    const [isOpenDelDial, setIsOpenDelDial] = useState<boolean>(false);

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
                setFilteredStoreBranches(response.data);
                return response.data;
            }
        },
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
                description: `Succesfully Added New Store`,
            });
            setIsOpenDial(false);
        },
        onError: (e: any) => {
            console.log(e);
            toast({
                title: "Failed",
                description: `Theres an error adding New Store please try again later`,
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
                description: `Succesfully Edited Branch`,
            });
            setEditStoreIndex(null);
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
                description: `Succesfully Deleted Store`,
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
        if (editStoreIndex !== null) {
            editStoreMutation.mutate(values);
        } else {
            addStore.mutate(values);
        }
    }
    useEffect(() => {
        if (editStoreIndex !== null) {
            const companyID = filteredStoreBranches[editStoreIndex].CompanyId;
            setTimeout(() => {
                form.setValue("companyId", `${companyID}`);
                form.setValue(
                    "contact",
                    `${filteredStoreBranches[editStoreIndex].Contact}`
                );
                form.setValue(
                    "contactPerson",
                    `${filteredStoreBranches[editStoreIndex].ContactPerson}`
                );
                form.setValue(
                    "fullAddress",
                    `${filteredStoreBranches[editStoreIndex].Address}`
                );
                form.setValue(
                    "branchName",
                    `${filteredStoreBranches[editStoreIndex].Name}`
                );
                form.setValue(
                    'tinNumber',
                    `${filteredStoreBranches[editStoreIndex].TIN}`
                )
            });
        }
    }, [form.setValue, isOpenDial]);

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
                    <h1 className="text-2xl font-semibold">
                        {BranchListi18n[locale]}
                    </h1>
                    <div className="flex w-auto items-center justify-end gap-3">
                        <Input
                            onChange={searchHandler}
                            className="w-3/2"
                            placeholder={
                                Searchi18n[locale] + " " + Namei18n[locale]
                            }
                        />
                        <AlertDialog
                            open={isOpenDial}
                            onOpenChange={setIsOpenDial}
                        >
                            <AlertDialogTrigger
                                onClick={() => {
                                    setIsOpenDial(true);
                                }}
                                className="rounded border-0 bg-primary px-4 py-2 text-white"
                            >
                                {AddBranchi18n[locale]}
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        {editStoreIndex !== null
                                            ? `${Editi18n[locale]}: ${filteredStoreBranches[editStoreIndex].Name}`
                                            : AddBranchi18n[locale]}
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        {AddStoreMsgi8n[locale]}
                                    </AlertDialogDescription>
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
                                                        render={({ field }) => (
                                                            <FormItem className="flex flex-col items-center">
                                                                <div className="flex w-full items-center justify-between">
                                                                    <FormLabel className="text-lg">
                                                                        {
                                                                            CompanyIdi8n[
                                                                                locale
                                                                            ]
                                                                        }
                                                                    </FormLabel>
                                                                    <FormControl className="w-[60%]">
                                                                        <Input
                                                                            {...field}
                                                                            type="number"
                                                                            disabled={
                                                                                userData?.companyId !==
                                                                                null
                                                                            }
                                                                            placeholder={
                                                                                AddCompanyIdi8n[
                                                                                    locale
                                                                                ]
                                                                            }
                                                                        />
                                                                    </FormControl>
                                                                </div>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
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
                                                        <FormMessage />
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
                                                        <FormMessage />
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
                                                        <FormMessage />
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
                                                        <FormMessage />
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
                                                        <FormMessage />
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

                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <div className="flex justify-end gap-5">
                                                <AlertDialogCancel>
                                                    {Canceli18n[locale]}
                                                </AlertDialogCancel>
                                                <Button type="submit">
                                                    {editStoreIndex === null
                                                        ? AddStorei18n[locale]
                                                        : Savei18n[locale]}
                                                </Button>
                                            </div>
                                        </form>
                                    </Form>
                                </AlertDialogHeader>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                    <AlertDialog
                        open={isOpenDelDial}
                        onOpenChange={setIsOpenDelDial}
                    >
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    {AreYouAbsolutelySurei18n[locale]}
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
                <div className="my flex flex-1 flex-col items-center">
                    <ScrollArea className="my-auto h-[710px] w-full">
                        <div className="flex flex-col gap-7">
                            {storeQuery.isPending ? (
                                <Loader2
                                    size={40}
                                    className="mx-auto mt-28 animate-spin"
                                />
                            ) : (
                                filteredStoreBranches.map((item, index) => {
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
                </div>
            </Card>
        </div>
    );
}
export default ManageStore;
