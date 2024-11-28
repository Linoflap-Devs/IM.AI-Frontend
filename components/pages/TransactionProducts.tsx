import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../ui/data-table";
import { useI18nStore } from "@/store/usei18n";

interface TransacationProductsProps {
    data: any[],
    className?: string,
}

export function TransactionProducts({data, className}: TransacationProductsProps) {

    const {locale, CurrencyMarker } = useI18nStore();
    

    const columns: ColumnDef<any>[] = [
        {
            header: "Image",
            cell: ({  }) => {
                return (
                    <div className="h-[50px] w-[50px] bg-gray-200"></div>
                )
            }
        },
        {
            accessorKey: "Name",
            header: "Product Name",
        },
        {
            accessorKey: "Quantity",
            header: () => <div className="text-end">Quantity</div>,
            cell: ({ row }) => {
                return (
                    <div className="text-end">{row.getValue("Quantity")}</div>
                )
            }
        },
        {
            accessorKey: "Price",
            header: () => <div className="text-end">Price</div>,
            cell: ({ row }) => {
                return (
                    <div className="text-end">{CurrencyMarker[locale]}{parseInt(row.getValue("Price")).toFixed(2)}</div>
                )
            }
        },
    ]

    console.log(data);

    const totalPrice = data.reduce((total, item) => {
        return total + item.Price * item.Quantity;
    }, 0);

    return (
        <div className={`${className} flex flex-col gap-3`}>
            <div className={`border p-4 h-full rounded w-full flex flex-col gap-4`}>
                <span className="text-lg font-semibold">Items Bought</span>

                <div className="h-[630px] overflow-auto p-1">
                    <DataTable 
                        columns={columns} 
                        data={data || []} 
                        isLoading={data === null} 
                        pageSize={10}   
                        pagination={true}
                        filtering={true}
                        columnsToSearch={["Name"]}
                    />
                </div>
            </div>
            <div className="border p-4 h-full rounded w-full flex justify-between items-center">
                <div className="font-semibold text-lg">Total</div>
                <div className="font-semibold text-2xl">{CurrencyMarker[locale]}{totalPrice.toFixed(2)}{}</div>
            </div>
        </div>
    )
};