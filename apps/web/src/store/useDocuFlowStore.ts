import { create } from "zustand";
import type { DocuFlowUIState } from "@docuflow/types";

export const useDocuFlowStore = create<DocuFlowUIState>((set) => ({
  activeFieldKey: null,
  setActiveFieldKey: (key) => set({ activeFieldKey: key }),
}));
