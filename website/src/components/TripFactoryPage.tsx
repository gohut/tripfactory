"use client";

import {
  Children,
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ChangeEvent,
  type ReactElement,
} from "react";
import { useSearchParams } from "next/navigation";
import { PackageCard, PACKAGE_CARDS, type PackageDuration, type PackageEnquirySelection } from "@/components/cards/PackageCard";
import { TestimonialDeck } from "@/components/cards/TestimonialCard";
import { OfferingCard, PRIMARY_OFFERING_CARDS, SECONDARY_OFFERING_CARDS } from "@/components/cards/OfferingCard";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteNavbar } from "@/components/SiteNavbar";
import {
  BoxElement,
  ButtonElement,
  ImageElement,
  TextElement,
  content,
  scaledChildren,
  type ButtonAction,
  type ElementProps,
  type Mode,
} from "@/components/cards/shared-elements";
import tourPackagesContent from "@/content/tour-packages.json";
import tripFactoryAnimationsJson from "@/content/trip-factory-animations.json";

type SliderIndexes = Record<string, number>;
type TourPackageLookupSource = {
  collections: Array<{
    cards: Array<{
      id: string;
      state: string;
      title: string;
      duration?: PackageDuration;
      combos: string[];
    }>;
  }>;
};
type TourPackageEntry = {
  packageId: string;
  destination: string;
  title: string;
  duration?: PackageDuration;
  combos: string[];
};
type TourPackageIndex = {
  entries: TourPackageEntry[];
  byId: Map<string, TourPackageEntry>;
  bySelection: Map<string, TourPackageEntry>;
  destinations: string[];
  combosByDestination: Record<string, string[]>;
};
type EnquiryFormState = {
  name: string;
  destination: string;
  combo: string;
  date: string;
  members: string;
  message: string;
  destinationOptions: string[];
  comboOptions: string[];
  onNameChange: (value: string) => void;
  onDestinationChange: (value: string) => void;
  onComboChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onMembersChange: (value: string) => void;
  onMessageChange: (value: string) => void;
};
type PageTreeProps = {
  buttonAction: ButtonAction;
  sliderIndexes: SliderIndexes;
  enquiryForm: EnquiryFormState;
  packageDurationText: string;
  onPackageEnquire: (selection: PackageEnquirySelection) => void;
};
type AnimationFrameSpec = { x: number; y: number; w: number; h: number; opacity: number; scale: number; rotation: number };
type AdvancedAnimationSpec = {
  type: string;
  speed: number;
  delay: number;
  animateOnAppear: boolean;
  smooth: boolean;
  scrollRange: number;
  triggerButtonId: string;
  hoverElementId: string;
  frames: AnimationFrameSpec[];
};


const TOUR_PACKAGE_INDEX: TourPackageIndex = (() => {
  const destinationLookup = new Map<string, Set<string>>();
  const byId = new Map<string, TourPackageEntry>();
  const bySelection = new Map<string, TourPackageEntry>();
  const entries: TourPackageEntry[] = [];
  const source = tourPackagesContent as TourPackageLookupSource;

  for (const collection of source.collections) {
    for (const card of collection.cards) {
      const entry: TourPackageEntry = {
        packageId: card.id,
        destination: card.state,
        title: card.title,
        duration: card.duration,
        combos: card.combos,
      };

      entries.push(entry);
      byId.set(entry.packageId, entry);

      for (const combo of card.combos) {
        const destinationCombos = destinationLookup.get(card.state) ?? new Set<string>();
        destinationCombos.add(combo);
        destinationLookup.set(card.state, destinationCombos);

        const selectionKey = `${card.state}||${combo}`;
        if (!bySelection.has(selectionKey)) bySelection.set(selectionKey, entry);
      }
    }
  }

  return {
    entries,
    byId,
    bySelection,
    destinations: Array.from(destinationLookup.keys()),
    combosByDestination: Object.fromEntries(
      Array.from(destinationLookup.entries()).map(([destination, comboSet]) => [destination, Array.from(comboSet)]),
    ) as Record<string, string[]>,
  };
})();

const TOUR_PACKAGE_DESTINATIONS = TOUR_PACKAGE_INDEX.destinations;
const TOUR_PACKAGE_COMBOS_BY_DESTINATION = TOUR_PACKAGE_INDEX.combosByDestination;

function resolveTourPackageEntry({
  packageId,
  destination,
  combo,
  durationCode,
}: {
  packageId?: string | null;
  destination?: string | null;
  combo?: string | null;
  durationCode?: string | null;
}) {
  const cleanPackageId = packageId?.trim();
  if (cleanPackageId) {
    const byId = TOUR_PACKAGE_INDEX.byId.get(cleanPackageId);
    if (byId) return byId;
  }

  const cleanDestination = destination?.trim();
  const cleanCombo = combo?.trim();
  if (!cleanDestination || !cleanCombo) return null;

  if (durationCode?.trim()) {
    const exactMatch = TOUR_PACKAGE_INDEX.entries.find(
      (entry) =>
        entry.destination === cleanDestination &&
        entry.combos.includes(cleanCombo) &&
        entry.duration?.code === durationCode.trim(),
    );
    if (exactMatch) return exactMatch;
  }

  return TOUR_PACKAGE_INDEX.bySelection.get(`${cleanDestination}||${cleanCombo}`) ?? null;
}

function formatPackageDurationText(duration?: PackageDuration) {
  if (!duration) return "";
  if (typeof duration.days === "number" && typeof duration.nights === "number") {
    if (duration.days === 1 && duration.nights === 0) return "1 day trip";
    if (duration.nights === 0) return `${duration.days} day${duration.days === 1 ? "" : "s"} trip`;
    return `${duration.days} day${duration.days === 1 ? "" : "s"} and ${duration.nights} night${duration.nights === 1 ? "" : "s"}`;
  }
  return duration.label;
}

function buildWhatsAppMessage({
  name,
  destination,
  combo,
  durationText,
  date,
  members,
  message,
}: {
  name: string;
  destination: string;
  combo: string;
  durationText: string;
  date: string;
  members: string;
  message: string;
}) {
  return [
    `Name: ${name.trim()}`,
    `Destination: ${destination.trim()}`,
    `Combo: ${combo.trim()}`,
    `Duration: ${durationText}`,
    `Date: ${date.trim()}`,
    `No. of member: ${members.trim()}`,
    `Message: ${message.trim()}`,
  ].join("\n");
}

type SliderConfig = {
  duration: number;
  loop: boolean;
  autoScroll: boolean;
  vertical: boolean;
  gap: number;
  counts: { desktop: number; mobile: number };
};
type ButtonActionConfig =
  | { slider: string; direction: "next" | "previous" }
  | { locationId: string; target?: string; speed?: number };
type TripFactoryAnimationsData = {
  mobileCanvas: { width: number; height: number };
  sliders: Record<string, SliderConfig>;
  buttonActions: Record<Mode, Record<string, ButtonActionConfig>>;
  locations: Record<string, number>;
  advancedAnimations: Record<Mode, Record<string, AdvancedAnimationSpec>>;
};

const tripFactoryAnimations = tripFactoryAnimationsJson as unknown as TripFactoryAnimationsData;

const MOBILE_CANVAS_WIDTH = tripFactoryAnimations.mobileCanvas.width;
const MOBILE_CANVAS_HEIGHT = tripFactoryAnimations.mobileCanvas.height;
const SLIDERS = tripFactoryAnimations.sliders;
const BUTTON_ACTIONS = tripFactoryAnimations.buttonActions;
const LOCATIONS = tripFactoryAnimations.locations;
const ADVANCED_ANIMATIONS = tripFactoryAnimations.advancedAnimations;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function useMobileScale() {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      setScale(clamp(window.innerWidth / MOBILE_CANVAS_WIDTH, 0.55, 1.35));
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  return scale;
}

function useSliderIndexes() {
  const [sliderIndexes, setSliderIndexes] = useState<SliderIndexes>({});

  const moveSlider = useCallback((id: keyof typeof SLIDERS, direction: 1 | -1) => {
    setSliderIndexes((current) => {
      const slider = SLIDERS[id];
      const count = Math.max(slider.counts.desktop, slider.counts.mobile);
      const currentIndex = current[id] ?? 0;
      let nextIndex = currentIndex + direction;

      if (slider.loop) {
        nextIndex = ((nextIndex % count) + count) % count;
      } else {
        nextIndex = clamp(nextIndex, 0, count - 1);
      }

      return { ...current, [id]: nextIndex };
    });
  }, []);

  useEffect(() => {
    const timers = Object.entries(SLIDERS)
      .filter(([, slider]) => slider.autoScroll)
      .map(([id, slider]) => window.setInterval(() => moveSlider(id as keyof typeof SLIDERS, 1), Math.max(0.5, slider.duration) * 1000));

    return () => timers.forEach((timer) => window.clearInterval(timer));
  }, [moveSlider]);

  return { sliderIndexes, moveSlider };
}

function smoothScrollTo(targetY: number, speed = 1) {
  const startY = window.scrollY;
  const distance = targetY - startY;
  const duration = Math.max(150, Math.min(2500, Math.abs(distance) / (1.1 * speed)));
  const startTime = performance.now();

  const easeInOut = (value: number) => (value < 0.5 ? 2 * value * value : 1 - Math.pow(-2 * value + 2, 2) / 2);

  const step = (timestamp: number) => {
    const progress = Math.min((timestamp - startTime) / duration, 1);
    window.scrollTo(0, startY + distance * easeInOut(progress));
    if (progress < 1) window.requestAnimationFrame(step);
  };

  window.requestAnimationFrame(step);
}


type InputElementProps = ElementProps & {
  inputType?: "text" | "date" | "number";
  value?: string;
  onValueChange?: (value: string) => void;
};

function InputElement({ id, className, children, style, scaleClassName, inputType = "text", value, onValueChange }: InputElementProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = inputType === "number" ? event.target.value.replace(/[^\d]/g, "") : event.target.value;
    onValueChange?.(nextValue);
  };
  const inputValueProps = value !== undefined ? { value } : {};

  return (
    <div className={`tf-el tf-input ${className}`} data-id={id} data-type="input" style={style}>
      <input
        type={inputType}
        placeholder={content.fields[id]?.placeholder ?? ""}
        min={inputType === "number" ? 1 : undefined}
        step={inputType === "number" ? 1 : undefined}
        inputMode={inputType === "number" ? "numeric" : undefined}
        pattern={inputType === "number" ? "[0-9]*" : undefined}
        onChange={handleChange}
        {...inputValueProps}
      />
      {scaledChildren(scaleClassName, children)}
    </div>
  );
}

type TextareaElementProps = ElementProps & {
  value?: string;
  onValueChange?: (value: string) => void;
};

function TextareaElement({ id, className, children, style, scaleClassName, value, onValueChange }: TextareaElementProps) {
  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onValueChange?.(event.target.value);
  };
  const textValueProps = value !== undefined ? { value } : {};

  return (
    <div className={`tf-el tf-textarea ${className}`} data-id={id} data-type="textarea" style={style}>
      <textarea placeholder={content.fields[id]?.placeholder ?? ""} onChange={handleChange} {...textValueProps} />
      {scaledChildren(scaleClassName, children)}
    </div>
  );
}

type SelectElementProps = ElementProps & {
  options?: string[];
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
};

function SelectElement({
  id,
  className,
  children,
  style,
  scaleClassName,
  options,
  value,
  onValueChange,
  disabled = false,
  placeholder,
}: SelectElementProps) {
  const resolvedOptions = options ?? (content.fields[id]?.options?.length ? content.fields[id]?.options : ["Option 1", "Option 2", "Option 3"]);
  const resolvedPlaceholder = placeholder ?? content.fields[id]?.placeholder ?? "Select an option";
  const selectValueProps = value !== undefined ? { value } : {};

  return (
    <div className={`tf-el tf-select ${className}`} data-id={id} data-type="select" style={style}>
      <select disabled={disabled} onChange={(event) => onValueChange?.(event.target.value)} {...selectValueProps}>
        <option value="" disabled>
          {resolvedPlaceholder}
        </option>
        {resolvedOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {scaledChildren(scaleClassName, children)}
    </div>
  );
}

function SliderElement({ id, className, activeIndex, children, style }: ElementProps & { activeIndex: number }) {
  const slider = SLIDERS[id as keyof typeof SLIDERS];
  const slides = Children.toArray(children);
  const safeIndex = slides.length ? ((activeIndex % slides.length) + slides.length) % slides.length : 0;

  return (
    <div className={`tf-el tf-slider ${className}`} data-id={id} data-type="slider" style={style}>
      {Children.map(children, (child, index) => {
        if (!isValidElement(child)) return child;
        const step = index - safeIndex;
        const offset = step * 100;
        const slideStyle: CSSProperties = {
          position: "absolute",
          width: "100%",
          height: "100%",
          transition: "left 0.45s ease, top 0.45s ease",
          left: slider?.vertical ? "0" : slider?.gap ? `calc(${offset}% + ${step * slider.gap}px)` : `${offset}%`,
          top: slider?.vertical ? (slider?.gap ? `calc(${offset}% + ${step * slider.gap}px)` : `${offset}%`) : "0",
        };

        return cloneElement(child as ReactElement<{ style?: CSSProperties }>, {
          style: { ...(child.props as { style?: CSSProperties }).style, ...slideStyle },
        });
      })}
    </div>
  );
}


function DesktopPage({ buttonAction, sliderIndexes, enquiryForm, packageDurationText, onPackageEnquire }: PageTreeProps) {
  return (
    <>
    <BoxElement id={"Hero_Section"} className="tf-d-Hero_Section_qks5n" type="group">
      <ImageElement id={"hero_background_image"} className="tf-d-image_mr4sj8ev_u7og1" />
      <ButtonElement id={"hero_plan_trip_button"} className="tf-d-button_mr66g82p_7h8fl" mode="desktop" onAction={buttonAction} />
      <ButtonElement id={"hero_contact_us_button"} className="tf-d-button_mr66g82t_7h8fl" mode="desktop" onAction={buttonAction} />
      <BoxElement id={"group_mr7fkzds"} className="tf-d-group_mr7fkzds_w9go0" type="group">
        <ImageElement id={"hero_photo_card_1"} className="tf-d-image_mr7fkzdo_szmwo">
          <ImageElement id={"hero_photo_card_1_image"} className="tf-d-image_mr7gzs96_sytpj" />
          <TextElement id={"hero_photo_card_1_label"} className="tf-d-text_mr7h6fmp_el9fl" />
        </ImageElement>
        <ImageElement id={"hero_photo_card_2"} className="tf-d-image_mr7fkzdq_szmwo">
          <ImageElement id={"hero_photo_card_2_image"} className="tf-d-image_mr7fkzdr_szmwo" />
          <TextElement id={"hero_photo_card_2_label"} className="tf-d-text_mr7h6fmr_el9fk" />
        </ImageElement>
        <ImageElement id={"hero_photo_card_3"} className="tf-d-image_mr7fkzdp_szmwo">
          <ImageElement id={"hero_photo_card_3_image"} className="tf-d-image_mr7gzs97_sytpj" />
          <TextElement id={"hero_photo_card_3_label"} className="tf-d-text_mr7h6fmq_el9fl" />
        </ImageElement>
      </BoxElement>
      <TextElement id={"hero_heading_line1"} className="tf-d-text_mr639bcb_fvebo" />
      <TextElement id={"hero_heading_line2"} className="tf-d-text_mr639bcc_fvebo" />
      <TextElement id={"hero_subtext"} className="tf-d-text_mr63mchh_fuh3h" />
    </BoxElement>
    <SiteNavbar className="tf-home-site-navbar tf-home-site-navbar--desktop" currentPath="/" label="Home page navigation" mode="desktop" onAction={buttonAction} />
    <BoxElement id={"About_US_Section"} className="tf-d-About_US_Section_4xggq" type="group">
      <TextElement id={"about_intro_paragraph"} className="tf-d-text_mr7zgza9_eahg1" />
      <TextElement id={"about_secondary_paragraph"} className="tf-d-text_mr7zgzaa_eahg0" />
      <ImageElement id={"about_background_image"} className="tf-d-image_mr80ofaf_tc81a" />
      <BoxElement id={"container_mr9ik21w"} className="tf-d-container_mr9ik21w_667sa" type="container">
        <TextElement id={"about_badge_label"} className="tf-d-text_mr9ik21x_dlpnv" />
      </BoxElement>
      <TextElement id={"about_heading_line1"} className="tf-d-text_mr7zgza6_eahg1" />
      <TextElement id={"about_heading_line2"} className="tf-d-text_mr7zgza7_eahg1" />
    </BoxElement>
    <BoxElement
      id={"Available_package_section"}
      className="tf-d-Available_package_section_bi3c1"
      type="group"
      style={{ overflow: "visible" }}
    >
      <BoxElement
        id={"Package_grp"}
        className="tf-d-Package_grp_seqzz"
        type="group"
        style={{
          // The classToken CSS positions each child card absolutely at its own
          // fixed x/y from the original canvas design, which is why they were
          // stacking on top of each other instead of sitting in a row. Forcing
          // a real flex row here (combined with the position reset on each
          // card's root, see PackageCard.tsx) lays them out side by side.
          //
          // flexWrap must stay "nowrap": the class this group inherits still
          // carries a fixed width sized for the old absolute-stacked layout
          // (narrower than 3 cards + gaps), so "wrap" was sending the 3rd card
          // onto a second row that then sat outside the parent section's fixed
          // height and got clipped — i.e. it looked "missing" rather than
          // wrapped. Keeping everything on one row and letting the group size
          // to its content (instead of the class's fixed width) fixes that.
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          flexWrap: "nowrap",
          gap: "24px",
          width: "fit-content",
          maxWidth: "none",
          position: "relative",
        }}
      >
        {PACKAGE_CARDS.map((card) => (
          <PackageCard key={card.root.id} mode="desktop" card={card} buttonAction={buttonAction} onEnquire={onPackageEnquire} />
        ))}
      </BoxElement>
      <ButtonElement id={"packages_see_more_button"} className="tf-d-button_mr9iulk6_59s0g" mode="desktop" onAction={buttonAction} />
      <TextElement id={"packages_intro_text"} className="tf-d-text_mr9aaqy8_dq924" />
      <TextElement id={"packages_heading"} className="tf-d-text_mr9aaqy6_dq924" />
      <BoxElement id={"container_mr9ik21y"} className="tf-d-container_mr9ik21y_667sa" type="container">
        <TextElement id={"packages_badge_label"} className="tf-d-text_mr9ik21z_dlpnv" />
      </BoxElement>
      <TextElement id={"packages_section_label"} className="tf-d-text_mr9issrr_dlj68" />
    </BoxElement>
    <ImageElement id={"decorative_image_1"} className="tf-d-image_mr9i8q4l_s0t29" />
    <ImageElement id={"decorative_image_2"} className="tf-d-image_mrc6d6g8_8w7j4" />
    <BoxElement id={"Fleet_Section"} className="tf-d-Fleet_Section_bpjmb" type="group">
      <TextElement id={"fleet_description"} className="tf-d-text_mrad23l9_58bwr" />
      <TextElement id={"fleet_heading_line2"} className="tf-d-text_mrad23la_58bws" />
      <BoxElement id={"container_mrad23lb"} className="tf-d-container_mrad23lb_p09cz" type="container">
        <TextElement id={"fleet_badge_label"} className="tf-d-text_mrad23lc_58bws" />
      </BoxElement>
      <TextElement id={"fleet_heading_line1"} className="tf-d-text_mrad23ld_58bws" />
      <TextElement id={"fleet_description_2"} className="tf-d-text_mrad23le_58bwt" />
    </BoxElement>
    <ImageElement id={"decorative_image_3"} className="tf-d-image_mrc4gq2l_8x80t" />
    <BoxElement id={"Testimonial_Section"} className="tf-d-Testimonial_Section_djwgz" type="group">
      <TestimonialDeck mode="desktop" />
      <TextElement id={"testimonials_intro_text"} className="tf-d-text_mra6rgji_4k7b6" />
      <TextElement id={"testimonials_heading"} className="tf-d-text_mra6rgjj_4k7b6" />
      <BoxElement id={"container_mra6rgjk"} className="tf-d-container_mra6rgjk_oc4rd" type="container">
        <TextElement id={"testimonials_badge_label"} className="tf-d-text_mra6rgjl_4k7b6" />
      </BoxElement>
      <TextElement id={"testimonials_heading_line1"} className="tf-d-text_mra6rgjm_4k7b6" />
    </BoxElement>
    <ImageElement id={"decorative_image_4"} className="tf-d-image_mrc841er_8vyp0" />
    <BoxElement id={"Let's_connect_Section"} className="tf-d-Let_s_connect_Section_xqyc9" type="group">
      <BoxElement id={"container_mrax5i7o"} className="tf-d-container_mrax5i7o_pbc8l" type="container">
        <BoxElement id={"container_mrax5i7p"} className="tf-d-container_mrax5i7p_pbc8l" type="container" />
        <BoxElement id={"container_mrax5i7q"} className="tf-d-container_mrax5i7q_pbc8l" type="container">
          <BoxElement id={"container_mraxrtd0"} className="tf-d-container_mraxrtd0_pcffz" type="container" />
          <ImageElement id={"contact_location_icon"} className="tf-d-image_mraxrtcz_8tq4z" />
          <TextElement id={"contact_address"} className="tf-d-text_mraxrtcq_5khzt" />
        </BoxElement>
      </BoxElement>
      <BoxElement id={"Testimonial_Form"} className="tf-d-Testimonial_Form_tx4ll" type="container">
        <div className="tf-enquiry-row tf-enquiry-row--paired">
          <InputElement id={"enquiry_name_input"} className="tf-d-input_mrb0ygep_kwdlv" value={enquiryForm.name} onValueChange={enquiryForm.onNameChange}>
            <TextElement id={"enquiry_name_label"} className="tf-d-text_mrb0ygew_4y2mt" />
          </InputElement>
          <SelectElement
            id={"enquiry_destination_select"}
            className="tf-d-select_mrb0yger_8l91i"
            options={enquiryForm.destinationOptions}
            value={enquiryForm.destination}
            onValueChange={enquiryForm.onDestinationChange}
            placeholder="Select destination"
          >
            <TextElement id={"enquiry_destination_label"} className="tf-d-text_mrb0ygex_4y2mt" />
          </SelectElement>
        </div>
        <SelectElement
          id={"enquiry_combo_select"}
          className="tf-d-select_mrb0yges_8l91i"
          options={enquiryForm.comboOptions}
          value={enquiryForm.combo}
          onValueChange={enquiryForm.onComboChange}
          disabled={!enquiryForm.destination}
          placeholder={enquiryForm.destination ? "Choose combo" : "Select destination first"}
        >
          <TextElement id={"enquiry_combo_label"} className="tf-d-text_mrb0ygey_4y2mt" />
        </SelectElement>
        {packageDurationText ? (
          <div
            className="tf-enquiry-duration-note tf-d-enquiry-duration-note"
            aria-live="polite"
          >
            {packageDurationText}
          </div>
        ) : null}
        <div className="tf-enquiry-row tf-enquiry-row--paired">
          <InputElement id={"enquiry_date_input"} className="tf-d-input_mrb0ygeu_kwdlv" inputType="date" value={enquiryForm.date} onValueChange={enquiryForm.onDateChange}>
            <TextElement id={"enquiry_date_label"} className="tf-d-text_mrb0ygf0_4y2ms" />
          </InputElement>
          <InputElement
            id={"enquiry_members_input"}
            className="tf-d-input_mrb0ygev_kwdlv"
            inputType="number"
            value={enquiryForm.members}
            onValueChange={enquiryForm.onMembersChange}
          >
            <TextElement id={"enquiry_members_label"} className="tf-d-text_mrb0ygf1_4y2ms" />
          </InputElement>
        </div>
        <TextareaElement id={"enquiry_message_textarea"} className="tf-d-textarea_mrb0ygez_t94rj" value={enquiryForm.message} onValueChange={enquiryForm.onMessageChange}>
          <TextElement id={"enquiry_message_label"} className="tf-d-text_mrb0ygf2_4y2ms" />
        </TextareaElement>
        <div className="tf-enquiry-row tf-enquiry-row--button">
          <ButtonElement id={"enquiry_send_button"} className="tf-d-button_mrb0yget_d9so0" mode="desktop" onAction={buttonAction} />
        </div>
        <div className="tf-enquiry-contact-line">
          <ImageElement id={"enquiry_whatsapp_icon"} className="tf-d-image_mrb2zm77_9f16j" />
          <TextElement id={"enquiry_whatsapp_text"} className="tf-d-text_mrb2fots_4yu9j" />
        </div>
        <BoxElement id={"container_mraxrtcx"} className="tf-d-container_mraxrtcx_pcfg0" type="container">
          <TextElement id={"enquiry_phone_text"} className="tf-d-text_mraxrtcy_5khzt" />
          <ImageElement id={"enquiry_phone_icon"} className="tf-d-image_mrb0t6c8_9g9pd" />
        </BoxElement>
      </BoxElement>
      <BoxElement id={"container_mrax5i7t"} className="tf-d-container_mrax5i7t_pbc8l" type="container">
        <TextElement id={"contact_website_text"} className="tf-d-text_mraxrtcu_5khzt" />
        <ImageElement id={"contact_website_icon"} className="tf-d-image_mrb0t6c7_9g9pd" />
      </BoxElement>
      <BoxElement id={"container_mraxrtcv"} className="tf-d-container_mraxrtcv_pcfg0" type="container">
        <TextElement id={"contact_email_text"} className="tf-d-text_mraxrtcw_5khzt" />
        <ImageElement id={"contact_email_icon"} className="tf-d-image_mrb0t6c9_9g9pd" />
      </BoxElement>
      <TextElement id={"cta_intro_text"} className="tf-d-text_mraw949s_5iwgi" />
      <TextElement id={"cta_heading_line2"} className="tf-d-text_mraw949t_5iwgi" />
      <BoxElement id={"container_mraw949u"} className="tf-d-container_mraw949u_patwp" type="container">
        <TextElement id={"cta_badge_label"} className="tf-d-text_mraw949v_5iwgi" />
      </BoxElement>
      <TextElement id={"cta_heading_line1"} className="tf-d-text_mraw949w_5iwgi" />
    </BoxElement>
    <SiteFooter className="tf-home-site-footer tf-home-site-footer--desktop" mode="desktop" onAction={buttonAction} />
    <ImageElement id={"decorative_image_5"} className="tf-d-image_mrc98pax_8vb1u" />
    <ImageElement id={"marquee_logo_1"} className="tf-d-image_mrc9fn5h_8uhqz" />
    <ImageElement id={"marquee_logo_2"} className="tf-d-image_mrc9fn5g_8uhqz" />
    <ImageElement id={"decorative_image_6"} className="tf-d-image_mrboyqls_8hi91" />
    <BoxElement id={"container_mrbv8hmy"} className="tf-d-container_mrbv8hmy_prc7b" type="container">
      <SliderElement id={"slider_mrad23lg"} className="tf-d-slider_mrad23lg_ypqky" activeIndex={sliderIndexes["slider_mrad23lg"] ?? 0}>
        <ImageElement id={"fleet_bus_photo_1"} className="tf-d-image_mrad23lf_95w80" />
        <ImageElement id={"fleet_bus_photo_2"} className="tf-d-image_mrad23lh_95w80" />
        <ImageElement id={"fleet_bus_photo_3"} className="tf-d-image_mrad23li_95w80" />
        <ImageElement id={"fleet_bus_photo_4"} className="tf-d-image_mrad23lj_95w80" />
        <ImageElement id={"fleet_bus_photo_5"} className="tf-d-image_mrad23lk_95w80" />
        <ImageElement id={"fleet_bus_photo_6"} className="tf-d-image_mrad23ll_95w80" />
        <ImageElement id={"fleet_bus_photo_7"} className="tf-d-image_mrad23lm_95w80" />
        <ImageElement id={"fleet_bus_photo_8"} className="tf-d-image_mrad23ln_95w80" />
        <ImageElement id={"fleet_bus_photo_9"} className="tf-d-image_mrad23lo_95w80" />
        <ImageElement id={"fleet_bus_photo_10"} className="tf-d-image_mrad23lp_95w80" />
        <ImageElement id={"fleet_bus_photo_11"} className="tf-d-image_mrad23lq_95w80" />
        <ImageElement id={"fleet_bus_photo_12"} className="tf-d-image_mrad23lr_95w80" />
        <ImageElement id={"fleet_bus_photo_13"} className="tf-d-image_mrad23ls_95w80" />
        <ImageElement id={"fleet_bus_photo_14"} className="tf-d-image_mrad23lt_95w80" />
        <ImageElement id={"fleet_bus_photo_15"} className="tf-d-image_mrad23lu_95w80" />
        <ImageElement id={"fleet_bus_photo_16"} className="tf-d-image_mrad23lw_95w80" />
      </SliderElement>
      <ButtonElement id={"fleet_slider_next_button"} className="tf-d-rightBtn_nr0rc" mode="desktop" onAction={buttonAction} />
      <ButtonElement id={"fleet_slider_prev_button"} className="tf-d-leftBtn_wzr9x" mode="desktop" onAction={buttonAction} />
    </BoxElement>
    <ImageElement id={"gallery_polaroid_frame"} className="tf-d-Poloroid_slider_plsqu">
      <SliderElement id={"slider_mrbma3g2"} className="tf-d-slider_mrbma3g2_zckcx" activeIndex={sliderIndexes["slider_mrbma3g2"] ?? 0}>
        <ImageElement id={"gallery_photo_1"} className="tf-d-image_mrbma3fs_8j2g1" />
        <ImageElement id={"gallery_photo_2"} className="tf-d-image_mrbma3ft_8j2g1" />
        <ImageElement id={"gallery_photo_3"} className="tf-d-image_mrbma3fu_8j2g1" />
        <ImageElement id={"gallery_photo_4"} className="tf-d-image_mrbma3fv_8j2g1" />
        <ImageElement id={"gallery_photo_5"} className="tf-d-image_mrbma3fw_8j2g1" />
        <ImageElement id={"gallery_photo_6"} className="tf-d-image_mrbma3fx_8j2g1" />
        <ImageElement id={"gallery_photo_7"} className="tf-d-image_mrbma3fy_8j2g1" />
        <ImageElement id={"gallery_photo_8"} className="tf-d-image_mrbma3fz_8j2g1" />
        <ImageElement id={"gallery_photo_9"} className="tf-d-image_mrbma3g0_8j2g2" />
        <ImageElement id={"gallery_photo_10"} className="tf-d-image_mrbma3g1_8j2g2" />
      </SliderElement>
    </ImageElement>
    {PRIMARY_OFFERING_CARDS.map((card) => (
      <OfferingCard key={card.root.id} mode="desktop" card={card} />
    ))}
    <BoxElement id={"container_mrbma3fj"} className="tf-d-container_mrbma3fj_pn34y" type="container">
      <TextElement id={"offerings_badge_label"} className="tf-d-text_mrbma3fk_5v5os" />
      <TextElement id={"offerings_heading_line1"} className="tf-d-text_mrbma3fn_5v5os" />
      <TextElement id={"offerings_heading_line2"} className="tf-d-text_mrbma3fo_5v5os" />
      <TextElement id={"offerings_description"} className="tf-d-text_mrbma3fp_5v5os" />
    </BoxElement>
    {SECONDARY_OFFERING_CARDS.map((card) => (
      <OfferingCard key={card.root.id} mode="desktop" card={card} />
    ))}
    <TextElement id={"gallery_tagline"} className="tf-d-text_mrbqbw7h_5xevf" />
    <BoxElement id={"container_mrcd83lw"} className="tf-d-container_mrcd83lw_pygfp" type="container">
      <TextElement id={"fleet_bottom_badge_label"} className="tf-d-text_mrcd83lx_66izj" />
    </BoxElement>
    </>
  );
}

function MobilePage({ buttonAction, sliderIndexes, enquiryForm, packageDurationText, onPackageEnquire }: PageTreeProps) {
  return (
    <>
    <BoxElement id={"Hero_Section"} className="tf-m-Hero_Section_qks5n" type="group">
      <ImageElement id={"hero_background_image"} className="tf-m-image_mr4sj8ev_u7og1" />
      <ButtonElement id={"hero_plan_trip_button"} className="tf-m-button_mr66g82p_7h8fl" mode="mobile" onAction={buttonAction} />
      <ButtonElement id={"hero_contact_us_button"} className="tf-m-button_mr66g82t_7h8fl" mode="mobile" onAction={buttonAction} />
      <BoxElement id={"group_mr7fkzds"} className="tf-m-group_mr7fkzds_w9go0" type="group" scaleClassName="tf-scale-m-group_mr7fkzds_w9go0">
        <ImageElement id={"hero_photo_card_1"} className="tf-m-image_mr7fkzdo_szmwo">
          <ImageElement id={"hero_photo_card_1_image"} className="tf-m-image_mr7gzs96_sytpj" />
          <TextElement id={"hero_photo_card_1_label"} className="tf-m-text_mr7h6fmp_el9fl" />
        </ImageElement>
        <ImageElement id={"hero_photo_card_2"} className="tf-m-image_mr7fkzdq_szmwo">
          <ImageElement id={"hero_photo_card_2_image"} className="tf-m-image_mr7fkzdr_szmwo" />
          <TextElement id={"hero_photo_card_2_label"} className="tf-m-text_mr7h6fmr_el9fk" />
        </ImageElement>
        <ImageElement id={"hero_photo_card_3"} className="tf-m-image_mr7fkzdp_szmwo">
          <ImageElement id={"hero_photo_card_3_image"} className="tf-m-image_mr7gzs97_sytpj" />
          <TextElement id={"hero_photo_card_3_label"} className="tf-m-text_mr7h6fmq_el9fl" />
        </ImageElement>
      </BoxElement>
      <TextElement id={"hero_heading_line1"} className="tf-m-text_mr639bcb_fvebo" />
      <TextElement id={"hero_heading_line2"} className="tf-m-text_mr639bcc_fvebo" />
      <TextElement id={"hero_subtext"} className="tf-m-text_mr63mchh_fuh3h" />
    </BoxElement>
    <SiteNavbar className="tf-home-site-navbar tf-home-site-navbar--mobile" currentPath="/" label="Home page navigation" mode="mobile" onAction={buttonAction} />
    <BoxElement id={"About_US_Section"} className="tf-m-About_US_Section_4xggq" type="group">
      <TextElement id={"about_intro_paragraph"} className="tf-m-text_mr7zgza9_eahg1" />
      <TextElement id={"about_secondary_paragraph"} className="tf-m-text_mr7zgzaa_eahg0" />
      <ImageElement id={"about_background_image"} className="tf-m-image_mr80ofaf_tc81a" />
      <BoxElement id={"container_mr9ik21w"} className="tf-m-container_mr9ik21w_667sa" type="container">
        <TextElement id={"about_badge_label"} className="tf-m-text_mr9ik21x_dlpnv" />
      </BoxElement>
      <TextElement id={"about_heading_line1"} className="tf-m-text_mr7zgza6_eahg1" />
      <TextElement id={"about_heading_line2"} className="tf-m-text_mr7zgza7_eahg1" />
    </BoxElement>
    <BoxElement id={"Available_package_section"} className="tf-m-Available_package_section_bi3c1" type="group">
      <BoxElement
        id={"Package_grp"}
        className="tf-m-Package_grp_seqzz"
        type="group"
        style={{
          // Same fix as the desktop tree: replace the legacy absolute-positioned
          // stacking with a real flex row. On mobile there isn't room for three
          // cards side by side without shrinking them illegibly, so this row
          // scrolls horizontally instead of wrapping.
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          flexWrap: "nowrap",
          gap: "16px",
          overflowX: "auto",
          position: "relative",
          left: "316px",
          width: "calc(100vw - 32px)",
          maxWidth: "358px",
          height: "465px",
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none",
          background: "transparent",
        }}
      >
        {PACKAGE_CARDS.map((card) => (
          <PackageCard key={card.root.id} mode="mobile" card={card} buttonAction={buttonAction} onEnquire={onPackageEnquire} />
        ))}
      </BoxElement>
      <ButtonElement id={"packages_see_more_button"} className="tf-m-button_mr9iulk6_59s0g" mode="mobile" onAction={buttonAction} />
      <TextElement id={"packages_intro_text"} className="tf-m-text_mr9aaqy8_dq924" />
      <TextElement id={"packages_heading"} className="tf-m-text_mr9aaqy6_dq924" />
      <BoxElement id={"container_mr9ik21y"} className="tf-m-container_mr9ik21y_667sa" type="container">
        <TextElement id={"packages_badge_label"} className="tf-m-text_mr9ik21z_dlpnv" />
      </BoxElement>
      <TextElement id={"packages_section_label"} className="tf-m-text_mr9issrr_dlj68" />
    </BoxElement>
    <ImageElement id={"decorative_image_1"} className="tf-m-image_mr9i8q4l_s0t29" />
    <ImageElement id={"decorative_image_2"} className="tf-m-image_mrc6d6g8_8w7j4" />
    <BoxElement id={"Fleet_Section"} className="tf-m-Fleet_Section_bpjmb" type="group">
      <BoxElement id={"container_mrbv8hmy"} className="tf-m-container_mrbv8hmy_prc7b" type="container" scaleClassName="tf-scale-m-container_mrbv8hmy_prc7b">
        <SliderElement id={"slider_mrad23lg"} className="tf-m-slider_mrad23lg_ypqky" activeIndex={sliderIndexes["slider_mrad23lg"] ?? 0}>
          <ImageElement id={"fleet_bus_photo_1"} className="tf-m-image_mrad23lf_95w80" />
          <ImageElement id={"fleet_bus_photo_2"} className="tf-m-image_mrad23lh_95w80" />
          <ImageElement id={"fleet_bus_photo_3"} className="tf-m-image_mrad23li_95w80" />
          <ImageElement id={"fleet_bus_photo_4"} className="tf-m-image_mrad23lj_95w80" />
          <ImageElement id={"fleet_bus_photo_5"} className="tf-m-image_mrad23lk_95w80" />
          <ImageElement id={"fleet_bus_photo_6"} className="tf-m-image_mrad23ll_95w80" />
          <ImageElement id={"fleet_bus_photo_7"} className="tf-m-image_mrad23lm_95w80" />
          <ImageElement id={"fleet_bus_photo_8"} className="tf-m-image_mrad23ln_95w80" />
          <ImageElement id={"fleet_bus_photo_9"} className="tf-m-image_mrad23lo_95w80" />
          <ImageElement id={"fleet_bus_photo_10"} className="tf-m-image_mrad23lp_95w80" />
          <ImageElement id={"fleet_bus_photo_11"} className="tf-m-image_mrad23lq_95w80" />
          <ImageElement id={"fleet_bus_photo_12"} className="tf-m-image_mrad23lr_95w80" />
          <ImageElement id={"fleet_bus_photo_13"} className="tf-m-image_mrad23ls_95w80" />
          <ImageElement id={"fleet_bus_photo_14"} className="tf-m-image_mrad23lt_95w80" />
          <ImageElement id={"fleet_bus_photo_15"} className="tf-m-image_mrad23lu_95w80" />
          <ImageElement id={"fleet_bus_photo_16"} className="tf-m-image_mrad23lw_95w80" />
        </SliderElement>
        <ButtonElement id={"fleet_slider_next_button"} className="tf-m-rightBtn_nr0rc" mode="mobile" onAction={buttonAction} />
        <ButtonElement id={"fleet_slider_prev_button"} className="tf-m-leftBtn_wzr9x" mode="mobile" onAction={buttonAction} />
      </BoxElement>
      <TextElement id={"fleet_description"} className="tf-m-text_mrad23l9_58bwr" />
      <TextElement id={"fleet_heading_line2"} className="tf-m-text_mrad23la_58bws" />
      <BoxElement id={"container_mrad23lb"} className="tf-m-container_mrad23lb_p09cz" type="container">
        <TextElement id={"fleet_badge_label"} className="tf-m-text_mrad23lc_58bws" />
      </BoxElement>
      <TextElement id={"fleet_heading_line1"} className="tf-m-text_mrad23ld_58bws" />
      <TextElement id={"fleet_description_2"} className="tf-m-text_mrad23le_58bwt" />
    </BoxElement>
    <ImageElement id={"decorative_image_3"} className="tf-m-image_mrc4gq2l_8x80t" />
    <BoxElement id={"Testimonial_Section"} className="tf-m-Testimonial_Section_djwgz" type="group" scaleClassName="tf-scale-m-Testimonial_Section_djwgz">
      <TestimonialDeck mode="mobile" />
      <TextElement id={"testimonials_intro_text"} className="tf-m-text_mra6rgji_4k7b6" />
      <TextElement id={"testimonials_heading"} className="tf-m-text_mra6rgjj_4k7b6" />
      <BoxElement id={"container_mra6rgjk"} className="tf-m-container_mra6rgjk_oc4rd" type="container">
        <TextElement id={"testimonials_badge_label"} className="tf-m-text_mra6rgjl_4k7b6" />
      </BoxElement>
      <TextElement id={"testimonials_heading_line1"} className="tf-m-text_mra6rgjm_4k7b6" />
    </BoxElement>
    <ImageElement id={"decorative_image_4"} className="tf-m-image_mrc841er_8vyp0" />
    <BoxElement id={"Let's_connect_Section"} className="tf-m-Let_s_connect_Section_xqyc9" type="group">
      <BoxElement id={"container_mrax5i7o"} className="tf-m-container_mrax5i7o_pbc8l" type="container" scaleClassName="tf-scale-m-container_mrax5i7o_pbc8l">
        <BoxElement id={"container_mrax5i7p"} className="tf-m-container_mrax5i7p_pbc8l" type="container" />
        <BoxElement id={"container_mrax5i7q"} className="tf-m-container_mrax5i7q_pbc8l" type="container">
          <BoxElement id={"container_mraxrtd0"} className="tf-m-container_mraxrtd0_pcffz" type="container" />
          <ImageElement id={"contact_location_icon"} className="tf-m-image_mraxrtcz_8tq4z" />
          <TextElement id={"contact_address"} className="tf-m-text_mraxrtcq_5khzt" />
        </BoxElement>
        <BoxElement id={"container_mrax5i7t"} className="tf-m-container_mrax5i7t_pbc8l" type="container">
          <TextElement id={"contact_website_text"} className="tf-m-text_mraxrtcu_5khzt" />
          <ImageElement id={"contact_website_icon"} className="tf-m-image_mrb0t6c7_9g9pd" />
        </BoxElement>
        <BoxElement id={"container_mraxrtcv"} className="tf-m-container_mraxrtcv_pcfg0" type="container">
          <TextElement id={"contact_email_text"} className="tf-m-text_mraxrtcw_5khzt" />
          <ImageElement id={"contact_email_icon"} className="tf-m-image_mrb0t6c9_9g9pd" />
        </BoxElement>
      </BoxElement>
      <BoxElement id={"Testimonial_Form"} className="tf-m-Testimonial_Form_tx4ll" type="container">
        <div className="tf-enquiry-row tf-enquiry-row--paired">
          <InputElement id={"enquiry_name_input"} className="tf-m-input_mrb0ygep_kwdlv" value={enquiryForm.name} onValueChange={enquiryForm.onNameChange}>
            <TextElement id={"enquiry_name_label"} className="tf-m-text_mrb0ygew_4y2mt" />
          </InputElement>
          <SelectElement
            id={"enquiry_destination_select"}
            className="tf-m-select_mrb0yger_8l91i"
            options={enquiryForm.destinationOptions}
            value={enquiryForm.destination}
            onValueChange={enquiryForm.onDestinationChange}
            placeholder="Select destination"
          >
            <TextElement id={"enquiry_destination_label"} className="tf-m-text_mrb0ygex_4y2mt" />
          </SelectElement>
        </div>
        <SelectElement
          id={"enquiry_combo_select"}
          className="tf-m-select_mrb0yges_8l91i"
          options={enquiryForm.comboOptions}
          value={enquiryForm.combo}
          onValueChange={enquiryForm.onComboChange}
          disabled={!enquiryForm.destination}
          placeholder={enquiryForm.destination ? "Choose combo" : "Select destination first"}
        >
          <TextElement id={"enquiry_combo_label"} className="tf-m-text_mrb0ygey_4y2mt" />
        </SelectElement>
        {packageDurationText ? (
          <div
            className="tf-enquiry-duration-note tf-m-enquiry-duration-note"
            aria-live="polite"
          >
            {packageDurationText}
          </div>
        ) : null}
        <div className="tf-enquiry-row tf-enquiry-row--paired">
          <InputElement id={"enquiry_date_input"} className="tf-m-input_mrb0ygeu_kwdlv" inputType="date" value={enquiryForm.date} onValueChange={enquiryForm.onDateChange}>
            <TextElement id={"enquiry_date_label"} className="tf-m-text_mrb0ygf0_4y2ms" />
          </InputElement>
          <InputElement
            id={"enquiry_members_input"}
            className="tf-m-input_mrb0ygev_kwdlv"
            inputType="number"
            value={enquiryForm.members}
            onValueChange={enquiryForm.onMembersChange}
          >
            <TextElement id={"enquiry_members_label"} className="tf-m-text_mrb0ygf1_4y2ms" />
          </InputElement>
        </div>
        <TextareaElement id={"enquiry_message_textarea"} className="tf-m-textarea_mrb0ygez_t94rj" value={enquiryForm.message} onValueChange={enquiryForm.onMessageChange}>
          <TextElement id={"enquiry_message_label"} className="tf-m-text_mrb0ygf2_4y2ms" />
        </TextareaElement>
        <div className="tf-enquiry-row tf-enquiry-row--button">
          <ButtonElement id={"enquiry_send_button"} className="tf-m-button_mrb0yget_d9so0" mode="mobile" onAction={buttonAction} />
        </div>
        <div className="tf-enquiry-contact-line">
          <ImageElement id={"enquiry_whatsapp_icon"} className="tf-m-image_mrb2zm77_9f16j" />
          <TextElement id={"enquiry_whatsapp_text"} className="tf-m-text_mrb2fots_4yu9j" />
        </div>
        <BoxElement id={"container_mraxrtcx"} className="tf-m-container_mraxrtcx_pcfg0" type="container">
          <TextElement id={"enquiry_phone_text"} className="tf-m-text_mraxrtcy_5khzt" />
          <ImageElement id={"enquiry_phone_icon"} className="tf-m-image_mrb0t6c8_9g9pd" />
        </BoxElement>
      </BoxElement>
      <TextElement id={"cta_intro_text"} className="tf-m-text_mraw949s_5iwgi" />
      <TextElement id={"cta_heading_line2"} className="tf-m-text_mraw949t_5iwgi" />
      <BoxElement id={"container_mraw949u"} className="tf-m-container_mraw949u_patwp" type="container">
        <TextElement id={"cta_badge_label"} className="tf-m-text_mraw949v_5iwgi" />
      </BoxElement>
      <TextElement id={"cta_heading_line1"} className="tf-m-text_mraw949w_5iwgi" />
    </BoxElement>
    <SiteFooter className="tf-home-site-footer tf-home-site-footer--mobile" mode="mobile" onAction={buttonAction} />
    <ImageElement id={"decorative_image_5"} className="tf-m-image_mrc98pax_8vb1u" />
    <ImageElement id={"marquee_logo_1"} className="tf-m-image_mrc9fn5h_8uhqz" />
    <ImageElement id={"marquee_logo_2"} className="tf-m-image_mrc9fn5g_8uhqz" />
    <BoxElement id={"Our_Offering_Section"} className="tf-m-Our_Offering_Section_2mlhu" type="container">
      <BoxElement id={"Offering_Section"} className="tf-m-Offering_Section_1b4dd" type="container" scaleClassName="tf-scale-m-Offering_Section_1b4dd">
        {PRIMARY_OFFERING_CARDS.map((card) => (
          <OfferingCard key={card.root.id} mode="mobile" card={card} />
        ))}
      </BoxElement>
      <BoxElement id={"container_mrbma3fj"} className="tf-m-container_mrbma3fj_pn34y" type="container">
        <TextElement id={"offerings_badge_label"} className="tf-m-text_mrbma3fk_5v5os" />
        <TextElement id={"offerings_heading_line1"} className="tf-m-text_mrbma3fn_5v5os" />
        <TextElement id={"offerings_heading_line2"} className="tf-m-text_mrbma3fo_5v5os" />
        <TextElement id={"offerings_description"} className="tf-m-text_mrbma3fp_5v5os" />
      </BoxElement>
      <BoxElement id={"container_mrbw694r"} className="tf-m-container_mrbw694r_prtpq" type="container" scaleClassName="tf-scale-m-container_mrbw694r_prtpq">
        {SECONDARY_OFFERING_CARDS.map((card) => (
          <OfferingCard key={card.root.id} mode="mobile" card={card} />
        ))}
      </BoxElement>
      <BoxElement id={"poloroid_Section"} className="tf-m-poloroid_Section_awt7z" type="container">
        <ImageElement id={"gallery_polaroid_frame"} className="tf-m-Poloroid_slider_plsqu" scaleClassName="tf-scale-m-Poloroid_slider_plsqu">
          <TextElement id={"gallery_tagline"} className="tf-m-text_mrbqbw7h_5xevf" />
          <SliderElement id={"slider_mrbma3g2"} className="tf-m-slider_mrbma3g2_zckcx" activeIndex={sliderIndexes["slider_mrbma3g2"] ?? 0}>
            <ImageElement id={"gallery_photo_1"} className="tf-m-image_mrbma3fs_8j2g1" />
            <ImageElement id={"gallery_photo_2"} className="tf-m-image_mrbma3ft_8j2g1" />
            <ImageElement id={"gallery_photo_3"} className="tf-m-image_mrbma3fu_8j2g1" />
            <ImageElement id={"gallery_photo_4"} className="tf-m-image_mrbma3fv_8j2g1" />
            <ImageElement id={"gallery_photo_5"} className="tf-m-image_mrbma3fw_8j2g1" />
            <ImageElement id={"gallery_photo_6"} className="tf-m-image_mrbma3fx_8j2g1" />
            <ImageElement id={"gallery_photo_7"} className="tf-m-image_mrbma3fy_8j2g1" />
            <ImageElement id={"gallery_photo_8"} className="tf-m-image_mrbma3fz_8j2g1" />
            <ImageElement id={"gallery_photo_9"} className="tf-m-image_mrbma3g0_8j2g2" />
            <ImageElement id={"gallery_photo_10"} className="tf-m-image_mrbma3g1_8j2g2" />
          </SliderElement>
        </ImageElement>
      </BoxElement>
    </BoxElement>
    <ImageElement id={"decorative_image_6"} className="tf-m-image_mrboyqls_8hi91" />
    <TextElement id={"mobile_contact_us_heading"} className="tf-m-text_mrdfrhpx_6pqbq" />
    </>
  );
}


function findAnimatedNode(root: HTMLElement, id: string) {
  return Array.from(root.querySelectorAll<HTMLElement>("[data-id]")).find((node) => node.dataset.id === id) ?? null;
}

function frameTransform(frame: Pick<AnimationFrameSpec, "rotation" | "scale">) {
  const parts: string[] = [];
  if (frame.rotation) parts.push("rotate(" + frame.rotation + "deg)");
  if (frame.scale !== undefined && frame.scale !== 1) parts.push("scale(" + frame.scale + ")");
  return parts.join(" ") || "none";
}

function applyAnimationFrame(node: HTMLElement, frame: AnimationFrameSpec) {
  node.style.left = frame.x + "px";
  node.style.top = frame.y + "px";
  node.style.width = frame.w + "px";
  node.style.height = frame.h + "px";
  node.style.opacity = String(frame.opacity ?? 1);
  node.style.transform = frameTransform(frame);
  node.style.transformOrigin = "center center";
}

function interpolateValue(start: number, end: number, t: number) {
  return start + (end - start) * t;
}

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function evaluateFrames(frames: AnimationFrameSpec[], t: number): AnimationFrameSpec {
  if (frames.length === 1) return frames[0];
  const clamped = clamp(t, 0, 1);
  const segments = frames.length - 1;
  const segment = Math.min(Math.floor(clamped * segments), segments - 1);
  const segmentT = clamped * segments - segment;
  const start = frames[segment];
  const end = frames[segment + 1];

  return {
    x: interpolateValue(start.x, end.x, segmentT),
    y: interpolateValue(start.y, end.y, segmentT),
    w: interpolateValue(start.w, end.w, segmentT),
    h: interpolateValue(start.h, end.h, segmentT),
    opacity: interpolateValue(start.opacity ?? 1, end.opacity ?? 1, segmentT),
    scale: interpolateValue(start.scale ?? 1, end.scale ?? 1, segmentT),
    rotation: interpolateValue(start.rotation ?? 0, end.rotation ?? 0, segmentT),
  };
}

function isFullyVisible(node: HTMLElement) {
  const rect = node.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  return rect.top >= 0 && rect.bottom <= viewportHeight;
}

function activeAnimationMode(): Mode {
  return window.innerWidth <= 480 ? "mobile" : "desktop";
}

function useAdvancedAnimations() {
  useEffect(() => {
    let cleanupCurrent = () => {};
    let resizeTimer: number | undefined;

    const setup = () => {
      cleanupCurrent();

      const mode = activeAnimationMode();
      const root = document.querySelector<HTMLElement>(mode === "mobile" ? ".tf-mobile-canvas" : ".tf-desktop-canvas");
      if (!root) return;

      const cleanups: Array<() => void> = [];
      const runningFrames = new Set<number>();
      const scrollAnimations = new Map<string, { node: HTMLElement; animation: AdvancedAnimationSpec; t: number; ready: boolean; appeared: boolean; delayStarted: boolean }>();
      let lastScrollY = window.scrollY;

      const cancelFrame = (frameId: number) => {
        window.cancelAnimationFrame(frameId);
        runningFrames.delete(frameId);
      };

      const trackFrame = (frameId: number) => {
        runningFrames.add(frameId);
        return frameId;
      };

      const startLoopOrOnce = (id: string, node: HTMLElement, animation: AdvancedAnimationSpec) => {
        let t = 0;
        let direction = 1;
        let lastTimestamp: number | null = null;
        let delayLeft = animation.delay;
        let frameId = 0;

        const tick = (timestamp: number) => {
          const delta = lastTimestamp === null ? 0 : Math.min((timestamp - lastTimestamp) / 1000, 0.1);
          lastTimestamp = timestamp;

          if (delayLeft > 0) {
            delayLeft -= delta;
            frameId = trackFrame(window.requestAnimationFrame(tick));
            return;
          }

          if (animation.type === "loop") {
            if (animation.smooth) {
              t += direction * delta / animation.speed;
              if (t >= 1) {
                t = 1;
                direction = -1;
              }
              if (t <= 0) {
                t = 0;
                direction = 1;
              }
            } else {
              t = (t + delta / animation.speed) % 1;
            }
          } else {
            t = Math.min(t + delta / animation.speed, 1);
          }

          applyAnimationFrame(node, evaluateFrames(animation.frames, easeInOut(t)));

          if (animation.type !== "once" || t < 1) {
            frameId = trackFrame(window.requestAnimationFrame(tick));
          }
        };

        frameId = trackFrame(window.requestAnimationFrame(tick));
        cleanups.push(() => {
          if (frameId) cancelFrame(frameId);
          void id;
        });
      };

      const startWhenReady = (node: HTMLElement, animation: AdvancedAnimationSpec, start: () => void) => {
        if (!animation.animateOnAppear) {
          start();
          return;
        }

        const observer = new IntersectionObserver((entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            start();
            observer.disconnect();
          }
        }, { threshold: 0.15 });

        observer.observe(node);
        cleanups.push(() => observer.disconnect());
      };

      const animateTowards = (node: HTMLElement, animation: AdvancedAnimationSpec, state: { t: number; frameId?: number; lastTimestamp?: number | null }, target: number) => {
        if (state.frameId) cancelFrame(state.frameId);
        state.lastTimestamp = null;

        const tick = (timestamp: number) => {
          const delta = state.lastTimestamp === null || state.lastTimestamp === undefined ? 0 : Math.min((timestamp - state.lastTimestamp) / 1000, 0.1);
          state.lastTimestamp = timestamp;
          const direction = target > state.t ? 1 : -1;
          state.t += direction * delta / animation.speed;

          if ((direction === 1 && state.t >= target) || (direction === -1 && state.t <= target)) state.t = target;
          applyAnimationFrame(node, evaluateFrames(animation.frames, easeInOut(state.t)));

          if (state.t !== target) state.frameId = trackFrame(window.requestAnimationFrame(tick));
          else state.frameId = undefined;
        };

        state.frameId = trackFrame(window.requestAnimationFrame(tick));
      };

      for (const [id, animation] of Object.entries(ADVANCED_ANIMATIONS[mode])) {
        const node = findAnimatedNode(root, id);
        if (!node) continue;

        applyAnimationFrame(node, animation.frames[0]);

        if (animation.type === "scroll") {
          scrollAnimations.set(id, { node, animation, t: 0, ready: !animation.animateOnAppear && animation.delay <= 0, appeared: !animation.animateOnAppear, delayStarted: false });
          if (!animation.animateOnAppear && animation.delay > 0) {
            const timer = window.setTimeout(() => {
              const state = scrollAnimations.get(id);
              if (state) state.ready = true;
            }, animation.delay * 1000);
            cleanups.push(() => window.clearTimeout(timer));
          }
          continue;
        }

        if (animation.type === "hover") {
          const hoverNode = animation.hoverElementId ? findAnimatedNode(root, animation.hoverElementId) : node;
          if (!hoverNode) continue;
          const state = { t: 0, frameId: undefined as number | undefined, lastTimestamp: null as number | null };
          const enter = () => animateTowards(node, animation, state, 1);
          const leave = () => animateTowards(node, animation, state, 0);
          hoverNode.addEventListener("mouseenter", enter);
          hoverNode.addEventListener("mouseleave", leave);
          cleanups.push(() => {
            hoverNode.removeEventListener("mouseenter", enter);
            hoverNode.removeEventListener("mouseleave", leave);
            if (state.frameId) cancelFrame(state.frameId);
          });
          continue;
        }

        if (animation.type === "trigger") {
          const triggerNode = animation.triggerButtonId ? findAnimatedNode(root, animation.triggerButtonId) : null;
          if (!triggerNode) continue;
          const click = () => startLoopOrOnce(id, node, { ...animation, type: "once" });
          triggerNode.addEventListener("click", click);
          cleanups.push(() => triggerNode.removeEventListener("click", click));
          continue;
        }

        startWhenReady(node, animation, () => startLoopOrOnce(id, node, animation));
      }

      const onScroll = () => {
        const currentY = window.scrollY;
        const delta = currentY - lastScrollY;
        lastScrollY = currentY;
        if (!delta) return;

        for (const [id, state] of scrollAnimations.entries()) {
          if (state.animation.animateOnAppear) {
            const visible = isFullyVisible(state.node);
            if (visible && !state.appeared) {
              state.appeared = true;
              if (!state.delayStarted) {
                state.delayStarted = true;
                if (state.animation.delay > 0) {
                  const timer = window.setTimeout(() => {
                    const latest = scrollAnimations.get(id);
                    if (latest) latest.ready = true;
                  }, state.animation.delay * 1000);
                  cleanups.push(() => window.clearTimeout(timer));
                } else {
                  state.ready = true;
                }
              }
            }
            if (!visible) {
              state.appeared = false;
              state.ready = false;
              state.delayStarted = false;
            }
          }

          if (!state.ready) continue;
          const range = state.animation.scrollRange * state.animation.speed;
          state.t = clamp(state.t + delta / range, 0, 1);
          applyAnimationFrame(state.node, evaluateFrames(state.animation.frames, easeInOut(state.t)));
        }
      };

      if (scrollAnimations.size) {
        window.addEventListener("scroll", onScroll, { passive: true });
        cleanups.push(() => window.removeEventListener("scroll", onScroll));
      }

      cleanupCurrent = () => {
        cleanups.splice(0).forEach((cleanup) => cleanup());
        runningFrames.forEach((frameId) => window.cancelAnimationFrame(frameId));
        runningFrames.clear();
      };
    };

    setup();

    const onResize = () => {
      if (resizeTimer) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(setup, 150);
    };

    window.addEventListener("resize", onResize);
    return () => {
      if (resizeTimer) window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      cleanupCurrent();
    };
  }, []);
}

function useMobileContentHeight(scale: number) {
  const [height, setHeight] = useState(MOBILE_CANVAS_HEIGHT);

  useEffect(() => {
    const measure = () => {
      const canvas = document.querySelector<HTMLElement>(".tf-mobile-canvas");
      const footer = canvas?.querySelector<HTMLElement>(".tf-home-site-footer--mobile");
      if (!canvas || !footer) return;

      // The footer (and every other canvas child) is position: absolute, so
      // the canvas's own box never grows to contain it — the static
      // MOBILE_CANVAS_HEIGHT from trip-factory-animations.json is what the
      // shell wrapper's height (and its overflow: hidden clip) was based on.
      // Measuring the footer's actual bottom edge instead means the wrapper
      // always fits the real content, even as the footer grows.
      const canvasTop = canvas.getBoundingClientRect().top;
      const footerBottom = footer.getBoundingClientRect().bottom;
      const unscaledExtent = (footerBottom - canvasTop) / scale;

      setHeight((current) => {
        const next = Math.max(MOBILE_CANVAS_HEIGHT, Math.ceil(unscaledExtent) + 32);
        return next === current ? current : next;
      });
    };

    measure();
    // Re-measure after fonts/images settle, since layout can shift slightly on load.
    const settleTimer = window.setTimeout(measure, 300);
    window.addEventListener("resize", measure);
    return () => {
      window.clearTimeout(settleTimer);
      window.removeEventListener("resize", measure);
    };
  }, [scale]);

  return height;
}

export default function TripFactoryPage() {
  useAdvancedAnimations();
  const mobileScale = useMobileScale();
  const mobileContentHeight = useMobileContentHeight(mobileScale);
  const { sliderIndexes, moveSlider } = useSliderIndexes();
  const searchParams = useSearchParams();
  const searchParamsKey = searchParams.toString();
  const lastPrefillKeyRef = useRef<string>("");
  const [name, setName] = useState("");
  const [destination, setDestination] = useState("");
  const [combo, setCombo] = useState("");
  const [date, setDate] = useState("");
  const [members, setMembers] = useState("");
  const [message, setMessage] = useState("");
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(searchParamsKey);
    const hasEnquiryPrefill = params.get("enquiry") === "1";
    if (!hasEnquiryPrefill) return;

    const packageId = params.get("packageId");
    const queryDestination = params.get("destination");
    const queryCombo = params.get("combo");
    const durationCode = params.get("duration");
    const prefillKey = [packageId ?? "", queryDestination ?? "", queryCombo ?? "", durationCode ?? ""].join("|");

    if (!packageId && !queryDestination && !queryCombo && !durationCode) return;
    if (lastPrefillKeyRef.current === prefillKey) return;

    const resolvedPackage = resolveTourPackageEntry({
      packageId,
      destination: queryDestination,
      combo: queryCombo,
      durationCode,
    });

    if (!resolvedPackage) return;

    const timer = window.setTimeout(() => {
      const nextCombo = queryCombo?.trim() && resolvedPackage.combos.includes(queryCombo.trim())
        ? queryCombo.trim()
        : resolvedPackage.combos[0] ?? "";

      setDestination(resolvedPackage.destination);
      setCombo(nextCombo);
      setSelectedPackageId(resolvedPackage.packageId);
      lastPrefillKeyRef.current = prefillKey;
      smoothScrollTo(LOCATIONS.loc_mrcd1in9, 1);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [searchParamsKey]);

  useEffect(() => {
    const params = new URLSearchParams(searchParamsKey);
    if (params.get("enquiry") === "1") return;

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [searchParamsKey]);

  const handleNameChange = useCallback((value: string) => setName(value), []);
  const handleDestinationChange = useCallback((value: string) => {
    setDestination(value);
    setCombo("");
    setSelectedPackageId(null);
  }, []);
  const handleComboChange = useCallback((value: string) => {
    setCombo(value);
    setSelectedPackageId(null);
  }, []);
  const handleDateChange = useCallback((value: string) => setDate(value), []);
  const handleMembersChange = useCallback((value: string) => setMembers(value.replace(/[^\d]/g, "")), []);
  const handleMessageChange = useCallback((value: string) => setMessage(value), []);

  const selectedPackage = useMemo(
    () =>
      resolveTourPackageEntry({
        packageId: selectedPackageId,
        destination,
        combo,
      }),
    [selectedPackageId, destination, combo],
  );
  const selectedPackageDuration = selectedPackage?.duration;
  const packageDurationText = selectedPackageDuration ? formatPackageDurationText(selectedPackageDuration) : "";
  const whatsappDurationText = selectedPackageDuration
    ? (selectedPackageDuration.code.includes("/") ? selectedPackageDuration.code.replace("/", "/ ") : selectedPackageDuration.code)
    : "";

  const handlePackageEnquire = useCallback((selection: PackageEnquirySelection) => {
    setDestination(selection.destination);
    setCombo(selection.combo);
    setSelectedPackageId(selection.cardId);
    smoothScrollTo(LOCATIONS.loc_mrcd1in9, 1);
  }, []);

  const buttonAction = useCallback<ButtonAction>((id, mode) => {
    if (id === "enquiry_send_button") {
      const whatsappMessage = buildWhatsAppMessage({
        name,
        destination,
        combo,
        durationText: whatsappDurationText,
        date,
        members,
        message,
      });
      window.location.href = `https://wa.me/919487428892?text=${encodeURIComponent(whatsappMessage)}`;
      return true;
    }

    if (id === "nav_packages_link" || id === "packages_see_more_button") {
      return false;
    }

    const action = BUTTON_ACTIONS[mode][id as keyof (typeof BUTTON_ACTIONS)[typeof mode]];

    if (action && "slider" in action) {
      moveSlider(action.slider as keyof typeof SLIDERS, action.direction === "previous" ? -1 : 1);
      return true;
    }

    if (action && "locationId" in action) {
      const targetY = LOCATIONS[action.locationId as keyof typeof LOCATIONS];
      if (typeof targetY === "number") {
        const speed = "speed" in action && typeof action.speed === "number" ? action.speed : 1;
        smoothScrollTo(targetY, speed);
        return true;
      }
    }

    return false;
  }, [combo, date, destination, members, message, moveSlider, name, whatsappDurationText]);

  const enquiryForm: EnquiryFormState = {
    name,
    destination,
    combo,
    date,
    members,
    message,
    destinationOptions: TOUR_PACKAGE_DESTINATIONS,
    comboOptions: destination ? TOUR_PACKAGE_COMBOS_BY_DESTINATION[destination] ?? [] : [],
    onNameChange: handleNameChange,
    onDestinationChange: handleDestinationChange,
    onComboChange: handleComboChange,
    onDateChange: handleDateChange,
    onMembersChange: handleMembersChange,
    onMessageChange: handleMessageChange,
  };

  return (
    <main className="tf-page-shell">
      <div className="tf-desktop-shell">
        <div className="tf-canvas tf-desktop-canvas">
          <DesktopPage
            buttonAction={buttonAction}
            sliderIndexes={sliderIndexes}
            enquiryForm={enquiryForm}
            packageDurationText={packageDurationText}
            onPackageEnquire={handlePackageEnquire}
          />
        </div>
      </div>
      <div className="tf-mobile-shell" style={{ height: mobileContentHeight * mobileScale }}>
        <div className="tf-canvas tf-mobile-canvas" style={{ transform: `scale(${mobileScale})` }}>
          <MobilePage
            buttonAction={buttonAction}
            sliderIndexes={sliderIndexes}
            enquiryForm={enquiryForm}
            packageDurationText={packageDurationText}
            onPackageEnquire={handlePackageEnquire}
          />
        </div>
      </div>
    </main>
  );
}