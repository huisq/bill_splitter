"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import {
  useWallet,
  InputTransactionData,
} from "@aptos-labs/wallet-adapter-react";
import { aptosClient } from "@/lib/utils/aptosClient";
import { toast } from "react-toastify";
import {
  getAllUserBill,
  getUserBillReceived,
} from "@/view-functions/getUserBill";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bill: any;
  amount: number;
}

export function PaymentDialog({
  open,
  onOpenChange,
  bill,
  amount,
}: PaymentDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const { account, signAndSubmitTransaction } = useWallet();

  const processingSteps = [
    "Connecting to wallet...",
    "Processing payment...",
    "Finalizing transaction...",
  ];

  const handlePayment = async () => {
    try {
      if (!account?.address) {
        toast.error("Please connect your wallet");
        return;
      }

      setIsProcessing(true);
      setProcessingStep(0);

      // 获取用户账单数据
      const accountBills = await getUserBillReceived(
        account?.address.toString()
      );
      if (!accountBills || accountBills.length === 0) {
        toast.error("No bills found");
        return;
      }

      const billId = accountBills[accountBills.length - 1]; // 获取最后一个账单ID
      console.log("billId", billId[0]);
      setProcessingStep(1);

      // 调用合约支付
      const payload: InputTransactionData = {
        data: {
          function: `${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}::aptme::pay_bill`,
          functionArguments: [billId[0]],
        },
      };

      const response = await signAndSubmitTransaction(payload);

      setProcessingStep(2);

      await aptosClient().waitForTransaction({
        transactionHash: response.hash,
      });

      toast.success("Payment successful");
      onOpenChange(false);
    } catch (error) {
      console.error("Payment failed:", error);
      toast.error("Payment failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Pay Bill Request</DialogTitle>
        </DialogHeader>

        {!isProcessing ? (
          <div className="space-y-4 py-4">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Bill</p>
              <p className="font-medium">
                {bill?.id ? `Bill #${bill.id.slice(0, 8)}...` : "Loading..."}
              </p>

              <div className="flex items-center justify-between mt-2">
                <div>
                  <p className="text-xs text-muted-foreground">Amount Due</p>
                  <p className="font-medium">{amount} APT</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Created At</p>
                  <p className="font-medium">
                    {bill?.timestamp
                      ? new Date(bill.timestamp).toLocaleDateString()
                      : "Loading..."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 flex flex-col items-center justify-center">
            <div className="relative h-16 w-16 mb-4">
              <Loader2 className="h-16 w-16 animate-spin text-muted-foreground" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-medium">
                  {processingStep + 1}/{processingSteps.length}
                </span>
              </div>
            </div>
            <p className="font-medium text-center">
              {processingSteps[processingStep]}
            </p>
            <div className="w-full mt-6">
              <div className="h-1 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-purple-500"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${
                      ((processingStep + 1) / processingSteps.length) * 100
                    }%`,
                  }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="flex justify-between mt-2">
                {processingSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 w-2 rounded-full ${
                      index <= processingStep ? "bg-primary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          {!isProcessing && (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handlePayment}
                disabled={isProcessing}
                className="bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
              >
                Confirm Payment
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
