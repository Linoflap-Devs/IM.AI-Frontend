export function capitalFirst(word: string) {
    return String(word).charAt(0).toUpperCase() + String(word).slice(1);
}
export function categoryColor(word: string, shade: number) {
    switch (word) {
        case "seasonal":
            return `bg-blue-${shade}`;
        case "clearance":
            return `bg-orange-${shade}`;
        case "percentage":
            return `bg-purple-${shade}`;
        default:
            return `bg-white`;
    }
}

export function removeItemInArray(index: number, array: Array<any>) {
    const newArr = [...array]; // Create a new array using spreading
    newArr.splice(index, 1);
    return newArr;
}

export function findLabelByValue(jsonArray: ComboBox[], searchValue: any) {
    for (let i = 0; i < jsonArray.length; i++) {
        if (jsonArray[i].value === searchValue) {
            return jsonArray[i].label;
        }
    }
    // If no match is found, you can return a default value or handle it as per your requirement.
    return null;
}

export function isBothFalse(a: boolean, b: boolean) {
    //if both boolean is false return false else return true
    return !a && !b ? false : true;
}

export function parseFormDataFromEvent(e: React.FormEvent<HTMLFormElement>) {
    const formData = new FormData(e.target as HTMLFormElement);
    return Array.from(formData.entries()).map(
        ([name, value]) => ({ productId: name, quantity: value })
    );
}

export function slowFetch() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
            return "slowDown";
        }, 4000);
    });
}