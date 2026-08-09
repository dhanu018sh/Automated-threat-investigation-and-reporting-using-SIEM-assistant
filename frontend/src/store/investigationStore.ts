import { create } from 'zustand';
import { Investigation } from '../types';

interface InvestigationState {
  investigations: Investigation[];
  activeInvestigation: Investigation | null;
  pendingApprovals: number;
  setInvestigations: (inv: Investigation[]) => void;
  setActiveInvestigation: (inv: Investigation | null) => void;
  setPendingApprovals: (count: number) => void;
}

export const useInvestigationStore = create<InvestigationState>((set) => ({
  investigations: [],
  activeInvestigation: null,
  pendingApprovals: 0,
  setInvestigations: (inv) => set({ investigations: inv }),
  setActiveInvestigation: (inv) => set({ activeInvestigation: inv }),
  setPendingApprovals: (count) => set({ pendingApprovals: count }),
}));
