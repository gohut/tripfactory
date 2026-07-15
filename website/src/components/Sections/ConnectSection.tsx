"use client";

import { BoxElement, ButtonElement, ImageElement, TextElement, type ButtonAction } from "@/components/cards/shared-elements";
import { InputElement, SelectElement, TextareaElement } from "./form-elements";

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

type ConnectSectionProps = {
  buttonAction: ButtonAction;
  enquiryForm: EnquiryFormState;
  packageDurationText: string;
};

export function ConnectSectionDesktop({ buttonAction, enquiryForm, packageDurationText }: ConnectSectionProps) {
  return (
    <>
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
    </>
  );
}

export function ConnectSectionMobile({ buttonAction, enquiryForm, packageDurationText }: ConnectSectionProps) {
  return (
    <>
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
    </>
  );
}
