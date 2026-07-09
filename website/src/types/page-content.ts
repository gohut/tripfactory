export type PageContent = {
  pageName: string;
  texts: Record<string, string>;
  images: Record<string, { src: string; alt?: string }>;
  buttons: Record<
    string,
    {
      label: string;
      href?: string;
      target?: string;
      image?: string;
      alt?: string;
      icon?: string;
      iconAlt?: string;
      iconPosition?: "left" | "right";
    }
  >;
  fields: Record<string, { placeholder?: string; options?: string[] }>;
};
