// import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import "./globals.css";

import { ThemeProvider } from "@/components/ThemeProvider";
import { WalletProvider } from "@/components/WalletProvider";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import { PropsWithChildren } from "react";
import { AutoConnectProvider } from "@/components/AutoConnectProvider";
import { ReactQueryClientProvider } from "@/components/ReactQueryClientProvider";
import { ToastContainer } from "react-toastify";
import { BillProvider } from "@/contexts/BillContext";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "AptMe",
  description: "AptMe",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(fontSans.variable)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AutoConnectProvider>
            <ReactQueryClientProvider>
              <WalletProvider>
                <BillProvider>
                  <ToastContainer aria-label="toast-container" />
                  {children}
                </BillProvider>
              </WalletProvider>
            </ReactQueryClientProvider>
          </AutoConnectProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
