"use client";

import { BoxElement, ButtonElement, ImageElement, TextElement, type ButtonAction } from "@/components/cards/shared-elements";
import { PackageCard, PACKAGE_CARDS, type PackageEnquirySelection } from "@/components/cards/PackageCard";

type PackagesSectionProps = {
  buttonAction: ButtonAction;
  onPackageEnquire: (selection: PackageEnquirySelection) => void;
};

export function PackagesSectionDesktop({ buttonAction, onPackageEnquire }: PackagesSectionProps) {
  return (
    <>
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
    </>
  );
}

export function PackagesSectionMobile({ buttonAction, onPackageEnquire }: PackagesSectionProps) {
  return (
    <>
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
    </>
  );
}
