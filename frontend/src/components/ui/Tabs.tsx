import { createContext, useContext, useState } from "react";

type TabsContextType = {
  value: string;
  onValueChange: (value: string) => void;
};

const TabsContext = createContext<TabsContextType | undefined>(undefined);

function useTabs() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used within a TabsProvider");
  }
  return context;
}

export interface TabsProps {
  defaultValue: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

export function Tabs({ defaultValue, onValueChange, children }: TabsProps) {
  const [value, setValue] = useState(defaultValue);

  const handleValueChange = (newValue: string) => {
    setValue(newValue);
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <div className="w-full">{children}</div>
    </TabsContext.Provider>
  );
}

export interface TabsListProps {
  className?: string;
  children: React.ReactNode;
}

export function TabsList({ className, children }: TabsListProps) {
  return (
    <div className={`inline-flex items-center justify-center rounded-lg bg-gray-100 p-1 ${className}`}>
      {children}
    </div>
  );
}

export interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
}

export function TabsTrigger({ value, children }: TabsTriggerProps) {
  const { value: selectedValue, onValueChange } = useTabs();
  const isSelected = selectedValue === value;

  return (
    <button
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
        isSelected
          ? "bg-white text-indigo-700 shadow-sm"
          : "text-gray-500 hover:text-gray-900"
      }`}
      onClick={() => onValueChange(value)}
    >
      {children}
    </button>
  );
}

export interface TabsContentProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

export function TabsContent({ value, className, children }: TabsContentProps) {
  const { value: selectedValue } = useTabs();
  const isSelected = selectedValue === value;

  if (!isSelected) return null;

  return <div className={className}>{children}</div>;
} 