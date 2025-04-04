"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { getAllUserBill } from "@/view-functions/getUserBill";
import { toast } from "react-toastify";

interface Bill {
  id: string;
  payees: string[];
  amount: number;
  perPersonAmount: number;
  timestamp: number;
  status: string;
}

interface BillContextType {
  bills: Bill[];
  allBills: Bill[];
  loading: boolean;
  error: any;
  refreshBills: () => Promise<void>;
  getBillById: (timestamp: string) => Bill | undefined;
}

const BillContext = createContext<BillContextType | undefined>(undefined);

export function BillProvider({ children }: { children: React.ReactNode }) {
  const [bills, setBills] = useState<Bill[]>([]);
  const [allBills, setAllBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const { account } = useWallet();

  const fetchBills = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!account?.address) {
        setBills([]);
        setAllBills([]);
        return;
      }

      const response = await getAllUserBill();

      // 格式化所有账单数据
      const formattedAllBills = response[0].map((bill: any[]) => {
        const payeeAddresses = bill[1]
          .split(";")
          .slice(1)
          .map((addr: string) =>
            addr
              .replace(/\\/g, "")
              .replace(/@/g, "")
              .replace(/"/g, "")
              .replace(/'/g, "")
          );

        const perPersonAmount = Number(bill[2]);
        const totalAmount = perPersonAmount * payeeAddresses.length;

        return {
          id: bill[0].replace("@", ""),
          payees: payeeAddresses,
          perPersonAmount: perPersonAmount,
          amount: totalAmount,
          timestamp: Number(bill[3]) * 1000,
          status: bill[4],
        };
      });

      setAllBills(formattedAllBills);

      // 过滤出当前用户创建的账单
      const userBills = formattedAllBills.filter(
        (bill: any) => bill.id === account.address?.toString()
      );

      setBills(userBills);
    } catch (error) {
      console.error("Error fetching bills:", error);
      setError(error);
      toast.error("Failed to fetch bills");
    } finally {
      setLoading(false);
    }
  };

  const refreshBills = async () => {
    await fetchBills();
  };

  const getBillById = (timestamp: string) => {
    return allBills.find((bill) => bill.timestamp.toString() === timestamp);
  };

  useEffect(() => {
    if (account?.address) {
      fetchBills();
    }
  }, [account?.address]);

  return (
    <BillContext.Provider
      value={{ bills, allBills, loading, error, refreshBills, getBillById }}
    >
      {children}
    </BillContext.Provider>
  );
}

export function useBills() {
  const context = useContext(BillContext);
  if (context === undefined) {
    throw new Error("useBills must be used within a BillProvider");
  }
  return context;
}
