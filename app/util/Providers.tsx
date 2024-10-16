"use client";
import { SessionProvider } from "next-auth/react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(new QueryClient());
    return (
        <QueryClientProvider client={queryClient}>
            <SessionProvider>{children}</SessionProvider>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}

export default Providers;
