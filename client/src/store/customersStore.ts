import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateMockCustomers, type Customer } from "@/lib/mockCustomers";
import { useOrdersStore } from "@/store/ordersStore";

type CustomersState = {
  customers: Customer[];
  toggleActive: (id: string) => void;
  ensureSeed: () => void;
};

function seed(): Customer[] {
  const orders = useOrdersStore.getState().orders;
  return generateMockCustomers(orders);
}

export const useCustomersStore = create<CustomersState>()(
  persist(
    (set, get) => ({
      customers: seed(),
      toggleActive: (id) =>
        set({
          customers: get().customers.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c)),
        }),
      ensureSeed: () => {
        if (get().customers.length === 0) set({ customers: seed() });
      },
    }),
    {
      name: "ds-customers-v1",
      partialize: (s) => ({ customers: s.customers }),
    }
  )
);
