"use client";

import {
  Children,
  cloneElement,
  isValidElement,
  type ChangeEvent,
  type CSSProperties,
  type ReactElement,
} from "react";
import { content, scaledChildren, type ElementProps } from "@/components/cards/shared-elements";

// Local copy of the slider timing/behaviour config, kept in sync with the
// SLIDERS constant in TripFactoryPage.tsx. Duplicated here (rather than
// imported) so this file has no dependency back on TripFactoryPage.tsx and
// there's no risk of a circular import between the page and its sections.
const SLIDERS = {
  "slider_mrad23lg": {
    "duration": 3,
    "loop": true,
    "autoScroll": true,
    "vertical": false,
    "gap": 0,
    "counts": {
      "desktop": 16,
      "mobile": 16
    }
  },
  "slider_mrbma3g2": {
    "duration": 3,
    "loop": true,
    "autoScroll": true,
    "vertical": false,
    "gap": 0,
    "counts": {
      "desktop": 10,
      "mobile": 10
    }
  }
} as const;

type InputElementProps = ElementProps & {
  inputType?: "text" | "date" | "number";
  value?: string;
  onValueChange?: (value: string) => void;
};

export function InputElement({ id, className, children, style, scaleClassName, inputType = "text", value, onValueChange }: InputElementProps) {
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

export function TextareaElement({ id, className, children, style, scaleClassName, value, onValueChange }: TextareaElementProps) {
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

export function SelectElement({
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

export function SliderElement({ id, className, activeIndex, children, style }: ElementProps & { activeIndex: number }) {
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
