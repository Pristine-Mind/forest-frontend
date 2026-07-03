import { customFetch } from "./api/custom-fetch";

export interface SurveyFormPayload {
  form_number: string;
  survey_date: string;
  block: number;
  district: string;
  municipality: string;
  ward_number: number;
  plot_number: number;
  forest_category: string;
  community_representative: string;
  forest_officer: string;
  notes?: string;
  tree_items_data: Array<{
    serial_number: number;
    species: number;
    girth_cm: number;
    height_m: number;
    volume_cubic_m: number;
    fuelwood_volume_cubic_m: number;
    wood_type: "timber" | "fuelwood";
    remarks?: string;
  }>;
}

export interface CuttingRegisterPayload {
  form_number: string;
  register_date: string;
  block: number;
  zone: string;
  district: string;
  municipality: string;
  ward_number: number;
  forest_classification: string;
  block_plot_name: string;
  block_plot_type: string;
  cutting_location: string;
  community_representative_name: string;
  forest_officer_name: string;
  notes?: string;
  cutting_items_data: Array<{
    serial_number: number;
    entry_time: string;
    plot_number: string;
    quota_number: string;
    species: number;
    size_measurement: string;
    volume_cubic_m: number;
    comments?: string;
    remarks?: string;
  }>;
}

export interface SurveyFormResponse {
  id: number;
  form_number: string;
  survey_date: string;
  block: number;
  block_name: string;
  district: string;
  municipality: string;
  ward_number: number;
  plot_number: number;
  forest_category: string;
  community_representative: string;
  community_representative_sign_date?: string;
  forest_officer: string;
  forest_officer_sign_date?: string;
  tree_items: Array<{
    id: number;
    serial_number: number;
    species: number;
    species_name: string;
    girth_cm: string;
    height_m: string;
    volume_cubic_m: string;
    fuelwood_volume_cubic_m: string;
    wood_type: string;
    remarks: string;
    created_at: string;
    updated_at: string;
  }>;
  total_volume: number;
  total_fuelwood: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface CuttingRegisterResponse {
  id: number;
  form_number: string;
  register_date: string;
  block: number;
  block_name: string;
  zone: string;
  district: string;
  municipality: string;
  ward_number: number;
  forest_classification: string;
  block_plot_name: string;
  block_plot_type: string;
  cutting_location: string;
  community_representative_name: string;
  community_representative_position?: string;
  community_representative_sign_date?: string;
  forest_officer_name: string;
  forest_officer_position?: string;
  forest_officer_sign_date?: string;
  cutting_items: Array<{
    id: number;
    serial_number: number;
    entry_time: string;
    plot_number: string;
    quota_number: string;
    species: number;
    species_name: string;
    size_measurement: string;
    volume_cubic_m: string;
    comments: string;
    remarks: string;
    created_at: string;
    updated_at: string;
  }>;
  total_volume: number;
  item_count: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

// Survey Forms API
export async function createSurveyForm(data: SurveyFormPayload): Promise<SurveyFormResponse> {
  return customFetch("/api/v1/survey-forms/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getSurveyForm(id: number): Promise<SurveyFormResponse> {
  return customFetch(`/api/v1/survey-forms/${id}/`, {
    method: "GET",
  });
}

export async function listSurveyForms(params?: {
  block?: number;
  survey_date?: string;
  search?: string;
}): Promise<{ results: SurveyFormResponse[]; count: number }> {
  const query = new URLSearchParams();
  if (params?.block) query.append("block", params.block.toString());
  if (params?.survey_date) query.append("survey_date", params.survey_date);
  if (params?.search) query.append("search", params.search);

  return customFetch(`/api/v1/survey-forms/?${query.toString()}`, {
    method: "GET",
  });
}

export async function updateSurveyForm(id: number, data: Partial<SurveyFormPayload>): Promise<SurveyFormResponse> {
  return customFetch(`/api/v1/survey-forms/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteSurveyForm(id: number): Promise<void> {
  return customFetch(`/api/v1/survey-forms/${id}/`, {
    method: "DELETE",
  });
}

export async function exportSurveyFormPDF(id: number): Promise<Blob> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/survey-forms/${id}/pdf/`,
    {
      method: "GET",
      headers: {
        Authorization: `Token ${localStorage.getItem("auth_token") || ""}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to export PDF: ${response.statusText}`);
  }

  return response.blob();
}

// Cutting Registers API
export async function createCuttingRegister(data: CuttingRegisterPayload): Promise<CuttingRegisterResponse> {
  return customFetch("/api/v1/cutting-registers/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getCuttingRegister(id: number): Promise<CuttingRegisterResponse> {
  return customFetch(`/api/v1/cutting-registers/${id}/`, {
    method: "GET",
  });
}

export async function listCuttingRegisters(params?: {
  block?: number;
  register_date?: string;
  search?: string;
}): Promise<{ results: CuttingRegisterResponse[]; count: number }> {
  const query = new URLSearchParams();
  if (params?.block) query.append("block", params.block.toString());
  if (params?.register_date) query.append("register_date", params.register_date);
  if (params?.search) query.append("search", params.search);

  return customFetch(`/api/v1/cutting-registers/?${query.toString()}`, {
    method: "GET",
  });
}

export async function updateCuttingRegister(id: number, data: Partial<CuttingRegisterPayload>): Promise<CuttingRegisterResponse> {
  return customFetch(`/api/v1/cutting-registers/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteCuttingRegister(id: number): Promise<void> {
  return customFetch(`/api/v1/cutting-registers/${id}/`, {
    method: "DELETE",
  });
}

export async function exportCuttingRegisterPDF(id: number): Promise<Blob> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/cutting-registers/${id}/pdf/`,
    {
      method: "GET",
      headers: {
        Authorization: `Token ${localStorage.getItem("auth_token") || ""}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to export PDF: ${response.statusText}`);
  }

  return response.blob();
}

// Helper function to download PDF
export function downloadPDF(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
