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

export default function LoaderComponent() {
    const { locale,Loadingi18n } = useI18nStore();

    return (
        <div className="flex flex-col items-center py-6">
            <p className="text-center text-gray-300">Loading...</p>
            <Loader size={40} className="animate-spin" />
        </div>
    );
}
