import { Suspense } from "react";
import TripFactoryPage from "@/components/TripFactoryPage";

export default function Home() {
  return (
    <Suspense fallback={null}>
      <TripFactoryPage />
    </Suspense>
  );
}
