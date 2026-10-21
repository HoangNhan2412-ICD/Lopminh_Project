"use client";
import { useLocal } from "@/lib/local-store";
import type { StudentWorkflow } from "./templates";
const EMPTY: StudentWorkflow[] = [];
export const workflowKey = (profileId: string) => `lm:workflows:${profileId}`;
export function useWorkflows(profileId: string) { return useLocal<StudentWorkflow[]>(workflowKey(profileId), EMPTY); }
