"use client";;
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function InvNavigation() {
    const router = useRouter();
    const currentPath = usePathname();
    const session = useSession();
    const userData = session.data?.data;

    return (
        <Card className="m-3 mt-0 flex w-max gap-2 px-3 py-2">
            <h1
                className={`rounded bg-blue-400 text-white hover:cursor-pointer hover:bg-blue-500 ${
                    currentPath === "/home/inventory/inventory"
                        ? "bg-blue-600"
                        : ""
                }`}
            >
                <Button
                    onClick={() => {
                        router.push("/home/inventory/inventory");
                    }}
                    className="text-white hover:no-underline"
                    variant={"link"}
                >
                    Inventory
                </Button>
            </h1>
            <h1
                className={`rounded bg-blue-400 text-white hover:cursor-pointer hover:bg-blue-500 ${
                    currentPath === "/home/inventory/products"
                        ? "bg-blue-600"
                        : ""
                }`}
            >
                <Button
                    onClick={() => {
                        router.push("/home/inventory/products");
                    }}
                    className="text-white hover:no-underline"
                    variant={"link"}
                >
                    Products
                </Button>
            </h1>
            {[1,2,3].includes(userData?.role) && (
                <h1
                    className={`rounded bg-blue-400 text-white hover:cursor-pointer hover:bg-blue-500 ${
                        currentPath === "/home/inventory/transferorder"
                            ? "bg-blue-600"
                            : ""
                    }`}
                >
                    <Button
                        onClick={() => {
                            router.push("/home/inventory/transferorder");
                        }}
                        className="text-white hover:no-underline"
                        variant={"link"}
                    >
                        Transfer Stocks
                    </Button>
                </h1>
            )}
        </Card>
    );
}
