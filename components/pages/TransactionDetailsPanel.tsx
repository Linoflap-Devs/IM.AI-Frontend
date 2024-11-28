import { format } from "date-fns";

interface TransactionDetailsPanelProps {
    className?: string;
    refData: any[];
}

export function TransactionDetailsPanel({ className, refData }: TransactionDetailsPanelProps) {
    const data = refData[0];
    
    const statusStyle = (status: string) => {
        if (status == "Success") {
            return "bg-green-200 text-green-800";
        }
        
        if (status == "On-Going" || status == "Processing Payment") {
            return "bg-orange-200 text-orange-800";
        }

        if (status == "Cancelled") {
            return "bg-red-200 text-red-800"
        }
    }

    return (
        <div className={`border rounded h-min flex flex-col gap-4 p-4 ${className}`}>
            <span className="font-semibold text-xl">Transaction Details</span>
            <div className="flex flex-col gap-2">
                <div className="flex flex-row justify-between border-b pb-2">
                    <p className="">Reference Number</p>
                    <p className="font-semibold text-right">{data.ReferenceNumber}</p>
                </div>
                <div className="flex flex-row justify-between border-b pb-2 items-center">
                    <p className="">Status</p>
                    <p className={`font-semibold text-right rounded p-1 ${statusStyle(data.TransactionStatus)}`}>{data.TransactionStatus}</p>
                </div>
                <div className="flex flex-row justify-between border-b pb-2">
                    <p className="">Branch Name</p>
                    <p className="font-semibold text-right">{data.BranchName}</p>
                </div>
                <div className="flex flex-row justify-between">
                    <p className="">Transaction Date</p>
                    <p className="font-semibold text-right">{format(new Date(data.CreatedAt), "MMM dd, yyyy | HH:mm a")}</p>
                </div>
            </div>
        </div>
    )
}