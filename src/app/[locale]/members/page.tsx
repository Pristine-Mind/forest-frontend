"use client";
import { useTranslations } from "next-intl";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { useListHouseholds } from "@/lib/api/members";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuthStore, WRITE_ROLES } from "@/stores/auth-store";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
}

function formatValue(value?: string | null) {
  if (!value) return "—";
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function HouseholdsList() {
  const t = useTranslations("members");
  const tCommon = useTranslations("common");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Calculate limit and offset based on page and pageSize
  const limit = pageSize;
  const offset = (page - 1) * pageSize;

  const { data, isLoading } = useListHouseholds({
    search: search || undefined,
    limit: limit,
    offset: offset,
  });

  const { can } = useAuthStore();

  const totalPages = data?.count ? Math.ceil(data.count / pageSize) : 0;
  const totalItems = data?.count || 0;

  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [search]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const renderPaginationItems = () => {
    const items = [];
    const maxVisible = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    // Previous button
    items.push(
      <PaginationItem key="prev">
        <PaginationPrevious 
          href="#" 
          onClick={(e) => { e.preventDefault(); handlePageChange(page - 1); }}
          className={page <= 1 ? "pointer-events-none opacity-50" : ""}
        />
      </PaginationItem>
    );

    // First page
    if (startPage > 1) {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink href="#" onClick={(e) => { e.preventDefault(); handlePageChange(1); }}>
            1
          </PaginationLink>
        </PaginationItem>
      );
      if (startPage > 2) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink 
            href="#" 
            onClick={(e) => { e.preventDefault(); handlePageChange(i); }}
            isActive={page === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink href="#" onClick={(e) => { e.preventDefault(); handlePageChange(totalPages); }}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Next button
    items.push(
      <PaginationItem key="next">
        <PaginationNext 
          href="#" 
          onClick={(e) => { e.preventDefault(); handlePageChange(page + 1); }}
          className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
        />
      </PaginationItem>
    );

    return items;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground mt-2">{t("subtitle")}</p>
        </div>
        {can(WRITE_ROLES) && (
          <Button asChild>
            <Link href="/members/new">{t("addHousehold")}</Link>
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <div className="flex gap-4">
        <div className="flex-1 max-w-sm relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("searchPlaceholder") || "Search by household name..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {search && (
          <Button 
            variant="outline" 
            onClick={() => setSearch("")}
          >
            {tCommon("clear") || "Clear"}
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {t("registeredHouseholds")}
            {totalItems > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({totalItems} {t("total") || "total"})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">{tCommon("loading")}</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("tableId")}</TableHead>
                      <TableHead>{t("tableHeadOfHousehold")}</TableHead>
                      <TableHead>{t("tableNameInEnglish")}</TableHead>
                      <TableHead>Photo</TableHead>
                      <TableHead>Citizenship No.</TableHead>
                      <TableHead>Contact Number</TableHead>
                      <TableHead>{t("tableTole")}</TableHead>
                      <TableHead>{t("tableWealthClass")}</TableHead>
                      <TableHead>Membership Type</TableHead>
                      <TableHead>Membership Status</TableHead>
                      <TableHead className="text-right">{t("tableMale")}</TableHead>
                      <TableHead className="text-right">{t("tableFemale")}</TableHead>
                      <TableHead className="text-right">{t("tableCattle")}</TableHead>
                      <TableHead className="text-right">{t("tableBuffalo")}</TableHead>
                      <TableHead className="text-right">{t("tableGoat")}</TableHead>
                      <TableHead>{t("tableEducation")}</TableHead>
                      <TableHead>{t("tableOccupation")}</TableHead>
                      <TableHead>{t("tableCasteEthnicity")}</TableHead>
                      <TableHead>{t("tableRegistrationDate")}</TableHead>
                      <TableHead>Date Joined</TableHead>
                      <TableHead>{t("tableEntryFeeType")}</TableHead>
                      <TableHead className="text-right">{t("tableEntryFeeDue")}</TableHead>
                      <TableHead>{t("tableStatus")}</TableHead>
                      <TableHead>{t("tableActions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.results?.map((h) => (
                      <TableRow key={h.id}>
                        <TableCell className="font-medium">{h.id}</TableCell>
                        <TableCell>{h.household_head_name}</TableCell>
                        <TableCell>{h.english_name || "—"}</TableCell>
                        <TableCell>
                          {h.photo ? (
                            <img src={h.photo} alt={h.household_head_name} className="w-12 h-12 rounded-full object-cover" />
                          ) : (
                            <span className="text-muted-foreground text-xs">No Photo</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{h.citizenship_no ?? "—"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{h.contact_number ?? "—"}</TableCell>
                        <TableCell>{h.tole || "—"}</TableCell>
                        <TableCell className="capitalize">{h.wealth_class}</TableCell>
                        <TableCell className="capitalize text-sm">{formatValue(h.membership_type)}</TableCell>
                        <TableCell className="capitalize text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            h.membership_status === "active" ? "bg-green-100 text-green-800" :
                            h.membership_status === "inactive" ? "bg-yellow-100 text-yellow-800" :
                            "bg-red-100 text-red-800"
                          }`}>
                            {formatValue(h.membership_status)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">{h.population_male}</TableCell>
                        <TableCell className="text-right">{h.population_female}</TableCell>
                        <TableCell className="text-right">{h.livestock_cattle}</TableCell>
                        <TableCell className="text-right">{h.livestock_buffalo}</TableCell>
                        <TableCell className="text-right">{h.livestock_goat}</TableCell>
                        <TableCell className="text-sm">{formatValue(h.education_level)}</TableCell>
                        <TableCell className="text-sm">{h.occupation || "—"}</TableCell>
                        <TableCell className="text-sm">{h.caste_ethnicity || "—"}</TableCell>
                        <TableCell className="text-sm">{formatDate(h.registration_date)}</TableCell>
                        <TableCell className="text-sm">{formatDate(h.date_joined)}</TableCell>
                        <TableCell className="text-sm capitalize">{h.entry_fee_type.replace(/_/g, " ")}</TableCell>
                        <TableCell className="text-right font-medium">रु {h.entry_fee_due}</TableCell>
                        <TableCell className="capitalize">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            h.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                          }`}>
                            {formatValue(h.status)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/members/${h.id}`}>{t("view")}</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!data?.results || data.results.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={22} className="text-center py-6 text-muted-foreground">
                          {search ? t("noSearchResults") || "No results found for your search" : t("empty")}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between flex-wrap gap-4">
                  <div className="text-sm text-muted-foreground">
                    {totalItems > 0 && (
                      <>
                        {t("showing") || "Showing"} {offset + 1} - {Math.min(offset + limit, totalItems)} {t("of") || "of"} {totalItems}
                      </>
                    )}
                  </div>
                  <Pagination>
                    <PaginationContent>
                      {renderPaginationItems()}
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
        <HouseholdsList />
      </AppLayout>
    </AuthGuard>
  );
}
