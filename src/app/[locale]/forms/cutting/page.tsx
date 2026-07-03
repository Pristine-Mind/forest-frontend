"use client";

import { useState, useEffect } from "react";
import { CuttingRegisterForm } from "@/components/forms/CuttingRegisterForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useListForestBlocks, useListSpecies } from "@/lib/api";
import { 
  createCuttingRegister, 
  type CuttingRegisterPayload,
  listCuttingRegisters,
  type CuttingRegisterResponse,
  exportCuttingRegisterPDF,
  downloadPDF,
} from "@/lib/api-forms";
import { FileDown } from "lucide-react";
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

export default function CuttingRegistersPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [registers, setRegisters] = useState<CuttingRegisterResponse[]>([]);
  const [species, setSpecies] = useState<Species[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoadingRegisters, setIsLoadingRegisters] = useState(true);

  // Fetch blocks and species from API
  const { data: blocksData, isLoading: blocksLoading, isError: blocksError } = useListForestBlocks();
  const { data: speciesData, isLoading: speciesLoading, isError: speciesError } = useListSpecies();

  useEffect(() => {
    loadRegisters();
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

  const loadRegisters = async () => {
    try {
      setIsLoadingRegisters(true);
      const data = await listCuttingRegisters();
      setRegisters(data.results);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load cutting registers",
        variant: "destructive",
      });
    } finally {
      setIsLoadingRegisters(false);
    }
  };

  const handleSubmit = async (data: CuttingRegisterPayload) => {
    try {
      setIsLoading(true);
      await createCuttingRegister(data);
      toast({
        title: "Success",
        description: "Cutting register created successfully",
      });
      setShowForm(false);
      loadRegisters();
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = async (id: number, formNumber: string) => {
    try {
      const blob = await exportCuttingRegisterPDF(id);
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
        <h1 className="text-3xl font-bold">Cutting Registers</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Create New Register"}
        </Button>
      </div>

      {showForm && (
        <CuttingRegisterForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          species={species}
          blocks={blocks}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Registers</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingRegisters ? (
            <p>Loading registers...</p>
          ) : registers.length === 0 ? (
            <p className="text-gray-500">No cutting registers yet. Create one to get started.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Form Number</TableHead>
                    <TableHead>Register Date</TableHead>
                    <TableHead>District</TableHead>
                    <TableHead>Municipality</TableHead>
                    <TableHead>Block</TableHead>
                    <TableHead>Total Volume (m³)</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registers.map((register) => (
                    <TableRow key={register.id}>
                      <TableCell className="font-medium">{register.form_number}</TableCell>
                      <TableCell>{register.register_date}</TableCell>
                      <TableCell>{register.district}</TableCell>
                      <TableCell>{register.municipality}</TableCell>
                      <TableCell>{register.block_name}</TableCell>
                      <TableCell>{register.total_volume.toFixed(3)}</TableCell>
                      <TableCell>{register.item_count}</TableCell>
                      <TableCell className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleExportPDF(register.id, register.form_number)}
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
