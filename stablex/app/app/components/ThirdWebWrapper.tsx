"use client"; // 👈 This ensures it runs in the client

import { ThirdwebProvider, ChainId } from "@thirdweb-dev/react";

export function ThirdwebProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThirdwebProvider activeChain={ChainId.Mainnet}>
      {children}
    </ThirdwebProvider>
  );
}
