// src/store/snippetStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import axios from 'axios';

export interface Snippet {
  id: string;
  language: 'python' | 'javascript';
  code: string;
  summary?: string;
  explanation?: string;
  optimizedCode?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  confidence?: number;
  createdAt: string;
}

type Store = {
  snippets: Snippet[];
  selectedId: string | null;
  loadSnippets: () => Promise<void>;
  addSnippet: (s: Snippet) => void;
  updateSnippet: (id: string, updates: Partial<Snippet>) => void;
  removeSnippet: (id: string) => void;
  selectSnippet: (id: string) => void;
};

export const useSnippetStore = create<Store>()(
  devtools((set, get) => ({
    snippets: [],
    selectedId: null,
    async loadSnippets() {
      try {
        const res = await axios.get('/api/snippets');
        set({ snippets: res.data, selectedId: res.data[0]?.id ?? null });
      } catch (e) {
        console.error('Failed to load snippets', e);
        set({ snippets: [] });
      }
    },
    addSnippet(s) {
      set(state => ({ snippets: [...state.snippets, s], selectedId: s.id }));
    },
    updateSnippet(id, updates) {
      set(state => ({
        snippets: state.snippets.map(sn => (sn.id === id ? { ...sn, ...updates } : sn)),
      }));
    },
    removeSnippet(id) {
      try {
        axios.delete(`/api/snippets/${id}`);
      } catch (e) {
        console.error('Failed to delete snippet', e);
      }
      set(state => ({
        snippets: state.snippets.filter(sn => sn.id !== id),
        selectedId: state.selectedId === id ? null : state.selectedId,
      }));
    },
    selectSnippet(id) {
      set({ selectedId: id });
    },
  }))
);
