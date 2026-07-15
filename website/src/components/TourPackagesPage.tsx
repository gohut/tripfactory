import { PackageCard } from "@/components/cards/PackageCard";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteNavbar } from "@/components/SiteNavbar";
import homeContent from "@/content/page.json";
import tourPackagesContent from "@/content/tour-packages.json";
import type { PageContent } from "@/types/page-content";

type Duration = {
  days: number | null;
  nights: number | null;
  code: string;
  label: string;
};

type TourPackageCardData = {
  id: string;
  state: string;
  title: string;
  subtitle: string;
  duration: Duration;
  image: {
    src: string;
    alt: string;
  };
  combos: string[];
  notes: string[];
};

type TourPackageCollection = {
  id: string;
  eyebrow: string;
  title: string;
  intro: string;
  cards: TourPackageCardData[];
};

type TourPackagesContent = {
  collections: TourPackageCollection[];
};

const home = homeContent as PageContent;
const packages = tourPackagesContent as TourPackagesContent;

function AvailablePackagesIntro() {
  return (
    <header className="tour-packages-intro">
      <div className="tour-packages-page-label">Tour Packages</div>
      <div className="tour-packages-badge">{home.texts.packages_badge_label}</div>
      <div className="tour-packages-heading-row">
        <span>{home.texts.packages_section_label}</span>
        <h1>{home.texts.packages_heading}</h1>
      </div>
      <p>{home.texts.packages_intro_text}</p>
    </header>
  );
}

function TourPackageCollectionSection({ collection }: { collection: TourPackageCollection }) {
  return (
    <section className="tour-package-collection" aria-labelledby={`${collection.id}-title`}>
      <div className="tour-package-collection-heading">
        <span>{collection.eyebrow}</span>
        <h2 id={`${collection.id}-title`}>{collection.title}</h2>
        <p>{collection.intro}</p>
      </div>

      <div className="tour-package-grid">
        {collection.cards.map((card) => (
          <PackageCard key={card.id} card={card} />
        ))}
      </div>
    </section>
  );
}

export default function TourPackagesPage() {
  return (
    <main className="tour-packages-shell">
      <SiteNavbar currentPath="/tour-packages" label="Tour packages navigation" />
      <AvailablePackagesIntro />
      <div className="tour-packages-content">
        {packages.collections.map((collection) => (
          <TourPackageCollectionSection key={collection.id} collection={collection} />
        ))}
      </div>
      <SiteFooter />
    </main>
  );
}
