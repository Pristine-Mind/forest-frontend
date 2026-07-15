"use client";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { useListTreeCounts } from "@/lib/api";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuthStore, WRITE_ROLES } from "@/stores/auth-store";
import { useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function TreeCountList() {
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const { data, isLoading } = useListTreeCounts({ 
    limit, 
    offset 
  });
  const { can } = useAuthStore();

  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setOffset((newPage - 1) * limit);
    }
  };

  const handleLimitChange = (value: string) => {
    const newLimit = parseInt(value);
    setLimit(newLimit);
    setOffset(0); // Reset to first page when changing limit
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tree Count Register</h1>
          <p className="text-muted-foreground mt-2">Baseline and remaining tree counts by species and block.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/forest">Back to Forest Resources</Link>
          </Button>
          {can(WRITE_ROLES) && (
            <Button asChild>
              <Link href="/forest/tree-counts/new">Add Entry</Link>
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Species</TableHead>
                    <TableHead>Block</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Harvested</TableHead>
                    <TableHead className="text-right">Remaining</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.results.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>{t.species_name}</TableCell>
                      <TableCell>{t.block_name ?? "All blocks"}</TableCell>
                      <TableCell className="text-right">{t.total_count}</TableCell>
                      <TableCell className="text-right">{t.harvested_count}</TableCell>
                      <TableCell className="text-right">{t.remaining_count}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/forest/tree-counts/${t.id}`}>View</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!data?.results || data.results.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        No tree count entries found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {totalCount > 0 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Rows per page:</span>
                    <Select value={String(limit)} onValueChange={handleLimitChange}>
                      <SelectTrigger className="w-[70px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-muted-foreground ml-2">
                      Showing {offset + 1} to {Math.min(offset + limit, totalCount)} of {totalCount} entries
                    </span>
                  </div>

                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(currentPage - 1);
                          }}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>

                      {getPageNumbers().map((pageNum, index) => (
                        <PaginationItem key={index}>
                          {pageNum === 'ellipsis' ? (
                            <PaginationEllipsis />
                          ) : (
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                handlePageChange(pageNum as number);
                              }}
                              isActive={pageNum === currentPage}
                            >
                              {pageNum}
                            </PaginationLink>
                          )}
                        </PaginationItem>
                      ))}

                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(currentPage + 1);
                          }}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function Page() {
  return (
    <AuthGuard>
      <AppLayout>
        <TreeCountList />
      </AppLayout>
    </AuthGuard>
  );
}
