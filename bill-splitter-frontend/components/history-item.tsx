"use client"

import { ArrowUpRight, ArrowDownLeft } from "lucide-react"
import { motion } from "framer-motion"

interface HistoryItemProps {
  item: {
    id: string
    type: string
    title: string
    amount: string
    token: string
    date: string
    to?: string
    from?: string
  }
}

export function HistoryItem({ item }: HistoryItemProps) {
  const isSent = !!item.to

  return (
    <motion.div
      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
      whileHover={{ x: 5 }}
    >
      <div className="flex items-center">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full ${
            isSent ? "bg-gradient-to-br from-red-400 to-pink-400" : "bg-gradient-to-br from-green-400 to-emerald-400"
          } text-white`}
        >
          {isSent ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
        </div>
        <div className="ml-3">
          <div className="font-medium text-sm">{item.title}</div>
          <div className="text-xs text-muted-foreground">{isSent ? `To: ${item.to}` : `From: ${item.from}`}</div>
        </div>
      </div>
      <div className="text-right">
        <div className={`font-medium text-sm ${isSent ? "text-red-500" : "text-green-500"}`}>
          {isSent ? "-" : "+"}
          {item.amount} {item.token}
        </div>
        <div className="text-xs text-muted-foreground">{new Date(item.date).toLocaleDateString()}</div>
      </div>
    </motion.div>
  )
}

