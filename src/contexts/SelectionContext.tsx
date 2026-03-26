import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SelectionContextType {
  selectionCallback: ((selected: any[]) => void) | null;
  setSelectionCallback: (callback: ((selected: any[]) => void) | null) => void;
}

const SelectionContext = createContext<SelectionContextType | undefined>(undefined);

export const SelectionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectionCallback, setSelectionCallback] = useState<((selected: any[]) => void) | null>(null);

  return (
    <SelectionContext.Provider value={{ selectionCallback, setSelectionCallback }}>
      {children}
    </SelectionContext.Provider>
  );
};

export const useSelection = () => {
  const context = useContext(SelectionContext);
  if (context === undefined) {
    throw new Error('useSelection must be used within a SelectionProvider');
  }
  return context;
};