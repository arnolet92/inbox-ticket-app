import dynamic from "next/dynamic";
import React from "react";

function NoSSRWrapper({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export const NoSSR = dynamic(() => Promise.resolve(NoSSRWrapper), {
  ssr: false,
  loading: () => null,
});
