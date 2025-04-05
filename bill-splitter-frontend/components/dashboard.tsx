"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { BillDetailsDialog } from "@/components/bill-details-dialog";
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, Clock } from "lucide-react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useBills } from "@/contexts/BillContext";

export default function Dashboard() {
  const [selectedBill, setSelectedBill] = useState<string | null>(null);
  const { account } = useWallet();
  const { bills, loading, error } = useBills();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-4">
        Failed to load bill proposals
      </div>
    );
  }

  if (!account?.address) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        Please connect your wallet to view bill proposals
      </div>
    );
  }

  const totalAmount = bills.reduce((sum, bill) => sum + bill.amount, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold">Recent Bills</h2>
        {/* <Button
          variant="ghost"
          size="sm"
          className="text-primary flex items-center gap-1"
        >
          View All <ArrowRight className="h-3 w-3" />
        </Button> */}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card className="bg-gradient-to-br from-primary/10 to-purple-500/10 border-none shadow-sm">
          <CardContent className="p-3 flex flex-col items-center justify-center">
            <TrendingUp className="h-8 w-8 text-primary mb-1" />
            <p className="text-lg font-bold">{totalAmount}</p>
            <p className="text-xs text-muted-foreground">Total Amount</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-none shadow-sm">
          <CardContent className="p-3 flex flex-col items-center justify-center">
            <Clock className="h-8 w-8 text-amber-500 mb-1" />
            <p className="text-lg font-bold">{bills.length}</p>
            <p className="text-xs text-muted-foreground">Total Bills</p>
          </CardContent>
        </Card>
      </div>

      <motion.div
        className="grid gap-3"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {bills.length > 0 ? (
          bills.map((bill) => (
            <motion.div key={bill.timestamp} variants={item}>
              <Card
                className="overflow-hidden hover:shadow-md transition-all duration-300 border-none shadow-sm cursor-pointer"
                onClick={() => setSelectedBill(bill.timestamp.toString())}
              >
                <div
                  className={`h-1 bg-gradient-to-r from-primary to-purple-500`}
                ></div>
                <CardHeader className="p-3 pb-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-sm">
                        Bill #{bill.id.slice(0, 8)}...
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Created at {new Date(bill.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <Badge
                      variant={
                        bill.status === "completed" ? "outline" : "default"
                      }
                      className="text-xs"
                    >
                      {bill.status === "0" ? "Pending" : "Paid"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="text-xs text-muted-foreground">
                      {bill.payees.length} participants
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="font-medium text-sm">
                        {bill.amount / 1e6} USDT
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ({bill.perPersonAmount / 1e6} USDT per person)
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex -space-x-2">
                    {bill.payees.slice(0, 3).map((payee, index) => (
                      <Avatar
                        key={index}
                        className="border-2 border-background h-6 w-6"
                      >
                        <AvatarFallback className="text-xs bg-gradient-to-br from-primary/80 to-purple-500/80 text-white">
                          {payee.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {bill.payees.length > 3 && (
                      <Avatar className="border-2 border-background h-6 w-6">
                        <AvatarFallback className="text-xs bg-muted">
                          +{bill.payees.length - 3}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            No bill proposals found
          </div>
        )}
      </motion.div>

      <BillDetailsDialog
        open={!!selectedBill}
        onOpenChange={() => setSelectedBill(null)}
        billTimestamp={selectedBill || ""}
      />
    </div>
  );
}
