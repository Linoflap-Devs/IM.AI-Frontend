import Login from "@/components/Login";
import Image from "next/image";
import Providers from "./util/Providers";
export default function Home() {
    return (
        <main className="flex h-screen flex-row items-center bg-personal-bg-color">
            <Providers>
                <div className="flex h-screen w-1/2 flex-col items-center justify-center gap-8">
                    <Image
                        src={"/imai.png"}
                        alt="im.cart logo"
                        height="550"
                        width="550"
                    />
                    <h1 className="text-6xl font-semibold text-personal-text-color">
                        IM.AI CART
                    </h1>
                </div>
                <div className="shadow- flex h-screen w-1/2 flex-col items-center justify-center bg-white shadow-md">
                    <Login />
                </div>
            </Providers>
        </main>
    );
}
