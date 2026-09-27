"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useListPrograms } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { CalendarDays, ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import { formatDateNepali } from "@/lib/nepali-date-format";

function formatDate(value?: string | null) {
  if (!value) return "—";
  try {
    return formatDateNepali(value, "short");
  } catch {
    return "—";
  }
}

const AUTOPLAY_MS = 4000;

export function LatestProgramWidget() {
  const t = useTranslations("dashboard.programs");
  const { data, isLoading } = useListPrograms({ limit: 1, offset: 0 });

  const program = data?.results?.[0];
  const images = program?.images
    ? [...program.images].sort((a, b) => a.order - b.order)
    : [];

  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goPrev = useCallback(() => {
    setIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  }, [images.length]);

  const goNext = useCallback(() => {
    setIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  }, [images.length]);

  useEffect(() => {
    setIndex(0);
  }, [program?.id]);

  useEffect(() => {
    if (images.length <= 1 || isPaused) return;
    const timer = setInterval(goNext, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [images.length, goNext, isPaused]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            {t("latestTitle") || "Latest program"}
          </CardTitle>
          <Link href="/program" className="text-xs text-primary hover:underline">
            {t("viewAll") || "View all"}
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner className="h-5 w-5" />
          </div>
        ) : !program ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            {t("empty") || "No programs yet."}
          </p>
        ) : (
          <div className="space-y-3">
            <div
              className="relative w-full rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {images.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-1.5 h-56">
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {t("noImages") || "No images added"}
                  </span>
                </div>
              ) : (
                <>
                  <img
                    key={images[index].id}
                    src={images[index].image_url}
                    alt={images[index].caption || program.title}
                    className="w-full h-auto max-h-[420px] object-contain animate-fade-in"
                  />

                  {images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={goPrev}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 z-10"
                        aria-label={t("previousImage") || "Previous image"}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={goNext}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 z-10"
                        aria-label={t("nextImage") || "Next image"}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>

                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                        {images.map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setIndex(i)}
                            aria-label={`${t("goToSlide") || "Go to slide"} ${i + 1}`}
                            className={`h-1.5 rounded-full transition-all ${
                              i === index ? "w-4 bg-white" : "w-1.5 bg-white/50"
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            <div>
              <Link href={`/program/${program.id}`} className="hover:underline">
                <p className="text-sm font-medium truncate">{program.title}</p>
              </Link>
              <p className="text-xs text-muted-foreground">{formatDate(program.date)}</p>
              {images[index]?.caption && (
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {images[index].caption}
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
