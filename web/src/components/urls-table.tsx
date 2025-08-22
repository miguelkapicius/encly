"use client";

import { useEffect, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

type Item = {
  id: string;
  shortUrl: string;
  originalUrl: string;
  createdAt: Date;
  expiresAt: Date;
  clickCount: number;
  lastAccessed: Date;
};

const columns: ColumnDef<Item>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
  },
  {
    header: "Short URL",
    accessorKey: "shortUrl",
    cell: ({ row }) => (
      <Link
        href={row.getValue("shortUrl")}
        target="_blank"
        className="font-medium"
      >
        {row.getValue("shortUrl")}
      </Link>
    ),
  },
  {
    header: "Original URL",
    accessorKey: "originalUrl",
  },
  {
    header: "Creation date",
    accessorKey: "createdAt",
    cell: ({ row }) => (
      <div>{new Date(row.getValue("createdAt")).toLocaleDateString()}</div>
    ),
  },
  {
    header: "Expiration date",
    accessorKey: "expiresAt",
    cell: ({ row }) => (
      <Badge
        className={cn(
          new Date(row.getValue("expiresAt")) < new Date() &&
            "bg-muted-foreground/60 text-primary-foreground"
        )}
      >
        {new Date(row.getValue("expiresAt")).toLocaleDateString()}
      </Badge>
    ),
  },
  {
    header: () => <div className="text-right">Clicks</div>,
    accessorKey: "clickCount",
    cell: ({ row }) => {
      return <div className="text-right">{row.getValue("clickCount")}</div>;
    },
  },
];

export function UrlsTable() {
  const {
    data = [],
    isLoading,
    isError,
  } = useQuery<Item[]>({
    queryKey: ["links"],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/links`);
      const data: Item[] = await res.json();
      return data.slice(0, 5);
    },
    retry: false,
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
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
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        <TableFooter className="bg-transparent">
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={5}>Total</TableCell>
            <TableCell className="text-right">
              {data.reduce((total, item) => total + item.clickCount, 0)}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
      <p className="text-muted-foreground mt-4 text-center text-sm">
        Basic data table made with{" "}
        <a
          className="hover:text-foreground underline"
          href="https://tanstack.com/table"
          target="_blank"
          rel="noopener noreferrer"
        >
          TanStack Table
        </a>
      </p>
    </div>
  );
}
