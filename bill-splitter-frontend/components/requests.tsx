"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BillDetailsDialog } from "@/components/bill-details-dialog";
import { PaymentDialog } from "@/components/payment-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft, Calendar } from "lucide-react";
import { useBills } from "@/contexts/BillContext";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

export default function Requests() {
  const [selectedBill, setSelectedBill] = useState<string | null>(null);
  const [paymentBill, setPaymentBill] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("received");
  const { bills, allBills } = useBills();
  const { account } = useWallet();

  // 获取当前用户需要支付的账单（作为 payee 的账单）
  const receivedRequests = allBills.filter(
    (bill) =>
      bill.payees.includes(account?.address?.toString() || "") &&
      bill.id !== account?.address?.toString()
  );
  console.log("receivedRequests", receivedRequests);

  // 获取当前用户创建的账单（使用已经过滤好的bills）
  const sentRequests = bills;

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

  if (!account?.address) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        Please connect your wallet to view requests
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs
        defaultValue="received"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/50 rounded-xl">
          <TabsTrigger
            value="received"
            className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            <ArrowDownLeft className="h-4 w-4 mr-1.5" />
            Received
          </TabsTrigger>
          <TabsTrigger
            value="sent"
            className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            <ArrowUpRight className="h-4 w-4 mr-1.5" />
            Sent
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          {activeTab === "received" && (
            <TabsContent value="received" className="mt-3 space-y-3">
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0 }}
              >
                {receivedRequests.length > 0 ? (
                  receivedRequests.map((request) => (
                    <motion.div key={request.timestamp} variants={item}>
                      <Card
                        className="overflow-hidden hover:shadow-md transition-all duration-300 border-none shadow-sm cursor-pointer"
                        onClick={() =>
                          setSelectedBill(request.timestamp.toString())
                        }
                      >
                        <div className="h-1 bg-gradient-to-r from-primary to-purple-500"></div>
                        <CardHeader className="p-3 pb-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium text-sm">
                                Bill #{request.id.slice(0, 8)}...
                              </h3>
                              <p className="text-xs text-muted-foreground">
                                Created at{" "}
                                {new Date(request.timestamp).toLocaleString()}
                              </p>
                            </div>
                            <Badge
                              variant={
                                request.status === "1" ? "outline" : "default"
                              }
                              className="text-xs"
                            >
                              {request.status === "1" ? "Completed" : "Pending"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-3 pt-2">
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-sm">
                              You owe: {request.perPersonAmount} APT
                            </div>
                            {request.status === "0" && (
                              <Button
                                size="sm"
                                className="h-7 text-xs bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPaymentBill(request);
                                }}
                              >
                                Pay
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No received requests
                  </div>
                )}
              </motion.div>
            </TabsContent>
          )}

          {activeTab === "sent" && (
            <TabsContent value="sent" className="mt-3 space-y-3">
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0 }}
              >
                {sentRequests.length > 0 ? (
                  sentRequests.map((request) => (
                    <motion.div key={request.timestamp} variants={item}>
                      <Card
                        className="overflow-hidden hover:shadow-md transition-all duration-300 border-none shadow-sm cursor-pointer"
                        onClick={() =>
                          setSelectedBill(request.timestamp.toString())
                        }
                      >
                        <div className="h-1 bg-gradient-to-r from-primary to-purple-500"></div>
                        <CardHeader className="p-3 pb-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium text-sm">
                                Bill #{request.id.slice(0, 8)}...
                              </h3>
                              <p className="text-xs text-muted-foreground">
                                {request.payees.length} participants
                              </p>
                            </div>
                            <Badge
                              variant={
                                request.status === "1" ? "outline" : "default"
                              }
                              className="text-xs"
                            >
                              {request.status === "1" ? "Completed" : "Pending"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-3 pt-2">
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-muted-foreground">
                              Created at{" "}
                              {new Date(request.timestamp).toLocaleString()}
                            </div>
                            <div className="font-medium text-sm">
                              {request.amount} APT
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No sent requests
                  </div>
                )}
              </motion.div>
            </TabsContent>
          )}
        </AnimatePresence>
      </Tabs>

      <BillDetailsDialog
        open={!!selectedBill}
        onOpenChange={() => setSelectedBill(null)}
        billTimestamp={selectedBill || ""}
      />

      <PaymentDialog
        open={!!paymentBill}
        onOpenChange={() => setPaymentBill(null)}
        bill={paymentBill || {}}
        amount={paymentBill?.perPersonAmount || 0}
      />
    </div>
  );
}
