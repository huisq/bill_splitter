"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { BillDetailsDialog } from "@/components/bill-details-dialog"
import { motion } from "framer-motion"
import { ArrowRight, TrendingUp, Clock } from "lucide-react"

export default function Dashboard() {
  const [selectedBill, setSelectedBill] = useState<string | null>(null)

  const bills = [
    {
      id: "bill-1",
      title: "Dinner at Satoshi's",
      amount: 120,
      token: "USDC",
      creator: "0x1a2b...3c4d",
      creatorName: "Alex",
      participants: 4,
      participantEmails: 2, // Add this to indicate how many participants use email
      paid: 2,
      deadline: "2025-04-01",
      progress: 50,
      status: "pending",
      color: "from-blue-500 to-cyan-400",
    },
    {
      id: "bill-2",
      title: "Vacation Rental",
      amount: 500,
      token: "APT",
      creator: "0x5e6f...7g8h",
      creatorName: "Sam",
      participants: 3,
      paid: 3,
      deadline: "2025-03-25",
      progress: 100,
      status: "completed",
      color: "from-green-500 to-emerald-400",
    },
    {
      id: "bill-3",
      title: "Concert Tickets",
      amount: 75,
      token: "USDT",
      creator: "You",
      creatorName: "You",
      participants: 2,
      paid: 0,
      deadline: "2025-04-10",
      progress: 0,
      status: "pending",
      color: "from-purple-500 to-pink-400",
    },
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold">Recent Bills</h2>
        <Button variant="ghost" size="sm" className="text-primary flex items-center gap-1">
          View All <ArrowRight className="h-3 w-3" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card className="bg-gradient-to-br from-primary/10 to-purple-500/10 border-none shadow-sm">
          <CardContent className="p-3 flex flex-col items-center justify-center">
            <TrendingUp className="h-8 w-8 text-primary mb-1" />
            <p className="text-lg font-bold">$695</p>
            <p className="text-xs text-muted-foreground">Total Pending</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-none shadow-sm">
          <CardContent className="p-3 flex flex-col items-center justify-center">
            <Clock className="h-8 w-8 text-amber-500 mb-1" />
            <p className="text-lg font-bold">3</p>
            <p className="text-xs text-muted-foreground">Pending Bills</p>
          </CardContent>
        </Card>
      </div>

      <motion.div className="grid gap-3" variants={container} initial="hidden" animate="show">
        {bills.map((bill) => (
          <motion.div key={bill.id} variants={item}>
            <Card
              className="overflow-hidden hover:shadow-md transition-all duration-300 border-none shadow-sm"
              onClick={() => setSelectedBill(bill.id)}
            >
              <div className={`h-1 bg-gradient-to-r ${bill.color}`}></div>
              <CardHeader className="p-3 pb-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-sm">{bill.title}</h3>
                    <p className="text-xs text-muted-foreground">Created by {bill.creatorName}</p>
                  </div>
                  <Badge variant={bill.status === "completed" ? "outline" : "default"} className="text-xs">
                    {bill.status === "completed" ? "Completed" : "Pending"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="text-xs text-muted-foreground">
                    {bill.paid} of {bill.participants} paid
                  </div>
                  <div className="font-medium text-sm">
                    {bill.amount} {bill.token}
                  </div>
                </div>
                <Progress
                  value={bill.progress}
                  className="h-1.5 rounded-full"
                  indicatorClassName={`bg-gradient-to-r ${bill.color}`}
                />
                <div className="mt-3 flex -space-x-2">
                  {Array.from({ length: Math.min(bill.participants - (bill.participantEmails || 0), 2) }).map(
                    (_, i) => (
                      <Avatar key={`wallet-${i}`} className="border-2 border-background h-6 w-6">
                        <AvatarFallback className="text-xs bg-gradient-to-br from-primary/80 to-purple-500/80 text-white">
                          <span className="text-[8px]">Ξ</span>
                        </AvatarFallback>
                      </Avatar>
                    ),
                  )}
                  {(bill.participantEmails || 0) > 0 &&
                    Array.from({ length: Math.min(bill.participantEmails || 0, 2) }).map((_, i) => (
                      <Avatar key={`email-${i}`} className="border-2 border-background h-6 w-6">
                        <AvatarFallback className="text-xs bg-gradient-to-br from-blue-400 to-cyan-500 text-white">
                          <span className="text-[8px]">@</span>
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  {bill.participants > 4 && (
                    <Avatar className="border-2 border-background h-6 w-6">
                      <AvatarFallback className="text-xs bg-muted">+{bill.participants - 4}</AvatarFallback>
                    </Avatar>
                  )}
                  {bill.status === "pending" && bill.creator !== "You" && (
                    <div className="ml-auto">
                      <Button
                        size="sm"
                        className="h-7 text-xs bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
                      >
                        Pay
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <BillDetailsDialog open={!!selectedBill} onOpenChange={() => setSelectedBill(null)} billId={selectedBill || ""} />
    </div>
  )
}

