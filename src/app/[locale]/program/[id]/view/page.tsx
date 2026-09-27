"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { Link } from "@/i18n/routing";
import { useGetProgram } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useAuthStore, WRITE_ROLES } from "@/stores/auth-store";
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Pencil,
} from "lucide-react";
import { formatDateNepali } from "@/lib/nepali-date-format";

function formatDate(value?: string | null) {
  if (!value) return "—";
  try {
    return formatDateNepali(value, "long");
  } catch {
    return "—";
  }
}

const AUTOPLAY_MS = 4000;

function ProgramGallery({
  images,
  title,
}: {
  images: { id: number; image_url: string; caption?: string; order: number }[];
  title: string;
}) {
  const t = useTranslations("programs");
  const sorted = [...images].sort((a, b) => a.order - b.order);
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goPrev = useCallback(() => {
    setIndex((i) => (i === 0 ? sorted.length - 1 : i - 1));
  }, [sorted.length]);

  const goNext = useCallback(() => {
    setIndex((i) => (i === sorted.length - 1 ? 0 : i + 1));
  }, [sorted.length]);

  useEffect(() => {
    if (sorted.length <= 1 || isPaused) return;
    const timer = setInterval(goNext, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [sorted.length, goNext, isPaused]);

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 h-72 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
        <ImageIcon className="h-8 w-8 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          {t("noImages") || "No images added"}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        className="relative w-full rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <img
          key={sorted[index].id}
          src={sorted[index].image_url}
          alt={sorted[index].caption || title}
          className="w-full h-auto max-h-[480px] object-contain animate-fade-in"
        />

        {sorted.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 z-10"
              aria-label={t("previousImage") || "Previous image"}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 z-10"
              aria-label={t("nextImage") || "Next image"}
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {sorted.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`${t("goToSlide") || "Go to slide"} ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? "w-5 bg-white" : "w-1.5 bg-white/50"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {sorted[index]?.caption && (
        <p className="text-sm text-muted-foreground text-center">
          {sorted[index].caption}
        </p>
      )}

      {sorted.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sorted.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setIndex(i)}
              className={`flex-shrink-0 rounded-md overflow-hidden border-2 transition-colors ${
                i === index ? "border-primary" : "border-transparent"
              }`}
            >
              <img
                src={img.image_url}
                alt=""
                className="h-14 w-14 object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ViewProgram({ programId }: { programId: number }) {
  const t = useTranslations("programs");
  const { data: program, isLoading } = useGetProgram(programId);
  const { can } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  if (!program) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">{t("notFound") || "Program not found"}</p>
        <Button variant="outline" size="sm" asChild className="mt-4">
          <Link href="/program">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("backToPrograms") || "Back to programs"}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/program">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("backToPrograms") || "Back to programs"}
          </Link>
        </Button>

        {can(WRITE_ROLES) && (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/program/${program.id}/edit`}>
              <Pencil className="h-4 w-4 mr-2" />
              {t("edit") || "Edit"}
            </Link>
          </Button>
        )}
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">{program.title}</h1>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground mt-2">
          <CalendarDays className="h-4 w-4" />
          {formatDate(program.date)}
        </p>
      </div>

      <ProgramGallery images={program.images || []} title={program.title} />

      {program.description && (
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-sm font-medium text-muted-foreground mb-2">
              {t("descriptionLabel") || "Description"}
            </h2>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {program.description}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function Page() {
  const params = useParams();
  const programId = Number(params.id);

  return (
    <AuthGuard>
      <AppLayout>
        <ViewProgram programId={programId} />
      </AppLayout>
    </AuthGuard>
  );
}
