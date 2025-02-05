"use client";
import React, { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Card } from "../ui/card";
import { ColumnDef } from "@tanstack/react-table";
import { useI18nStore } from "@/store/usei18n";
import { useGlobalStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
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
} from "../ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "../ui/dialog"
import BranchDropDown from "../BranchDropDown";
import { z } from "zod";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  PackageCheck,
  Check,
  X,
  Loader2,
  RotateCw,
  ArrowUpDown,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import ProductDropDown from "../ProductDropDown";
import { Input } from "../ui/input";
import { parseFormDataFromEvent } from "@/app/util/Helpers";
import { Cancel } from "@radix-ui/react-alert-dialog";
const formSchema = z.object({
  productName: z.string().min(2).max(50),
  category: z.string().min(2).max(50),
  price: z.coerce.number().min(1),
  quantity: z.coerce.number().min(1),
  unit: z.string().min(2).max(50),
  expiryDate: z.date(),
  thresholdValue: z.coerce.number().min(1),
  imgFile: z.instanceof(File),
});

export default function TransferOrder() {
  const session = useSession();
  const userData = session.data?.data;
  const { toast } = useToast();
  axios.defaults.headers.common[
    "Authorization"
  ] = `Bearer ${session.data?.token}`;
  const { globalBranchState, globalCompanyState } = useGlobalStore();
  const {
    locale,
    Downloadi18n,
    Datai18n,
    Addi18n,
    TransferStocki18n,
    RequestTransferi18n,
    Actioni18n,
    DateIssuedi18n,
    DateReceivedi18n,
    Statusi18n,
    ReceiverBranchi18n,
    SenderBranchi18n,
    AddTransferStocksi18n,
    Confirmi18n,
    SelectProducti18n,
    SuccesfullyConfirmedReceivedi18n,
    AcceptTransferingStocki18n,
    AreYouAbsolutelySureToAcceptTransferingStocki18n,
    DenyStockTransferi18n,
    AreYouAbsolutelySureToDenyTransferingStocki18n,
    MarkTransferStockAsReceivedi18n,
    AreYouAbsolutelySureToMarkThisAsReceiveThisActionCannotBeUndonei18n,
    PickASourceBranchi18n,
    PickABranchToTransferFromAndModifyQuantityIfNeededi18n,
    DenyStockTransferRequesti18n,
    AreYouAbsolutelySureToDenyTransferStockRequesti18n,
    ReProcessStockTransferi18n,
    AreYouAbsolutelySureToReProcessTransferStockRequesti18n,
    Canceli18n,
    Successi18n,
    Continuei18n,
    Request,
    Producti18n,
    Quantityi18n
  } = useI18nStore();

  const [
    listOfSelectedProductsConfirmation,
    setListOfSelectedProductsConfirmation,
  ] = useState<any[]>([]);
  const [listOfSelectedProducts, setListOfSelectedProducts] = useState<
    DropDownOptions[]
  >([]);
  const [receiverBranch, setReceiverBranch] = useState<string>("");
  const [sourceBranchId, setSourceBranchId] = useState<string>("");
  const [transferStockId, setTransferStockId] = useState<string>("");
  const [transferStockIdComp, setTransferStockIdComp] = useState<string>("");
  /* Modal */
  const [openModalConfirmBranch, setOpenModalConfirmBranch] =
    useState<boolean>(false);
  const [openModalDenyBranch, setOpenModalDenyBranch] =
    useState<boolean>(false);
  const [openModelReceived, setOpenModelReceived] = useState<boolean>(false);
  const [openModalConfirmComp, setOpenModalConfirmComp] =
    useState<boolean>(false);
  const [openModalDenyComp, setOpenModalDenyComp] = useState<boolean>(false);
  const [openModalCompanyReIn, setOpenModalCompanyReIn] =
    useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [openLoadingModal, setOpenLoadingModal] = useState<boolean>(false);

  console.log(userData);

  const getTransferOrder = useQuery({
    queryKey: ["GetTransferOrder"],
    enabled: session.data?.token !== undefined,
    queryFn: async () => {
      if (session.data?.token !== undefined) {
        const companyId =
          globalCompanyState !== "all"
            ? globalCompanyState
            : userData?.companyId;
        const branchId =
          globalBranchState !== "all" ? globalBranchState : userData?.branchId;
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/product/getTransportOrder/cId/${companyId}/bId/${branchId}/`,
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
  const getProductListConfirmation = useQuery({
    queryKey: ["GetProductListConfirmation"],
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    enabled: false,
    queryFn: async () => {
      const req = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/product/getListOfProductsConfirmation/tId/${transferStockIdComp}`
      );
      setListOfSelectedProductsConfirmation(req.data);
      return req.data;
    },
  });
  const requestTransferStock = useMutation({
    mutationKey: ["requestTransferOrder"],
    mutationFn: async (data: any) => {
      console.log(data, userData?.branchId);
      return await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/product/transportStock`,
        { products: data, branchId: userData?.branchId }
      );
    },
    onMutate: async () => {
      setOpenLoadingModal(true);
    },
    onSuccess: async () => {
      toast({
        title: "Success",
        description: `Succesfully requested stock transfer`,
      });
      setOpen(false);
    },

    onSettled: async () => {
      setOpenLoadingModal(false);
      setListOfSelectedProducts([]);
      getTransferOrder.refetch();
    },
  });
  const confirmationMutationByCompany = useMutation({
    mutationKey: ["confirmationTransferOrderByCompany"],
    mutationFn: async (data: any) => {
      return await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/product/confirmByComp`,
        data
      );
    },
    onMutate: async () => {
      setOpenLoadingModal(true);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Succesfully confirmed the transfer of stock.`,
      })
      getTransferOrder.refetch();
    },
    onError: (err: any) => {
      toast({
        variant: "destructive",
        description: err?.response?.data?.message,
        title: "Oops!"
      })
    },
    onSettled: async () => {
      setOpenLoadingModal(false);
    },
  });
  const confirmationMutationByStoreSender = useMutation({
    mutationKey: ["confirmationTransferOrderByStoreSender"],
    mutationFn: async (data: any) => {
      return await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/product/confirmByBranch`,
        data
      );
    },
    onMutate: async () => {
      setOpenLoadingModal(true);
    },
    onSuccess: (data: any) => {
      console.log(data);
      getTransferOrder.refetch();
    },
    onSettled: async () => {
      setOpenLoadingModal(false);
    },
  });
  const confirmReceivedMutaion = useMutation({
    mutationKey: ["ConfirmReceived"],
    mutationFn: async (data: any) => {
      return await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/product/confirmReceived`,
        data
      );
    },
    onMutate: async () => {
      setOpenLoadingModal(true);
    },
    onSuccess: () => {
      getTransferOrder.refetch();
      toast({
        title: Successi18n[locale],
        description: SuccesfullyConfirmedReceivedi18n[locale],
      });
    },
    onSettled: async () => {
      setOpenLoadingModal(false);
    },
  });
  const reprocessRequestMutation = useMutation({
    mutationKey: ["reprocessRequest"],
    mutationFn: async (data: any) => {
      return await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/product/reprocessRequest`,
        data
      );
    },
    onMutate: async () => {
      setOpenLoadingModal(true);
    },
    onSuccess: () => {
      getTransferOrder.refetch();
    },
    onSettled: async () => {
      setOpenLoadingModal(false);
    },
  });
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    requestTransferStock.mutate(parseFormDataFromEvent(e));
  }
  function onSubmitCompany(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formDataArray = parseFormDataFromEvent(e);
    confirmationMutationByCompany.mutate({
      status: "Confirm",
      products: formDataArray,
      transferStockId: transferStockIdComp,
      sourceBranchId,
    });
  }
  function onSubmitStoreConfirmation(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formDataArray = parseFormDataFromEvent(e);
    console.log(formDataArray);
    confirmationMutationByStoreSender.mutate({
      products: formDataArray,
      transferStockId,
      status: "Confirm",
    });
  }
  function onSubmitReceived(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formDataArray = parseFormDataFromEvent(e);
    console.log(formDataArray);
    confirmReceivedMutaion.mutate({
      products: formDataArray,
      transferStockId,
    });
  }

  const columns: ColumnDef<InventoryDataTable>[] = [
    {
      accessorKey: "TransferOrderId",
      header: () => <div className="text-center">{TransferStocki18n["Transfer Stock"][locale]} #</div>,
      cell: ({ row, cell }) => (
        <div className="text-center">{row.getValue("TransferOrderId")}</div>
      ),
    },

    {
      accessorKey: "SourceBranch",
      header: SenderBranchi18n[locale],
      cell: ({ row }) => {
        const value =
          row.getValue("SourceBranch") == null
            ? "N/A"
            : (row.getValue("SourceBranch") as string);
        return <div>{value}</div>;
      },
    },
    {
      accessorKey: "DestinationBranch",
      header: ReceiverBranchi18n[locale],
    },
    {
      accessorKey: "Status",
      header: () => <div className="text-center">{Statusi18n[locale]}</div>,
      cell: ({ row }) => {
        const status = row.getValue("Status") as string;
        const defaultStatus =
          TransferStocki18n[status as keyof typeof TransferStocki18n][locale];

        const statusClass = () => {
          switch(status){
            case "Declined":
            case "Cancelled":
              return "bg-red-200 text-red-800 p-1 rounded-sm"
            case "Received":
              return "bg-green-100 text-green-800 p-1 rounded-sm"
            case "Pending Company Approval":
            case "Pending Store Approval":
              return "bg-orange-100 text-orange-800 p-1 rounded-sm"
            case "For Shipping":
              return "bg-blue-100 text-blue-800 p-1 rounded-sm"
          }
        }
        
        return (
          <div className="text-center">
            <span className={`${statusClass()}`}>
              {status == "Company Approved" 
                ? userData?.role == 3
                  ? TransferStocki18n["Pending Store Approval"][locale]
                  : defaultStatus
                : defaultStatus}

            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "Received",
      header: () => <div className="text-center">{DateReceivedi18n[locale]}</div>,
      cell: ({ row }) => {
        if (row.getValue("Received") == null) {
          return <div className="flex justify-center">N/A</div>;
        } else {
          const date: Date = new Date(
            (row.getValue("Received") as string)
              .replace("T", " ")
              .replace("Z", "")
          );
          return (
            <div className="text-center">
              {date.toLocaleDateString(locale, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          );
        }
      },
    },
    {
      accessorKey: "CreatedAt",
      header: ({ table }) => (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            className="hover:bg-gray-300"
            onClick={() => {
              table
                .getColumn("CreatedAt")
                ?.toggleSorting(
                  table.getColumn("CreatedAt")?.getIsSorted() === "asc"
                );
            }}
          >
            {DateIssuedi18n[locale]}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ),

      cell: ({ row }) => {
        const date: Date = new Date(
          (row.getValue("CreatedAt") as string)
            .replace("T", " ")
            .replace("Z", "")
        );
        return (
          <div className="text-center">
            {date.toLocaleDateString(locale, {
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
        const status = row.getValue("Status") as string;
        const destinationBranch = row.getValue("DestinationStoreId") as string;

        return (
          <div className="mx-auto flex h-[28px] w-[8.94rem] items-center justify-center">
            {/* For Stock request store only */}
            {/* When Company has to Approve Request from Receiver Store */}
            {/* Keyword: Recieved */}
            {userData.branchId == destinationBranch &&
              userData.role == 3 &&
              status === "For Shipping" && (
                <div className="flex w-full">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => {
                            setOpenModelReceived(true);
                            setTransferStockId(row.getValue(`TransferOrderId`));
                            setTransferStockIdComp(
                              row.getValue(`TransferOrderId`)
                            );
                          }}
                          disabled={!row.getValue("Received") == null}
                          className="mx-auto h-max p-0 px-2 py-1"
                        >
                          <PackageCheck size={20} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Received </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            {/* For Company Only */}
            {/* When Pending Approval by Sender Store */}
            {/* Keyword: Company Approval */}
            {userData.role == 2 && status === "Pending Company Approval" && (
              <div className="flex w-full gap-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => {
                          setOpenModalConfirmComp(true);
                          setTransferStockIdComp(
                            row.getValue(`TransferOrderId`)
                          );
                          setTransferStockIdComp(
                            row.getValue(`TransferOrderId`)
                          );
                          console.log(row.getValue(`DestinationStoreId`));
                          setReceiverBranch(row.getValue(`DestinationStoreId`));
                        }}
                        variant={"secondary"}
                        className="mx-auto h-max p-0 px-2 py-1"
                      >
                        <Check size={20} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Approve</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => {
                          setOpenModalDenyComp(true);
                          setTransferStockId(row.getValue(`TransferOrderId`));
                        }}
                        variant={"destructive"}
                        className="mx-auto h-max p-0 px-2 py-1"
                      >
                        <X size={20} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Decline</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
            {/* Re Process */}
            {userData.role == 2 &&
              row.getValue("SourceStoreId") !== null &&
              status === "Declined" && (
                <div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => {
                            setOpenModalCompanyReIn(true);
                            setTransferStockId(row.getValue(`TransferOrderId`));
                          }}
                          className="mx-auto h-max p-0 px-2 py-1"
                        >
                          <RotateCw size={20} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Reprocess Request</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            {/* For Stock Sender branch only */}
            {/* Finalize When the Stock is Received  */}
            {/* Keyword: Src Store Approval */}
            {userData.branchId == row.getValue("SourceStoreId") &&
              userData.role == 3 &&
              status == "Pending Store Approval" && (
                <div className="flex gap-4">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={"secondary"}
                          className="mx-auto h-max p-0 px-2 py-1"
                          onClick={() => {
                            setOpenModalConfirmBranch(true);
                            setTransferStockId(row.getValue("TransferOrderId"));
                            setTransferStockIdComp(
                              row.getValue(`TransferOrderId`)
                            );
                          }}
                        >
                          <Check size={20} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Approve</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => {
                            setOpenModalDenyBranch(true);
                            setTransferStockId(row.getValue(`TransferOrderId`));
                          }}
                          variant={"destructive"}
                          className="mx-auto h-max p-0 px-2 py-1"
                        >
                          <X size={20} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Decline</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
          </div>
        );
      },
    },

    {
      accessorKey: "SourceStoreId",
    },
    {
      accessorKey: "DestinationStoreId",
    },
  ];
  useEffect(() => {
    getProductListConfirmation.refetch();
  }, [transferStockIdComp]);
  useEffect(() => {
    getTransferOrder.refetch();
  }, [globalBranchState, globalCompanyState]);
  return (
    <div className="flex flex-1 flex-col">
      {/* For Branch */}
      {/* Accept */}
      <Dialog
        open={openModalConfirmBranch}
        onOpenChange={setOpenModalConfirmBranch}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{AcceptTransferingStocki18n[locale]}</DialogTitle>
            <DialogDescription>
              {AreYouAbsolutelySureToAcceptTransferingStocki18n[locale]}
            </DialogDescription>
          </DialogHeader>
          <form
            className="flex flex-col items-center justify-between py-2"
            onSubmit={onSubmitStoreConfirmation}
          >
            {!getProductListConfirmation.isFetching ? (
              listOfSelectedProductsConfirmation.length > 0 ? (
                listOfSelectedProductsConfirmation.map((items, index) => {
                  return (
                    <div
                      key={index}
                      className="flex w-full items-center justify-between"
                    >
                      <label className="text-base">{items.Name}</label>
                      <Input
                        className="w-48"
                        type="number"
                        name={items.ProductId}
                        defaultValue={items.ApprovedQuantity}
                      />
                    </div>
                  );
                })
              ) : (
                <div className="flex h-40 w-full items-center">
                  <p className="w-full py-5 text-center">No Products</p>
                </div>
              )
            ) : (
              <div className="flex h-40 w-full items-center justify-center">
                <Loader2 size={42} className="m-auto animate-spin" />
              </div>
            )}
            <div className="flex w-full justify-end gap-2 pt-5">
              <Button type="button" variant="secondary">{Canceli18n[locale]}</Button>
              <Button type="submit">{Continuei18n[locale]}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {/* Deny */}
      <Dialog
        open={openModalDenyBranch}
        onOpenChange={setOpenModalDenyBranch}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{DenyStockTransferi18n[locale]}</DialogTitle>
            <DialogDescription>
              {AreYouAbsolutelySureToDenyTransferingStocki18n[locale]}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose>{Canceli18n[locale]}</DialogClose>
            <Button
              type="button"
              variant={"destructive"}
              onClick={() => {
                confirmationMutationByStoreSender.mutate({
                  transferStockId,
                  status: "Declined",
                });
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Receive */}
      <Dialog open={openModelReceived} onOpenChange={setOpenModelReceived}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{MarkTransferStockAsReceivedi18n[locale]}</DialogTitle>
            <DialogDescription>
              {AreYouAbsolutelySureToMarkThisAsReceiveThisActionCannotBeUndonei18n[locale]}
            </DialogDescription>
          </DialogHeader>
          <div>
            <form
              className="flex flex-col items-center justify-between"
              onSubmit={onSubmitReceived}
            >
              {!getProductListConfirmation.isFetching ? (
                listOfSelectedProductsConfirmation.length > 0 ? (
                  listOfSelectedProductsConfirmation.map((items, index) => {
                    return (
                      <div
                        key={index}
                        className="flex w-full items-center justify-between"
                      >
                        <label className="text-base">{items.Name}</label>
                        <Input
                          className="w-48"
                          type="number"
                          name={items.ProductId}
                          defaultValue={items.ShippedQuantity}
                        />
                      </div>
                    );
                  })
                ) : (
                  <div className="flex h-40 w-full items-center">
                    <p className="w-full py-5 text-center">No Products</p>
                  </div>
                )
              ) : (
                <div className="flex h-40 w-full items-center justify-center">
                  <Loader2 size={42} className="m-auto animate-spin" />
                </div>
              )}
              <div className="flex w-full justify-end gap-2 py-4">
                <Button type="button" variant="secondary">{Canceli18n[locale]}</Button>
                <Button type="submit">{Continuei18n[locale]}</Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
      {/* ==================================== */}
      {/* Company */}
      {/* Accept */}
      <Dialog
        open={openModalConfirmComp}
        onOpenChange={setOpenModalConfirmComp}
      >
        <DialogContent>
          <form
            onSubmit={onSubmitCompany}
            className="flex flex-col gap-2 py-2 text-black"
          >
            <DialogHeader>
              <DialogTitle>{PickASourceBranchi18n[locale]}</DialogTitle>
            {/* <DialogDescription>
              {PickABranchToTransferFromAndModifyQuantityIfNeededi18n[locale]}
            </DialogDescription> */}
            </DialogHeader>
            <div className="flex flex-col">
              <label className="text-base ">Stock Source Store</label>
              <BranchDropDown
                className="w-full mt-2"
                removeOption={[receiverBranch]}
                externalState={sourceBranchId}
                setExternalState={setSourceBranchId}
              />
            </div>
            {
              listOfSelectedProductsConfirmation.length > 0 &&
              <div className="flex items-center justify-between font-bold mt-2">
                <div className="">{Producti18n[locale]}</div>
                <div className="w-48">{Quantityi18n[locale]}</div>
              </div>
            }
            {!getProductListConfirmation.isFetching ? (
              listOfSelectedProductsConfirmation.length > 0 ? (
                listOfSelectedProductsConfirmation.map((items, index) => {
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <label className="text-base">{items.Name}</label>
                      <Input
                        className="w-48"
                        type="number"
                        name={items.ProductId}
                        defaultValue={items.RequestQuantity}
                      />
                    </div>
                  );
                })
              ) : (
                <div className="flex h-40 w-full items-center">
                  <p className="w-full py-5 text-center">No Products</p>
                </div>
              )
            ) : (
              <div className="flex h-40 w-full items-center justify-center">
                <Loader2 size={42} className="m-auto animate-spin" />
              </div>
            )}
            <DialogFooter className="mt-3">
              <div className="flex justify-end gap-2">
                <Button type="button" variant="secondary">{Canceli18n[locale]}</Button>
                <Button
                  onClick={() => {
                    setOpenModalConfirmComp(false);
                  }}
                  disabled={
                    listOfSelectedProductsConfirmation.length < 1 ||
                    sourceBranchId === ""
                  }
                  type="submit"
                >
                  {`Confirm`}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Deny */}
      <Dialog open={openModalDenyComp} onOpenChange={setOpenModalDenyComp}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{DenyStockTransferRequesti18n[locale]}</DialogTitle>
            <DialogDescription>
              {AreYouAbsolutelySureToDenyTransferStockRequesti18n[locale]}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="secondary">{Canceli18n[locale]}</Button>
            <Button
              type="button"
              variant={"destructive"}
              onClick={() => {
                confirmationMutationByCompany.mutate({
                  transferStockId,
                  status: "Declined",
                });
              }}
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Re-Initialize Transfer */}
      <Dialog
        open={openModalCompanyReIn}
        onOpenChange={setOpenModalCompanyReIn}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{ReProcessStockTransferi18n[locale]}</DialogTitle>
            <DialogDescription>
              {AreYouAbsolutelySureToReProcessTransferStockRequesti18n[locale]}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="secondary">{Canceli18n[locale]}</Button>
            <Button
              type="button"
              onClick={() => {
                reprocessRequestMutation.mutate({
                  transferStockId,
                });
              }}
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Loading  */}
      <Dialog open={openLoadingModal} onOpenChange={setOpenLoadingModal}>
        <DialogContent className="flex size-60 items-center justify-center">
          <DialogHeader>
            <DialogTitle className="flex flex-col items-center justify-between">
              <Loader2 size={40} className="animate-spin" />
            </DialogTitle>
            <DialogDescription className="text-center">
              Loading
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <Card className="mx-3 mb-2 flex flex-1 flex-col gap-2 p-3">
        {userData && userData.role <= 3 && (
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">
              {TransferStocki18n["Transfer Stock"][locale]}
            </h1>
            <div className="flex gap-3">
              <Button className="bg-green-400">
                {`${Downloadi18n[locale]}`}
              </Button>
              {userData.role === 3 && (
                <Dialog open={open} onOpenChange={(open) => {setOpen(open); setListOfSelectedProducts([]);}}>
                  <DialogTrigger asChild>
                    <Button variant={"default"}>{RequestTransferi18n[locale]}</Button>
                  </DialogTrigger>
                  <DialogContent>
                      <DialogTitle className="flex items-center justify-between text-2xl">
                        {`${RequestTransferi18n[locale]}`}
                        {/* <Button 
                          type="button"
                          onClick={() => {
                            setListOfSelectedProducts([]);
                          }}
                        >
                          X
                        </Button> */}
                      </DialogTitle>
                      <form onSubmit={onSubmit} className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <label>{SelectProducti18n[locale]}</label>
                          <ProductDropDown
                            externalState={listOfSelectedProducts}
                            setExternalState={setListOfSelectedProducts}
                          />
                        </div>
                        <div className="flex flex-col gap-2 py-2">
                          {
                            listOfSelectedProducts.length > 0 &&
                            <div className="flex items-center justify-between font-bold pr-3">
                              <div className="">{Producti18n[locale]}</div>
                              <div className="w-[30%]">{Quantityi18n[locale]}</div>
                            </div>
                          }
                          <div className="flex flex-col gap-2 max-h-[400px] overflow-auto pr-3">
                            {listOfSelectedProducts.length > 0 &&
                              listOfSelectedProducts.map((item, index) => {
                                return (
                                  <div
                                    key={index}
                                    className={`flex items-center gap-3 justify-between ${index !== 0 ? "border-t pt-2" : ""}`}
                                  >
                                    <label className="text-pretty">{item.label}</label>
                                    <Input
                                      required
                                      placeholder="Quantity"
                                      className="w-[30%]"
                                      type="number"
                                      min={1}
                                      name={item.value}
                                    />
                                  </div>
                                );
                              })}

                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                              setListOfSelectedProducts([]);
                              setOpen(false);
                            }}
                          >
                            {Canceli18n[locale]}
                          </Button>
                          <Button
                            disabled={listOfSelectedProducts.length < 1}
                            type="submit"
                          >
                            {Request[locale]}
                          </Button>
                        </div>
                      </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        )}
        <div>
          {userData && (
            <DataTable
              filtering={true}
              columnsToSearch={["TransferOrderId", "SourceBranch", "DestinationBranch"]}
              resetSortBtn={true}
              pageSize={userData.role === 1 ? 13 : 11}
              data={getTransferOrder?.data ? getTransferOrder.data : []}
              pagination={true}
              columns={columns}
              visibility={{
                action: userData.role == 1 || userData.role == 4 ? false : true,
                SourceStoreId: false,
                DestinationStoreId: false,
              }}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
