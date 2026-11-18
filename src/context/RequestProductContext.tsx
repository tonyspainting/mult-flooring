import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import RequestProductModal from "@/components/RequestProductModal";

export interface OpenRequestOptions {
  query?: string;
  source?: string;
}

interface RequestProductContextValue {
  openRequest: (opts?: OpenRequestOptions) => void;
}

const RequestProductContext = createContext<RequestProductContextValue>({
  openRequest: () => {},
});

export function useRequestProduct() {
  return useContext(RequestProductContext);
}

export function RequestProductProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ open: boolean; query: string; source: string }>({
    open: false,
    query: "",
    source: "",
  });

  const openRequest = useCallback((opts?: OpenRequestOptions) => {
    const query = opts?.query || "";
    const source = opts?.source || "";
    setState({ open: true, query, source });
  }, []);

  const close = useCallback(() => setState((s) => ({ ...s, open: false })), []);

  return (
    <RequestProductContext.Provider value={{ openRequest }}>
      {children}
      <RequestProductModal open={state.open} onClose={close} initialQuery={state.query} source={state.source} />
    </RequestProductContext.Provider>
  );
}
