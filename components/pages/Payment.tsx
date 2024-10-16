"use client";
import { Card } from "../ui/card";
import { QrScanner } from "react-qrcode-scanner";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import Image from "next/image";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../ui/alert-dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { toast } from "../ui/use-toast";
import { slowFetch } from "@/app/util/Helpers";
import CardPaymentForm from "../CardPaymentForm";
import { useI18nStore } from "@/store/usei18n";

type tabState =
    | "paymentOpt"
    | "scanQr"
    | "paymentSuccess"
    | "paymentFailed"
    | "processCashPayment";

export default function Payment() {

    const {
        locale,
        ScanQRCodei18n,
        ScanAgaini18n,
        Producti18n,
        Quantityi18n,
        Pricei18n,
        Uniti18n,
        TotalPricei18n,
        SubTotali18n,
        Discounti18n,
        Paymenti18n,
        Canceli18n,
        Continuei18n,
        Submiti18n,
        GoBacki18n,
        CardPaymenti18n,
        CashPaymenti18n,
        PleaseEnterYourCardDetailsi18n,
        CardNumberi18n,
        PleaseEnterExactCashAmounti18n,
        TenderAmounti18n,
        AmountToPayi18n,
        Changei18n,
        YourChangeIsi18n,
        Proceedi18n,
        PaymentSuccessfuli18n,
        PaymentFailedi18n,
        Loadingi18n,
        TransactionCompletei18n,
        TheTransactionWasSuccessfullyCompletedi18n
    } = useI18nStore();

    const deviceIdList = {
        arduCam:
            "a0539edb6d54c0c3edb9ace4d70daa488684573709d9770b756b7bf53ad35d27",
        laptopCam:
            "16e40f9ffed61b5e1662729dc2892ea7a5af68ae27542420215f9d0608fd41a1",
    };
    const [openCashPaymentModal, setOpenCashPaymentModal] =
        useState<boolean>(false);
    const [openChangeModal, setOpenChangeModal] = useState<boolean>(false);
    const [openLoadingModal, setOpenLoadingModal] = useState<boolean>(false);
    const [openCardPaymentModal, setOpenCardPaymentModal] =
        useState<boolean>(false);
    /* Modal State */
    const [tabState, setTabState] = useState<tabState>("scanQr");
    const [qrData, setQrData] = useState<string>("202403000029");
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [subTotal, setSubTotal] = useState<number>(0);
    const [discount, setDiscount] = useState<number>(0);
    const [change, setChange] = useState<number>(0);
    const [transactionProducts, setTransactionProducts] = useState<any[]>([]);
    /* if (!navigator.mediaDevices?.enumerateDevices) {
        console.log("enumerateDevices() not supported.");
    } else {
        navigator.mediaDevices
            .enumerateDevices()
            .then((devices) => {
                devices.forEach((device) => {
                    console.log(
                        `${device.kind}: ${device.label} id = ${device.deviceId}`
                    );
                });
            })
            .catch((err) => {
                console.error(`${err.name}: ${err.message}`);
            });
    } */
    const getTransactionProducts = useQuery({
        queryKey: ["GetTransactionProducts"],
        enabled: qrData !== "",
        queryFn: async () => {
            const result = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/transaction/getTransactionProducts/tID/${qrData}`
            );
            setTransactionProducts(result.data.data);
            setTotalPrice(result.data.finalPrice);
            setSubTotal(result.data.subPrice);
            setDiscount(result.data.discount);
            return result.data;
        },
    });
    function resetPayment() {
        setTabState("scanQr");
        setQrData("");
        setTotalPrice(0);
        setSubTotal(0);
        setDiscount(0);
        setChange(0);
        setTransactionProducts([]);
    }
    const cashPaymentMutation = useMutation({
        mutationKey: ["cashPaymentMatation"],
        mutationFn: async (data: any) => {
            await slowFetch();
        },
        onMutate: () => {
            setOpenLoadingModal(true);
            setOpenCashPaymentModal(false);
        },
        onError: () => {
            toast({
                title: "Failed",
                description: `Please Try Again later`,
            });
        },
        onSuccess: () => {
            setOpenLoadingModal(false);
            setOpenChangeModal(true);
            toast({
                title: TransactionCompletei18n[locale],
                description: TheTransactionWasSuccessfullyCompletedi18n[locale],
            });
        },
    });
    const cardPaymentMutation = useMutation({
        mutationKey: ["cardPaymentMatation"],
        mutationFn: async (data: any) => {
            await slowFetch();
        },
        onMutate: () => {
            setOpenLoadingModal(true);
            setOpenCardPaymentModal(false);
        },
        onError: () => {
            toast({
                title: "Failed",
                description: `Please Try Again later`,
            });
        },
        onSuccess: () => {
            setOpenLoadingModal(false);
            setTabState("paymentSuccess");
            setTimeout(() => {
                resetPayment();
            }, 2000);
            toast({
                title: "Transaction Complete",
                description: `The Transaction was Succesfully Completed`,
            });
        },
    });
    function handleScan(value: string) {
        setQrData(value);
    }
    function cashPaymentSubmitHandler(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setOpenLoadingModal(true);
        const formData = new FormData(e.target as HTMLFormElement);
        const formVal = Array.from(formData.entries()).map(([name, value]) => ({
            [name]: value,
        }));
        const TenderAmount = parseInt(formVal[0].TenderAmount as string);
        const change = TenderAmount - totalPrice;
        setChange(change);
        cashPaymentMutation.mutate({
            tID: qrData,
            tenderAmount: formVal[0].TenderAmount,
            totalPrice: totalPrice,
            change: change,
        });
    }
    function cardPaymentSubmitHandler(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setOpenLoadingModal(true);
        const formData = new FormData(e.target as HTMLFormElement);
        const formVal = Array.from(formData.entries()).map(([name, value]) => ({
            [name]: value,
        }));
        const TenderAmount = parseInt(formVal[0].TenderAmount as string);
        const change = TenderAmount - totalPrice;
        setChange(change);
        cardPaymentMutation.mutate({
            tID: qrData,
            tenderAmount: formVal[0].TenderAmount,
            totalPrice: totalPrice,
            change: change,
        });
    }
    const tabs = {
        scanQr: (
            <div className="flex flex-1 gap-3">
                <Card className="flex h-full w-1/3 flex-col items-center justify-around px-3 py-4">
                    <h1 className="text-center text-lg font-semibold">
                        {ScanQRCodei18n[locale]}
                    </h1>

                    {qrData === "" ? (
                        <div className="w-full rounded-xl">
                            <QrScanner
                                onScan={handleScan}
                                aspectRatio="4:6"
                                constraints={{
                                    deviceId: deviceIdList.arduCam,
                                }}
                            />
                        </div>
                    ) : (
                        <Button
                            onClick={() => {
                                setQrData("");
                                setTransactionProducts([]);
                            }}
                        >
                            {ScanAgaini18n[locale]}
                        </Button>
                    )}
                </Card>
                <div className="flex w-2/3 flex-col gap-3">
                    <Card className="flex-1 p-4">
                        <div className="">
                            <h1 className="text-center text-2xl font-semibold">
                                Linoflap Technology Phillippines, Inc.
                            </h1>
                            <h1 className="text-center text-xl font-semibold">
                                539 Arquiza Street, Corner Grey Street, Ermita,
                                Manila, 1000 Metro Manila, Phillipines
                            </h1>
                        </div>
                        <Separator className="mb-1 mt-5 p-0.5" />
                        <div className="flex">
                            <p className="w-2/5 text-lg font-semibold">
                                {Producti18n[locale]}
                            </p>
                            <p className="w-1/5 text-center text-lg font-semibold">
                                {Quantityi18n[locale]}
                            </p>
                            <p className="w-1/5 text-center text-lg font-semibold">
                                {Pricei18n[locale]}/{Uniti18n[locale]}
                            </p>
                            <p className="w-1/5 text-center text-lg font-semibold">
                                 {TotalPricei18n[locale]}
                            </p>
                        </div>
                        <Separator className="my-1 p-0.5" />
                        <ScrollArea className="h-[30rem]">
                            <div>
                                {transactionProducts.length >= 1 &&
                                    transactionProducts.map(
                                        (item: any, index: number) => {
                                            const totalPrice =
                                                item.Quantity * item.Price;
                                            return (
                                                <div
                                                    key={index}
                                                    className="flex"
                                                >
                                                    <p className="w-2/5 text-lg">
                                                        {item.Name}
                                                    </p>
                                                    <p className="w-1/5 text-center text-lg">
                                                        {item.Quantity}
                                                    </p>
                                                    <p className="w-1/5 text-center text-lg">
                                                        {item.Price}¥
                                                    </p>
                                                    <p className="w-1/5 text-center text-lg">
                                                        {totalPrice}¥
                                                    </p>
                                                </div>
                                            );
                                        }
                                    )}
                            </div>
                        </ScrollArea>
                        <Separator className="my-1 p-0.5" />
                        <div className="flex">
                            <p className="w-1/3 text-center text-2xl font-semibold">
                                {SubTotali18n[locale]}: {subTotal}¥
                            </p>
                            <p className="w-1/3 text-center text-2xl font-semibold">
                                {Discounti18n[locale]}: {discount}%
                            </p>

                            <p className="w-1/3 text-center text-2xl font-semibold">
                                {TotalPricei18n[locale]}: {totalPrice}¥
                            </p>
                        </div>
                    </Card>
                    <Button
                        disabled={qrData === ""}
                        onClick={() => {
                            setTabState("paymentOpt");
                        }}
                        className="ml-auto flex h-20 w-max items-center text-4xl font-bold"
                    >
                        {Paymenti18n[locale]} <ChevronRight size={50} />
                    </Button>
                </div>
            </div>
        ),
        paymentOpt: (
            <div className="flex flex-1">
                <Card className="flex flex-1 flex-col p-4">
                    <Button
                        onClick={() => {
                            setTabState("scanQr");
                        }}
                        className="h-15 ml-auto flex w-max items-center text-xl font-bold"
                    >
                        <ChevronLeft size={30} /> {GoBacki18n[locale]}
                    </Button>
                    <div className="flex flex-1 flex-row items-center justify-center gap-20">
                        <div
                            onClick={() => {
                                setOpenCardPaymentModal(true);
                            }}
                            className="cursor-pointer rounded-md border px-3 py-5 shadow-md transition-all hover:scale-[1.01] active:scale-[.99]"
                        >
                            <Image
                                alt="cashOpt"
                                src="/cardOpt.png"
                                width={400}
                                height={400}
                            />
                            <h1 className="text-center text-3xl font-semibold">
                                {CardPaymenti18n[locale]}
                            </h1>
                        </div>
                        <div
                            onClick={() => {
                                setOpenCashPaymentModal(true);
                            }}
                            className="cursor-pointer rounded-md border px-3 py-5 shadow-md transition-all hover:scale-[1.01] active:scale-[.99]"
                        >
                            <Image
                                alt="cashOpt"
                                src="/cashOpt.png"
                                width={400}
                                height={400}
                            />
                            <h1 className="text-center text-3xl font-semibold">
                                {CashPaymenti18n[locale]}
                            </h1>
                        </div>
                        {/* <div className="cursor-pointer rounded-md border px-3 py-5 shadow-md active:scale-[.99]">
                        <Image alt="cashOpt" src="/cashOpt.png" width={400} height={400} />
                        <h1 className="text-center text-3xl font-semibold">Cash Payment</h1>
                    </div> */}
                    </div>
                </Card>
            </div>
        ),
        processCashPayment: <div>Process Cash Payment</div>,
        paymentSuccess: (
            <div className="flex flex-1 items-center justify-center">
                <Card className="flex flex-col gap-5 px-8 py-3">
                    <h1 className="text-center text-5xl font-semibold">
                        {PaymentSuccessfuli18n[locale]}
                    </h1>
                    <Image
                        alt="success"
                        src="/imai.png"
                        width={500}
                        height={500}
                    />
                </Card>
            </div>
        ),
        paymentFailed: <div>{PaymentFailedi18n[locale]}</div>,
    };
    useEffect(() => {
        getTransactionProducts.refetch();
    }, [qrData]);
    return (
        <div className="flex flex-1 gap-3 px-3 pb-3">
            {/* Cash CheckOut */}
            <AlertDialog
                open={openCashPaymentModal}
                onOpenChange={setOpenCashPaymentModal}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{CashPaymenti18n[locale]}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {PleaseEnterExactCashAmounti18n[locale]}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <form
                        onSubmit={cashPaymentSubmitHandler}
                        className="flex w-full flex-col items-center justify-between gap-5 py-2"
                    >
                        <div className="flex w-full items-center justify-between">
                            <Label className="text-base">{TenderAmounti18n[locale]}</Label>
                            <div className="flex w-2/4 items-center rounded border">
                                <Input
                                    className="border-0 text-center"
                                    name="TenderAmount"
                                    required
                                    min={totalPrice}
                                    type="number"
                                />
                                <h1 className="w-8 text-center">¥</h1>
                            </div>
                        </div>
                        <div className="group flex w-full items-center justify-between">
                            <Label className="text-base">{AmountToPayi18n[locale]}</Label>
                            <div className="flex w-2/4 items-center rounded border">
                                <Input
                                    className="border-0 text-center focus:outline-0"
                                    name="TotalPrice"
                                    type="number"
                                    readOnly
                                    defaultValue={totalPrice}
                                />
                                <h1 className="w-8 text-center">¥</h1>
                            </div>
                        </div>
                        <div className="flex w-full justify-end gap-2 pt-5">
                            <AlertDialogCancel>{Canceli18n[locale]}</AlertDialogCancel>
                            <Button type="submit">{Continuei18n[locale]}</Button>
                        </div>
                    </form>
                </AlertDialogContent>
            </AlertDialog>
            {/* Card CheckOut */}
            <AlertDialog
                open={openCardPaymentModal}
                onOpenChange={setOpenCardPaymentModal}
            >
                <AlertDialogContent className="max-w-max">
                    <AlertDialogHeader>
                        <AlertDialogTitle>{CardPaymenti18n[locale]}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {PleaseEnterYourCardDetailsi18n[locale]}
                        </AlertDialogDescription>
                        {/* React Card Form Remove if not final */}
                        <div>
                            <CardPaymentForm
                                onSubmit={cardPaymentSubmitHandler}
                            />
                        </div>
                    </AlertDialogHeader>
                </AlertDialogContent>
            </AlertDialog>
            {/* Change */}
            <AlertDialog
                open={openChangeModal}
                onOpenChange={setOpenChangeModal}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{Changei18n[locale]}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {YourChangeIsi18n[locale]}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <h1 className="text-center text-3xl font-semibold">
                        {change}
                    </h1>
                    <AlertDialogAction
                        className="ml-auto w-max"
                        onClick={() => {
                            setTabState("paymentSuccess");
                            setTimeout(() => {
                                resetPayment();
                            }, 2000);
                        }}
                    >
                        {Proceedi18n[locale]}
                    </AlertDialogAction>
                </AlertDialogContent>
            </AlertDialog>
            {/* Loading */}
            <AlertDialog
                open={openLoadingModal}
                onOpenChange={setOpenLoadingModal}
            >
                <AlertDialogContent className="flex size-60 items-center justify-center">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex flex-col items-center justify-between">
                            <Loader2 size={40} className="animate-spin" />
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-center">
                            {Loadingi18n[locale]}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                </AlertDialogContent>
            </AlertDialog>
            {tabs[tabState]}
        </div>
    );
}
