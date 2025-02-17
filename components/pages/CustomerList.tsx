"use client";
import { Card } from "../ui/card";
import { useGlobalStore } from "@/store/useStore";
import { ColumnDef } from "@tanstack/react-table";
import { useI18nStore } from "@/store/usei18n";
import { DataTable } from "../ui/data-table";
import { useSession } from "next-auth/react";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { toast } from "../ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle
} from "../ui/alert-dialog";
import { Input } from "../ui/input";

const formSchema = z.object({
    email: z
        .string()
        .min(1, { message: "Email must contain a valid Email" })
        .max(50)
        .email(),
});

function CustomerList() {
    const session = useSession();
    const userData = session.data?.data;
    const {
        locale,
        Registeri18n,
        IDi18n,
        Emaili18n,
        FullNamei18n,
        ContactNumberi18n,
        CreatedSincei18n,
        CustomerListi18n,
        Customersi18n,
        Downloadi18n,
        AddGuesti18n,
        CreateGuestAccounti18n,
        CreateANewGuestOrOneTimeAccount,
        Canceli18n
    } = useI18nStore();
    const { globalBranchState, globalCompanyState } = useGlobalStore();
    const [clientList, setClientList] = useState<ClientList[]>([]);
    const [error, setError] = useState<any>();
    const [openAddGuest, setOpenAddGuest] = useState(false);
    const addOTU = useMutation({
        mutationFn: (newOTU: string) => {
            return axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/userClient/registerOTU`,
                {
                    email: newOTU,
                }
            );
        },
        onError: (e: any) => {
            if (e.request.response.includes("Duplicate Record")) {
                setError(["Email already in use"]);
            }
        },
        onSuccess: (data) => {
            console.log(data);
            toast({
                title: "Success",
                description: `Succesfully added new temporary account ${data.data.Email}`,
                duration: 3000,
            });
            setOpenAddGuest(false); // Close modal after success
            form.reset(); // Reset the form after submission
        },
    });
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
        },
    });
    // 2. Define a submit handler.
    async function onSubmit(values: z.infer<typeof formSchema>) {
        addOTU.mutate(values.email);
    }
    const getUserClientQuery = useQuery({
        queryKey: ["client"],
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
                    `${process.env.NEXT_PUBLIC_API_URL}/userclient/getUserClient/cId/${companyId}/bId/${branchId}/`,
                    {
                        headers: {
                            Authorization: `Bearer ${session.data?.token}`,
                        },
                    }
                );
                setClientList(response.data);
                return response.data;
            }
        },
    });
    const clientListColoumns: ColumnDef<ClientList>[] = [
        {
            accessorKey: "UserClientId",
            header: IDi18n[locale],
        },
        {
            accessorKey: "UserClient",
            header: FullNamei18n[locale],
        },
        {
            accessorKey: "Email",
            header: Emaili18n[locale],
        },
        {
            accessorKey: "ContactNumber",
            header: ContactNumberi18n[locale],
        },
        {
            accessorKey: "CreatedAt",
            header: ({ column }) => {
                return (
                    <div className="flex flex-col items-start">
                        <Button
                            variant={"ghost"}
                            className="hover:bg-gray-300"
                            onClick={() => {
                                column.toggleSorting(
                                    column.getIsSorted() === "asc"
                                );
                            }}
                        >
                            {CreatedSincei18n[locale]}
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                );
            },
            cell: ({ row }) => {
                const date: Date = new Date(
                    (row.getValue("CreatedAt") as string)
                    /* .replace("T", " ")
                    .replace("Z", "") */
                );
                return (
                    <div className="px-[1rem]">
                        {date.toLocaleDateString(locale, {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}
                    </div>
                );
            },
        },
    ];
    useEffect(() => {
        getUserClientQuery.refetch();
    }, [globalBranchState, globalCompanyState]);

    console.log(clientList)
    return (
        <div className="flex h-full flex-1 flex-col gap-3 px-3">
            {/* Add User */}
            <AlertDialog open={openAddGuest} onOpenChange={(open) => { setOpenAddGuest(open); form.reset(); form.clearErrors(); setError(null) }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {CreateGuestAccounti18n[locale]}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {CreateANewGuestOrOneTimeAccount[locale]}
                        </AlertDialogDescription>
                        {error && (
                            <div>
                                {error.map((item: any, index: number) => {
                                    return (
                                        <p
                                            key={index}
                                            className="text-center text-red-400"
                                        >
                                            {item}
                                        </p>
                                    );
                                })}
                            </div>
                        )}
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="flex flex-col gap-5"
                            >
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel>
                                                {Emaili18n[locale]}
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder={
                                                        Emaili18n[locale]
                                                    }
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="ml-auto flex gap-2">
                                    <AlertDialogCancel>
                                        {Canceli18n[locale]}
                                    </AlertDialogCancel>

                                    <Button
                                        className="ml-auto w-max"
                                        type="submit"
                                    >
                                        {Registeri18n[locale]}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </AlertDialogHeader>
                </AlertDialogContent>
            </AlertDialog>
            <Card className="mb-3 flex flex-grow flex-col gap-3 p-3">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">{Customersi18n[locale]}</h1>
                    <div className="flex flex-grow-0 gap-4">
                        <Button className="bg-green-500">{Downloadi18n[locale]}</Button>
                        {userData?.role > 2 && (
                            <Button onClick={() => setOpenAddGuest(true)}>
                                {AddGuesti18n[locale]}
                            </Button>
                        )}
                    </div>
                </div>
                <DataTable
                    resetSortBtn={true}
                    columns={clientListColoumns}
                    filtering={true}
                    columnsToSearch={["Email", "UserClientId", "ContactNumber", "UserClient"]}
                    data={clientList}
                    pageSize={11}
                    pagination={true}
                />
            </Card>
        </div>
    );
}

export default CustomerList;
