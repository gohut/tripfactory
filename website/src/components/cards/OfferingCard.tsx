"use client";

import {
  BoxElement,
  ImageElement,
  TextElement,
  modeClassName,
  type GeneratedElementSpec,
  type Mode,
} from "./shared-elements";

export type OfferingCardSpec = {
  root: GeneratedElementSpec;
  background: GeneratedElementSpec;
  icon: GeneratedElementSpec;
  title: GeneratedElementSpec;
  subtitle: GeneratedElementSpec;
};

export const PRIMARY_OFFERING_CARDS: OfferingCardSpec[] = [
  {
    root: { id: "container_mrboyqlt", classToken: "container_mrboyqlt_ponby" },
    background: { id: "container_mrboyqlv", classToken: "container_mrboyqlv_ponby" },
    icon: { id: "offering_hotels_icon", classToken: "image_mrboyqlu_8hi91" },
    title: { id: "offering_hotels_title", classToken: "text_mrboyqlx_5wpvs" },
    subtitle: { id: "offering_hotels_subtitle", classToken: "text_mrboyqly_5wpvs" },
  },
  {
    root: { id: "container_mrboyqlz", classToken: "container_mrboyqlz_ponby" },
    background: { id: "container_mrboyqm0", classToken: "container_mrboyqm0_ponbx" },
    icon: { id: "offering_food_icon", classToken: "image_mrboyqm1_8hi92" },
    title: { id: "offering_food_title", classToken: "text_mrboyqm2_5wpvr" },
    subtitle: { id: "offering_food_subtitle", classToken: "text_mrboyqm3_5wpvr" },
  },
  {
    root: { id: "container_mrboyqm4", classToken: "container_mrboyqm4_ponbx" },
    background: { id: "container_mrboyqm5", classToken: "container_mrboyqm5_ponbx" },
    icon: { id: "offering_transport_icon", classToken: "image_mrboyqm6_8hi92" },
    title: { id: "offering_transport_title", classToken: "text_mrboyqm7_5wpvr" },
    subtitle: { id: "offering_transport_subtitle", classToken: "text_mrboyqm8_5wpvr" },
  },
  {
    root: { id: "container_mrboyqm9", classToken: "container_mrboyqm9_ponbx" },
    background: { id: "container_mrboyqma", classToken: "container_mrboyqma_ponbz" },
    icon: { id: "offering_coordinators_icon", classToken: "image_mrboyqmb_8hi91" },
    title: { id: "offering_coordinators_title", classToken: "text_mrboyqmc_5wpvs" },
    subtitle: { id: "offering_coordinators_subtitle", classToken: "text_mrboyqmd_5wpvs" },
  },
];

export const SECONDARY_OFFERING_CARDS: OfferingCardSpec[] = [
  {
    root: { id: "container_mrbw694s", classToken: "container_mrbw694s_prtpq" },
    background: { id: "container_mrbw694t", classToken: "container_mrbw694t_prtpq" },
    icon: { id: "offering_women_guide_icon", classToken: "image_mrbw694u_8ebva" },
    title: { id: "offering_women_guide_title", classToken: "text_mrbw694v_5zw9j" },
    subtitle: { id: "offering_women_guide_subtitle", classToken: "text_mrbw694w_5zw9j" },
  },
  {
    root: { id: "container_mrbw694x", classToken: "container_mrbw694x_prtpq" },
    background: { id: "container_mrbw694y", classToken: "container_mrbw694y_prtpq" },
    icon: { id: "offering_student_pricing_icon", classToken: "image_mrbw694z_8ebva" },
    title: { id: "offering_student_pricing_title", classToken: "text_mrbw6950_5zw9i" },
    subtitle: { id: "offering_student_pricing_subtitle", classToken: "text_mrbw6951_5zw9i" },
  },
  {
    root: { id: "container_mrbw6952", classToken: "container_mrbw6952_prtpp" },
    background: { id: "container_mrbw6953", classToken: "container_mrbw6953_prtpp" },
    icon: { id: "offering_24x7_support_icon", classToken: "image_mrbw6954_8ebvb" },
    title: { id: "offering_24x7_support_title", classToken: "text_mrbw6955_5zw9i" },
    subtitle: { id: "offering_24x7_support_subtitle", classToken: "text_mrbw6956_5zw9i" },
  },
  {
    root: { id: "container_mrbw6957", classToken: "container_mrbw6957_prtpp" },
    background: { id: "container_mrbw6958", classToken: "container_mrbw6958_prtpp" },
    icon: { id: "offering_custom_itinerary_icon", classToken: "image_mrbw6959_8ebva" },
    title: { id: "offering_custom_itinerary_title", classToken: "text_mrbw695a_5zw9j" },
    subtitle: { id: "offering_custom_itinerary_subtitle", classToken: "text_mrbw695b_5zw9j" },
  },
];

export function OfferingCard({ mode, card }: { mode: Mode; card: OfferingCardSpec }) {
  return (
    <BoxElement id={card.root.id} className={modeClassName(mode, card.root.classToken)} type="container">
      <BoxElement id={card.background.id} className={modeClassName(mode, card.background.classToken)} type="container" />
      <ImageElement id={card.icon.id} className={modeClassName(mode, card.icon.classToken)} />
      <TextElement id={card.title.id} className={modeClassName(mode, card.title.classToken)} />
      <TextElement id={card.subtitle.id} className={modeClassName(mode, card.subtitle.classToken)} />
    </BoxElement>
  );
}
