"use client";
import { Card } from "../ui/card";
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
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useI18nStore } from "@/store/usei18n";
import { useToast } from "../ui/use-toast";
import { useSession } from "next-auth/react";

const formSchema = z.object({
    email: z
        .string()
        .min(1, { message: "Email must contain a valid Email" })
        .max(50)
        .email(),
});

function ManageUser() {
    const session = useSession();
    const { toast } = useToast();
    const { locale, CreateOTAi18n, Emaili18n, Registeri18n } = useI18nStore();
    const [error, setError] = useState<any>();
    axios.defaults.headers.common[
        "Authorization"
    ] = `Bearer ${session.data?.token}`;
    const addOTU = useMutation({
        mutationFn: (newOTU: string) => {
            return axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/userClient/registerOTU`,
                {
                    email: newOTU,
                }
            );
        },
        onError: (e: any) => {
            if (e.request.response.includes("Duplicate Record")) {
                setError(["Email already in use"]);
            }
        },
        onSuccess: (data) => {
            console.log(data);
            toast({
                title: "Success",
                description: `Succesfully added new Temporary Account ${data.data.Email}`,
                duration: 3000,
            });
        },
    });
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
        },
    });
    // 2. Define a submit handler.
    async function onSubmit(values: z.infer<typeof formSchema>) {
        addOTU.mutate(values.email);
    }
    return (
        <div className="flex h-[80vh] items-center justify-center">
            <Card className="flex flex-col gap-4 p-5 px-6">
                <h1 className="text-center text-2xl font-semibold">
                    {CreateOTAi18n[locale]}
                </h1>
                {error && (
                    <div>
                        {error.map((item: any, index: number) => {
                            return (
                                <p
                                    key={index}
                                    className="text-center text-red-400"
                                >
                                    {item}
                                </p>
                            );
                        })}
                    </div>
                )}
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex flex-col gap-5"
                    >
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{Emaili18n[locale]}</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder={Emaili18n[locale]}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit">{Registeri18n[locale]}</Button>
                    </form>
                </Form>
            </Card>
        </div>
    );
}

export default ManageUser;
