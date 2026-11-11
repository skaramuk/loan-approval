import type { Band } from "@/components/prediction/decision-badge";
import type { Factor } from "@/components/prediction/factor-bars";
import { HATALAR } from "@/lib/metinler";
import { createClient } from "@/lib/supabase/client";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

export type NumericFieldSchema = {
  min: number;
  max: number;
  integer: boolean;
  typical_min: number;
  typical_max: number;
};

export type MetricSet = {
  n: number;
  positive_rate: number;
  roc_auc: number;
  pr_auc: number;
  f1: number;
  precision: number;
  recall: number;
  brier: number;
};

export type ModelInfo = {
  model_version: string;
  algorithm: string;
  trained_at: string;
  threshold: number;
  metrics: { overall: MetricSet; no_default: MetricSet };
  fields: {
    numeric: Record<string, NumericFieldSchema>;
    categorical: Record<string, string[]>;
    boolean: string[];
    min_age_experience_gap: number;
  };
  training_rows: number;
  excluded_features: string[];
};

export type PredictionRequest = {
  person_age: number;
  person_education: string;
  person_income: number;
  person_emp_exp: number;
  person_home_ownership: string;
  loan_amnt: number;
  loan_intent: string;
  loan_int_rate: number;
  cb_person_cred_hist_length: number;
  credit_score: number;
  previous_loan_defaults_on_file: boolean;
};

export type Prediction = {
  id: string;
  created_at: string;
  model_version: string;
  approved: boolean;
  probability: number;
  threshold: number;
  band: Band;
  factors: Array<Factor & { feature: string }>;
  low_confidence_fields: string[];
};

export type PredictionDetail = Prediction & {
  input: PredictionRequest & { loan_percent_income: number };
};

export type PredictionListItem = {
  id: string;
  created_at: string;
  loan_amnt: number;
  loan_intent: string;
  probability: number;
  threshold: number;
  approved: boolean;
  band: Band;
};

export type PredictionList = {
  items: PredictionListItem[];
  total: number;
  page: number;
  page_size: number;
};

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details: Array<{ field: string; message: string }> = [],
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function accessToken(): Promise<string> {
  const { data } = await createClient().auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new ApiError(401, "unauthorized", HATALAR.oturum);
  return token;
}

async function request<T>(path: string, init: RequestInit = {}, auth = true): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body) headers.set("Content-Type", "application/json");
  if (auth) headers.set("Authorization", `Bearer ${await accessToken()}`);

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...init, headers });
  } catch {
    throw new ApiError(0, "network_error", HATALAR.baglanti);
  }

  if (response.status === 204) return undefined as T;

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const error = body?.error;
    throw new ApiError(
      response.status,
      error?.code ?? "unknown_error",
      error?.message ?? HATALAR.genel,
      error?.details ?? [],
    );
  }
  return body as T;
}

export const api = {
  model: () => request<ModelInfo>("/api/v1/model", {}, false),

  createPrediction: (payload: PredictionRequest) =>
    request<Prediction>("/api/v1/predictions", { method: "POST", body: JSON.stringify(payload) }),

  listPredictions: (params: { page?: number; pageSize?: number; approved?: boolean }) => {
    const query = new URLSearchParams({
      page: String(params.page ?? 1),
      page_size: String(params.pageSize ?? 10),
    });
    if (params.approved !== undefined) query.set("approved", String(params.approved));
    return request<PredictionList>(`/api/v1/predictions?${query}`);
  },

  getPrediction: (id: string) => request<PredictionDetail>(`/api/v1/predictions/${id}`),

  deletePrediction: (id: string) =>
    request<void>(`/api/v1/predictions/${id}`, { method: "DELETE" }),

  deleteAllPredictions: () =>
    request<{ deleted: number }>("/api/v1/me/predictions", { method: "DELETE" }),
};

export const queryKeys = {
  model: ["model"] as const,
  predictions: ["predictions"] as const,
  predictionList: (params: object) => ["predictions", "list", params] as const,
  prediction: (id: string) => ["predictions", "detail", id] as const,
};
