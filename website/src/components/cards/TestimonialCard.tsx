"use client";

import Image from "next/image";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  BoxElement,
  ImageElement,
  modeClassName,
  type GeneratedElementSpec,
  type Mode,
} from "./shared-elements";
import reviewContent from "@/content/review.json";

type ReviewLogoSize = {
  width: number;
  height: number;
};

export type ReviewEntry = {
  id: string;
  name: string;
  subName: string;
  review: string;
  starCount: number;
  logoLocation: string;
  logoSize: ReviewLogoSize;
};

type ReviewContent = {
  reviews: ReviewEntry[];
};

export type TestimonialCardSpec = {
  root: GeneratedElementSpec;
  quoteOpen: GeneratedElementSpec;
  quoteClose: GeneratedElementSpec;
  avatar: GeneratedElementSpec;
  initial: GeneratedElementSpec;
  name: GeneratedElementSpec;
  role: GeneratedElementSpec;
  quote: GeneratedElementSpec;
};

const REVIEWS = (reviewContent as ReviewContent).reviews;
const REVIEW_WORD_LIMIT = 18;
const DESKTOP_REVIEW_INTERVAL_MS = 5200;
const DESKTOP_REVIEW_SWAP_MS = 220;
const MOBILE_REVIEW_REPEATS = 3;

export const TESTIMONIAL_CARDS: TestimonialCardSpec[] = [
  {
    root: { id: "container_mrarstno", classToken: "container_mrarstno_p95bp" },
    quoteOpen: { id: "testimonial_1_quote_icon_open", classToken: "image_mrarstnp_8x09b" },
    quoteClose: { id: "testimonial_1_quote_icon_close", classToken: "image_mrarstnq_8x09b" },
    avatar: { id: "container_mrarstnr", classToken: "container_mrarstnr_p95bp" },
    initial: { id: "testimonial_1_initial", classToken: "text_mrarstns_5h7vi" },
    name: { id: "testimonial_1_name", classToken: "text_mrarstnu_5h7vi" },
    role: { id: "testimonial_1_role", classToken: "text_mrarstnv_5h7vi" },
    quote: { id: "testimonial_1_quote", classToken: "text_mrarstnw_5h7vi" },
  },
  {
    root: { id: "container_mrav47v5", classToken: "container_mrav47v5_pa70t" },
    quoteOpen: { id: "testimonial_2_quote_icon_open", classToken: "image_mrav47v6_8vyk7" },
    quoteClose: { id: "testimonial_2_quote_icon_close", classToken: "image_mrav47v7_8vyk7" },
    avatar: { id: "container_mrav47v8", classToken: "container_mrav47v8_pa70t" },
    initial: { id: "testimonial_2_initial", classToken: "text_mrav47v9_5i9km" },
    name: { id: "testimonial_2_name", classToken: "text_mrav47va_5i9kn" },
    role: { id: "testimonial_2_role", classToken: "text_mrav47vb_5i9kn" },
    quote: { id: "testimonial_2_quote", classToken: "text_mrav47vc_5i9kn" },
  },
  {
    root: { id: "container_mrav47vd", classToken: "container_mrav47vd_pa70u" },
    quoteOpen: { id: "testimonial_3_quote_icon_open", classToken: "image_mrav47ve_8vyk5" },
    quoteClose: { id: "testimonial_3_quote_icon_close", classToken: "image_mrav47vf_8vyk5" },
    avatar: { id: "container_mrav47vg", classToken: "container_mrav47vg_pa70u" },
    initial: { id: "testimonial_3_initial", classToken: "text_mrav47vh_5i9ko" },
    name: { id: "testimonial_3_name", classToken: "text_mrav47vi_5i9ko" },
    role: { id: "testimonial_3_role", classToken: "text_mrav47vj_5i9ko" },
    quote: { id: "testimonial_3_quote", classToken: "text_mrav47vk_5i9ko" },
  },
];

function reviewWords(review: string) {
  return review.trim().split(/\s+/).filter(Boolean);
}

function initialFromName(name: string) {
  return name.trim().charAt(0).toUpperCase() || "?";
}

function safeStarCount(starCount: number) {
  return Math.max(0, Math.min(5, Math.round(starCount)));
}

function DynamicTextElement({
  id,
  className,
  children,
  style,
}: {
  id: string;
  className: string;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div className={`tf-el tf-text ${className}`} data-id={id} data-type="text" style={style}>
      {children}
    </div>
  );
}

function useDesktopReviewOffset(mode: Mode, cardCount: number) {
  const [offset, setOffset] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (mode !== "desktop" || REVIEWS.length <= cardCount) return;

    let swapTimer: number | undefined;
    let fadeFrame: number | undefined;
    const interval = window.setInterval(() => {
      setIsFading(true);
      swapTimer = window.setTimeout(() => {
        setOffset((current) => (current + cardCount) % REVIEWS.length);
        fadeFrame = window.requestAnimationFrame(() => setIsFading(false));
      }, DESKTOP_REVIEW_SWAP_MS);
    }, DESKTOP_REVIEW_INTERVAL_MS);

    return () => {
      window.clearInterval(interval);
      if (swapTimer) window.clearTimeout(swapTimer);
      if (fadeFrame) window.cancelAnimationFrame(fadeFrame);
    };
  }, [cardCount, mode]);

  return { offset, isFading };
}

function TestimonialStars({ starCount }: { starCount: number }) {
  const filledStars = safeStarCount(starCount);

  return (
    <div className="tf-testimonial-stars" aria-label={`${filledStars} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <span
          key={index}
          className={index < filledStars ? "tf-testimonial-star tf-testimonial-star--filled" : "tf-testimonial-star"}
          aria-hidden="true"
        >
          ★
        </span>
      ))}
    </div>
  );
}

function TestimonialReviewText({ review }: { review: ReviewEntry }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const words = useMemo(() => reviewWords(review.review), [review.review]);
  const hasLongReview = words.length > REVIEW_WORD_LIMIT;
  const visibleReview = hasLongReview && !isExpanded ? words.slice(0, REVIEW_WORD_LIMIT).join(" ") : review.review;

  return (
    <DynamicTextElement
      id="testimonial_dynamic_quote"
      className={`tf-testimonial-review-text${isExpanded ? " tf-testimonial-review-text--expanded" : ""}`}
    >
      <span>{visibleReview}</span>
      {hasLongReview && !isExpanded ? (
        <a
          className="tf-testimonial-read-more"
          href="#"
          onClick={(event) => {
            event.preventDefault();
            setIsExpanded(true);
          }}
        >
          read more
        </a>
      ) : null}
    </DynamicTextElement>
  );
}

function TestimonialLogo({ review }: { review: ReviewEntry }) {
  const logoStyle: CSSProperties = {
    width: `${review.logoSize.width}px`,
    height: `${review.logoSize.height}px`,
  };

  return (
    <div className="tf-testimonial-logo" style={logoStyle}>
      <Image src={review.logoLocation} alt={`${review.subName} logo`} fill sizes={`${review.logoSize.width}px`} unoptimized />
    </div>
  );
}

export function TestimonialCard({
  mode,
  card,
  review,
  isFading = false,
}: {
  mode: Mode;
  card: TestimonialCardSpec;
  review?: ReviewEntry;
  isFading?: boolean;
}) {
  const activeReview = review ?? REVIEWS[0];
  if (!activeReview) return null;

  return (
    <BoxElement id={card.root.id} className={`${modeClassName(mode, card.root.classToken)} tf-testimonial-card`} type="container">
      <ImageElement id={card.quoteOpen.id} className={modeClassName(mode, card.quoteOpen.classToken)} />
      <ImageElement id={card.quoteClose.id} className={modeClassName(mode, card.quoteClose.classToken)} />
      <div
        className={`tf-testimonial-content-shell${isFading ? " tf-testimonial-content-shell--fading" : ""}`}
        data-review-id={activeReview.id}
      >
        <BoxElement id={card.avatar.id} className={modeClassName(mode, card.avatar.classToken)} type="container" />
        <DynamicTextElement id={card.initial.id} className={modeClassName(mode, card.initial.classToken)}>
          {initialFromName(activeReview.name)}
        </DynamicTextElement>
        <DynamicTextElement id={card.name.id} className={modeClassName(mode, card.name.classToken)}>
          {activeReview.name}
        </DynamicTextElement>
        <DynamicTextElement id={card.role.id} className={modeClassName(mode, card.role.classToken)}>
          {activeReview.subName}
        </DynamicTextElement>
        <TestimonialReviewText key={activeReview.id} review={activeReview} />
        <TestimonialStars starCount={activeReview.starCount} />
        <TestimonialLogo review={activeReview} />
      </div>
    </BoxElement>
  );
}

function MobileTestimonialSlider({ cards }: { cards: TestimonialCardSpec[] }) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const loopedReviews = useMemo(
    () => Array.from({ length: MOBILE_REVIEW_REPEATS }).flatMap(() => REVIEWS),
    [],
  );

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider || REVIEWS.length <= 1) return;

    const placeAtMiddleSet = () => {
      const groupWidth = slider.scrollWidth / MOBILE_REVIEW_REPEATS;
      if (groupWidth) slider.scrollLeft = groupWidth;
    };

    const frame = window.requestAnimationFrame(placeAtMiddleSet);
    const handleScroll = () => {
      const groupWidth = slider.scrollWidth / MOBILE_REVIEW_REPEATS;
      if (!groupWidth) return;

      if (slider.scrollLeft < groupWidth * 0.35) {
        slider.scrollLeft += groupWidth;
      } else if (slider.scrollLeft > groupWidth * 1.65) {
        slider.scrollLeft -= groupWidth;
      }
    };

    slider.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.cancelAnimationFrame(frame);
      slider.removeEventListener("scroll", handleScroll);
    };
  }, []);

  if (!loopedReviews.length) return null;

  return (
    <div className="tf-testimonial-mobile-slider" ref={sliderRef}>
      <div className="tf-testimonial-mobile-track">
        {loopedReviews.map((review, index) => (
          <div className="tf-testimonial-mobile-slide" key={`${review.id}-${index}`}>
            <TestimonialCard mode="mobile" card={cards[index % cards.length]} review={review} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TestimonialDeck({ mode, cards = TESTIMONIAL_CARDS }: { mode: Mode; cards?: TestimonialCardSpec[] }) {
  const { offset, isFading } = useDesktopReviewOffset(mode, cards.length);

  if (mode === "mobile") {
    return (
      <>
        <MobileTestimonialSlider cards={cards} />
        <div className="tf-testimonial-mobile-scroll-hint" aria-hidden="true">
          <span>slide here</span>
          <Image src="/icons/arrow-right-minimal.svg" alt="" width={22} height={22} unoptimized />
        </div>
      </>
    );
  }

  if (!REVIEWS.length) return null;

  return (
    <>
      {cards.map((card, index) => (
        <TestimonialCard
          key={card.root.id}
          mode={mode}
          card={card}
          review={REVIEWS[(offset + index) % REVIEWS.length]}
          isFading={isFading}
        />
      ))}
    </>
  );
}
