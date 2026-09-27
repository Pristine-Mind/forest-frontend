"use client";
import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCreateProgram, useCreateProgramImage } from "@/lib/api";
import { X, Upload, ImagePlus, Loader2 } from "lucide-react";

interface PendingImage {
  file: File;
  previewUrl: string;
  caption: string;
}

function NewProgramForm() {
  const t = useTranslations("programs");
  const tCommon = useTranslations("common");
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [images, setImages] = useState<PendingImage[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createProgram = useCreateProgram();
  const createProgramImage = useCreateProgramImage();

  const handleFilesSelected = (fileList: FileList | null) => {
    if (!fileList) return;
    const newImages: PendingImage[] = Array.from(fileList).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      caption: "",
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const updateCaption = (index: number, caption: string) => {
    setImages((prev) =>
      prev.map((img, i) => (i === index ? { ...img, caption } : img))
    );
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = t("titleRequired") || "Title is required";
    if (!date) newErrors.date = t("dateRequired") || "Date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const program = await createProgram.mutateAsync({
        data: { title: title.trim(), description: description.trim() || undefined, date },
      });

      // Upload images sequentially, preserving order
      for (let i = 0; i < images.length; i++) {
        await createProgramImage.mutateAsync({
          programId: program.id,
          file: images[i].file,
          caption: images[i].caption || undefined,
          order: i + 1,
        });
      }

      router.push(`/program`);
    } catch (err) {
      setErrors({
        form: t("submitError") || "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t("addProgram") || "Add program"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t("addProgramSubtitle") || "Create a new committee program with photos"}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("details") || "Details"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">{t("titleLabel") || "Title"}</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("titlePlaceholder") || "e.g. Annual cleanup drive"}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="date">{t("dateLabel") || "Date"}</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              {errors.date && (
                <p className="text-sm text-destructive">{errors.date}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">{t("descriptionLabel") || "Description"}</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("descriptionPlaceholder") || "What was this program about?"}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">{t("images") || "Photos"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label
              htmlFor="image-upload"
              className="flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg py-8 cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
            >
              <ImagePlus className="h-6 w-6 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {t("uploadPrompt") || "Click to add photos"}
              </span>
              <input
                id="image-upload"
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                multiple
                className="hidden"
                onChange={(e) => handleFilesSelected(e.target.files)}
              />
            </label>

            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {images.map((img, index) => (
                  <div key={index} className="space-y-1.5">
                    <div className="relative">
                      <img
                        src={img.previewUrl}
                        alt=""
                        className="w-full h-28 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full p-1"
                        aria-label={t("removeImage") || "Remove image"}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <Input
                      value={img.caption}
                      onChange={(e) => updateCaption(index, e.target.value)}
                      placeholder={t("captionPlaceholder") || "Caption (optional)"}
                      className="h-8 text-xs"
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {errors.form && (
          <p className="text-sm text-destructive mt-4">{errors.form}</p>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/program")}
            disabled={isSubmitting}
          >
            {tCommon("cancel") || "Cancel"}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t("saving") || "Saving..."}
              </>
            ) : (
              t("save") || "Save program"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function Page() {
  return (
    <AuthGuard>
      <AppLayout>
        <NewProgramForm />
      </AppLayout>
    </AuthGuard>
  );
}
