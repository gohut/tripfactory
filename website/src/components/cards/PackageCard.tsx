"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, type CSSProperties, type KeyboardEvent, type MouseEvent } from "react";
import { content, modeClassName, type ButtonAction, type GeneratedElementSpec, type Mode } from "./shared-elements";

type TextContainerSpec = {
  container: GeneratedElementSpec;
  text: GeneratedElementSpec;
};

export type PackageDuration = {
  days?: number | null;
  nights?: number | null;
  code: string;
  label: string;
};

export type PackageCardSpec = {
  root: GeneratedElementSpec;
  image: GeneratedElementSpec;
  button: GeneratedElementSpec;
  title: TextContainerSpec;
  combos: TextContainerSpec[];
  location: {
    container: GeneratedElementSpec;
    text: GeneratedElementSpec;
    icon: GeneratedElementSpec;
  };
  comboCount?: TextContainerSpec;
  subtitle?: string;
  duration?: PackageDuration;
};

export type PackageCardData = {
  id: string;
  state: string;
  title: string;
  subtitle?: string;
  duration?: PackageDuration;
  image: {
    src: string;
    alt?: string;
  };
  combos: string[];
  notes?: string[];
  buttonHref?: string;
  buttonLabel?: string;
};

export type PackageEnquirySelection = {
  cardId: string;
  packageTitle: string;
  destination: string;
  combo: string;
  duration?: PackageDuration;
};

type NormalizedCombo = {
  id: string;
  label: string;
  containerId?: string;
};

type NormalizedPackageCard = {
  id: string;
  rootClassName?: string;
  rootStyle?: CSSProperties;
  title: string;
  titleId?: string;
  subtitle?: string;
  state: string;
  locationId?: string;
  locationIconId?: string;
  locationIconSrc: string;
  duration?: PackageDuration;
  image: {
    id?: string;
    src: string;
    alt: string;
  };
  combos: NormalizedCombo[];
  comboCount?: {
    id?: string;
    label: string;
  };
  notes: string[];
  buttonId?: string;
  buttonLabel: string;
  buttonHref?: string;
};

const HOME_PACKAGE_DURATION: PackageDuration = {
  days: 2,
  nights: 1,
  code: "2D/1N",
  label: "2 Days / 1 Night",
};

export const PACKAGE_CARDS: PackageCardSpec[] = [
  {
    root: { id: "container_PKG_Card", classToken: "container_PKG_Card_oycau", scaleClassToken: "container_PKG_Card_oycau" },
    image: { id: "package_1_image", classToken: "image_mr9adhx8_s4fgo" },
    button: { id: "package_1_enquire_button", classToken: "button_mr9adhx9_5ehan" },
    subtitle: "High demand Kerala combos",
    duration: HOME_PACKAGE_DURATION,
    title: {
      container: { id: "container_mr9cjvf0", classToken: "container_mr9cjvf0_62xtd" },
      text: { id: "package_1_title", classToken: "text_mr9cjvf1_dozms" },
    },
    combos: [
      {
        container: { id: "container_mr9cjvf2", classToken: "container_mr9cjvf2_62xtd" },
        text: { id: "package_1_combo_1", classToken: "text_mr9cjvf3_dozms" },
      },
      {
        container: { id: "container_mr9gr3zj", classToken: "container_mr9gr3zj_658qh" },
        text: { id: "package_1_combo_2", classToken: "text_mr9gr3zk_dmopo" },
      },
      {
        container: { id: "container_mr9gr3zl", classToken: "container_mr9gr3zl_658qh" },
        text: { id: "package_1_combo_3", classToken: "text_mr9gr3zm_dmopo" },
      },
      {
        container: { id: "container_mr9gr3zn", classToken: "container_mr9gr3zn_658qh" },
        text: { id: "package_1_combo_4", classToken: "text_mr9gr3zo_dmopo" },
      },
      {
        container: { id: "container_mr9gr3zp", classToken: "container_mr9gr3zp_658qi" },
        text: { id: "package_1_combo_5", classToken: "text_mr9gr3zq_dmopo" },
      },
    ],
    location: {
      container: { id: "container_mr9h7du0", classToken: "container_mr9h7du0_64rv1" },
      text: { id: "package_1_location", classToken: "text_mr9h7du1_dn5l5" },
      icon: { id: "package_1_location_icon", classToken: "image_mr9h7du2_s1dpz" },
    },
    comboCount: {
      container: { id: "container_mr9h7du3", classToken: "container_mr9h7du3_64rv1" },
      text: { id: "package_1_combo_count", classToken: "text_mr9h7du4_dn5l5" },
    },
  },
  {
    root: { id: "container_mr9i3apy", classToken: "container_mr9i3apy_6591e", scaleClassToken: "container_mr9i3apy_6591e" },
    image: { id: "package_2_image", classToken: "image_mr9i3apz_s0wjm" },
    button: { id: "package_2_enquire_button", classToken: "button_mr9i3aq0_5aydm" },
    subtitle: "Cool hills and active routes",
    duration: HOME_PACKAGE_DURATION,
    title: {
      container: { id: "container_mr9i3aq1", classToken: "container_mr9i3aq1_6591c" },
      text: { id: "package_2_title", classToken: "text_mr9i3aq2_dmoet" },
    },
    combos: [
      {
        container: { id: "container_mr9i3aq3", classToken: "container_mr9i3aq3_6591c" },
        text: { id: "package_2_combo_1", classToken: "text_mr9i3aq4_dmoet" },
      },
      {
        container: { id: "container_mr9i3aq5", classToken: "container_mr9i3aq5_6591d" },
        text: { id: "package_2_combo_2", classToken: "text_mr9i3aq6_dmoet" },
      },
      {
        container: { id: "container_mr9i3aq7", classToken: "container_mr9i3aq7_6591d" },
        text: { id: "package_2_combo_3", classToken: "text_mr9i3aq8_dmoet" },
      },
      {
        container: { id: "container_mr9i3aq9", classToken: "container_mr9i3aq9_6591d" },
        text: { id: "package_2_combo_4", classToken: "text_mr9i3aqa_dmoes" },
      },
      {
        container: { id: "container_mr9i3aqb", classToken: "container_mr9i3aqb_6591e" },
        text: { id: "package_2_combo_5", classToken: "text_mr9i3aqc_dmoes" },
      },
    ],
    location: {
      container: { id: "container_mr9i3aqd", classToken: "container_mr9i3aqd_6591e" },
      text: { id: "package_2_location", classToken: "text_mr9i3aqe_dmoes" },
      icon: { id: "package_2_location_icon", classToken: "image_mr9i3aqf_s0wjl" },
    },
    comboCount: {
      container: { id: "container_mr9i3aqg", classToken: "container_mr9i3aqg_6591e" },
      text: { id: "package_2_combo_count", classToken: "text_mr9i3aqh_dmoes" },
    },
  },
  {
    root: { id: "container_mr9i3aqi", classToken: "container_mr9i3aqi_6591e", scaleClassToken: "container_mr9i3aqi_6591e" },
    image: { id: "package_3_image", classToken: "image_mr9i3aqj_s0wjl" },
    button: { id: "package_3_enquire_button", classToken: "button_mr9i3aqk_5aydk" },
    subtitle: "Waterfalls, valleys, and green escapes",
    duration: HOME_PACKAGE_DURATION,
    title: {
      container: { id: "container_mr9i3aql", classToken: "container_mr9i3aql_6591e" },
      text: { id: "package_3_title", classToken: "text_mr9i3aqm_dmoer" },
    },
    combos: [
      {
        container: { id: "container_mr9i3aqn", classToken: "container_mr9i3aqn_6591e" },
        text: { id: "package_3_combo_1", classToken: "text_mr9i3aqo_dmoer" },
      },
      {
        container: { id: "container_mr9i3aqp", classToken: "container_mr9i3aqp_6591e" },
        text: { id: "package_3_combo_2", classToken: "text_mr9i3aqq_dmoer" },
      },
      {
        container: { id: "container_mr9i3aqr", classToken: "container_mr9i3aqr_6591e" },
        text: { id: "package_3_combo_3", classToken: "text_mr9i3aqs_dmoer" },
      },
      {
        container: { id: "container_mr9i3aqt", classToken: "container_mr9i3aqt_6591e" },
        text: { id: "package_3_combo_4", classToken: "text_mr9i3aqu_dmoer" },
      },
      {
        container: { id: "container_mr9i3aqv", classToken: "container_mr9i3aqv_6591e" },
        text: { id: "package_3_combo_5", classToken: "text_mr9i3aqw_dmoer" },
      },
    ],
    location: {
      container: { id: "container_mr9i3aqx", classToken: "container_mr9i3aqx_6591e" },
      text: { id: "package_3_location", classToken: "text_mr9i3aqy_dmoer" },
      icon: { id: "package_3_location_icon", classToken: "image_mr9i3aqz_s0wjl" },
    },
  },
];

function stripLeadingBullet(value: string) {
  return value.replace(/^(?:\u00c2?\u00b7|\u2022)\s*/, "").trim();
}

function isGeneratedPackageCard(card: PackageCardSpec | PackageCardData): card is PackageCardSpec {
  return "root" in card;
}

function generatedRootStyle(mode: Mode): CSSProperties {
  const mobile = mode === "mobile";

  return {
    position: "relative",
    top: "auto",
    right: "auto",
    bottom: "auto",
    left: "auto",
    margin: 0,
    transform: "none",
    flex: "0 0 auto",
    width: mobile ? "min(307px, calc(100vw - 32px))" : "384px",
    height: mobile ? "445px" : "552px",
    minHeight: mobile ? "445px" : "552px",
    overflow: "hidden",
    scrollSnapAlign: "start",
  };
}

function normalizeGeneratedCard(card: PackageCardSpec, mode: Mode): NormalizedPackageCard {
  const image = content.images[card.image.id];
  const locationIcon = content.images[card.location.icon.id];
  const button = content.buttons[card.button.id];

  return {
    id: card.root.id,
    rootClassName: `tf-el tf-container ${modeClassName(mode, card.root.classToken)} tour-package-card tour-package-card--generated tour-package-card--home-${mode}`,
    rootStyle: generatedRootStyle(mode),
    title: content.texts[card.title.text.id] ?? "",
    titleId: card.title.container.id,
    subtitle: card.subtitle,
    state: content.texts[card.location.text.id] ?? "",
    locationId: card.location.container.id,
    locationIconId: card.location.icon.id,
    locationIconSrc: locationIcon?.src ?? "/icons/location-pin.svg",
    duration: card.duration,
    image: {
      id: card.image.id,
      src: image?.src ?? "",
      alt: image?.alt ?? content.texts[card.title.text.id] ?? "",
    },
    combos: card.combos.map((combo) => ({
      id: combo.container.id,
      containerId: combo.container.id,
      label: stripLeadingBullet(content.texts[combo.text.id] ?? ""),
    })),
    comboCount: card.comboCount
      ? {
          id: card.comboCount.container.id,
          label: content.texts[card.comboCount.text.id] ?? "",
        }
      : undefined,
    notes: [],
    buttonId: card.button.id,
    buttonLabel: button?.label ?? "Enquire",
    buttonHref: button?.href && button.href !== "#" ? button.href : undefined,
  };
}

function normalizeDataCard(card: PackageCardData): NormalizedPackageCard {
  return {
    id: card.id,
    title: card.title,
    subtitle: card.subtitle,
    state: card.state,
    locationIconSrc: "/icons/location-pin.svg",
    duration: card.duration,
    image: {
      src: card.image.src,
      alt: card.image.alt ?? card.title,
    },
    combos: card.combos.map((combo, index) => ({
      id: `${card.id}-combo-${index}`,
      label: stripLeadingBullet(combo),
    })),
    notes: card.notes ?? [],
    buttonId: `${card.id}-enquire`,
    buttonLabel: card.buttonLabel ?? "Enquire",
    buttonHref: card.buttonHref ?? "/",
  };
}

function packageEnquiryHref(baseHref: string | undefined, selection: PackageEnquirySelection) {
  const fallbackHref = "/";
  const href = baseHref && baseHref !== "#" ? baseHref : fallbackHref;
  const [pathWithQuery] = href.split("#");
  const [pathname = "/", query = ""] = pathWithQuery.split("?");
  const params = new URLSearchParams(query);

  params.set("packageId", selection.cardId);
  params.set("destination", selection.destination);
  params.set("combo", selection.combo);
  if (selection.duration?.code) params.set("duration", selection.duration.code);
  params.set("enquiry", "1");

  const serialized = params.toString();
  return `${pathname || "/"}${serialized ? `?${serialized}` : ""}`;
}

function ComboItem({
  combo,
  selected,
  onSelect,
}: {
  combo: NormalizedCombo;
  selected: boolean;
  onSelect: () => void;
}) {
  const handleKeyDown = (event: KeyboardEvent<HTMLLIElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect();
    }
  };

  return (
    <li
      data-id={combo.containerId}
      data-type={combo.containerId ? "container" : undefined}
      role="radio"
      tabIndex={0}
      aria-checked={selected}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
    >
      {combo.label}
    </li>
  );
}

function EnquireControl({
  card,
  mode,
  buttonAction,
  selectedCombo,
  onMissingCombo,
  onEnquire,
}: {
  card: NormalizedPackageCard;
  mode?: Mode;
  buttonAction?: ButtonAction;
  selectedCombo: NormalizedCombo | null;
  onMissingCombo: () => void;
  onEnquire?: (selection: PackageEnquirySelection, mode?: Mode) => void;
}) {
  const selection = selectedCombo
    ? {
        cardId: card.id,
        packageTitle: card.title,
        destination: card.state,
        combo: selectedCombo.label,
        duration: card.duration,
      }
    : null;

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    if (!selection) {
      event.preventDefault();
      onMissingCombo();
      return;
    }

    if (onEnquire) {
      event.preventDefault();
      onEnquire(selection, mode);
      return;
    }

    if (buttonAction && mode && card.buttonId && buttonAction(card.buttonId, mode, event)) {
      event.preventDefault();
    }
  };

  const commonProps = {
    className: "tour-package-enquire",
    "data-id": card.buttonId,
    "data-type": card.buttonId ? "button" : undefined,
    onClick: handleClick,
  };

  if (card.buttonHref) {
    return (
      <Link href={selection ? packageEnquiryHref(card.buttonHref, selection) : card.buttonHref} scroll={false} {...commonProps}>
        {card.buttonLabel}
      </Link>
    );
  }

  return (
    <button type="button" {...commonProps}>
      {card.buttonLabel}
    </button>
  );
}

export function PackageCard({
  mode,
  card,
  buttonAction,
  onEnquire,
}: {
  mode?: Mode;
  card: PackageCardSpec | PackageCardData;
  buttonAction?: ButtonAction;
  onEnquire?: (selection: PackageEnquirySelection, mode?: Mode) => void;
}) {
  const view = useMemo(() => (isGeneratedPackageCard(card) ? normalizeGeneratedCard(card, mode ?? "desktop") : normalizeDataCard(card)), [card, mode]);
  const [selectedComboId, setSelectedComboId] = useState<string | null>(null);
  const [showComboWarning, setShowComboWarning] = useState(false);
  const selectedCombo = selectedComboId ? view.combos.find((combo) => combo.id === selectedComboId) ?? null : null;

  const rootProps = {
    className: view.rootClassName ?? "tour-package-card",
    style: view.rootStyle,
    "data-id": view.id,
    "data-type": view.rootClassName ? "container" : undefined,
  };

  return (
    <article {...rootProps}>
      {view.image.src ? (
        <Image
          data-id={view.image.id}
          data-type={view.image.id ? "image" : undefined}
          className="tour-package-card-image"
          src={view.image.src}
          alt={view.image.alt}
          fill
          sizes="(max-width: 700px) 100vw, (max-width: 1200px) 50vw, 384px"
          unoptimized
        />
      ) : null}
      <div className="tour-package-card-overlay" />

      <div className="tour-package-card-content">
        <div className="tour-package-card-top">
          <span className="tour-package-title-pill" data-id={view.titleId} data-type={view.titleId ? "container" : undefined}>
            {view.title}
          </span>
          <span className="tour-package-location-chip" data-id={view.locationId} data-type={view.locationId ? "container" : undefined}>
            <Image data-id={view.locationIconId} src={view.locationIconSrc} alt="" width={14} height={14} unoptimized />
            {view.state}
          </span>
        </div>

        {view.subtitle ? <p className="tour-package-card-subtitle">{view.subtitle}</p> : null}

        {view.duration ? (
          <div className="tour-package-duration-row" aria-label={`${view.duration.label} package duration`}>
            <span>{view.duration.code}</span>
            <span>{view.duration.label}</span>
          </div>
        ) : null}

        <div className="tour-package-card-body">
          <ul className="tour-package-combo-list" role="radiogroup" aria-label={`${view.title} combos`}>
            {view.combos.map((combo) => (
              <ComboItem
                key={combo.id}
                combo={combo}
                selected={selectedComboId === combo.id}
                onSelect={() => {
                  setSelectedComboId(combo.id);
                  setShowComboWarning(false);
                }}
              />
            ))}
          </ul>

          {view.comboCount ? (
            <span className="tour-package-combo-count" data-id={view.comboCount.id} data-type={view.comboCount.id ? "container" : undefined}>
              {view.comboCount.label}
            </span>
          ) : null}

          {view.notes.length ? (
            <div className="tour-package-notes">
              {view.notes.map((note) => (
                <p key={note}>{note}</p>
              ))}
            </div>
          ) : null}
        </div>

        {showComboWarning ? <p className="tour-package-enquire-warning">select a combo above to enquire</p> : null}
        <EnquireControl
          card={view}
          mode={mode}
          buttonAction={buttonAction}
          selectedCombo={selectedCombo}
          onMissingCombo={() => setShowComboWarning(true)}
          onEnquire={onEnquire}
        />
      </div>
    </article>
  );
}
