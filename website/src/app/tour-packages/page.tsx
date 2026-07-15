import type { Metadata } from "next";
import TourPackagesPage from "@/components/TourPackagesPage";

export const metadata: Metadata = {
  title: "Tour Packages | TripFactory",
  description: "Explore TripFactory tour packages by destination, duration, and combo route.",
};

export default function Page() {
  return <TourPackagesPage />;
}
