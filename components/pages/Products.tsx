"use client";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import InventoryPurchase from "@/components/pages/InventoryPurchase";
import ProductView from "@/components/pages/ProductView";
import { useI18nStore } from "@/store/usei18n";
import { useSession } from "next-auth/react";
function Products() {
    const session = useSession();
    const userData = session.data?.data;
    const [tabState, setTabState] = useState<string>("overview");
    const {
        locale,
        Overviewi18n,
        Purchasesi18n,
    } = useI18nStore();
    
    return (
        <Card className="m-3 p-3">
            <div className="flex justify-between">
                <h1 className="p-2 text-2xl font-semibold">{"ProdId"}</h1>
            </div>
            <div className="p-2">
                <div className="flex gap-2 border-b">
                    <span
                        className={`border-b p-2 py-3 hover:cursor-pointer hover:bg-slate-300 ${
                            tabState == "overview" &&
                            "border-primary border-b-2"
                        }`}
                        onClick={() => {
                            setTabState("overview");
                        }}
                    >
                        {Overviewi18n[locale]}
                    </span>
                    {userData?.role <= 2 && (
                        <span
                            className={`   border-b p-2 py-3 hover:cursor-pointer hover:bg-slate-300 ${
                                tabState == "purchase" &&
                                "border-primary border-b-2"
                            }`}
                            onClick={() => {
                                setTabState("purchase");
                            }}
                        >
                            {Purchasesi18n[locale]}
                        </span>
                    )}
                </div>
                {tabState == "overview" ? (
                    <ProductView />
                ) : (
                    <InventoryPurchase />
                )}
            </div>
        </Card>
    );
}

export default Products;
