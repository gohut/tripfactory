"use client";

import type { CSSProperties, MouseEvent, ReactNode } from "react";
import Image from "next/image";
import pageContent from "@/content/page.json";
import type { PageContent } from "@/types/page-content";

export type Mode = "desktop" | "mobile";
export type ButtonAction = (id: string, mode: Mode, event: MouseEvent<HTMLElement>) => boolean;
export type ElementProps = {
  id: string;
  className: string;
  children?: ReactNode;
  style?: CSSProperties;
  scaleClassName?: string;
};
export type GeneratedElementSpec = {
  id: string;
  classToken: string;
  scaleClassToken?: string;
};

export const content = pageContent as PageContent;

export const modeClassName = (mode: Mode, classToken: string) =>
  `tf-${mode === "desktop" ? "d" : "m"}-${classToken}`;

export const modeScaleClassName = (mode: Mode, classToken?: string) =>
  mode === "mobile" && classToken ? `tf-scale-m-${classToken}` : undefined;

export function scaledChildren(scaleClassName: string | undefined, children: ReactNode) {
  if (!scaleClassName) return children;
  return <div className={`tf-scale-wrap ${scaleClassName}`}>{children}</div>;
}

export function BoxElement({ id, className, type, children, style, scaleClassName }: ElementProps & { type: "container" | "group" }) {
  return (
    <div className={`tf-el tf-${type} ${className}`} data-id={id} data-type={type} style={style}>
      {scaledChildren(scaleClassName, children)}
    </div>
  );
}

export function TextElement({ id, className, children, style, onClick }: ElementProps & { onClick?: (e: React.MouseEvent<HTMLDivElement>) => void }) {
  return (
    <div className={`tf-el tf-text ${className}`} data-id={id} data-type="text" style={style} onClick={onClick}>
      {content.texts[id] ?? ""}
      {children}
    </div>
  );
}

export function TextLinkElement({ id, className, href, children, style }: ElementProps & { href: string }) {
  return (
    <a className={`tf-el tf-text ${className}`} data-id={id} data-type="text" href={href} style={style}>
      {content.texts[id] ?? ""}
      {children}
    </a>
  );
}

export function ImageElement({ id, className, children, style, scaleClassName }: ElementProps) {
  const image = content.images[id];

  return (
    <div className={`tf-el tf-image ${className}`} data-id={id} data-type="image" style={style}>
      {image?.src ? <Image src={image.src} alt={image.alt ?? ""} fill sizes="100vw" unoptimized /> : null}
      {scaledChildren(scaleClassName, children)}
    </div>
  );
}

export function ButtonElement({ id, mode, className, children, style, onAction }: ElementProps & { mode: Mode; onAction: ButtonAction }) {
  const button = content.buttons[id];
  const label = button?.label ?? "";
  const icon = button?.icon ? (
    <Image
      className={`tf-button-icon${label ? "" : " tf-button-icon-only"}`}
      src={button.icon}
      alt={label ? "" : button.iconAlt ?? ""}
      width={28}
      height={28}
      unoptimized
    />
  ) : null;
  const body = children ?? (button?.image ? (
    <Image className="tf-button-full-image" src={button.image} alt={button.alt ?? label} fill sizes="100vw" unoptimized />
  ) : (
    <>
      {button?.iconPosition === "left" ? icon : null}
      {label ? <span className="tf-button-label">{label}</span> : null}
      {button?.iconPosition !== "left" ? icon : null}
    </>
  ));
  const href = button?.href && button.href !== "#" ? button.href : undefined;
  const handleClick = (event: MouseEvent<HTMLElement>) => {
    if (onAction(id, mode, event)) event.preventDefault();
  };
  const buttonClassName = `tf-el tf-button ${button?.icon ? "tf-button-with-icon " : ""}${className}`;

  if (href) {
    return (
      <a className={buttonClassName} data-id={id} data-type="button" href={href} target={button?.target || undefined} onClick={handleClick} style={style}>
        {body}
      </a>
    );
  }

  return (
    <button className={buttonClassName} data-id={id} data-type="button" type="button" onClick={handleClick} style={style}>
      {body}
    </button>
  );
}

