import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { DataTable } from "@/components/ui/data-table";
import { useI18nStore } from "@/store/usei18n";
type SupplyInfo = {
    storeName: string;
    stockInHand: number;
};
/* Query */

function ProductView() {
    const {
        locale,
        localeExtended,
        PrimaryDetailsi18n,
        SupplierDetailsi18n,
        ProductIDi18n,
        OpeningStocksi18n,
        RemainingStocksi18n,
        ThresholStockValuei18n,
        StoreNamei18n,
        StockInHandi18n,
        Categoryi18n,
        Expiryi18n,
        Contacti18n,
    } = useI18nStore();
    const productInfo = {
        productName: "Maggi",
        productId: "03298",
        category: "Instant Food",
        thresholdValue: "304",
        supplier: "LinoFlap",
        supplierContact: "9797979797",
        openingStock: "32",
        remainingStock: "34",
        onTheWay: "15",
    };
    const supplyData: Array<SupplyInfo> = [
        { storeName: "Landers", stockInHand: 10 },
        { storeName: "SM", stockInHand: 10 },
        { storeName: "Super 8", stockInHand: 10 },
        { storeName: "S&R", stockInHand: 10 },
        { storeName: "Save More", stockInHand: 10 },
        { storeName: "Save More", stockInHand: 10 },
        { storeName: "Save More", stockInHand: 10 },
        { storeName: "Save More", stockInHand: 10 },
        { storeName: "Save More", stockInHand: 10 },
        { storeName: "Save More", stockInHand: 10 },
        { storeName: "Save More", stockInHand: 10 },
        { storeName: "Save More", stockInHand: 10 },
    ];
    const column: ColumnDef<SupplyInfo>[] = [
        {
            accessorKey: "storeName",
            header: StoreNamei18n[locale],
        },
        {
            accessorKey: "stockInHand",
            header: StockInHandi18n[locale],
        },
    ];
    return (
        <div className="flex">
            <div className="gap- flex w-1/3 flex-col p-4">
                <h1 className="font-bold">{PrimaryDetailsi18n[locale]}</h1>
                <div className="flex flex-col gap-4 p-3">
                    <div className="flex flex-row items-center gap-28 p-1">
                        <h1 className="font-base w- w-[200px] text-lg text-gray-600">
                            {ProductIDi18n[locale]}
                        </h1>
                        <p className="font-semibold">
                            {productInfo.openingStock}
                        </p>
                    </div>
                    <div className="flex flex-row items-center gap-28 p-1">
                        <h1 className="font-base w- w-[200px] text-lg text-gray-600">
                            {ProductIDi18n[locale]}
                        </h1>
                        <p className="font-semibold">
                            {productInfo.openingStock}
                        </p>
                    </div>
                    <div className="flex flex-row items-center gap-28 p-1">
                        <h1 className="font-base w- w-[200px] text-lg text-gray-600">
                            {Categoryi18n[locale]}
                        </h1>
                        <p className="font-semibold">
                            {productInfo.openingStock}
                        </p>
                    </div>
                    <div className="flex flex-row items-center gap-28 p-1">
                        <h1 className="font-base w- w-[200px] text-lg text-gray-600">
                            {Expiryi18n[locale]}
                        </h1>
                        <p className="font-semibold">
                            {productInfo.openingStock}
                        </p>
                    </div>
                </div>
                <h1 className="font-bold">{SupplierDetailsi18n[locale]}</h1>
                <div className="flex flex-col gap-4 p-3">
                    <div className="flex flex-row items-center gap-28 p-1">
                        <h1 className="font-base w- w-[200px] text-lg text-gray-600">
                            {SupplierDetailsi18n[locale]}
                        </h1>
                        <p className="font-semibold">{productInfo.supplier}</p>
                    </div>
                    <div className="flex flex-row items-center gap-28 p-1">
                        <h1 className="font-base w- w-[200px] text-lg text-gray-600">
                            {Contacti18n[locale]}
                        </h1>
                        <p className="font-semibold">
                            {productInfo.supplierContact}
                        </p>
                    </div>
                </div>
            </div>
            <div className="flex h-[34.8125rem] w-1/3 flex-col gap-6 border-r p-4">
                <h1 className="font-bold">{}</h1>
                <DataTable
                    data={supplyData}
                    columns={column}
                    pagination={true}
                    pageSize={7}
                    filtering={true}
                    coloumnToFilter="storeName"
                />
            </div>
            <div className="flex w-1/3 flex-col items-center gap-6 p-4">
                <Image
                    alt="productImg"
                    src="https://placehold.co/300x300"
                    width="250"
                    height="250"
                    unoptimized={true}
                />
                <div className="flex flex-col gap-4">
                    <div className="flex flex-row items-center justify-between gap-28">
                        <h1 className="text-lg font-medium text-gray-600">
                            {OpeningStocksi18n[locale]}
                        </h1>
                        <p className="font-semibold">
                            {productInfo.openingStock}
                        </p>
                    </div>
                    <div className="flex flex-row items-center justify-between gap-28">
                        <h1 className="text-lg font-medium text-gray-600">
                            {RemainingStocksi18n[locale]} 
                        </h1>
                        <p className="font-semibold">
                            {productInfo.remainingStock}
                        </p>
                    </div>
                    <div className="flex flex-row items-center justify-between gap-28">
                        <h1 className="text-lg font-medium text-gray-600">
                            {ThresholStockValuei18n[locale]}
                        </h1>
                        <p className="font-semibold">
                            {productInfo.thresholdValue}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductView;
