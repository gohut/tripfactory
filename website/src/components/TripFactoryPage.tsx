"use client";

import {
  Children,
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import Image from "next/image";
import pageContent from "@/content/page.json";
import type { PageContent } from "@/types/page-content";

type Mode = "desktop" | "mobile";
type SliderIndexes = Record<string, number>;
type ButtonAction = (id: string, mode: Mode, event: MouseEvent<HTMLElement>) => boolean;
type ElementProps = { id: string; className: string; children?: ReactNode; style?: CSSProperties; scaleClassName?: string };
type PageTreeProps = { buttonAction: ButtonAction; sliderIndexes: SliderIndexes };
type AnimationFrameSpec = { x: number; y: number; w: number; h: number; opacity: number; scale: number; rotation: number };
type AdvancedAnimationSpec = {
  type: string;
  speed: number;
  delay: number;
  animateOnAppear: boolean;
  smooth: boolean;
  scrollRange: number;
  triggerButtonId: string;
  hoverElementId: string;
  frames: AnimationFrameSpec[];
};


const content = pageContent as PageContent;
const MOBILE_CANVAS_WIDTH = 390;
const MOBILE_CANVAS_HEIGHT = 7118;
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
const BUTTON_ACTIONS = {
  "desktop": {
    "fleet_slider_next_button": {
      "slider": "slider_mrad23lg",
      "direction": "next"
    },
    "fleet_slider_prev_button": {
      "slider": "slider_mrad23lg",
      "direction": "previous"
    },
    "nav_about_us_link": {
      "locationId": "loc_mrcddcfx",
      "target": "main"
    },
    "nav_enquiry_link": {
      "locationId": "loc_mrcd1in9"
    },
    "nav_packages_link": {
      "locationId": "loc_mrcd0ve0",
      "target": "main"
    },
    "nav_bus_link": {
      "locationId": "loc_mrcdf778",
      "target": "main"
    },
    "hero_plan_trip_button": {
      "locationId": "loc_mrcd2xkz",
      "target": "main"
    },
    "hero_contact_us_button": {
      "locationId": "loc_mrcd39tj",
      "target": "main"
    }
  },
  "mobile": {
    "fleet_slider_next_button": {
      "slider": "slider_mrad23lg",
      "direction": "next"
    },
    "fleet_slider_prev_button": {
      "slider": "slider_mrad23lg",
      "direction": "previous"
    },
    "nav_about_us_link": {
      "locationId": "loc_mrcddcfx",
      "target": "main"
    },
    "nav_enquiry_link": {
      "locationId": "loc_mrcd1in9"
    },
    "nav_packages_link": {
      "locationId": "loc_mrcd0ve0",
      "target": "main"
    },
    "nav_bus_link": {
      "locationId": "loc_mrcdf778",
      "target": "main"
    },
    "hero_plan_trip_button": {
      "locationId": "loc_mrcd2xkz",
      "target": "main"
    },
    "hero_contact_us_button": {
      "locationId": "loc_mrcd39tj",
      "target": "main"
    }
  }
} as const;
const LOCATIONS = {
  "loc_mr0edof2": 656,
  "loc_mrcd0ve0": 1350,
  "loc_mrcd1in9": 3539,
  "loc_mrcd2xkz": 1350,
  "loc_mrcd39tj": 3539,
  "loc_mrcddcfx": 663,
  "loc_mrcdf778": 2112
} as const;
const LEGAL_FOOTER_LINKS = {
  "footer_terms_link": "/legal#terms-and-conditions",
  "footer_privacy_link": "/legal#privacy-policy",
  "footer_legal_extra_1": "/legal#refund-policy",
  "footer_legal_extra_2": "/legal#cancellation-policy",
} as const;
const ADVANCED_ANIMATIONS: Record<Mode, Record<string, AdvancedAnimationSpec>> = {
  "desktop": {
    "decorative_image_1": {
      "type": "scroll",
      "speed": 1,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 1160,
          "y": 915,
          "w": 476,
          "h": 789,
          "opacity": 0.4,
          "scale": 1,
          "rotation": 42
        },
        {
          "x": 846,
          "y": 1046,
          "w": 476,
          "h": 789,
          "opacity": 0.4,
          "scale": 1,
          "rotation": -24
        }
      ]
    },
    "decorative_image_2": {
      "type": "scroll",
      "speed": 1,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 452,
          "y": 2425,
          "w": 569,
          "h": 399,
          "opacity": 0,
          "scale": 0.92,
          "rotation": 0
        },
        {
          "x": 452,
          "y": 2425,
          "w": 569,
          "h": 399,
          "opacity": 0.35,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "decorative_image_4": {
      "type": "once",
      "speed": 1,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": -405,
          "y": 3929,
          "w": 1588,
          "h": 804,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": -405,
          "y": 3632,
          "w": 1588,
          "h": 804,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "decorative_image_5": {
      "type": "once",
      "speed": 1,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": -380,
          "y": 4632,
          "w": 1537,
          "h": 562,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": -380,
          "y": 4632,
          "w": 1537,
          "h": 562,
          "opacity": 0.5,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "marquee_logo_1": {
      "type": "loop",
      "speed": 60,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": true,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": -427,
          "y": 4638,
          "w": 331,
          "h": 135,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 866,
          "y": 4638,
          "w": 331,
          "h": 135,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "marquee_logo_2": {
      "type": "loop",
      "speed": 60,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": true,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 850,
          "y": 4512,
          "w": 331,
          "h": 135,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": -377,
          "y": 4509,
          "w": 331,
          "h": 135,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "gallery_polaroid_frame": {
      "type": "once",
      "speed": 1,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 22,
          "y": 4575,
          "w": 745,
          "h": 576,
          "opacity": 0,
          "scale": 0.92,
          "rotation": 0
        },
        {
          "x": 22,
          "y": 4575,
          "w": 745,
          "h": 576,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "container_mrboyqlt": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": -284,
          "y": 4565,
          "w": 249,
          "h": 79,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": -260,
          "y": 4565,
          "w": 249,
          "h": 79,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "container_mrboyqlz": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": -286,
          "y": 4680,
          "w": 249,
          "h": 79,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": -262,
          "y": 4680,
          "w": 249,
          "h": 79,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "container_mrboyqm4": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": -286,
          "y": 4795,
          "w": 249,
          "h": 79,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": -262,
          "y": 4795,
          "w": 249,
          "h": 79,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "container_mrboyqm9": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": -286,
          "y": 4910,
          "w": 249,
          "h": 79,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": -262,
          "y": 4910,
          "w": 249,
          "h": 79,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "container_mrbma3fj": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": false,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 335,
          "y": 4453,
          "w": 177,
          "h": 25,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 335,
          "y": 4429,
          "w": 177,
          "h": 25,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "container_mrbw694s": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 783,
          "y": 4566,
          "w": 249,
          "h": 79,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 807,
          "y": 4566,
          "w": 249,
          "h": 79,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "container_mrbw694x": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 784,
          "y": 4680,
          "w": 249,
          "h": 79,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 808,
          "y": 4680,
          "w": 249,
          "h": 79,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "container_mrbw6952": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 803,
          "y": 4790,
          "w": 249,
          "h": 79,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 803,
          "y": 4790,
          "w": 249,
          "h": 79,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "container_mrbw6957": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 776,
          "y": 4908,
          "w": 249,
          "h": 79,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 800,
          "y": 4908,
          "w": 249,
          "h": 79,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "gallery_tagline": {
      "type": "once",
      "speed": 1,
      "delay": 0.5,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 141,
          "y": 5001,
          "w": 531,
          "h": 116,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 141,
          "y": 5001,
          "w": 531,
          "h": 116,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "container_mrarstno": {
      "type": "once",
      "speed": 0.3,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 132,
          "y": 140,
          "w": 384,
          "h": 227,
          "opacity": 0,
          "scale": 0.92,
          "rotation": 0
        },
        {
          "x": 132,
          "y": 140,
          "w": 384,
          "h": 227,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "container_mrax5i7o": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 70,
          "y": 149,
          "w": 611,
          "h": 526,
          "opacity": 0,
          "scale": 0.92,
          "rotation": 0
        },
        {
          "x": 70,
          "y": 149,
          "w": 611,
          "h": 526,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "Testimonial_Form": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 729,
          "y": 151,
          "w": 616,
          "h": 467,
          "opacity": 0,
          "scale": 0.92,
          "rotation": 0
        },
        {
          "x": 729,
          "y": 151,
          "w": 616,
          "h": 467,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "footer_logo_image": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": false,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 10,
          "y": -2,
          "w": 224,
          "h": 100,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 34,
          "y": -2,
          "w": 224,
          "h": 100,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "footer_tagline": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": -9,
          "y": 65,
          "w": 275,
          "h": 41,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 15,
          "y": 65,
          "w": 275,
          "h": 41,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "group_mr7fkzds": {
      "type": "hover",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": false,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 822,
          "y": -36,
          "w": 550,
          "h": 443,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 822,
          "y": -55,
          "w": 550,
          "h": 443,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "about_intro_paragraph": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 20,
          "y": 83,
          "w": 638,
          "h": 47,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 44,
          "y": 83,
          "w": 638,
          "h": 47,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "about_secondary_paragraph": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 22,
          "y": 222,
          "w": 638,
          "h": 47,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 46,
          "y": 222,
          "w": 638,
          "h": 47,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "about_background_image": {
      "type": "once",
      "speed": 1,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": -1405,
          "y": -66,
          "w": 913,
          "h": 473,
          "opacity": 0.3,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": -878,
          "y": -66,
          "w": 913,
          "h": 473,
          "opacity": 0.3,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "container_mr9ik21w": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 13,
          "y": 10,
          "w": 129,
          "h": 28,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 13,
          "y": -14,
          "w": 129,
          "h": 28,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "packages_see_more_button": {
      "type": "once",
      "speed": 0.5,
      "delay": 1.5,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 565,
          "y": 751,
          "w": 302,
          "h": 50,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 565,
          "y": 727,
          "w": 302,
          "h": 50,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "container_mraxrtcx": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 1,
          "y": 510,
          "w": 161,
          "h": 34,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 1,
          "y": 486,
          "w": 161,
          "h": 34,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "container_mrax5i7t": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": false,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 1153,
          "y": 660,
          "w": 195,
          "h": 33,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 1153,
          "y": 636,
          "w": 195,
          "h": 33,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "container_mraxrtcv": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 905,
          "y": 661,
          "w": 232,
          "h": 32,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 905,
          "y": 637,
          "w": 232,
          "h": 32,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "packages_intro_text": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 41,
          "y": 66,
          "w": 821,
          "h": 33,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 65,
          "y": 66,
          "w": 821,
          "h": 33,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "container_PKG_Card": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 0,
          "y": 0,
          "w": 384,
          "h": 552,
          "opacity": 0,
          "scale": 0.92,
          "rotation": 0
        },
        {
          "x": 0,
          "y": 0,
          "w": 384,
          "h": 552,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "container_mr9i3apy": {
      "type": "once",
      "speed": 0.5,
      "delay": 0.5,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 432,
          "y": 0,
          "w": 384,
          "h": 552,
          "opacity": 0,
          "scale": 0.92,
          "rotation": 0
        },
        {
          "x": 432,
          "y": 0,
          "w": 384,
          "h": 552,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "container_mr9i3aqi": {
      "type": "once",
      "speed": 0.5,
      "delay": 1,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 856,
          "y": 0,
          "w": 384,
          "h": 552,
          "opacity": 0,
          "scale": 0.92,
          "rotation": 0
        },
        {
          "x": 856,
          "y": 0,
          "w": 384,
          "h": 552,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "hero_photo_card_1": {
      "type": "once",
      "speed": 1.5,
      "delay": 0,
      "animateOnAppear": false,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 64,
          "y": 49,
          "w": 303,
          "h": 346,
          "opacity": 0,
          "scale": 1,
          "rotation": 4
        },
        {
          "x": 64,
          "y": 49,
          "w": 303,
          "h": 346,
          "opacity": 1,
          "scale": 1,
          "rotation": 4
        }
      ]
    },
    "hero_photo_card_2": {
      "type": "once",
      "speed": 1.5,
      "delay": 1.5,
      "animateOnAppear": false,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 275,
          "y": 152,
          "w": 303,
          "h": 346,
          "opacity": 0,
          "scale": 1,
          "rotation": 4
        },
        {
          "x": 275,
          "y": 152,
          "w": 303,
          "h": 346,
          "opacity": 1,
          "scale": 1,
          "rotation": 4
        }
      ]
    },
    "hero_photo_card_3": {
      "type": "once",
      "speed": 1.5,
      "delay": 3,
      "animateOnAppear": false,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 187,
          "y": -65,
          "w": 303,
          "h": 346,
          "opacity": 0,
          "scale": 1,
          "rotation": 4
        },
        {
          "x": 187,
          "y": -65,
          "w": 303,
          "h": 346,
          "opacity": 1,
          "scale": 1,
          "rotation": 4
        }
      ]
    },
    "hero_heading_line1": {
      "type": "loop",
      "speed": 1.5,
      "delay": 0,
      "animateOnAppear": false,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 16,
          "y": -2,
          "w": 414,
          "h": 68,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 16,
          "y": -2,
          "w": 414,
          "h": 68,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "about_heading_line1": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 20,
          "y": 43,
          "w": 495,
          "h": 258,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 20,
          "y": 19,
          "w": 495,
          "h": 258,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "about_heading_line2": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 232,
          "y": 44,
          "w": 495,
          "h": 258,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 232,
          "y": 20,
          "w": 495,
          "h": 258,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "packages_heading": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 302,
          "y": 31,
          "w": 224,
          "h": 52,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 302,
          "y": 7,
          "w": 224,
          "h": 52,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "container_mr9ik21y": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 31,
          "y": -3,
          "w": 214,
          "h": 25,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 31,
          "y": -27,
          "w": 214,
          "h": 25,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "packages_section_label": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 32,
          "y": 29,
          "w": 264,
          "h": 55,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 32,
          "y": 5,
          "w": 264,
          "h": 55,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "testimonials_intro_text": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 41,
          "y": 66,
          "w": 821,
          "h": 33,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 65,
          "y": 66,
          "w": 821,
          "h": 33,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "testimonials_heading": {
      "type": "once",
      "speed": 0.55,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 241,
          "y": 30,
          "w": 259,
          "h": 47,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 241,
          "y": 6,
          "w": 259,
          "h": 47,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "container_mra6rgjk": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 7,
          "y": -27,
          "w": 177,
          "h": 25,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 31,
          "y": -27,
          "w": 177,
          "h": 25,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "testimonials_heading_line1": {
      "type": "once",
      "speed": 0.55,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 32,
          "y": 29,
          "w": 264,
          "h": 55,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 32,
          "y": 5,
          "w": 264,
          "h": 55,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "fleet_description": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 40,
          "y": 66,
          "w": 638,
          "h": 36,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 64,
          "y": 66,
          "w": 638,
          "h": 36,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "fleet_heading_line2": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 394,
          "y": 27,
          "w": 337,
          "h": 32,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 394,
          "y": 3,
          "w": 337,
          "h": 32,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "fleet_heading_line1": {
      "type": "once",
      "speed": 0.55,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 24,
          "y": 29,
          "w": 369,
          "h": 32,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 24,
          "y": 5,
          "w": 369,
          "h": 32,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "fleet_description_2": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 41,
          "y": 218,
          "w": 638,
          "h": 36,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 65,
          "y": 218,
          "w": 638,
          "h": 36,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "testimonial_1_quote_icon_open": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 8,
          "y": 180,
          "w": 103,
          "h": 119,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 8,
          "y": 156,
          "w": 103,
          "h": 119,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "testimonial_1_quote_icon_close": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 272,
          "y": -37,
          "w": 103,
          "h": 119,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 272,
          "y": -61,
          "w": 103,
          "h": 119,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "testimonial_1_quote": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 22,
          "y": 78,
          "w": 296,
          "h": 43,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 46,
          "y": 78,
          "w": 296,
          "h": 43,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "cta_intro_text": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 65,
          "y": 90,
          "w": 821,
          "h": 33,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 65,
          "y": 66,
          "w": 821,
          "h": 33,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "cta_heading_line2": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 320,
          "y": 6,
          "w": 411,
          "h": 23,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 344,
          "y": 6,
          "w": 411,
          "h": 23,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "container_mraw949u": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 31,
          "y": -3,
          "w": 177,
          "h": 25,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 31,
          "y": -27,
          "w": 177,
          "h": 25,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "cta_heading_line1": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 8,
          "y": 5,
          "w": 335,
          "h": 48,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 32,
          "y": 5,
          "w": 335,
          "h": 48,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "container_mrcd83lw": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 417,
          "y": 2322,
          "w": 140,
          "h": 25,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 417,
          "y": 2298,
          "w": 140,
          "h": 25,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    }
  },
  "mobile": {
    "decorative_image_1": {
      "type": "once",
      "speed": 1,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 324,
          "y": 1207,
          "w": 175,
          "h": 556,
          "opacity": 0.4,
          "scale": 1,
          "rotation": 12
        },
        {
          "x": 255,
          "y": 1310,
          "w": 175,
          "h": 556,
          "opacity": 0.4,
          "scale": 1,
          "rotation": -16
        }
      ]
    },
    "decorative_image_2": {
      "type": "once",
      "speed": 0.45,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 11,
          "y": 3652,
          "w": 365,
          "h": 251,
          "opacity": 0,
          "scale": 0.92,
          "rotation": 0
        },
        {
          "x": 11,
          "y": 3652,
          "w": 365,
          "h": 251,
          "opacity": 0.5,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "decorative_image_3": {
      "type": "loop",
      "speed": 50,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": true,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 1,
          "y": 4001,
          "w": 707,
          "h": 257,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": -319,
          "y": 3988,
          "w": 707,
          "h": 257,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "decorative_image_4": {
      "type": "scroll",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": -49,
          "y": 4682,
          "w": 471,
          "h": 378,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": -49,
          "y": 4547,
          "w": 471,
          "h": 378,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "decorative_image_5": {
      "type": "once",
      "speed": 1,
      "delay": 0,
      "animateOnAppear": false,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": -16,
          "y": 6075,
          "w": 718,
          "h": 333,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": -16,
          "y": 6075,
          "w": 718,
          "h": 333,
          "opacity": 0.5,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "marquee_logo_1": {
      "type": "loop",
      "speed": 40,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": true,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": -86,
          "y": 6012,
          "w": 200,
          "h": 80,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 386,
          "y": 6012,
          "w": 200,
          "h": 80,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 386,
          "y": 6012,
          "w": 200,
          "h": 80,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "marquee_logo_2": {
      "type": "loop",
      "speed": 30,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": true,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 303,
          "y": 6086,
          "w": 200,
          "h": 80,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": -172,
          "y": 6086,
          "w": 200,
          "h": 80,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "gallery_polaroid_frame": {
      "type": "once",
      "speed": 1,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": -2,
          "y": -59,
          "w": 408,
          "h": 325,
          "opacity": 0,
          "scale": 0.92,
          "rotation": 0
        },
        {
          "x": -2,
          "y": -59,
          "w": 408,
          "h": 325,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "container_mrboyqlt": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": -11,
          "y": 22,
          "w": 249,
          "h": 79,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 13,
          "y": 22,
          "w": 249,
          "h": 79,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "container_mrboyqlz": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": -8,
          "y": 128,
          "w": 249,
          "h": 79,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 16,
          "y": 128,
          "w": 249,
          "h": 79,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "container_mrboyqm4": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": -8,
          "y": 243,
          "w": 249,
          "h": 79,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 16,
          "y": 243,
          "w": 249,
          "h": 79,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "container_mrboyqm9": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": -8,
          "y": 358,
          "w": 249,
          "h": 79,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 16,
          "y": 358,
          "w": 249,
          "h": 79,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "container_mrbma3fj": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 374,
          "y": -22,
          "w": 177,
          "h": 25,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 374,
          "y": -46,
          "w": 177,
          "h": 25,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "container_mrbw694s": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": -11,
          "y": 22,
          "w": 249,
          "h": 79,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 13,
          "y": 22,
          "w": 249,
          "h": 79,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "container_mrbw694x": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": -8,
          "y": 128,
          "w": 249,
          "h": 79,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 16,
          "y": 128,
          "w": 249,
          "h": 79,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "container_mrbw6952": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": -8,
          "y": 243,
          "w": 249,
          "h": 79,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 16,
          "y": 243,
          "w": 249,
          "h": 79,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "container_mrbw6957": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": -8,
          "y": 358,
          "w": 249,
          "h": 79,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 16,
          "y": 358,
          "w": 249,
          "h": 79,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "gallery_tagline": {
      "type": "once",
      "speed": 1,
      "delay": 0.5,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 103,
          "y": 439,
          "w": 566,
          "h": 107,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 103,
          "y": 439,
          "w": 566,
          "h": 107,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "container_mrc0dj11": {
      "type": "trigger",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "package_3_enquire_button",
      "hoverElementId": "",
      "frames": [
        {
          "x": 676,
          "y": 41,
          "w": 133,
          "h": 157,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 517,
          "y": 41,
          "w": 133,
          "h": 157,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "slider_mrad23lg": {
      "type": "once",
      "speed": 1,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 12,
          "y": 7,
          "w": 405,
          "h": 275,
          "opacity": 0,
          "scale": 0.92,
          "rotation": 0
        },
        {
          "x": 12,
          "y": 7,
          "w": 405,
          "h": 275,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "fleet_slider_next_button": {
      "type": "once",
      "speed": 0.5,
      "delay": 0.5,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 379,
          "y": 242,
          "w": 45,
          "h": 48,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 379,
          "y": 242,
          "w": 45,
          "h": 48,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "fleet_slider_prev_button": {
      "type": "once",
      "speed": 0.5,
      "delay": 0.5,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 8,
          "y": 242,
          "w": 45,
          "h": 48,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 8,
          "y": 242,
          "w": 45,
          "h": 48,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "container_mrax5i7o": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 526,
          "y": 674,
          "w": 350,
          "h": 374,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 526,
          "y": 650,
          "w": 350,
          "h": 374,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "Testimonial_Form": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 522,
          "y": 14,
          "w": 358,
          "h": 542,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 522,
          "y": -10,
          "w": 358,
          "h": 542,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "footer_logo_image": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 99,
          "y": 66,
          "w": 224,
          "h": 100,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 99,
          "y": 42,
          "w": 224,
          "h": 100,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "footer_tagline": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 61,
          "y": 111,
          "w": 275,
          "h": 41,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 85,
          "y": 111,
          "w": 275,
          "h": 41,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "group_mr7fkzds": {
      "type": "scroll",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 323,
          "y": -111,
          "w": 550,
          "h": 443,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 323,
          "y": -132,
          "w": 550,
          "h": 443,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "about_intro_paragraph": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": -362,
          "y": 338,
          "w": 349,
          "h": 39,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": -338,
          "y": 338,
          "w": 349,
          "h": 39,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "about_secondary_paragraph": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": -365,
          "y": 507,
          "w": 348,
          "h": 38,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": -341,
          "y": 507,
          "w": 348,
          "h": 38,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "about_background_image": {
      "type": "once",
      "speed": 1,
      "delay": 2,
      "animateOnAppear": false,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": -1038,
          "y": -87,
          "w": 760,
          "h": 327,
          "opacity": 0.3,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": -725,
          "y": -87,
          "w": 760,
          "h": 327,
          "opacity": 0.3,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "container_mr9ik21w": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": -345,
          "y": 246,
          "w": 129,
          "h": 28,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": -345,
          "y": 222,
          "w": 129,
          "h": 28,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "packages_see_more_button": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 377,
          "y": 1515,
          "w": 161,
          "h": 33,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 401,
          "y": 1515,
          "w": 161,
          "h": 33,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "container_mraxrtcx": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 4,
          "y": 584,
          "w": 161,
          "h": 34,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 4,
          "y": 560,
          "w": 161,
          "h": 34,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "container_mrax5i7t": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": false,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 176,
          "y": -105,
          "w": 195,
          "h": 33,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 176,
          "y": -105,
          "w": 195,
          "h": 33,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "container_mraxrtcv": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 61,
          "y": -32,
          "w": 232,
          "h": 32,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 61,
          "y": -56,
          "w": 232,
          "h": 32,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "packages_intro_text": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 297,
          "y": 48,
          "w": 326,
          "h": 33,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 321,
          "y": 48,
          "w": 326,
          "h": 33,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "container_PKG_Card": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 259,
          "y": 0,
          "w": 307,
          "h": 445,
          "opacity": 0,
          "scale": 0.92,
          "rotation": 0
        },
        {
          "x": 259,
          "y": 0,
          "w": 307,
          "h": 445,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "container_mr9i3apy": {
      "type": "once",
      "speed": 0.5,
      "delay": 0.5,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 253,
          "y": 461,
          "w": 310,
          "h": 440,
          "opacity": 0,
          "scale": 0.92,
          "rotation": 0
        },
        {
          "x": 253,
          "y": 461,
          "w": 310,
          "h": 440,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "container_mr9i3aqi": {
      "type": "once",
      "speed": 0.5,
      "delay": 0.5,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 256,
          "y": 933,
          "w": 305,
          "h": 445,
          "opacity": 0,
          "scale": 0.92,
          "rotation": 0
        },
        {
          "x": 256,
          "y": 933,
          "w": 305,
          "h": 445,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "hero_photo_card_1": {
      "type": "once",
      "speed": 1.5,
      "delay": 0,
      "animateOnAppear": false,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 64,
          "y": 49,
          "w": 303,
          "h": 346,
          "opacity": 0,
          "scale": 1,
          "rotation": 4
        },
        {
          "x": 64,
          "y": 49,
          "w": 303,
          "h": 346,
          "opacity": 1,
          "scale": 1,
          "rotation": 4
        }
      ]
    },
    "hero_photo_card_2": {
      "type": "once",
      "speed": 1.5,
      "delay": 1.5,
      "animateOnAppear": false,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 275,
          "y": 152,
          "w": 303,
          "h": 346,
          "opacity": 0,
          "scale": 1,
          "rotation": 4
        },
        {
          "x": 275,
          "y": 152,
          "w": 303,
          "h": 346,
          "opacity": 1,
          "scale": 1,
          "rotation": 4
        }
      ]
    },
    "hero_photo_card_3": {
      "type": "once",
      "speed": 1.5,
      "delay": 3,
      "animateOnAppear": false,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 187,
          "y": -65,
          "w": 303,
          "h": 346,
          "opacity": 0,
          "scale": 1,
          "rotation": 4
        },
        {
          "x": 187,
          "y": -65,
          "w": 303,
          "h": 346,
          "opacity": 1,
          "scale": 1,
          "rotation": 4
        }
      ]
    },
    "hero_photo_card_1_label": {
      "type": "once",
      "speed": 1.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 33,
          "y": 278,
          "w": 229,
          "h": 62,
          "opacity": 0,
          "scale": 1,
          "rotation": 1
        },
        {
          "x": 33,
          "y": 254,
          "w": 229,
          "h": 62,
          "opacity": 1,
          "scale": 1,
          "rotation": 1
        }
      ]
    },
    "hero_photo_card_3_label": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 40,
          "y": 298,
          "w": 239,
          "h": 31,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 40,
          "y": 274,
          "w": 239,
          "h": 31,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "hero_photo_card_2_label": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 29,
          "y": 292,
          "w": 281,
          "h": 41,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 29,
          "y": 268,
          "w": 281,
          "h": 41,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "about_heading_line1": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": -366,
          "y": 263,
          "w": 161,
          "h": 20,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": -342,
          "y": 263,
          "w": 161,
          "h": 20,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "about_heading_line2": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": -370,
          "y": 293,
          "w": 415,
          "h": 20,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": -346,
          "y": 293,
          "w": 415,
          "h": 20,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "packages_heading": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 490,
          "y": 31,
          "w": 224,
          "h": 52,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 490,
          "y": 7,
          "w": 224,
          "h": 52,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "container_mr9ik21y": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 316,
          "y": -11,
          "w": 214,
          "h": 25,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 316,
          "y": -35,
          "w": 214,
          "h": 25,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "packages_section_label": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 322,
          "y": 30,
          "w": 168,
          "h": 34,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 322,
          "y": 6,
          "w": 168,
          "h": 34,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "testimonials_intro_text": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 20,
          "y": 62,
          "w": 821,
          "h": 33,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 44,
          "y": 62,
          "w": 821,
          "h": 33,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "testimonials_heading": {
      "type": "once",
      "speed": 0.55,
      "delay": 0,
      "animateOnAppear": false,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 241,
          "y": 30,
          "w": 259,
          "h": 47,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 241,
          "y": 6,
          "w": 259,
          "h": 47,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "container_mra6rgjk": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 7,
          "y": -27,
          "w": 209,
          "h": 31,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 31,
          "y": -27,
          "w": 209,
          "h": 31,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "testimonials_heading_line1": {
      "type": "once",
      "speed": 0.55,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 32,
          "y": 29,
          "w": 264,
          "h": 55,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 32,
          "y": 5,
          "w": 264,
          "h": 55,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "fleet_description": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 22,
          "y": 353,
          "w": 363,
          "h": 36,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 46,
          "y": 353,
          "w": 363,
          "h": 36,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "fleet_heading_line2": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 23,
          "y": 55,
          "w": 337,
          "h": 32,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 47,
          "y": 55,
          "w": 337,
          "h": 32,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "container_mrad23lb": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 41,
          "y": 14,
          "w": 142,
          "h": 26,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 41,
          "y": -10,
          "w": 142,
          "h": 26,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "fleet_heading_line1": {
      "type": "once",
      "speed": 0.55,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 24,
          "y": 26,
          "w": 369,
          "h": 32,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 48,
          "y": 26,
          "w": 369,
          "h": 32,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "fleet_description_2": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 20,
          "y": 503,
          "w": 375,
          "h": 36,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 44,
          "y": 503,
          "w": 375,
          "h": 36,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "testimonial_1_quote": {
      "type": "once",
      "speed": 1,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 22,
          "y": 78,
          "w": 296,
          "h": 43,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 46,
          "y": 78,
          "w": 296,
          "h": 43,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "cta_intro_text": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 508,
          "y": -72,
          "w": 367,
          "h": 36,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 532,
          "y": -72,
          "w": 367,
          "h": 36,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "cta_heading_line2": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 500,
          "y": -107,
          "w": 411,
          "h": 23,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 524,
          "y": -107,
          "w": 411,
          "h": 23,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "container_mraw949u": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 499,
          "y": -168,
          "w": 156,
          "h": 24,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 523,
          "y": -168,
          "w": 156,
          "h": 24,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    },
    "cta_heading_line1": {
      "type": "once",
      "speed": 0.5,
      "delay": 0,
      "animateOnAppear": true,
      "smooth": false,
      "scrollRange": 200,
      "triggerButtonId": "",
      "hoverElementId": "",
      "frames": [
        {
          "x": 500,
          "y": -136,
          "w": 335,
          "h": 48,
          "opacity": 0,
          "scale": 1,
          "rotation": 0
        },
        {
          "x": 524,
          "y": -136,
          "w": 335,
          "h": 48,
          "opacity": 1,
          "scale": 1,
          "rotation": 0
        }
      ]
    }
  }
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function useMobileScale() {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      setScale(clamp(window.innerWidth / MOBILE_CANVAS_WIDTH, 0.55, 1.35));
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  return scale;
}

function useSliderIndexes() {
  const [sliderIndexes, setSliderIndexes] = useState<SliderIndexes>({});

  const moveSlider = useCallback((id: keyof typeof SLIDERS, direction: 1 | -1) => {
    setSliderIndexes((current) => {
      const slider = SLIDERS[id];
      const count = Math.max(slider.counts.desktop, slider.counts.mobile);
      const currentIndex = current[id] ?? 0;
      let nextIndex = currentIndex + direction;

      if (slider.loop) {
        nextIndex = ((nextIndex % count) + count) % count;
      } else {
        nextIndex = clamp(nextIndex, 0, count - 1);
      }

      return { ...current, [id]: nextIndex };
    });
  }, []);

  useEffect(() => {
    const timers = Object.entries(SLIDERS)
      .filter(([, slider]) => slider.autoScroll)
      .map(([id, slider]) => window.setInterval(() => moveSlider(id as keyof typeof SLIDERS, 1), Math.max(0.5, slider.duration) * 1000));

    return () => timers.forEach((timer) => window.clearInterval(timer));
  }, [moveSlider]);

  return { sliderIndexes, moveSlider };
}

function smoothScrollTo(targetY: number, speed = 1) {
  const startY = window.scrollY;
  const distance = targetY - startY;
  const duration = Math.max(150, Math.min(2500, Math.abs(distance) / (1.1 * speed)));
  const startTime = performance.now();

  const easeInOut = (value: number) => (value < 0.5 ? 2 * value * value : 1 - Math.pow(-2 * value + 2, 2) / 2);

  const step = (timestamp: number) => {
    const progress = Math.min((timestamp - startTime) / duration, 1);
    window.scrollTo(0, startY + distance * easeInOut(progress));
    if (progress < 1) window.requestAnimationFrame(step);
  };

  window.requestAnimationFrame(step);
}

function scaledChildren(scaleClassName: string | undefined, children: ReactNode) {
  if (!scaleClassName) return children;
  return <div className={`tf-scale-wrap ${scaleClassName}`}>{children}</div>;
}

function BoxElement({ id, className, type, children, style, scaleClassName }: ElementProps & { type: "container" | "group" }) {
  return (
    <div className={`tf-el tf-${type} ${className}`} data-id={id} data-type={type} style={style}>
      {scaledChildren(scaleClassName, children)}
    </div>
  );
}

function TextElement({ id, className, children, style }: ElementProps) {
  return (
    <div className={`tf-el tf-text ${className}`} data-id={id} data-type="text" style={style}>
      {content.texts[id] ?? ""}
      {children}
    </div>
  );
}

function TextLinkElement({ id, className, href, children, style }: ElementProps & { href: string }) {
  return (
    <a className={`tf-el tf-text ${className}`} data-id={id} data-type="text" href={href} style={style}>
      {content.texts[id] ?? ""}
      {children}
    </a>
  );
}

function ImageElement({ id, className, children, style, scaleClassName }: ElementProps) {
  const image = content.images[id];

  return (
    <div className={`tf-el tf-image ${className}`} data-id={id} data-type="image" style={style}>
      {image?.src ? <Image src={image.src} alt={image.alt ?? ""} fill sizes="100vw" unoptimized /> : null}
      {scaledChildren(scaleClassName, children)}
    </div>
  );
}

function ButtonElement({ id, mode, className, children, style, onAction }: ElementProps & { mode: Mode; onAction: ButtonAction }) {
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

function InputElement({ id, className, children, style, scaleClassName }: ElementProps) {
  return (
    <div className={`tf-el tf-input ${className}`} data-id={id} data-type="input" style={style}>
      <input type="text" placeholder={content.fields[id]?.placeholder ?? ""} />
      {scaledChildren(scaleClassName, children)}
    </div>
  );
}

function TextareaElement({ id, className, children, style, scaleClassName }: ElementProps) {
  return (
    <div className={`tf-el tf-textarea ${className}`} data-id={id} data-type="textarea" style={style}>
      <textarea placeholder={content.fields[id]?.placeholder ?? ""} />
      {scaledChildren(scaleClassName, children)}
    </div>
  );
}

function SelectElement({ id, className, children, style, scaleClassName }: ElementProps) {
  const options = content.fields[id]?.options?.length ? content.fields[id]?.options : ["Option 1", "Option 2", "Option 3"];

  return (
    <div className={`tf-el tf-select ${className}`} data-id={id} data-type="select" style={style}>
      <select>
        {options?.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {scaledChildren(scaleClassName, children)}
    </div>
  );
}

function SliderElement({ id, className, activeIndex, children, style }: ElementProps & { activeIndex: number }) {
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

type GeneratedElementSpec = {
  id: string;
  classToken: string;
  scaleClassToken?: string;
};
type TextContainerSpec = {
  container: GeneratedElementSpec;
  text: GeneratedElementSpec;
};
type PackageCardSpec = {
  root: GeneratedElementSpec;
  image: GeneratedElementSpec;
  button: GeneratedElementSpec;
  title: TextContainerSpec;
  combos: TextContainerSpec[];
  location: {
    container: GeneratedElementSpec;
    text: GeneratedElementSpec;
    icon: GeneratedElementSpec;
  };
  comboCount?: TextContainerSpec;
};
type TestimonialCardSpec = {
  root: GeneratedElementSpec;
  quoteOpen: GeneratedElementSpec;
  quoteClose: GeneratedElementSpec;
  avatar: GeneratedElementSpec;
  initial: GeneratedElementSpec;
  name: GeneratedElementSpec;
  role: GeneratedElementSpec;
  quote: GeneratedElementSpec;
};
type OfferingCardSpec = {
  root: GeneratedElementSpec;
  background: GeneratedElementSpec;
  icon: GeneratedElementSpec;
  title: GeneratedElementSpec;
  subtitle: GeneratedElementSpec;
};

const modeClassName = (mode: Mode, classToken: string) => `tf-${mode === "desktop" ? "d" : "m"}-${classToken}`;
const modeScaleClassName = (mode: Mode, classToken?: string) => (mode === "mobile" && classToken ? `tf-scale-m-${classToken}` : undefined);

const PACKAGE_CARDS: PackageCardSpec[] = [
  {
    root: { id: "container_PKG_Card", classToken: "container_PKG_Card_oycau", scaleClassToken: "container_PKG_Card_oycau" },
    image: { id: "package_1_image", classToken: "image_mr9adhx8_s4fgo" },
    button: { id: "package_1_enquire_button", classToken: "button_mr9adhx9_5ehan" },
    title: {
      container: { id: "container_mr9cjvf0", classToken: "container_mr9cjvf0_62xtd" },
      text: { id: "package_1_title", classToken: "text_mr9cjvf1_dozms" },
    },
    combos: [
      {
        container: { id: "container_mr9cjvf2", classToken: "container_mr9cjvf2_62xtd" },
        text: { id: "package_1_combo_1", classToken: "text_mr9cjvf3_dozms" },
      },
      {
        container: { id: "container_mr9gr3zj", classToken: "container_mr9gr3zj_658qh" },
        text: { id: "package_1_combo_2", classToken: "text_mr9gr3zk_dmopo" },
      },
      {
        container: { id: "container_mr9gr3zl", classToken: "container_mr9gr3zl_658qh" },
        text: { id: "package_1_combo_3", classToken: "text_mr9gr3zm_dmopo" },
      },
      {
        container: { id: "container_mr9gr3zn", classToken: "container_mr9gr3zn_658qh" },
        text: { id: "package_1_combo_4", classToken: "text_mr9gr3zo_dmopo" },
      },
      {
        container: { id: "container_mr9gr3zp", classToken: "container_mr9gr3zp_658qi" },
        text: { id: "package_1_combo_5", classToken: "text_mr9gr3zq_dmopo" },
      },
    ],
    location: {
      container: { id: "container_mr9h7du0", classToken: "container_mr9h7du0_64rv1" },
      text: { id: "package_1_location", classToken: "text_mr9h7du1_dn5l5" },
      icon: { id: "package_1_location_icon", classToken: "image_mr9h7du2_s1dpz" },
    },
    comboCount: {
      container: { id: "container_mr9h7du3", classToken: "container_mr9h7du3_64rv1" },
      text: { id: "package_1_combo_count", classToken: "text_mr9h7du4_dn5l5" },
    },
  },
  {
    root: { id: "container_mr9i3apy", classToken: "container_mr9i3apy_6591e", scaleClassToken: "container_mr9i3apy_6591e" },
    image: { id: "package_2_image", classToken: "image_mr9i3apz_s0wjm" },
    button: { id: "package_2_enquire_button", classToken: "button_mr9i3aq0_5aydm" },
    title: {
      container: { id: "container_mr9i3aq1", classToken: "container_mr9i3aq1_6591c" },
      text: { id: "package_2_title", classToken: "text_mr9i3aq2_dmoet" },
    },
    combos: [
      {
        container: { id: "container_mr9i3aq3", classToken: "container_mr9i3aq3_6591c" },
        text: { id: "package_2_combo_1", classToken: "text_mr9i3aq4_dmoet" },
      },
      {
        container: { id: "container_mr9i3aq5", classToken: "container_mr9i3aq5_6591d" },
        text: { id: "package_2_combo_2", classToken: "text_mr9i3aq6_dmoet" },
      },
      {
        container: { id: "container_mr9i3aq7", classToken: "container_mr9i3aq7_6591d" },
        text: { id: "package_2_combo_3", classToken: "text_mr9i3aq8_dmoet" },
      },
      {
        container: { id: "container_mr9i3aq9", classToken: "container_mr9i3aq9_6591d" },
        text: { id: "package_2_combo_4", classToken: "text_mr9i3aqa_dmoes" },
      },
      {
        container: { id: "container_mr9i3aqb", classToken: "container_mr9i3aqb_6591e" },
        text: { id: "package_2_combo_5", classToken: "text_mr9i3aqc_dmoes" },
      },
    ],
    location: {
      container: { id: "container_mr9i3aqd", classToken: "container_mr9i3aqd_6591e" },
      text: { id: "package_2_location", classToken: "text_mr9i3aqe_dmoes" },
      icon: { id: "package_2_location_icon", classToken: "image_mr9i3aqf_s0wjl" },
    },
    comboCount: {
      container: { id: "container_mr9i3aqg", classToken: "container_mr9i3aqg_6591e" },
      text: { id: "package_2_combo_count", classToken: "text_mr9i3aqh_dmoes" },
    },
  },
  {
    root: { id: "container_mr9i3aqi", classToken: "container_mr9i3aqi_6591e", scaleClassToken: "container_mr9i3aqi_6591e" },
    image: { id: "package_3_image", classToken: "image_mr9i3aqj_s0wjl" },
    button: { id: "package_3_enquire_button", classToken: "button_mr9i3aqk_5aydk" },
    title: {
      container: { id: "container_mr9i3aql", classToken: "container_mr9i3aql_6591e" },
      text: { id: "package_3_title", classToken: "text_mr9i3aqm_dmoer" },
    },
    combos: [
      {
        container: { id: "container_mr9i3aqn", classToken: "container_mr9i3aqn_6591e" },
        text: { id: "package_3_combo_1", classToken: "text_mr9i3aqo_dmoer" },
      },
      {
        container: { id: "container_mr9i3aqp", classToken: "container_mr9i3aqp_6591e" },
        text: { id: "package_3_combo_2", classToken: "text_mr9i3aqq_dmoer" },
      },
      {
        container: { id: "container_mr9i3aqr", classToken: "container_mr9i3aqr_6591e" },
        text: { id: "package_3_combo_3", classToken: "text_mr9i3aqs_dmoer" },
      },
      {
        container: { id: "container_mr9i3aqt", classToken: "container_mr9i3aqt_6591e" },
        text: { id: "package_3_combo_4", classToken: "text_mr9i3aqu_dmoer" },
      },
      {
        container: { id: "container_mr9i3aqv", classToken: "container_mr9i3aqv_6591e" },
        text: { id: "package_3_combo_5", classToken: "text_mr9i3aqw_dmoer" },
      },
    ],
    location: {
      container: { id: "container_mr9i3aqx", classToken: "container_mr9i3aqx_6591e" },
      text: { id: "package_3_location", classToken: "text_mr9i3aqy_dmoer" },
      icon: { id: "package_3_location_icon", classToken: "image_mr9i3aqz_s0wjl" },
    },
  },
];

const TESTIMONIAL_CARDS: TestimonialCardSpec[] = [
  {
    root: { id: "container_mrarstno", classToken: "container_mrarstno_p95bp" },
    quoteOpen: { id: "testimonial_1_quote_icon_open", classToken: "image_mrarstnp_8x09b" },
    quoteClose: { id: "testimonial_1_quote_icon_close", classToken: "image_mrarstnq_8x09b" },
    avatar: { id: "container_mrarstnr", classToken: "container_mrarstnr_p95bp" },
    initial: { id: "testimonial_1_initial", classToken: "text_mrarstns_5h7vi" },
    name: { id: "testimonial_1_name", classToken: "text_mrarstnu_5h7vi" },
    role: { id: "testimonial_1_role", classToken: "text_mrarstnv_5h7vi" },
    quote: { id: "testimonial_1_quote", classToken: "text_mrarstnw_5h7vi" },
  },
  {
    root: { id: "container_mrav47v5", classToken: "container_mrav47v5_pa70t" },
    quoteOpen: { id: "testimonial_2_quote_icon_open", classToken: "image_mrav47v6_8vyk7" },
    quoteClose: { id: "testimonial_2_quote_icon_close", classToken: "image_mrav47v7_8vyk7" },
    avatar: { id: "container_mrav47v8", classToken: "container_mrav47v8_pa70t" },
    initial: { id: "testimonial_2_initial", classToken: "text_mrav47v9_5i9km" },
    name: { id: "testimonial_2_name", classToken: "text_mrav47va_5i9kn" },
    role: { id: "testimonial_2_role", classToken: "text_mrav47vb_5i9kn" },
    quote: { id: "testimonial_2_quote", classToken: "text_mrav47vc_5i9kn" },
  },
  {
    root: { id: "container_mrav47vd", classToken: "container_mrav47vd_pa70u" },
    quoteOpen: { id: "testimonial_3_quote_icon_open", classToken: "image_mrav47ve_8vyk5" },
    quoteClose: { id: "testimonial_3_quote_icon_close", classToken: "image_mrav47vf_8vyk5" },
    avatar: { id: "container_mrav47vg", classToken: "container_mrav47vg_pa70u" },
    initial: { id: "testimonial_3_initial", classToken: "text_mrav47vh_5i9ko" },
    name: { id: "testimonial_3_name", classToken: "text_mrav47vi_5i9ko" },
    role: { id: "testimonial_3_role", classToken: "text_mrav47vj_5i9ko" },
    quote: { id: "testimonial_3_quote", classToken: "text_mrav47vk_5i9ko" },
  },
];

const PRIMARY_OFFERING_CARDS: OfferingCardSpec[] = [
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

const SECONDARY_OFFERING_CARDS: OfferingCardSpec[] = [
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

function TextContainer({ mode, item }: { mode: Mode; item: TextContainerSpec }) {
  return (
    <BoxElement id={item.container.id} className={modeClassName(mode, item.container.classToken)} type="container">
      <TextElement id={item.text.id} className={modeClassName(mode, item.text.classToken)} />
    </BoxElement>
  );
}

function PackageCard({ mode, card, buttonAction }: { mode: Mode; card: PackageCardSpec; buttonAction: ButtonAction }) {
  return (
    <BoxElement
      id={card.root.id}
      className={modeClassName(mode, card.root.classToken)}
      type="container"
      scaleClassName={modeScaleClassName(mode, card.root.scaleClassToken)}
    >
      <ImageElement id={card.image.id} className={modeClassName(mode, card.image.classToken)} />
      <ButtonElement id={card.button.id} className={modeClassName(mode, card.button.classToken)} mode={mode} onAction={buttonAction} />
      <TextContainer mode={mode} item={card.title} />
      {card.combos.map((combo) => (
        <TextContainer key={combo.container.id} mode={mode} item={combo} />
      ))}
      <BoxElement id={card.location.container.id} className={modeClassName(mode, card.location.container.classToken)} type="container">
        <TextElement id={card.location.text.id} className={modeClassName(mode, card.location.text.classToken)} />
        <ImageElement id={card.location.icon.id} className={modeClassName(mode, card.location.icon.classToken)} />
      </BoxElement>
      {card.comboCount ? <TextContainer mode={mode} item={card.comboCount} /> : null}
    </BoxElement>
  );
}

function TestimonialCard({ mode, card }: { mode: Mode; card: TestimonialCardSpec }) {
  return (
    <BoxElement id={card.root.id} className={modeClassName(mode, card.root.classToken)} type="container">
      <ImageElement id={card.quoteOpen.id} className={modeClassName(mode, card.quoteOpen.classToken)} />
      <ImageElement id={card.quoteClose.id} className={modeClassName(mode, card.quoteClose.classToken)} />
      <BoxElement id={card.avatar.id} className={modeClassName(mode, card.avatar.classToken)} type="container" />
      <TextElement id={card.initial.id} className={modeClassName(mode, card.initial.classToken)} />
      <TextElement id={card.name.id} className={modeClassName(mode, card.name.classToken)} />
      <TextElement id={card.role.id} className={modeClassName(mode, card.role.classToken)} />
      <TextElement id={card.quote.id} className={modeClassName(mode, card.quote.classToken)} />
    </BoxElement>
  );
}

function OfferingCard({ mode, card }: { mode: Mode; card: OfferingCardSpec }) {
  return (
    <BoxElement id={card.root.id} className={modeClassName(mode, card.root.classToken)} type="container">
      <BoxElement id={card.background.id} className={modeClassName(mode, card.background.classToken)} type="container" />
      <ImageElement id={card.icon.id} className={modeClassName(mode, card.icon.classToken)} />
      <TextElement id={card.title.id} className={modeClassName(mode, card.title.classToken)} />
      <TextElement id={card.subtitle.id} className={modeClassName(mode, card.subtitle.classToken)} />
    </BoxElement>
  );
}

function DesktopPage({ buttonAction, sliderIndexes }: PageTreeProps) {
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
    <BoxElement id={"Navbar_Section"} className="tf-d-Navbar_Section_jxg4z" type="container">
      <ButtonElement id={"nav_about_us_link"} className="tf-d-text_mr4pnrti_fuzxp" mode="desktop" onAction={buttonAction} />
      <ButtonElement id={"nav_enquiry_link"} className="tf-d-text_mr4pnrtk_fuzxo" mode="desktop" onAction={buttonAction} />
      <ButtonElement id={"nav_packages_link"} className="tf-d-text_mr4pnrtl_fuzxo" mode="desktop" onAction={buttonAction} />
      <ButtonElement id={"nav_bus_link"} className="tf-d-text_mr4pnrtm_fuzxo" mode="desktop" onAction={buttonAction} />
      <ImageElement id={"nav_logo_image"} className="tf-d-image_mr5ue7rl_tpmfu" />
    </BoxElement>
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
    <BoxElement id={"Available_package_section"} className="tf-d-Available_package_section_bi3c1" type="group">
      <BoxElement id={"Package_grp"} className="tf-d-Package_grp_seqzz" type="group">
        {PACKAGE_CARDS.map((card) => (
          <PackageCard key={card.root.id} mode="desktop" card={card} buttonAction={buttonAction} />
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
        <InputElement id={"enquiry_name_input"} className="tf-d-input_mrb0ygep_kwdlv">
          <TextElement id={"enquiry_name_label"} className="tf-d-text_mrb0ygew_4y2mt" />
        </InputElement>
        <SelectElement id={"enquiry_destination_select"} className="tf-d-select_mrb0yger_8l91i">
          <TextElement id={"enquiry_destination_label"} className="tf-d-text_mrb0ygex_4y2mt" />
        </SelectElement>
        <SelectElement id={"enquiry_combo_select"} className="tf-d-select_mrb0yges_8l91i">
          <TextElement id={"enquiry_combo_label"} className="tf-d-text_mrb0ygey_4y2mt" />
        </SelectElement>
        <ButtonElement id={"enquiry_send_button"} className="tf-d-button_mrb0yget_d9so0" mode="desktop" onAction={buttonAction} />
        <InputElement id={"enquiry_date_input"} className="tf-d-input_mrb0ygeu_kwdlv">
          <TextElement id={"enquiry_date_label"} className="tf-d-text_mrb0ygf0_4y2ms" />
        </InputElement>
        <InputElement id={"enquiry_members_input"} className="tf-d-input_mrb0ygev_kwdlv">
          <TextElement id={"enquiry_members_label"} className="tf-d-text_mrb0ygf1_4y2ms" />
        </InputElement>
        <TextareaElement id={"enquiry_message_textarea"} className="tf-d-textarea_mrb0ygez_t94rj">
          <TextElement id={"enquiry_message_label"} className="tf-d-text_mrb0ygf2_4y2ms" />
        </TextareaElement>
        <BoxElement id={"container_mraxrtcx"} className="tf-d-container_mraxrtcx_pcfg0" type="container">
          <TextElement id={"enquiry_phone_text"} className="tf-d-text_mraxrtcy_5khzt" />
          <ImageElement id={"enquiry_phone_icon"} className="tf-d-image_mrb0t6c8_9g9pd" />
        </BoxElement>
        <TextElement id={"enquiry_whatsapp_text"} className="tf-d-text_mrb2fots_4yu9j" />
        <ImageElement id={"enquiry_whatsapp_icon"} className="tf-d-image_mrb2zm77_9f16j" />
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
    <BoxElement id={"Footer_Section"} className="tf-d-Footer_Section_flkou" type="container">
      <BoxElement id={"container_mrb30nlc"} className="tf-d-container_mrb30nlc_oqd02" type="container">
        <ImageElement id={"footer_logo_image"} className="tf-d-image_mrb30nlb_9fskx" />
        <TextElement id={"footer_tagline"} className="tf-d-text_mrb30nld_4yfjw" />
      </BoxElement>
      <TextElement id={"footer_rapid_links_heading"} className="tf-d-text_mrb3e0zj_4zc4k">
        <TextElement id={"footer_packages_link"} className="tf-d-text_mrb3e0zk_4zc4k" />
        <TextElement id={"footer_about_us_link"} className="tf-d-text_mrb3e0zl_4zc4k" />
        <TextElement id={"footer_enquiry_link"} className="tf-d-text_mrb3e0zm_4zc4k" />
        <TextElement id={"footer_testimonials_link"} className="tf-d-text_mrb3e0zn_4zc4k" />
      </TextElement>
      <TextElement id={"footer_legal_heading"} className="tf-d-text_mrb3e0zo_4zc4k">
        <TextLinkElement id={"footer_terms_link"} className="tf-d-text_mrb3e0zp_4zc4k" href={LEGAL_FOOTER_LINKS.footer_terms_link} />
        <TextLinkElement id={"footer_privacy_link"} className="tf-d-text_mrb3e0zq_4zc4k" href={LEGAL_FOOTER_LINKS.footer_privacy_link} />
        <TextLinkElement id={"footer_legal_extra_1"} className="tf-d-text_mrb3e0zr_4zc4k" href={LEGAL_FOOTER_LINKS.footer_legal_extra_1} />
        <TextLinkElement id={"footer_legal_extra_2"} className="tf-d-text_mrb3e0zs_4zc4k" href={LEGAL_FOOTER_LINKS.footer_legal_extra_2} />
      </TextElement>
      <TextElement id={"footer_copyright"} className="tf-d-text_mrb3e0zu_4zc4k" />
      <TextElement id={"footer_contact_link"} className="tf-d-text_mrb3e0zv_4zc4k" />
      <BoxElement id={"container_mrb3q9g6"} className="tf-d-container_mrb3q9g6_orher" type="container" />
    </BoxElement>
    <ImageElement id={"decorative_image_5"} className="tf-d-image_mrc98pax_8vb1u" />
    <ImageElement id={"marquee_logo_1"} className="tf-d-image_mrc9fn5h_8uhqz" />
    <ImageElement id={"marquee_logo_2"} className="tf-d-image_mrc9fn5g_8uhqz" />
    <ImageElement id={"decorative_image_6"} className="tf-d-image_mrboyqls_8hi91" />
    <BoxElement id={"container_mrbv8hmy"} className="tf-d-container_mrbv8hmy_prc7b" type="container">
      <SliderElement id={"slider_mrad23lg"} className="tf-d-slider_mrad23lg_ypqky" activeIndex={sliderIndexes["slider_mrad23lg"] ?? 0}>
        <ImageElement id={"fleet_bus_photo_1"} className="tf-d-image_mrad23lf_95w80" />
        <ImageElement id={"fleet_bus_photo_2"} className="tf-d-image_mrad23lh_95w80" />
        <ImageElement id={"fleet_bus_photo_3"} className="tf-d-image_mrad23li_95w80" />
        <ImageElement id={"fleet_bus_photo_4"} className="tf-d-image_mrad23lj_95w80" />
        <ImageElement id={"fleet_bus_photo_5"} className="tf-d-image_mrad23lk_95w80" />
        <ImageElement id={"fleet_bus_photo_6"} className="tf-d-image_mrad23ll_95w80" />
        <ImageElement id={"fleet_bus_photo_7"} className="tf-d-image_mrad23lm_95w80" />
        <ImageElement id={"fleet_bus_photo_8"} className="tf-d-image_mrad23ln_95w80" />
        <ImageElement id={"fleet_bus_photo_9"} className="tf-d-image_mrad23lo_95w80" />
        <ImageElement id={"fleet_bus_photo_10"} className="tf-d-image_mrad23lp_95w80" />
        <ImageElement id={"fleet_bus_photo_11"} className="tf-d-image_mrad23lq_95w80" />
        <ImageElement id={"fleet_bus_photo_12"} className="tf-d-image_mrad23lr_95w80" />
        <ImageElement id={"fleet_bus_photo_13"} className="tf-d-image_mrad23ls_95w80" />
        <ImageElement id={"fleet_bus_photo_14"} className="tf-d-image_mrad23lt_95w80" />
        <ImageElement id={"fleet_bus_photo_15"} className="tf-d-image_mrad23lu_95w80" />
        <ImageElement id={"fleet_bus_photo_16"} className="tf-d-image_mrad23lw_95w80" />
      </SliderElement>
      <ButtonElement id={"fleet_slider_next_button"} className="tf-d-rightBtn_nr0rc" mode="desktop" onAction={buttonAction} />
      <ButtonElement id={"fleet_slider_prev_button"} className="tf-d-leftBtn_wzr9x" mode="desktop" onAction={buttonAction} />
    </BoxElement>
    <BoxElement id={"container_mrbq03iy"} className="tf-d-container_mrbq03iy_pof12" type="container">
      <TextElement id={"contact_footer_phone"} className="tf-d-text_mrbq03iz_5whkv" />
      <ImageElement id={"contact_footer_phone_icon"} className="tf-d-image_mrbq03j0_8hqjz" />
    </BoxElement>
    <BoxElement id={"container_mrbq03j1"} className="tf-d-container_mrbq03j1_pof11" type="container">
      <TextElement id={"contact_footer_email"} className="tf-d-text_mrbq03j2_5whku" />
      <ImageElement id={"contact_footer_email_icon"} className="tf-d-image_mrbq03j3_8hqjz" />
    </BoxElement>
    <BoxElement id={"container_mrbq5l5n"} className="tf-d-container_mrbq5l5n_pojd0" type="container">
      <TextElement id={"contact_footer_website"} className="tf-d-text_mrbq5l5o_5wlwt" />
      <ImageElement id={"contact_footer_website_icon"} className="tf-d-image_mrbq5l5p_8hm7z" />
    </BoxElement>
    <ImageElement id={"gallery_polaroid_frame"} className="tf-d-Poloroid_slider_plsqu">
      <SliderElement id={"slider_mrbma3g2"} className="tf-d-slider_mrbma3g2_zckcx" activeIndex={sliderIndexes["slider_mrbma3g2"] ?? 0}>
        <ImageElement id={"gallery_photo_1"} className="tf-d-image_mrbma3fs_8j2g1" />
        <ImageElement id={"gallery_photo_2"} className="tf-d-image_mrbma3ft_8j2g1" />
        <ImageElement id={"gallery_photo_3"} className="tf-d-image_mrbma3fu_8j2g1" />
        <ImageElement id={"gallery_photo_4"} className="tf-d-image_mrbma3fv_8j2g1" />
        <ImageElement id={"gallery_photo_5"} className="tf-d-image_mrbma3fw_8j2g1" />
        <ImageElement id={"gallery_photo_6"} className="tf-d-image_mrbma3fx_8j2g1" />
        <ImageElement id={"gallery_photo_7"} className="tf-d-image_mrbma3fy_8j2g1" />
        <ImageElement id={"gallery_photo_8"} className="tf-d-image_mrbma3fz_8j2g1" />
        <ImageElement id={"gallery_photo_9"} className="tf-d-image_mrbma3g0_8j2g2" />
        <ImageElement id={"gallery_photo_10"} className="tf-d-image_mrbma3g1_8j2g2" />
      </SliderElement>
    </ImageElement>
    {PRIMARY_OFFERING_CARDS.map((card) => (
      <OfferingCard key={card.root.id} mode="desktop" card={card} />
    ))}
    <BoxElement id={"container_mrbma3fj"} className="tf-d-container_mrbma3fj_pn34y" type="container">
      <TextElement id={"offerings_badge_label"} className="tf-d-text_mrbma3fk_5v5os" />
      <TextElement id={"offerings_heading_line1"} className="tf-d-text_mrbma3fn_5v5os" />
      <TextElement id={"offerings_heading_line2"} className="tf-d-text_mrbma3fo_5v5os" />
      <TextElement id={"offerings_description"} className="tf-d-text_mrbma3fp_5v5os" />
    </BoxElement>
    {SECONDARY_OFFERING_CARDS.map((card) => (
      <OfferingCard key={card.root.id} mode="desktop" card={card} />
    ))}
    <TextElement id={"gallery_tagline"} className="tf-d-text_mrbqbw7h_5xevf" />
    <BoxElement id={"container_mrcd83lw"} className="tf-d-container_mrcd83lw_pygfp" type="container">
      <TextElement id={"fleet_bottom_badge_label"} className="tf-d-text_mrcd83lx_66izj" />
    </BoxElement>
    </>
  );
}

function MobilePage({ buttonAction, sliderIndexes }: PageTreeProps) {
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
    <BoxElement id={"Navbar_Section"} className="tf-m-Navbar_Section_jxg4z" type="container">
      <BoxElement id={"container_mrc0dj11"} className="tf-m-container_mrc0dj11_p6obl" type="container">
        <ButtonElement id={"nav_about_us_link"} className="tf-m-text_mr4pnrti_fuzxp" mode="mobile" onAction={buttonAction} />
        <ButtonElement id={"nav_enquiry_link"} className="tf-m-text_mr4pnrtk_fuzxo" mode="mobile" onAction={buttonAction} />
        <ButtonElement id={"nav_packages_link"} className="tf-m-text_mr4pnrtl_fuzxo" mode="mobile" onAction={buttonAction} />
        <ButtonElement id={"nav_bus_link"} className="tf-m-text_mr4pnrtm_fuzxo" mode="mobile" onAction={buttonAction} />
      </BoxElement>
      <ImageElement id={"nav_logo_image"} className="tf-m-image_mr5ue7rl_tpmfu" />
    </BoxElement>
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
    <BoxElement id={"Available_package_section"} className="tf-m-Available_package_section_bi3c1" type="group">
      <BoxElement id={"Package_grp"} className="tf-m-Package_grp_seqzz" type="group">
        {PACKAGE_CARDS.map((card) => (
          <PackageCard key={card.root.id} mode="mobile" card={card} buttonAction={buttonAction} />
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
        <InputElement id={"enquiry_name_input"} className="tf-m-input_mrb0ygep_kwdlv">
          <TextElement id={"enquiry_name_label"} className="tf-m-text_mrb0ygew_4y2mt" />
        </InputElement>
        <SelectElement id={"enquiry_destination_select"} className="tf-m-select_mrb0yger_8l91i">
          <TextElement id={"enquiry_destination_label"} className="tf-m-text_mrb0ygex_4y2mt" />
        </SelectElement>
        <SelectElement id={"enquiry_combo_select"} className="tf-m-select_mrb0yges_8l91i">
          <TextElement id={"enquiry_combo_label"} className="tf-m-text_mrb0ygey_4y2mt" />
        </SelectElement>
        <ButtonElement id={"enquiry_send_button"} className="tf-m-button_mrb0yget_d9so0" mode="mobile" onAction={buttonAction} />
        <InputElement id={"enquiry_date_input"} className="tf-m-input_mrb0ygeu_kwdlv">
          <TextElement id={"enquiry_date_label"} className="tf-m-text_mrb0ygf0_4y2ms" />
        </InputElement>
        <InputElement id={"enquiry_members_input"} className="tf-m-input_mrb0ygev_kwdlv">
          <TextElement id={"enquiry_members_label"} className="tf-m-text_mrb0ygf1_4y2ms" />
        </InputElement>
        <TextareaElement id={"enquiry_message_textarea"} className="tf-m-textarea_mrb0ygez_t94rj">
          <TextElement id={"enquiry_message_label"} className="tf-m-text_mrb0ygf2_4y2ms" />
        </TextareaElement>
        <BoxElement id={"container_mraxrtcx"} className="tf-m-container_mraxrtcx_pcfg0" type="container">
          <TextElement id={"enquiry_phone_text"} className="tf-m-text_mraxrtcy_5khzt" />
          <ImageElement id={"enquiry_phone_icon"} className="tf-m-image_mrb0t6c8_9g9pd" />
        </BoxElement>
        <TextElement id={"enquiry_whatsapp_text"} className="tf-m-text_mrb2fots_4yu9j" />
        <ImageElement id={"enquiry_whatsapp_icon"} className="tf-m-image_mrb2zm77_9f16j" />
      </BoxElement>
      <TextElement id={"cta_intro_text"} className="tf-m-text_mraw949s_5iwgi" />
      <TextElement id={"cta_heading_line2"} className="tf-m-text_mraw949t_5iwgi" />
      <BoxElement id={"container_mraw949u"} className="tf-m-container_mraw949u_patwp" type="container">
        <TextElement id={"cta_badge_label"} className="tf-m-text_mraw949v_5iwgi" />
      </BoxElement>
      <TextElement id={"cta_heading_line1"} className="tf-m-text_mraw949w_5iwgi" />
    </BoxElement>
    <BoxElement id={"Footer_Section"} className="tf-m-Footer_Section_flkou" type="container">
      <BoxElement id={"Contact_box"} className="tf-m-Contact_box_s9jeh" type="container">
        <BoxElement id={"container_mrbq03iy"} className="tf-m-container_mrbq03iy_pof12" type="container">
          <TextElement id={"contact_footer_phone"} className="tf-m-text_mrbq03iz_5whkv" />
          <ImageElement id={"contact_footer_phone_icon"} className="tf-m-image_mrbq03j0_8hqjz" />
        </BoxElement>
        <BoxElement id={"container_mrbq03j1"} className="tf-m-container_mrbq03j1_pof11" type="container">
          <TextElement id={"contact_footer_email"} className="tf-m-text_mrbq03j2_5whku" />
          <ImageElement id={"contact_footer_email_icon"} className="tf-m-image_mrbq03j3_8hqjz" />
        </BoxElement>
        <BoxElement id={"container_mrbq5l5n"} className="tf-m-container_mrbq5l5n_pojd0" type="container">
          <TextElement id={"contact_footer_website"} className="tf-m-text_mrbq5l5o_5wlwt" />
          <ImageElement id={"contact_footer_website_icon"} className="tf-m-image_mrbq5l5p_8hm7z" />
        </BoxElement>
      </BoxElement>
      <BoxElement id={"container_mrb30nlc"} className="tf-m-container_mrb30nlc_oqd02" type="container" />
      <ImageElement id={"footer_logo_image"} className="tf-m-image_mrb30nlb_9fskx" />
      <TextElement id={"footer_tagline"} className="tf-m-text_mrb30nld_4yfjw" />
      <TextElement id={"footer_rapid_links_heading"} className="tf-m-text_mrb3e0zj_4zc4k">
        <TextElement id={"footer_packages_link"} className="tf-m-text_mrb3e0zk_4zc4k" />
        <TextElement id={"footer_about_us_link"} className="tf-m-text_mrb3e0zl_4zc4k" />
        <TextElement id={"footer_enquiry_link"} className="tf-m-text_mrb3e0zm_4zc4k" />
        <TextElement id={"footer_testimonials_link"} className="tf-m-text_mrb3e0zn_4zc4k" />
      </TextElement>
      <TextElement id={"footer_legal_heading"} className="tf-m-text_mrb3e0zo_4zc4k">
        <TextLinkElement id={"footer_terms_link"} className="tf-m-text_mrb3e0zp_4zc4k" href={LEGAL_FOOTER_LINKS.footer_terms_link} />
        <TextLinkElement id={"footer_privacy_link"} className="tf-m-text_mrb3e0zq_4zc4k" href={LEGAL_FOOTER_LINKS.footer_privacy_link} />
        <TextLinkElement id={"footer_legal_extra_1"} className="tf-m-text_mrb3e0zr_4zc4k" href={LEGAL_FOOTER_LINKS.footer_legal_extra_1} />
        <TextLinkElement id={"footer_legal_extra_2"} className="tf-m-text_mrb3e0zs_4zc4k" href={LEGAL_FOOTER_LINKS.footer_legal_extra_2} />
      </TextElement>
      <TextElement id={"footer_copyright"} className="tf-m-text_mrb3e0zu_4zc4k" />
      <TextElement id={"footer_contact_link"} className="tf-m-text_mrb3e0zv_4zc4k" />
      <BoxElement id={"container_mrb3q9g6"} className="tf-m-container_mrb3q9g6_orher" type="container" />
    </BoxElement>
    <ImageElement id={"decorative_image_5"} className="tf-m-image_mrc98pax_8vb1u" />
    <ImageElement id={"marquee_logo_1"} className="tf-m-image_mrc9fn5h_8uhqz" />
    <ImageElement id={"marquee_logo_2"} className="tf-m-image_mrc9fn5g_8uhqz" />
    <BoxElement id={"Our_Offering_Section"} className="tf-m-Our_Offering_Section_2mlhu" type="container">
      <BoxElement id={"Offering_Section"} className="tf-m-Offering_Section_1b4dd" type="container" scaleClassName="tf-scale-m-Offering_Section_1b4dd">
        {PRIMARY_OFFERING_CARDS.map((card) => (
          <OfferingCard key={card.root.id} mode="mobile" card={card} />
        ))}
      </BoxElement>
      <BoxElement id={"container_mrbma3fj"} className="tf-m-container_mrbma3fj_pn34y" type="container">
        <TextElement id={"offerings_badge_label"} className="tf-m-text_mrbma3fk_5v5os" />
        <TextElement id={"offerings_heading_line1"} className="tf-m-text_mrbma3fn_5v5os" />
        <TextElement id={"offerings_heading_line2"} className="tf-m-text_mrbma3fo_5v5os" />
        <TextElement id={"offerings_description"} className="tf-m-text_mrbma3fp_5v5os" />
      </BoxElement>
      <BoxElement id={"container_mrbw694r"} className="tf-m-container_mrbw694r_prtpq" type="container" scaleClassName="tf-scale-m-container_mrbw694r_prtpq">
        {SECONDARY_OFFERING_CARDS.map((card) => (
          <OfferingCard key={card.root.id} mode="mobile" card={card} />
        ))}
      </BoxElement>
      <BoxElement id={"poloroid_Section"} className="tf-m-poloroid_Section_awt7z" type="container">
        <ImageElement id={"gallery_polaroid_frame"} className="tf-m-Poloroid_slider_plsqu" scaleClassName="tf-scale-m-Poloroid_slider_plsqu">
          <TextElement id={"gallery_tagline"} className="tf-m-text_mrbqbw7h_5xevf" />
          <SliderElement id={"slider_mrbma3g2"} className="tf-m-slider_mrbma3g2_zckcx" activeIndex={sliderIndexes["slider_mrbma3g2"] ?? 0}>
            <ImageElement id={"gallery_photo_1"} className="tf-m-image_mrbma3fs_8j2g1" />
            <ImageElement id={"gallery_photo_2"} className="tf-m-image_mrbma3ft_8j2g1" />
            <ImageElement id={"gallery_photo_3"} className="tf-m-image_mrbma3fu_8j2g1" />
            <ImageElement id={"gallery_photo_4"} className="tf-m-image_mrbma3fv_8j2g1" />
            <ImageElement id={"gallery_photo_5"} className="tf-m-image_mrbma3fw_8j2g1" />
            <ImageElement id={"gallery_photo_6"} className="tf-m-image_mrbma3fx_8j2g1" />
            <ImageElement id={"gallery_photo_7"} className="tf-m-image_mrbma3fy_8j2g1" />
            <ImageElement id={"gallery_photo_8"} className="tf-m-image_mrbma3fz_8j2g1" />
            <ImageElement id={"gallery_photo_9"} className="tf-m-image_mrbma3g0_8j2g2" />
            <ImageElement id={"gallery_photo_10"} className="tf-m-image_mrbma3g1_8j2g2" />
          </SliderElement>
        </ImageElement>
      </BoxElement>
    </BoxElement>
    <ImageElement id={"decorative_image_6"} className="tf-m-image_mrboyqls_8hi91" />
    <ImageElement id={"mobile_decorative_icon"} className="tf-m-image_mrc12obt_8zt98" />
    <TextElement id={"mobile_contact_us_heading"} className="tf-m-text_mrdfrhpx_6pqbq" />
    </>
  );
}


function findAnimatedNode(root: HTMLElement, id: string) {
  return Array.from(root.querySelectorAll<HTMLElement>("[data-id]")).find((node) => node.dataset.id === id) ?? null;
}

function frameTransform(frame: Pick<AnimationFrameSpec, "rotation" | "scale">) {
  const parts: string[] = [];
  if (frame.rotation) parts.push("rotate(" + frame.rotation + "deg)");
  if (frame.scale !== undefined && frame.scale !== 1) parts.push("scale(" + frame.scale + ")");
  return parts.join(" ") || "none";
}

function applyAnimationFrame(node: HTMLElement, frame: AnimationFrameSpec) {
  node.style.left = frame.x + "px";
  node.style.top = frame.y + "px";
  node.style.width = frame.w + "px";
  node.style.height = frame.h + "px";
  node.style.opacity = String(frame.opacity ?? 1);
  node.style.transform = frameTransform(frame);
  node.style.transformOrigin = "center center";
}

function interpolateValue(start: number, end: number, t: number) {
  return start + (end - start) * t;
}

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function evaluateFrames(frames: AnimationFrameSpec[], t: number): AnimationFrameSpec {
  if (frames.length === 1) return frames[0];
  const clamped = clamp(t, 0, 1);
  const segments = frames.length - 1;
  const segment = Math.min(Math.floor(clamped * segments), segments - 1);
  const segmentT = clamped * segments - segment;
  const start = frames[segment];
  const end = frames[segment + 1];

  return {
    x: interpolateValue(start.x, end.x, segmentT),
    y: interpolateValue(start.y, end.y, segmentT),
    w: interpolateValue(start.w, end.w, segmentT),
    h: interpolateValue(start.h, end.h, segmentT),
    opacity: interpolateValue(start.opacity ?? 1, end.opacity ?? 1, segmentT),
    scale: interpolateValue(start.scale ?? 1, end.scale ?? 1, segmentT),
    rotation: interpolateValue(start.rotation ?? 0, end.rotation ?? 0, segmentT),
  };
}

function isFullyVisible(node: HTMLElement) {
  const rect = node.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  return rect.top >= 0 && rect.bottom <= viewportHeight;
}

function activeAnimationMode(): Mode {
  return window.innerWidth <= 480 ? "mobile" : "desktop";
}

function useAdvancedAnimations() {
  useEffect(() => {
    let cleanupCurrent = () => {};
    let resizeTimer: number | undefined;

    const setup = () => {
      cleanupCurrent();

      const mode = activeAnimationMode();
      const root = document.querySelector<HTMLElement>(mode === "mobile" ? ".tf-mobile-canvas" : ".tf-desktop-canvas");
      if (!root) return;

      const cleanups: Array<() => void> = [];
      const runningFrames = new Set<number>();
      const scrollAnimations = new Map<string, { node: HTMLElement; animation: AdvancedAnimationSpec; t: number; ready: boolean; appeared: boolean; delayStarted: boolean }>();
      let lastScrollY = window.scrollY;

      const cancelFrame = (frameId: number) => {
        window.cancelAnimationFrame(frameId);
        runningFrames.delete(frameId);
      };

      const trackFrame = (frameId: number) => {
        runningFrames.add(frameId);
        return frameId;
      };

      const startLoopOrOnce = (id: string, node: HTMLElement, animation: AdvancedAnimationSpec) => {
        let t = 0;
        let direction = 1;
        let lastTimestamp: number | null = null;
        let delayLeft = animation.delay;
        let frameId = 0;

        const tick = (timestamp: number) => {
          const delta = lastTimestamp === null ? 0 : Math.min((timestamp - lastTimestamp) / 1000, 0.1);
          lastTimestamp = timestamp;

          if (delayLeft > 0) {
            delayLeft -= delta;
            frameId = trackFrame(window.requestAnimationFrame(tick));
            return;
          }

          if (animation.type === "loop") {
            if (animation.smooth) {
              t += direction * delta / animation.speed;
              if (t >= 1) {
                t = 1;
                direction = -1;
              }
              if (t <= 0) {
                t = 0;
                direction = 1;
              }
            } else {
              t = (t + delta / animation.speed) % 1;
            }
          } else {
            t = Math.min(t + delta / animation.speed, 1);
          }

          applyAnimationFrame(node, evaluateFrames(animation.frames, easeInOut(t)));

          if (animation.type !== "once" || t < 1) {
            frameId = trackFrame(window.requestAnimationFrame(tick));
          }
        };

        frameId = trackFrame(window.requestAnimationFrame(tick));
        cleanups.push(() => {
          if (frameId) cancelFrame(frameId);
          void id;
        });
      };

      const startWhenReady = (node: HTMLElement, animation: AdvancedAnimationSpec, start: () => void) => {
        if (!animation.animateOnAppear) {
          start();
          return;
        }

        const observer = new IntersectionObserver((entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            start();
            observer.disconnect();
          }
        }, { threshold: 0.15 });

        observer.observe(node);
        cleanups.push(() => observer.disconnect());
      };

      const animateTowards = (node: HTMLElement, animation: AdvancedAnimationSpec, state: { t: number; frameId?: number; lastTimestamp?: number | null }, target: number) => {
        if (state.frameId) cancelFrame(state.frameId);
        state.lastTimestamp = null;

        const tick = (timestamp: number) => {
          const delta = state.lastTimestamp === null || state.lastTimestamp === undefined ? 0 : Math.min((timestamp - state.lastTimestamp) / 1000, 0.1);
          state.lastTimestamp = timestamp;
          const direction = target > state.t ? 1 : -1;
          state.t += direction * delta / animation.speed;

          if ((direction === 1 && state.t >= target) || (direction === -1 && state.t <= target)) state.t = target;
          applyAnimationFrame(node, evaluateFrames(animation.frames, easeInOut(state.t)));

          if (state.t !== target) state.frameId = trackFrame(window.requestAnimationFrame(tick));
          else state.frameId = undefined;
        };

        state.frameId = trackFrame(window.requestAnimationFrame(tick));
      };

      for (const [id, animation] of Object.entries(ADVANCED_ANIMATIONS[mode])) {
        const node = findAnimatedNode(root, id);
        if (!node) continue;

        applyAnimationFrame(node, animation.frames[0]);

        if (animation.type === "scroll") {
          scrollAnimations.set(id, { node, animation, t: 0, ready: !animation.animateOnAppear && animation.delay <= 0, appeared: !animation.animateOnAppear, delayStarted: false });
          if (!animation.animateOnAppear && animation.delay > 0) {
            const timer = window.setTimeout(() => {
              const state = scrollAnimations.get(id);
              if (state) state.ready = true;
            }, animation.delay * 1000);
            cleanups.push(() => window.clearTimeout(timer));
          }
          continue;
        }

        if (animation.type === "hover") {
          const hoverNode = animation.hoverElementId ? findAnimatedNode(root, animation.hoverElementId) : node;
          if (!hoverNode) continue;
          const state = { t: 0, frameId: undefined as number | undefined, lastTimestamp: null as number | null };
          const enter = () => animateTowards(node, animation, state, 1);
          const leave = () => animateTowards(node, animation, state, 0);
          hoverNode.addEventListener("mouseenter", enter);
          hoverNode.addEventListener("mouseleave", leave);
          cleanups.push(() => {
            hoverNode.removeEventListener("mouseenter", enter);
            hoverNode.removeEventListener("mouseleave", leave);
            if (state.frameId) cancelFrame(state.frameId);
          });
          continue;
        }

        if (animation.type === "trigger") {
          const triggerNode = animation.triggerButtonId ? findAnimatedNode(root, animation.triggerButtonId) : null;
          if (!triggerNode) continue;
          const click = () => startLoopOrOnce(id, node, { ...animation, type: "once" });
          triggerNode.addEventListener("click", click);
          cleanups.push(() => triggerNode.removeEventListener("click", click));
          continue;
        }

        startWhenReady(node, animation, () => startLoopOrOnce(id, node, animation));
      }

      const onScroll = () => {
        const currentY = window.scrollY;
        const delta = currentY - lastScrollY;
        lastScrollY = currentY;
        if (!delta) return;

        for (const [id, state] of scrollAnimations.entries()) {
          if (state.animation.animateOnAppear) {
            const visible = isFullyVisible(state.node);
            if (visible && !state.appeared) {
              state.appeared = true;
              if (!state.delayStarted) {
                state.delayStarted = true;
                if (state.animation.delay > 0) {
                  const timer = window.setTimeout(() => {
                    const latest = scrollAnimations.get(id);
                    if (latest) latest.ready = true;
                  }, state.animation.delay * 1000);
                  cleanups.push(() => window.clearTimeout(timer));
                } else {
                  state.ready = true;
                }
              }
            }
            if (!visible) {
              state.appeared = false;
              state.ready = false;
              state.delayStarted = false;
            }
          }

          if (!state.ready) continue;
          const range = state.animation.scrollRange * state.animation.speed;
          state.t = clamp(state.t + delta / range, 0, 1);
          applyAnimationFrame(state.node, evaluateFrames(state.animation.frames, easeInOut(state.t)));
        }
      };

      if (scrollAnimations.size) {
        window.addEventListener("scroll", onScroll, { passive: true });
        cleanups.push(() => window.removeEventListener("scroll", onScroll));
      }

      cleanupCurrent = () => {
        cleanups.splice(0).forEach((cleanup) => cleanup());
        runningFrames.forEach((frameId) => window.cancelAnimationFrame(frameId));
        runningFrames.clear();
      };
    };

    setup();

    const onResize = () => {
      if (resizeTimer) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(setup, 150);
    };

    window.addEventListener("resize", onResize);
    return () => {
      if (resizeTimer) window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      cleanupCurrent();
    };
  }, []);
}

export default function TripFactoryPage() {
  useAdvancedAnimations();
  const mobileScale = useMobileScale();
  const { sliderIndexes, moveSlider } = useSliderIndexes();

  const buttonAction = useCallback<ButtonAction>((id, mode) => {
    const action = BUTTON_ACTIONS[mode][id as keyof (typeof BUTTON_ACTIONS)[typeof mode]];

    if (action && "slider" in action) {
      moveSlider(action.slider as keyof typeof SLIDERS, action.direction === "previous" ? -1 : 1);
      return true;
    }

    if (action && "locationId" in action) {
      const targetY = LOCATIONS[action.locationId as keyof typeof LOCATIONS];
      if (typeof targetY === "number") {
        const speed = "speed" in action && typeof action.speed === "number" ? action.speed : 1;
        smoothScrollTo(targetY, speed);
        return true;
      }
    }

    return false;
  }, [moveSlider]);

  return (
    <main className="tf-page-shell">
      <div className="tf-desktop-shell">
        <div className="tf-canvas tf-desktop-canvas">
          <DesktopPage buttonAction={buttonAction} sliderIndexes={sliderIndexes} />
        </div>
      </div>
      <div className="tf-mobile-shell" style={{ height: MOBILE_CANVAS_HEIGHT * mobileScale }}>
        <div className="tf-canvas tf-mobile-canvas" style={{ transform: `scale(${mobileScale})` }}>
          <MobilePage buttonAction={buttonAction} sliderIndexes={sliderIndexes} />
        </div>
      </div>
    </main>
  );
}
