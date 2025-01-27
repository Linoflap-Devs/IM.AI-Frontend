"use client"
import { useState } from "react";
import { Card } from "../ui/card";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
    FormLabel,
} from "@/components/ui/form";
import { Button } from "../ui/button";
import { useSession } from "next-auth/react";
import { useToast } from "../ui/use-toast";
import axios, { AxiosError } from "axios";
import { useI18nStore } from "@/store/usei18n";
import { ColumnDef } from "@tanstack/react-table";
import { useMutation, useQuery } from "@tanstack/react-query";
import { DataTable } from "../ui/data-table";
import { get } from "http";
import { format } from "date-fns";
import { number, string, z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "../ui/input";
import { useGlobalStore } from "@/store/useStore";

export default function Category() {
    const session = useSession();
    const userData = session.data?.data;
    const { toast } = useToast();
    axios.defaults.headers.common[
        "Authorization"
    ] = `Bearer ${session.data?.token}`;

    const {
        locale,
        AddCategory,
        CategoryName,
        CreatedSincei18n,
        Actioni18n,
        Editi18n,
        EditCategory,
        Addi18n,
        Submiti18n,
        Update,
        Deletei18n,
        DeleteCategory,
        DeleteCategoryDeleteMsg,
        Canceli18n,
        CompanyIdi8n
    } = useI18nStore();

    const { globalCompanyState } = useGlobalStore();

    const [open, setOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedEditId, setSelectedEditId] = useState(0)
    const [selectedRecord, setSelectedRecord] = useState<{id: number, categoryName: string, companyId: number}>({id: 0, categoryName: "", companyId: 0});
    const [deleteOpen, setDeleteOpen] = useState(false);

    const getCategoriesQuery = useQuery({
        queryKey: ["getCategories", globalCompanyState !== "all" ? globalCompanyState : userData?.companyId],
        enabled: session.status === "authenticated" && userData.role <= 3,
        queryFn: async () => {
            const isAdmin = userData.role === 1;
            const adminQuery = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/product/getCategoriesAll`,
                {
                    headers: {
                        Authorization: `Bearer ${session.data?.token}`,
                    },
                }
            );
            const companyQuery = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/product/getCategories`,
                {
                    data: {
                        companyId: globalCompanyState !== "all" ? globalCompanyState : userData?.companyId
                    },
                    headers: {
                        Authorization: `Bearer ${session.data?.token}`,
                    },
                }
            );
            
            const response = isAdmin ? adminQuery : companyQuery;

            return response.data;
        },
        refetchOnWindowFocus: false,
    });    

    const formSchema = z.object({
        categoryName: z.string().min(1 , { message: "Category Name is required" }),
        companyId: z.coerce.number().min(1, { message: "Company is required" }),
    })

    const form = useForm<z.infer <typeof formSchema>>({
        resolver: zodResolver(formSchema),
        values: {
            categoryName: selectedRecord.categoryName || "",
            companyId: globalCompanyState !== "all" ? globalCompanyState : userData?.companyId
        },
        defaultValues: {
            categoryName: "",
            companyId: 0
        }
    })

    const addCategoryMutation = useMutation({
        mutationFn: async (data: z.infer<typeof formSchema>) => {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/product/addCategory`,
                {
                    name: data.categoryName,
                    companyId: data.companyId
                },
                // {
                //     headers: {
                //         Authorization: `Bearer ${session.data?.token}`,
                //     },
                // }
            );
            return response.data;
        },
        onSuccess: () => {
            getCategoriesQuery.refetch();
            setOpen(false);
            toast({
                title: "Success",
                description: "Category added successfully.",
            });
        },
        onError: (error: any) => {
            console.log(error);
            toast({
                variant: "destructive",
                title: "Oops!",
                description: error.response.data.message,
            })
        }
    })

    const editCategoryMutation = useMutation({
        mutationFn: async (data: z.infer<typeof formSchema>) => {
            const response = await axios.patch(
                `${process.env.NEXT_PUBLIC_API_URL}/product/editCategory`,
                {
                    id: selectedRecord.id,
                    value: data.categoryName,
                },
                // {
                //     headers: {
                //         Authorization: `Bearer ${session.data?.token}`,
                //     },
                // }
            );
            return response.data;
        },
        onSuccess: () => {
            getCategoriesQuery.refetch();
            setOpen(false);
            toast({
                title: "Success",
                description: "Category updated successfully.",
            });
        },
        onError: (error: any) => {
            console.log(error);
            toast({
                variant: "destructive",
                title: "Oops!",
                description: error.response.data.message,
            })
        }
    })

    const deleteCategoryMutation = useMutation({
        mutationFn: async (data: z.infer<typeof formSchema>) => {
            console.log(selectedRecord.id)
            const response = await axios.delete(
                `${process.env.NEXT_PUBLIC_API_URL}/product/deleteCategory`,
                {
                    data: {
                        id: selectedRecord.id
                    }
                },
            );
            return response.data;
        },
        onSuccess: () => {
            getCategoriesQuery.refetch();
            toast({
                title: "Success",
                description: "Category deleted successfully.",
            });
        },
        onError: (error: any) => {
            console.log(error);
            toast({
                variant: "destructive",
                title: "Oops!",
                description: error.response.data.message,
            })
        },
    })

    function onSubmit(data: z.infer<typeof formSchema>) {
        isEditMode ? editCategoryMutation.mutate(data) : addCategoryMutation.mutate(data);
    }

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "CategoryId",
            header: "ID",
            id: "CategoryId",
            enableHiding: true
        },
        {
            accessorKey: "CompanyId",
            header: "Company Id",
            id: "CompanyId",
            enableHiding: true
        },
        {
            accessorKey: "Name",
            header: `${CategoryName[locale]}`,
        },
        {
            accessorKey: "CreatedAt",
            header: `${CreatedSincei18n[locale]}`,
            cell: ({ row }) => {
                return <p>{format(new Date(row.getValue("CreatedAt")), "MMM dd, yyyy")}</p>
            }
        },
        {
            id: "actions",
            header: ({column}: any) => {
                return (
                  <p className="text-center">{Actioni18n[locale]}</p>
                )
              },
            cell: ({ row }) => {
                return (
                    <div className="flex gap-4 justify-center">
                        <Button
                            variant={"outline"}
                            onClick={() => {
                                console.log(row)
                                setSelectedRecord({id: row.original.CategoryId, categoryName: row.original.Name, companyId: row.original.CompanyId});
                                setIsEditMode(true);
                                setOpen(true);
                            }}
                            className="h-max px-4"
                        >
                            {Editi18n[locale]}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                console.log(row)
                                setSelectedRecord({id: row.original.CategoryId, categoryName: row.original.Name, companyId: row.original.CompanyId});
                                setDeleteOpen(true);
                            }}
                            className="h-max px-4"
                        >
                            {Deletei18n[locale]}
                        </Button>
                    </div>
                )
            }
        }
    ]

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="">
                    <DialogHeader>
                        <DialogTitle>
                            {isEditMode
                                ? EditCategory[locale]
                                : AddCategory[locale]}
                        </DialogTitle>
                        {/* <DialogDescription>
                            {isEditMode
                                ? PleaseCompleteTheFormToEditTheSupplieri18n[
                                    locale
                                ]
                                : PleaseCompleteTheFormToAddASupplieri18n[
                                    locale
                                ]}
                        </DialogDescription> */}
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="categoryName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel ><p className="mb-2">{CategoryName[locale]}</p></FormLabel>
                                        <FormControl>
                                            <Input placeholder={"Vegetables"} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                            
                                control={form.control}
                                name="companyId"
                                render={({ field }) => (
                                    <FormItem className={`${userData?.role == 1 ? "" : "hidden"}`}>
                                        <FormLabel ><p className="mb-2">{CompanyIdi8n[locale]}</p></FormLabel>
                                        <FormControl>
                                            <Input placeholder={"1"} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="submit">{isEditMode ? Update[locale] : Addi18n[locale]}</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {DeleteCategory[locale] }
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {
                               DeleteCategoryDeleteMsg[
                                    locale
                                ]
                            } {`[${selectedRecord.categoryName}]`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <Button
                            variant={"secondary"}
                            onClick={() => {
                                setDeleteOpen(false);
                            }}
                        >
                            {Canceli18n[locale]}
                        </Button>
                        <Button
                            variant={"destructive"}
                            onClick={() => {
                                deleteCategoryMutation.mutate(selectedRecord);
                                setDeleteOpen(false);
                            }}
                        >
                            {Deletei18n[locale]}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <Card className="mx-3 mb-3 flex w-full flex-col gap-2 p-4">
                <div className="flex justify-between">
                    <h1 className="text-2xl font-semibold">Category</h1>
                    <Button
                        onClick={() => {
                            setIsEditMode(false);
                            setOpen(true)
                            form.reset();

                            console.log(userData)
                        }}
                    >
                        {AddCategory[locale]}
                    </Button>   
                </div>
                <div>
                    <DataTable
                        visibility={{
                            CategoryId: false,
                            CompanyId: false,
                        }}
                        filtering={true}
                        columnsToSearch={["Name"]}
                        resetSortBtn={true}
                        pageSize={11}
                        data={getCategoriesQuery.data || []}
                        pagination={true}
                        columns={columns}
                        isLoading={getCategoriesQuery.isLoading}
                    />
                </div>
            </Card>
        </>
    );
}