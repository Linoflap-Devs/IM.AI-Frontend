import Header from "@/components/Header";
import NavBar from "@/components/NavBar";
import Providers from "../util/Providers";



export default function layout({ children }: { children: React.ReactNode }) {
    
    return (
        <div className="flex flex-row overflow-hidden">
            <Providers>
                <NavBar />
                <div className="flex h-screen w-full flex-col overflow-y-auto bg-personal-bg-color">
                    <Header />
                    {children}
                </div>
            </Providers>
        </div>
    );
}
