"use client";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState, useLayoutEffect } from "react";
import { useSession } from "next-auth/react";

function Login() {
    const router = useRouter();
    const session = useSession();

    const [error, setError] = useState<string>("");
    // 1. Define your form.
    const formSchema = z.object({
        email: z
            .string()
            .min(1, { message: "Please enter a valid email address." })
            .max(50)
            .email(),
        password: z
            .string()
            .min(2, { message: "Password must contain a valid password." })
            .max(50),
        remember30: z.boolean().default(false).optional(),
    });
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
            remember30: false,
        },
    });
    // 2. Define a submit handler.
    async function onSubmit(values: z.infer<typeof formSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        try {
            const res = await signIn("credentials", {
                email: values.email,
                password: values.password,
                redirect: false,
            });
            if (res?.error) {
                setError("Invalid credentials. Please verify your details.");
            } else {
                router.push("/home/dashboard");
            }
        } catch (error) {
            console.log(error);
        }
    }
    function authenticate() {
        if (session.status === "authenticated") {
            router.push("/home/dashboard");
        } /* else {
            console.log("Not Authenticated");
        } */
    }
    useLayoutEffect(() => {
        authenticate();
        window.addEventListener("focus", authenticate);
        // Calls onFocus when the window first loads
        authenticate();
        // Specify how to clean up after this effect:
        return () => {
            window.removeEventListener("focus", authenticate);
        };
    }, [router, session]);
    return (
        <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-5">
                <h1 className="text-center text-5xl font-semibold">
                    Log in to your account
                </h1>
                <p className="text-center text-2xl">
                    Welcome back! Please enter your details.
                </p>
                {error && (
                    <p className="text-center text-sm font-semibold text-destructive">
                        {error}
                    </p>
                )}
            </div>
            <div className="flex flex-col gap-2">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex flex-col gap-5"
                    >
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem className="space-y-2">
                                    <FormLabel className="text-2xl" >Email</FormLabel>
                                    <FormControl>
                                        <Input className="text-2xl" placeholder="Email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem className="space-y-2">
                                    <FormLabel className="text-2xl" >Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            className="px-2 py-1 text-2xl" 
                                            type="password"
                                            placeholder="Password"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex flex-row items-center justify-between">
                            <div className="gap-1">
                                <FormField
                                    control={form.control}
                                    name="remember30"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center gap-1">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={
                                                        field.onChange
                                                    }
                                                />
                                            </FormControl>
                                            <FormLabel className="m-0 text-md hover:cursor-pointer">
                                                Remember for 30 days
                                            </FormLabel>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button variant="link" className="p-0 text-md">
                                Forgot Password
                            </Button>
                        </div>
                        <Button className="mx-auto w-full text-xl" type="submit" size={"lg"}>
                            <span className="py-5">Sign in</span>
                        </Button>
                    </form>
                </Form>
                {/*  <div className="mx-auto flex w-full items-center justify-evenly before:mr-4 before:block before:h-px before:flex-grow before:bg-stone-300 after:ml-4 after:block after:h-px after:flex-grow after:bg-stone-300">
                    or
                </div>
                <div className="flex flex-col gap-3">
                    <Button className="bg-white text-black" type="submit">
                        Sign in With Google
                    </Button>
                </div> */}
            </div>
            {/* <Button variant="link" className="p-0 text-center text-lg">
                Register Account
            </Button> */}
        </div>
    );
}

export default Login;
