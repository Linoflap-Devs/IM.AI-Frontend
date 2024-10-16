import React from "react";
import InvNavigation from "@/components/InvNavigation";
export default function layout({ children }: { children: React.ReactNode }) {

    
    return (
        <div>
            <InvNavigation />
            {children}
        </div>
    );
}
