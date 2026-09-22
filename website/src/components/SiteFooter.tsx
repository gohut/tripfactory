"use client";

import type { MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import homeContent from "@/content/page.json";
import type { ButtonAction, Mode } from "@/components/cards/shared-elements";
import type { PageContent } from "@/types/page-content";

const home = homeContent as PageContent;

type SiteFooterProps = {
  className?: string;
  mode?: Mode;
  onAction?: ButtonAction;
};

export function SiteFooter({ className = "", mode = "desktop", onAction }: SiteFooterProps) {
  const handleAction = (id: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (onAction?.(id, mode, event)) event.preventDefault();
  };

  return (
    <footer className={`site-footer ${className}`.trim()}>
      <div className="site-footer-brand">
        <Image src="/asset/logow.png" alt="TripFactory" width={190} height={84} unoptimized />
        <p>{home.texts.footer_tagline}</p>
      </div>

      <div>
        <h2>{home.texts.footer_rapid_links_heading}</h2>
        <Link href="/">Home</Link>
        <Link href="/tour-packages">{home.texts.footer_packages_link}</Link>
        <Link href="/" onClick={handleAction("footer_about_us_link")}>
          {home.texts.footer_about_us_link}
        </Link>
        <Link href="/" onClick={handleAction("footer_enquiry_link")}>
          {home.texts.footer_enquiry_link}
        </Link>
      </div>

      <div>
        <h2>{home.texts.footer_legal_heading}</h2>
        <Link href="/legal#terms-and-conditions">{home.texts.footer_terms_link}</Link>
        <Link href="/legal#privacy-policy">{home.texts.footer_privacy_link}</Link>
        <Link href="/legal#refund-policy">{home.texts.footer_legal_extra_1}</Link>
        <Link href="/legal#cancellation-policy">{home.texts.footer_legal_extra_2}</Link>
      </div>

      <div>
        <h2>{home.texts.footer_contact_link}</h2>
        <p>{home.texts.contact_footer_phone}</p>
        <p>{home.texts.contact_footer_email}</p>
        <p>{home.texts.contact_footer_website}</p>
      </div>

      <p className="site-footer-credit">
        Crafted by{" "}
        <a href="https://noospacewebsolutions.blogspot.com/" target="_blank" rel="noopener noreferrer">
          Noospace
        </a>
      </p>

      <p className="site-footer-copyright">{home.texts.footer_copyright}</p>
    </footer>
  );
}