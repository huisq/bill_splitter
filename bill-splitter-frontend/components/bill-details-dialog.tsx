"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, User } from "lucide-react";
import { PaymentDialog } from "@/components/payment-dialog";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBills } from "@/contexts/BillContext";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

interface BillDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  billTimestamp: string;
}

export function BillDetailsDialog({
  open,
  onOpenChange,
  billTimestamp,
}: BillDetailsDialogProps) {
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("participants");
  const { getBillById } = useBills();
  const { account } = useWallet();

  const bill = getBillById(billTimestamp);

  if (!bill) {
    return null;
  }

  const currentUserIsPayee = bill.payees.includes(
    account?.address?.toString() || ""
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-primary to-purple-500 p-4 flex flex-col justify-end">
          <DialogHeader className="text-white">
            <DialogTitle className="flex items-center justify-between">
              <span className="text-xl">Bill Details</span>
              <Badge
                variant={bill.status === "1" ? "outline" : "default"}
                className="bg-white/20 text-white border-white/40"
              >
                {bill.status === "1" ? "Completed" : "Pending"}
              </Badge>
            </DialogTitle>
            <p className="text-white/80 text-sm mt-1">
              Created at {new Date(bill.timestamp).toLocaleString()}
            </p>
          </DialogHeader>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Avatar className="h-10 w-10 mr-3 border-2 border-background">
                <AvatarFallback className="bg-gradient-to-br from-primary to-purple-500 text-white">
                  {bill.id.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">
                  Bill #{bill.id.slice(0, 8)}...
                </p>
                <p className="text-xs text-muted-foreground">Creator</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium">{bill.amount} APT</p>
              <div className="flex items-center text-xs text-muted-foreground">
                <Calendar className="h-3 w-3 mr-1" />
                {new Date(bill.timestamp).toLocaleDateString()}
              </div>
            </div>
          </div>

          <Tabs
            defaultValue="participants"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-1 p-1 bg-muted/50 rounded-xl">
              <TabsTrigger
                value="participants"
                className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                <User className="h-4 w-4 mr-1.5" />
                Participants
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <TabsContent value="participants" className="mt-3 space-y-2">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {bill.payees.map((payee, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-3">
                          <AvatarFallback className="text-white bg-gradient-to-br from-amber-400 to-orange-400">
                            {payee.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-xs text-muted-foreground flex items-center">
                            <span className="text-xs bg-purple-100 text-purple-600 px-1 rounded mr-1">
                              Ξ
                            </span>
                            {payee.slice(0, 6)}...{payee.slice(-4)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">
                          {bill.perPersonAmount} APT
                        </p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </TabsContent>
            </AnimatePresence>
          </Tabs>

          <div className="flex justify-between pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>

            {currentUserIsPayee && bill.status === "0" && (
              <Button
                onClick={() => setIsPaymentOpen(true)}
                className="bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
              >
                Pay Now
              </Button>
            )}
          </div>
        </div>
      </DialogContent>

      {currentUserIsPayee && (
        <PaymentDialog
          open={isPaymentOpen}
          onOpenChange={setIsPaymentOpen}
          bill={bill}
          amount={bill.perPersonAmount}
        />
      )}
    </Dialog>
  );
}
