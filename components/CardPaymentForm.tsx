import React, { useState } from "react";
import Cards, { Focused } from "react-credit-cards-2";
import { Input } from "./ui/input";
import "react-credit-cards-2/dist/es/styles-compiled.css";
import { Button } from "./ui/button";
import { useI18nStore } from "@/store/usei18n";

interface State {
    number: string;
    expiry: string;
    cvc: string;
    name: string;
    focus: Focused | undefined; // Update the type of focus to be Focused | undefined
}
export default function PaymentForm({
    onSubmit,
}: {
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
    const [state, setState] = useState<State>({
        number: "",
        expiry: "",
        cvc: "",
        name: "",
        focus: "",
    });
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === "number") {
            setState((prev) => ({
                ...prev,
                number: handleCreditCardInput(value),
            }));
        } else if (name === "expiry") {
            setState((prev) => ({ ...prev, expiry: handleExpiryInput(value) }));
        } else if (name === "cvc") {
            setState((prev) => ({ ...prev, cvc: handleCVCInput(value) }));
        } else {
            setState((prev) => ({ ...prev, [name]: value }));
        }
    };

    const {
        locale,
        CardNumberi18n,
        Namei18n,
        ValidThrui18n
    } = useI18nStore();

    const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        setState((prev) => ({ ...prev, focus: e.target.name as Focused }));
    };
    function handleCreditCardInput(input: string) {
        let cleanedInput = input.replace(/\D/g, "");
        let limitedInput = cleanedInput.slice(0, 16);
        let formattedInput = limitedInput.replace(/(\d{4})/g, "$1 ");
        return formattedInput.trim();
    }
    function handleExpiryInput(input: string) {
        let cleanedInput = input.replace(/\D/g, "");
        let limitedInput = cleanedInput.slice(0, 4);
        let formattedInput = limitedInput.replace(/(\d{2})(\d{0,2})/, "$1/$2");
        return formattedInput.trim();
    }
    function handleCVCInput(input: string) {
        let cleanedInput = input.replace(/\D/g, "");
        let limitedInput = cleanedInput.slice(0, 4);
        return limitedInput;
    }
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
                <Cards
                    number={state.number}
                    expiry={state.expiry}
                    cvc={state.cvc}
                    name={state.name}
                    focused={state.focus}
                />
                <form
                    onSubmit={onSubmit}
                    className="flex w-80 flex-col gap-4"
                    id="payment-form"
                >
                    <Input
                        name="number"
                        required
                        placeholder={CardNumberi18n[locale]}
                        value={state.number}
                        onChange={handleInputChange}
                        onFocus={handleInputFocus}
                    />
                    <Input
                        className="capitalize"
                        name="name"
                        required
                        placeholder={Namei18n[locale]}
                        value={state.name}
                        onChange={handleInputChange}
                        onFocus={handleInputFocus}
                    />
                    <div className="flex gap-4">
                        <Input
                            className="w-2/3"
                            name="expiry"
                            required
                            placeholder={ValidThrui18n[locale]}
                            value={state.expiry}
                            onChange={handleInputChange}
                            onFocus={handleInputFocus}
                        />
                        <Input
                            className="w-1/3"
                            type="number"
                            required
                            name="cvc"
                            placeholder="CVC/CVV"
                            value={state.cvc}
                            onChange={handleInputChange}
                            onFocus={handleInputFocus}
                        />
                    </div>
                </form>
            </div>
            <Button form="payment-form" className="ml-auto w-max" type="submit">
                Submit
            </Button>
        </div>
    );
}
