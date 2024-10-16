import Inventory from "@/components/pages/Inventory";
import { notFound } from "next/navigation";
async function page() {
    return (
        <div className="flex flex-1">
            <Inventory />
        </div>
    );
}

export default page;
