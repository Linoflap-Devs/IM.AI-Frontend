"use client";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    SortingState,
    ColumnFiltersState,
    VisibilityState
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useI18nStore } from "@/store/usei18n";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    pagination?: boolean;
    pageSize?: number;
    resetSortBtn?: boolean;
    filtering?: boolean;
    coloumnToFilter?: string;
    visibility?: VisibilityState;
    isLoading?: boolean;
    searchPlaceholder?: string;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    pagination = false,
    pageSize = 10,
    resetSortBtn = false,
    filtering = false,
    coloumnToFilter = "",
    visibility = {},
    isLoading,
    searchPlaceholder = "Search",

}: DataTableProps<TData, TValue>) {
    const { locale, Reseti18n, Tablei18n, Searchi18n, Previousi18n, Nexti18n } =
        useI18nStore();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [hiddenColoumns, setHiddenColoumn] =
        useState<VisibilityState>(visibility);
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: {
                pageSize: pageSize,
            },
            columnVisibility: hiddenColoumns,
        },
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnFilters,
        },
        autoResetAll: false,
    });
    const currentPage = table.getState().pagination.pageIndex + 1;
    return (
        <div className={`flex flex-col gap-4 rounded-md pb-2`}>
            {(pagination || resetSortBtn || filtering) && (
                <div
                    className={`flex items-center gap-2 ${
                        resetSortBtn || filtering
                            ? "justify-between"
                            : "justify-end"
                    }`}
                >
                    {(resetSortBtn || filtering) && (
                        <div className="flex gap-2">
                            {false && (
                                <Button
                                    onClick={() => {
                                        table.resetSorting(true);
                                    }}
                                    variant={"destructive"}
                                >
                                    {`${Reseti18n[locale]} ${Tablei18n[locale]}`}
                                </Button>
                            )}
                            {filtering && (
                                <Input
                                    placeholder={
                                        Searchi18n[
                                            locale
                                        ] /* Add Search Column */
                                    }
                                    onChange={(event) => {
                                        return table
                                            .getColumn(coloumnToFilter)
                                            ?.setFilterValue(
                                                event.target.value
                                            );
                                    }}
                                    className="max-w-sm"
                                />
                            )}
                        </div>
                    )}
                    {pagination && (
                        <div className="flex items-center justify-end gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    table.previousPage();
                                }}
                                disabled={!table.getCanPreviousPage()}
                            >
                                {Previousi18n[locale]}
                            </Button>
                            {/* <span className="w-28 text-center">
                                {Pagei18n[locale]} {`${currentPage}`}{" "}
                                {Ofi18n[locale]} {table.getPageCount()}
                            </span> */}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    table.nextPage();
                                }}
                                disabled={!table.getCanNextPage()}
                            >
                                {Nexti18n[locale]}
                            </Button>
                        </div>
                    )}
                </div>
            )}
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow className="bg-gray-200" key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef
                                                      .header,
                                                  header.getContext()
                                              )}
                                    </TableHead>
                                );
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext()
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : isLoading ? (
                        <TableRow>
                            <TableCell
                                colSpan={columns.length}
                                className="h-56 text-center"
                            >
                                <Loader2
                                    size={40}
                                    className="mx-auto animate-spin"
                                />
                            </TableCell>
                        </TableRow>
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={columns.length}
                                className="h-24 text-center"
                            >
                                No results.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
