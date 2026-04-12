import type { AppProps } from "next/app";
import { AuthProvider } from "@/context/AuthContext";
import { OrganizerProvider } from "@/context/OrganizerContext";
import { PageLoader } from "@/components/PageLoader";
import { NoSSR } from "@/components/NoSSR";
import "@/index.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <NoSSR>
      <AuthProvider>
        <OrganizerProvider>
          <PageLoader />
          <Component {...pageProps} />
        </OrganizerProvider>
      </AuthProvider>
    </NoSSR>
  );
}
