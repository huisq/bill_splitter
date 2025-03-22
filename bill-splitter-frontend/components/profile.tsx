"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HistoryItem } from "@/components/history-item"
import { motion } from "framer-motion"
import { Copy, ExternalLink, QrCode } from "lucide-react"

export default function Profile() {
  const walletAddress = "0x1a2b3c4d5e6f7g8h9i0j"
  const shortAddress = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`

  const tokens = [
    {
      symbol: "APT",
      name: "Aptos",
      balance: "12.45",
      usdValue: "124.50",
      change: "+5.2%",
      positive: true,
      color: "bg-gradient-to-r from-blue-500 to-cyan-400",
    },
    {
      symbol: "USDC",
      name: "USD Coin",
      balance: "250.00",
      usdValue: "250.00",
      change: "0.0%",
      positive: true,
      color: "bg-gradient-to-r from-blue-600 to-blue-400",
    },
    {
      symbol: "USDT",
      name: "Tether",
      balance: "100.00",
      usdValue: "100.00",
      change: "-0.1%",
      positive: false,
      color: "bg-gradient-to-r from-green-500 to-emerald-400",
    },
  ]

  const history = [
    {
      id: "tx1",
      type: "payment",
      title: "Dinner at Satoshi's",
      amount: "30",
      token: "USDC",
      date: "2025-03-15",
      to: "Alex",
    },
    {
      id: "tx2",
      type: "request",
      title: "Concert Tickets",
      amount: "75",
      token: "USDT",
      date: "2025-03-10",
      from: "You",
    },
    {
      id: "tx3",
      type: "payment",
      title: "Group Lunch",
      amount: "25",
      token: "APT",
      date: "2025-03-05",
      to: "Sam",
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
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card className="overflow-hidden border-none shadow-sm">
          <div className="h-24 bg-gradient-to-r from-primary to-purple-500"></div>
          <CardContent className="p-3 relative">
            <div className="flex items-center">
              <Avatar className="h-16 w-16 border-4 border-background -mt-12 shadow-md">
                <AvatarFallback className="bg-gradient-to-br from-primary to-purple-500 text-white">YN</AvatarFallback>
              </Avatar>
              <div className="ml-3 mt-1">
                <h3 className="font-bold text-lg">Your Name</h3>
                <div className="flex items-center text-xs text-muted-foreground">
                  {shortAddress}
                  <Button variant="ghost" size="icon" className="h-6 w-6 ml-1">
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="mb-4"
      >
        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="p-3 pb-0">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm">Your Wallet Address</h3>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => navigator.clipboard.writeText(walletAddress)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3 flex flex-col items-center">
            <div className="bg-white p-3 rounded-lg mb-2 relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
              <QrCode className="h-32 w-32 text-primary" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-8 w-8 rounded-full bg-white p-1">
                  <div className="h-full w-full rounded-full bg-gradient-to-r from-primary to-purple-500"></div>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Scan this QR code to add your wallet address to a bill
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="border-none shadow-sm">
          <CardHeader className="p-3 pb-0">
            <h3 className="font-medium text-sm">Wallet Balance</h3>
          </CardHeader>
          <CardContent className="p-3">
            <motion.div className="space-y-2" variants={container} initial="hidden" animate="show">
              {tokens.map((token) => (
                <motion.div key={token.symbol} variants={item}>
                  <div className="flex items-center p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-white text-xs ${token.color}`}
                    >
                      {token.symbol}
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="font-medium text-sm">{token.name}</div>
                      <div className="text-xs text-muted-foreground">{token.symbol}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-sm">{token.balance}</div>
                      <div className="flex items-center text-xs">
                        <span className="text-muted-foreground mr-1">${token.usdValue}</span>
                        <span className={token.positive ? "text-green-500" : "text-red-500"}>{token.change}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className="border-none shadow-sm">
          <CardHeader className="p-3 pb-0">
            <h3 className="font-medium text-sm">Transaction History</h3>
          </CardHeader>
          <CardContent className="p-3">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3 p-1 bg-muted/50 rounded-xl">
                <TabsTrigger
                  value="all"
                  className="rounded-lg text-xs data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                >
                  All
                </TabsTrigger>
                <TabsTrigger
                  value="sent"
                  className="rounded-lg text-xs data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                >
                  Sent
                </TabsTrigger>
                <TabsTrigger
                  value="received"
                  className="rounded-lg text-xs data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                >
                  Received
                </TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-3 space-y-3">
                {history.map((item) => (
                  <HistoryItem key={item.id} item={item} />
                ))}
              </TabsContent>
              <TabsContent value="sent" className="mt-3 space-y-3">
                {history
                  .filter((item) => item.to)
                  .map((item) => (
                    <HistoryItem key={item.id} item={item} />
                  ))}
              </TabsContent>
              <TabsContent value="received" className="mt-3 space-y-3">
                {history
                  .filter((item) => item.from)
                  .map((item) => (
                    <HistoryItem key={item.id} item={item} />
                  ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

