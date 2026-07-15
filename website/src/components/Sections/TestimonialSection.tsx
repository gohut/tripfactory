"use client";

import { BoxElement, ImageElement, TextElement } from "@/components/cards/shared-elements";
import { TestimonialCard, TESTIMONIAL_CARDS } from "@/components/cards/TestimonialCard";

export function TestimonialSectionDesktop() {
  return (
    <>
    <BoxElement id={"Testimonial_Section"} className="tf-d-Testimonial_Section_djwgz" type="group">
      {TESTIMONIAL_CARDS.map((card) => (
        <TestimonialCard key={card.root.id} mode="desktop" card={card} />
      ))}
      <TextElement id={"testimonials_intro_text"} className="tf-d-text_mra6rgji_4k7b6" />
      <TextElement id={"testimonials_heading"} className="tf-d-text_mra6rgjj_4k7b6" />
      <BoxElement id={"container_mra6rgjk"} className="tf-d-container_mra6rgjk_oc4rd" type="container">
        <TextElement id={"testimonials_badge_label"} className="tf-d-text_mra6rgjl_4k7b6" />
      </BoxElement>
      <TextElement id={"testimonials_heading_line1"} className="tf-d-text_mra6rgjm_4k7b6" />
    </BoxElement>
    <ImageElement id={"decorative_image_4"} className="tf-d-image_mrc841er_8vyp0" />
    </>
  );
}

export function TestimonialSectionMobile() {
  return (
    <>
    <BoxElement id={"Testimonial_Section"} className="tf-m-Testimonial_Section_djwgz" type="group" scaleClassName="tf-scale-m-Testimonial_Section_djwgz">
      {TESTIMONIAL_CARDS.map((card) => (
        <TestimonialCard key={card.root.id} mode="mobile" card={card} />
      ))}
      <TextElement id={"testimonials_intro_text"} className="tf-m-text_mra6rgji_4k7b6" />
      <TextElement id={"testimonials_heading"} className="tf-m-text_mra6rgjj_4k7b6" />
      <BoxElement id={"container_mra6rgjk"} className="tf-m-container_mra6rgjk_oc4rd" type="container">
        <TextElement id={"testimonials_badge_label"} className="tf-m-text_mra6rgjl_4k7b6" />
      </BoxElement>
      <TextElement id={"testimonials_heading_line1"} className="tf-m-text_mra6rgjm_4k7b6" />
    </BoxElement>
    <ImageElement id={"decorative_image_4"} className="tf-m-image_mrc841er_8vyp0" />
    </>
  );
}
