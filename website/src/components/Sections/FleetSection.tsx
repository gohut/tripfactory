"use client";

import { BoxElement, ButtonElement, ImageElement, TextElement, type ButtonAction } from "@/components/cards/shared-elements";
import { SliderElement } from "./form-elements";

type SliderIndexes = Record<string, number>;

export function FleetSectionDesktop() {
  return (
    <>
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
    </>
  );
}

type FleetSectionMobileProps = {
  buttonAction: ButtonAction;
  sliderIndexes: SliderIndexes;
};

export function FleetSectionMobile({ buttonAction, sliderIndexes }: FleetSectionMobileProps) {
  return (
    <>
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
    </>
  );
}
