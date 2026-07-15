"use client";

import { useState, useEffect } from "react";
import { FellingRegisterForm } from "@/components/forms/FellingRegisterForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useListSpecies } from "@/lib/api";
import {
  createFellingRegister,
  type FellingRegisterPayload,
  listFellingRegisters,
  type FellingRegisterResponse,
  exportFellingRegisterPDF,
  downloadPDF,
} from "@/lib/api-forms";
import { FileDown, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

interface Species {
  id: number;
  species_name: string;
}

export default function FellingRegistersPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [registers, setRegisters] = useState<FellingRegisterResponse[]>([]);
  const [species, setSpecies] = useState<Species[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoadingRegisters, setIsLoadingRegisters] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Fetch species from API
  const { data: speciesData, isLoading: speciesLoading, isError: speciesError } = useListSpecies();

  useEffect(() => {
    loadRegisters();
  }, []);

  useEffect(() => {
    if (speciesData?.results) {
      setSpecies(speciesData.results);
    }
  }, [speciesData]);

  const loadRegisters = async () => {
    try {
      setIsLoadingRegisters(true);
      const data = await listFellingRegisters();
      setRegisters(data.results);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load felling registers",
        variant: "destructive",
      });
    } finally {
      setIsLoadingRegisters(false);
    }
  };

  const handleSubmit = async (data: FellingRegisterPayload) => {
    try {
      setIsLoading(true);
      await createFellingRegister(data);
      toast({
        title: "Success",
        description: "Felling register created successfully",
      });
      setShowForm(false);
      loadRegisters();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create felling register",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = async (id: number, formNumber: string) => {
    try {
      const blob = await exportFellingRegisterPDF(id);
      downloadPDF(blob, `${formNumber}.pdf`);
      toast({
        title: "Success",
        description: "PDF exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export PDF",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setDeletingId(id);
      // Note: You'll need to add deleteFellingRegister to api-forms if it doesn't exist
      toast({
        title: "Info",
        description: "Delete functionality will be available soon",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete register",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-2 mt-10 ml-10">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Felling Registers (अनुसूची-८)</h1>
        <Button onClick={() => setShowForm(!showForm)} data-testid="button-create-felling-register">
          {showForm ? "Cancel" : "Create New Register"}
        </Button>
      </div>

      {showForm && (
        <FellingRegisterForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          species={species}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Felling Registers</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingRegisters ? (
            <p className="text-muted-foreground">Loading felling registers...</p>
          ) : registers.length === 0 ? (
            <p className="text-muted-foreground">No felling registers yet. Create one to get started.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>District</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Entries</TableHead>
                    <TableHead>Sawing Deadline</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registers.map((register) => (
                    <TableRow key={register.id} data-testid={`row-felling-register-${register.id}`}>
                      <TableCell className="font-medium" data-testid={`cell-id-${register.id}`}>
                        #{register.id}
                      </TableCell>
                      <TableCell data-testid={`cell-district-${register.id}`}>
                        {register.district}
                      </TableCell>
                      <TableCell data-testid={`cell-location-${register.id}`}>
                        {register.felling_location || "—"}
                      </TableCell>
                      <TableCell data-testid={`cell-entries-${register.id}`}>
                        {register.entries?.length || 0}
                      </TableCell>
                      <TableCell data-testid={`cell-deadline-${register.id}`}>
                        {register.felling_sawing_deadline
                          ? new Date(register.felling_sawing_deadline).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell data-testid={`cell-created-${register.id}`}>
                        {new Date(register.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleExportPDF(register.id, `felling-register-${register.id}`)}
                          data-testid={`button-export-${register.id}`}
                        >
                          <FileDown className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              data-testid={`button-delete-${register.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Register?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the felling register for {register.district}. This action
                                cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(register.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}