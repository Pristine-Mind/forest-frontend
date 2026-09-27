"use client";
import { useTranslations } from "next-intl";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { useListPrograms } from "@/lib/api";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore, WRITE_ROLES } from "@/stores/auth-store";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight, Image as ImageIcon, CalendarDays } from "lucide-react";
import { formatDateNepali } from "@/lib/nepali-date-format";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface ProgramImage {
  id: number;
  image_url: string;
  caption?: string;
  order: number;
}

interface Program {
  id: number;
  title: string;
  description?: string;
  date: string;
  images: ProgramImage[];
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  try {
    return formatDateNepali(value, "short");
  } catch {
    return "—";
  }
}

function ProgramCarousel({ images, title }: { images: ProgramImage[]; title: string }) {
  const t = useTranslations("programs");
  const [index, setIndex] = useState(0); 
  

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1.5 h-48 bg-muted rounded-t-lg">
        <ImageIcon className="h-6 w-6 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">{t("noImages") || "No images added"}</span>
      </div>
    );
  }

  const sorted = [...images].sort((a, b) => a.order - b.order);
  const current = sorted[index];

  const goPrev = () => setIndex((i) => (i === 0 ? sorted.length - 1 : i - 1));
  const goNext = () => setIndex((i) => (i === sorted.length - 1 ? 0 : i + 1));

  return (
    <div className="relative">
      <img
        src={current.image_url}
        alt={current.caption || title}
        className="w-full h-48 object-cover rounded-t-lg"
      />

      {sorted.length > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1"
            aria-label={t("previousImage") || "Previous image"}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={goNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1"
            aria-label={t("nextImage") || "Next image"}
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {sorted.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-1.5 rounded-full ${i === index ? "bg-white" : "bg-white/50"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ProgramsList() {
  const t = useTranslations("programs");
  const tCommon = useTranslations("common");
  const { can } = useAuthStore();
  const canWrite = can(WRITE_ROLES); 
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 9;

  const limit = pageSize;
  const offset = (page - 1) * pageSize;

  const { data, isLoading } = useListPrograms({
    search: search || undefined,
    limit,
    offset,
  });


  const programs = (data?.results ?? []) as Program[];
  const totalPages = data?.count ? Math.ceil(data.count / pageSize) : 0;
  const totalItems = data?.count || 0;

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

    items.push(
      <PaginationItem key="prev">
        <PaginationPrevious
          href="#"
          onClick={(e) => { e.preventDefault(); handlePageChange(page - 1); }}
          className={page <= 1 ? "pointer-events-none opacity-50" : ""}
        />
      </PaginationItem>
    );

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
          <h1 className="text-3xl font-bold tracking-tight">{t("title") || "Programs"}</h1>
          <p className="text-muted-foreground mt-2">
            {t("subtitle") || "Committee programs and activities"}
          </p>
        </div>
        {can(WRITE_ROLES) && (
          <Button asChild>
            <Link href="/program/new">{t("addProgram") || "Add program"}</Link>
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <div className="flex gap-4">
        <div className="flex-1 max-w-sm relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("searchPlaceholder") || "Search programs..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {search && (
          <Button variant="outline" onClick={() => setSearch("")}>
            {tCommon("clear") || "Clear"}
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">{tCommon("loading")}</div>
      ) : programs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {search
              ? t("noSearchResults") || "No results found for your search"
              : t("empty") || "No programs yet."}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program) => (
              <Card key={program.id} className="overflow-hidden pt-0">
                <ProgramCarousel images={program.images} title={program.title} />
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold truncate">
                    {program.title}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatDate(program.date)}
                  </p>
                </CardHeader>
                <CardContent className="pt-0">
                {program.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {program.description}
                    </p>
                )}
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link href={`/program/${program.id}/view`}>{t("view") || "View"}</Link>
                    </Button>
                    {canWrite && (
                      <Button variant="outline" size="sm" asChild className="flex-1">
                        <Link href={`/program/${program.id}`}>{t("edit") || "Edit"}</Link>
                      </Button>
                    )}
                </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between flex-wrap gap-4">
              <div className="text-sm text-muted-foreground">
                {totalItems > 0 && (
                  <>
                    {t("showing") || "Showing"} {offset + 1} -{" "}
                    {Math.min(offset + limit, totalItems)} {t("of") || "of"} {totalItems}
                  </>
                )}
              </div>
              <Pagination>
                <PaginationContent>{renderPaginationItems()}</PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <AuthGuard>
      <AppLayout>
        <ProgramsList />
      </AppLayout>
    </AuthGuard>
  );
}
