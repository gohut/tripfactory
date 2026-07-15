"use client";

import { BoxElement, ButtonElement, ImageElement, TextElement, type ButtonAction } from "@/components/cards/shared-elements";

type HeroSectionProps = {
  buttonAction: ButtonAction;
};

export function HeroSectionDesktop({ buttonAction }: HeroSectionProps) {
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
    </>
  );
}

export function HeroSectionMobile({ buttonAction }: HeroSectionProps) {
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
    </>
  );
}
