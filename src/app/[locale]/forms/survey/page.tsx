"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { SurveyForm } from "@/components/forms/SurveyForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useListForestBlocks, useListSpecies } from "@/lib/api";
import { 
  createSurveyForm, 
  type SurveyFormPayload,
  listSurveyForms,
  type SurveyFormResponse,
  exportSurveyFormPDF,
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

interface Species {
  id: number;
  species_name: string;
}

interface Block {
  id: number;
  block_name: string;
}

export default function SurveyFormsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [forms, setForms] = useState<SurveyFormResponse[]>([]);
  const [species, setSpecies] = useState<Species[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoadingForms, setIsLoadingForms] = useState(true);

  // Fetch blocks and species from API
  const { data: blocksData, isLoading: blocksLoading, isError: blocksError } = useListForestBlocks();
  const { data: speciesData, isLoading: speciesLoading, isError: speciesError } = useListSpecies();

  useEffect(() => {
    loadForms();
  }, []);

  useEffect(() => {
    if (blocksData?.results) {
      setBlocks(blocksData.results);
    }
  }, [blocksData]);

  useEffect(() => {
    if (speciesData?.results) {
      setSpecies(speciesData.results);
    }
  }, [speciesData]);

  const loadForms = async () => {
    try {
      setIsLoadingForms(true);
      const data = await listSurveyForms();
      setForms(data.results);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load survey forms",
        variant: "destructive",
      });
    } finally {
      setIsLoadingForms(false);
    }
  };

  const handleSubmit = async (data: SurveyFormPayload) => {
    try {
      setIsLoading(true);
      await createSurveyForm(data);
      toast({
        title: "Success",
        description: "Survey form created successfully",
      });
      setShowForm(false);
      loadForms();
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = async (id: number, formNumber: string) => {
    try {
      const blob = await exportSurveyFormPDF(id);
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Survey Forms</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Create New Survey"}
        </Button>
      </div>

      {showForm && (
        <SurveyForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          species={species}
          blocks={blocks}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Forms</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingForms ? (
            <p>Loading forms...</p>
          ) : forms.length === 0 ? (
            <p className="text-gray-500">No survey forms yet. Create one to get started.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Form Number</TableHead>
                    <TableHead>Survey Date</TableHead>
                    <TableHead>District</TableHead>
                    <TableHead>Municipality</TableHead>
                    <TableHead>Block</TableHead>
                    <TableHead>Total Volume (m³)</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {forms.map((form) => (
                    <TableRow key={form.id}>
                      <TableCell className="font-medium">{form.form_number}</TableCell>
                      <TableCell>{form.survey_date}</TableCell>
                      <TableCell>{form.district}</TableCell>
                      <TableCell>{form.municipality}</TableCell>
                      <TableCell>{form.block_name}</TableCell>
                      <TableCell>{form.total_volume.toFixed(3)}</TableCell>
                      <TableCell>{form.tree_items.length}</TableCell>
                      <TableCell className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleExportPDF(form.id, form.form_number)}
                        >
                          <FileDown className="w-4 h-4" />
                        </Button>
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
