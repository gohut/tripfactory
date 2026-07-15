"use client";

import { BoxElement, ImageElement, TextElement } from "@/components/cards/shared-elements";

export function AboutSectionDesktop() {
  return (
    <>
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
    </>
  );
}

export function AboutSectionMobile() {
  return (
    <>
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
    </>
  );
}
