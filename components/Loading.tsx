"use client";
import { Loader } from "lucide-react";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from "./ui/alert-dialog";
import { useI18nStore } from "@/store/usei18n";

export default function Loading() {
    const { locale,Loadingi18n } = useI18nStore();

    return (
        <AlertDialog open={true}>
            <AlertDialogContent className="w-max">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-center text-xl">
                        {Loadingi18n[locale]}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="flex justify-center">
                        <Loader size={40} className="animate-spin" />
                    </AlertDialogDescription>
                </AlertDialogHeader>
            </AlertDialogContent>
        </AlertDialog>
    );
}
