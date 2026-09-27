"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  useGetProgram,
  useUpdateProgram,
  useDeleteProgram,
  useCreateProgramImage,
  useDeleteProgramImage,
  ProgramImageResponse,
} from "@/lib/api";
import { X, ImagePlus, Loader2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PendingImage {
  file: File;
  previewUrl: string;
  caption: string;
}

function EditProgramForm({ programId }: { programId: number }) {
  const t = useTranslations("programs");
  const tCommon = useTranslations("common");
  const router = useRouter();

  const { data: program, isLoading } = useGetProgram(programId);
  const updateProgram = useUpdateProgram();
  const deleteProgram = useDeleteProgram();
  const createProgramImage = useCreateProgramImage();
  const deleteProgramImage = useDeleteProgramImage();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [existingImages, setExistingImages] = useState<ProgramImageResponse[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<number[]>([]);
  const [newImages, setNewImages] = useState<PendingImage[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pre-fill form once the program loads
  useEffect(() => {
    if (program) {
      setTitle(program.title);
      setDescription(program.description || "");
      setDate(program.date);
      setExistingImages(program.images || []);
    }
  }, [program]);

  const handleFilesSelected = (fileList: FileList | null) => {
    if (!fileList) return;
    const added: PendingImage[] = Array.from(fileList).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      caption: "",
    }));
    setNewImages((prev) => [...prev, ...added]);
  };

  const removeExistingImage = (id: number) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== id));
    setRemovedImageIds((prev) => [...prev, id]);
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const updateNewCaption = (index: number, caption: string) => {
    setNewImages((prev) =>
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
      await updateProgram.mutateAsync({
        id: programId,
        data: { title: title.trim(), description: description.trim() || undefined, date },
      });

      // Delete images removed in this session
      for (const id of removedImageIds) {
        await deleteProgramImage.mutateAsync({ id });
      }

      // Upload newly added images, continuing order after existing ones
      const startOrder = existingImages.length + 1;
      for (let i = 0; i < newImages.length; i++) {
        await createProgramImage.mutateAsync({
          programId,
          file: newImages[i].file,
          caption: newImages[i].caption || undefined,
          order: startOrder + i,
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

  const handleDeleteProgram = async () => {
    setIsDeleting(true);
    try {
      await deleteProgram.mutateAsync({ id: programId });
      router.push("/program");
    } catch (err) {
      setErrors({
        form: t("deleteError") || "Failed to delete program. Please try again.",
      });
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  if (!program) {
    return (
      <p className="text-center text-muted-foreground py-12">
        {t("notFound") || "Program not found"}
      </p>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t("editProgram") || "Edit program"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t("editProgramSubtitle") || "Update program details and photos"}
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
              {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="date">{t("dateLabel") || "Date"}</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              {errors.date && <p className="text-sm text-destructive">{errors.date}</p>}
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
            {existingImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {existingImages.map((img) => (
                  <div key={img.id} className="relative">
                    <img
                      src={img.image_url}
                      alt={img.caption || ""}
                      className="w-full h-28 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(img.id)}
                      className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full p-1"
                      aria-label={t("removeImage") || "Remove image"}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    {img.caption && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {img.caption}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

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

            {newImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {newImages.map((img, index) => (
                  <div key={index} className="space-y-1.5">
                    <div className="relative">
                      <img
                        src={img.previewUrl}
                        alt=""
                        className="w-full h-28 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full p-1"
                        aria-label={t("removeImage") || "Remove image"}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <Input
                      value={img.caption}
                      onChange={(e) => updateNewCaption(index, e.target.value)}
                      placeholder={t("captionPlaceholder") || "Caption (optional)"}
                      className="h-8 text-xs"
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {errors.form && <p className="text-sm text-destructive mt-4">{errors.form}</p>}

        <div className="flex items-center justify-between mt-6">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="destructive" disabled={isDeleting}>
                <Trash2 className="h-4 w-4 mr-2" />
                {t("deleteProgram") || "Delete program"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {t("deleteConfirmTitle") || "Delete this program?"}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {t("deleteConfirmDescription") ||
                    "This will permanently delete the program and all its photos. This action cannot be undone."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{tCommon("cancel") || "Cancel"}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteProgram}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t("deleting") || "Deleting..."}
                    </>
                  ) : (
                    t("confirmDelete") || "Delete"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/program`)}
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
                t("save") || "Save changes"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function Page() {
  const params = useParams();
  const programId = Number(params.id);

  return (
    <AuthGuard>
      <AppLayout>
        <EditProgramForm programId={programId} />
      </AppLayout>
    </AuthGuard>
  );
}
