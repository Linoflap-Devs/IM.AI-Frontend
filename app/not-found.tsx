import Image from "next/image";
import Link from "next/link";
import React from "react";

function notfound() {
    return (
        <div className="my-auto flex h-full flex-col items-center justify-center gap-5">
            <Image
            className="mt-20"
                alt="notfound"
                src={"/notFound.png"}
                width="450"
                height="400"
            />
            <div>
                <h1 className="text-center text-6xl font-extrabold">404</h1>
                <p className="text-2xl font-bold">Page Not Found</p>
            </div>
            <p className="text-xl font-semibold">
                Sorry, we were unable to find that page
            </p>
            <p className="text-xl">
                Start from{" "}
                <Link className="underline" href="/home/dashboard">
                    Home page
                </Link>
            </p>
        </div>
    );
}

export default notfound;
