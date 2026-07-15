import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteNavbar } from "@/components/SiteNavbar";

type LegalBlock = {
  heading?: string;
  paragraphs?: string[];
  items?: string[];
};

type LegalSection = {
  id: string;
  title: string;
  intro?: string[];
  blocks: LegalBlock[];
};

const legalSections: LegalSection[] = [
  {
    id: "privacy-policy",
    title: "Privacy Policy",
    intro: [
      'This Privacy Policy explains how Trip Factory ("Trip Factory", "we", "us", or "our") collects, uses, discloses, and safeguards your information when you visit www.tripfactory.co.in (the "Website"), or use our travel planning, booking, and enquiry services (collectively, the "Services"). By using our Website or Services, you agree to the terms of this Privacy Policy.',
    ],
    blocks: [
      {
        heading: "1. Information We Collect",
        paragraphs: ["We may collect the following categories of information:"],
        items: [
          "Personal details you provide through our enquiry, booking, or contact forms, such as your name, phone number, email address, and WhatsApp number.",
          "Trip-related details, including destination preferences, travel dates, number of travellers, institution or organisation name, and special requirements.",
          "Communication records from calls, emails, WhatsApp chats, or messages exchanged with our team for the purpose of planning, confirming, or supporting your trip.",
          "Technical information such as browser type, device information, IP address, and pages visited, collected automatically when you use our Website.",
          "Payment-related information necessary to process advance payments or balance payments, processed through our payment partners; we do not store your full card or bank details on our servers.",
        ],
      },
      {
        heading: "2. How We Use Your Information",
        paragraphs: ["We use the information we collect to:"],
        items: [
          "Respond to enquiries and prepare customised travel itineraries and quotations.",
          "Process bookings, confirm reservations with hotels, transport partners, and other vendors, and coordinate your trip.",
          "Communicate with you regarding booking confirmations, payment reminders, itinerary changes, and travel updates.",
          "Improve our Website, services, and customer experience.",
          "Comply with applicable legal, regulatory, or tax obligations.",
          "Send you promotional offers or newsletters, where you have consented to receive such communication; you may opt out at any time.",
        ],
      },
      {
        heading: "3. Sharing of Information",
        paragraphs: ["We do not sell your personal information. We may share your information with:"],
        items: [
          "Third-party vendors such as hotels, transport operators, drivers, and local guides, strictly to the extent necessary to deliver the booked services.",
          "Payment gateway providers, to process transactions securely.",
          "Government or regulatory authorities, where required by law, court order, or to protect our legal rights.",
          "We require our vendors and partners to handle your information responsibly and only for the purpose of fulfilling your trip.",
        ],
      },
      {
        heading: "4. Data Security",
        paragraphs: [
          "We implement reasonable administrative, technical, and physical safeguards designed to protect your personal information from unauthorised access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is completely secure, and we cannot guarantee absolute security.",
        ],
      },
      {
        heading: "5. Data Retention",
        paragraphs: [
          "We retain personal information for as long as necessary to fulfil the purposes described in this Policy, including maintaining business and accounting records, resolving disputes, and complying with legal obligations. Enquiry data that does not convert into a confirmed booking may be retained for a reasonable period for follow-up purposes, unless you request earlier deletion.",
        ],
      },
      {
        heading: "6. Your Rights",
        paragraphs: [
          "Subject to applicable law, you may request access to, correction of, or deletion of your personal information, or withdraw consent for marketing communication, by writing to us at the contact details below. We will respond to legitimate requests within a reasonable timeframe.",
        ],
      },
      {
        heading: "7. Cookies",
        paragraphs: [
          "Our Website may use cookies or similar technologies to remember your preferences and understand how visitors use the Website. You can control cookie settings through your browser, though disabling cookies may affect certain Website features.",
        ],
      },
      {
        heading: "8. Children's Privacy",
        paragraphs: [
          "While our Services are frequently booked by schools and colleges on behalf of students, we do not knowingly collect personal information directly from children without the involvement of a parent, guardian, teacher, or institution. Any student information shared with us for trip coordination is provided by the responsible institution or guardian.",
        ],
      },
      {
        heading: "9. Changes to This Policy",
        paragraphs: [
          "We may update this Privacy Policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons. The updated version will be posted on this page with a revised effective date.",
        ],
      },
      {
        heading: "10. Contact Us",
        paragraphs: ["If you have questions or concerns about this Privacy Policy or how your information is handled, please contact us:"],
        items: [
          "Email: info@tripfactory.co.in",
          "Phone / WhatsApp: +91 85310 20303",
          "Address: Murugan Street, TVS Nagar, Koundampalayam Rd, TVS Nagar, Coimbatore - 641030, Tamil Nadu, India",
        ],
      },
    ],
  },
  {
    id: "terms-and-conditions",
    title: "Terms and Conditions",
    intro: [
      'These Terms and Conditions ("Terms") govern your access to and use of www.tripfactory.co.in and the travel, tour-planning, and transport-coordination services offered by Trip Factory ("Trip Factory", "we", "us", or "our"). By enquiring about, booking, or otherwise using our Services, you agree to be bound by these Terms. If you do not agree, please do not use our Services.',
    ],
    blocks: [
      {
        heading: "1. About Our Services",
        paragraphs: [
          "Trip Factory organises educational and experiential tours, custom itineraries, and group travel arrangements for schools, colleges, and corporate teams, including but not limited to transport arrangements, hotel bookings, meal coordination, sightseeing, and on-ground tour coordination.",
        ],
      },
      {
        heading: "2. Bookings and Enquiries",
        items: [
          "Enquiries submitted through our Website, WhatsApp, or phone are treated as a request for a quotation and do not constitute a confirmed booking.",
          "A booking is confirmed only upon written confirmation from Trip Factory and receipt of the applicable advance payment, as communicated for that specific package.",
          "The person or institution submitting the booking is responsible for the accuracy of all details provided, including number of travellers, age groups, dates, and destination preferences.",
          "Package prices, inclusions, and availability (including vehicles, hotels, and itineraries) are subject to change until a booking is confirmed and may vary based on group size, season, and vendor availability.",
        ],
      },
      {
        heading: "3. Payments",
        items: [
          "An advance payment is required to confirm a booking; the applicable amount and due dates for the remaining balance will be communicated at the time of booking.",
          "Full and final payment must be completed prior to or on the date specified in the booking confirmation, failing which Trip Factory reserves the right to treat the booking as cancelled.",
          "All prices are quoted in Indian Rupees (INR) unless otherwise stated and are subject to applicable taxes.",
        ],
      },
      {
        heading: "4. Traveller Responsibilities",
        items: [
          "Travellers (and, in the case of student groups, the accompanying institution or faculty) are responsible for complying with the instructions of tour coordinators, drivers, and vendor staff for the safety and smooth conduct of the trip.",
          "Travellers must carry valid identification documents as required by hotels, transport authorities, or attractions along the route.",
          "Trip Factory reserves the right to deny or discontinue services to any traveller whose conduct endangers the safety, comfort, or well-being of the group, without any refund for the affected traveller.",
          "Institutions booking group trips are responsible for ensuring adequate adult supervision of minors throughout the journey.",
        ],
      },
      {
        heading: "5. Itinerary Changes and Force Majeure",
        paragraphs: [
          "While we make every effort to deliver the itinerary as planned, Trip Factory shall not be liable for changes, delays, or cancellations caused by circumstances beyond our reasonable control, including but not limited to weather conditions, natural disasters, road closures, government restrictions, strikes, political unrest, vehicle breakdowns, or other force majeure events. In such cases, we will make reasonable efforts to offer suitable alternatives.",
        ],
      },
      {
        heading: "6. Vehicles, Hotels, and Third-Party Vendors",
        paragraphs: [
          "Transport, accommodation, and certain experiences are provided through third-party vendors (drivers, hotels, resorts, and local operators). Trip Factory selects vendors with reasonable care; however, we are not the direct provider of these services and shall not be held liable for acts, omissions, or service deficiencies solely attributable to independent third-party vendors, beyond assisting in resolving such issues on the traveller's behalf.",
        ],
      },
      {
        heading: "7. Limitation of Liability",
        paragraphs: [
          "To the maximum extent permitted by law, Trip Factory's liability for any claim arising out of or relating to the Services shall not exceed the total amount paid by the traveller or institution for the specific booking giving rise to the claim. Trip Factory shall not be liable for indirect, incidental, or consequential losses, including loss of enjoyment or missed connections, except where such exclusion is not permitted by applicable law.",
        ],
      },
      {
        heading: "8. Insurance",
        paragraphs: [
          "Trip Factory recommends that travellers or institutions consider appropriate travel or personal accident insurance for the duration of the trip. Unless expressly included in a package, travel insurance is not automatically provided.",
        ],
      },
      {
        heading: "9. Intellectual Property",
        paragraphs: [
          "All content on the Website, including text, images, logos, and itineraries, is the property of Trip Factory or its licensors and may not be reproduced or used without prior written consent.",
        ],
      },
      {
        heading: "10. Governing Law and Jurisdiction",
        paragraphs: [
          "These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts at Coimbatore, Tamil Nadu.",
        ],
      },
      {
        heading: "11. Amendments",
        paragraphs: [
          "Trip Factory reserves the right to modify these Terms at any time. Continued use of our Services after any such changes constitutes acceptance of the revised Terms.",
        ],
      },
      {
        heading: "12. Contact Us",
        items: [
          "Email: info@tripfactory.co.in",
          "Phone / WhatsApp: +91 85310 20303",
          "Address: Murugan Street, TVS Nagar, Koundampalayam Rd, TVS Nagar, Coimbatore - 641030, Tamil Nadu, India",
        ],
      },
    ],
  },
  {
    id: "cancellation-policy",
    title: "Cancellation Policy",
    intro: [
      "This Cancellation Policy applies to all bookings made with Trip Factory for tours, transport, and travel packages. It should be read together with our Terms and Conditions and Refund Policy.",
    ],
    blocks: [
      {
        heading: "1. Cancellations by the Traveller / Institution",
        paragraphs: [
          "Cancellation requests must be submitted in writing via email or WhatsApp to the contact details below, quoting the booking reference and travel dates. The date of cancellation will be the date on which we receive the written request.",
        ],
      },
      {
        heading: "2. Cancellation Charges",
        paragraphs: [
          "Because Trip Factory pre-books hotels, vehicles, and other vendor services on your behalf, cancellation charges apply based on how close the cancellation is to the travel date:",
        ],
        items: [
          "30 days or more before the travel date: 10% of the total package cost will be deducted as a processing and vendor-booking fee.",
          "15 to 29 days before the travel date: 25% of the total package cost will be deducted.",
          "7 to 14 days before the travel date: 50% of the total package cost will be deducted.",
          "Less than 7 days before the travel date, or in case of a no-show: the advance payment and any amount paid are non-refundable, as vendor bookings cannot typically be reversed at this stage.",
          "Where a specific package, hotel, or transport vendor has stricter non-refundable terms (for example, certain peak-season hotel bookings), those terms will be communicated at the time of booking and will take precedence over the general slabs above.",
        ],
      },
      {
        heading: "3. Reduction in Group Size",
        paragraphs: [
          "If the number of confirmed travellers reduces after a booking is confirmed, the per-person cost may be revised, as group pricing is based on the originally confirmed headcount. Any shortfall will be payable prior to the trip.",
        ],
      },
      {
        heading: "4. Cancellations or Changes by Trip Factory",
        paragraphs: [
          "In the rare event that Trip Factory needs to cancel or substantially alter a confirmed trip due to reasons within our control, we will offer the traveller/institution either a rescheduled date, an alternative package of equivalent value, or a full refund of amounts paid, at their choice. Where the change is due to force majeure or third-party vendor failure beyond our control, Section 5 of our Terms and Conditions shall apply.",
        ],
      },
      {
        heading: "5. Date Changes / Rescheduling",
        paragraphs: [
          "Requests to reschedule a trip to a new date, subject to availability, will be treated as a date change rather than a cancellation, provided the request is made at least 15 days before the original travel date. A rescheduling fee may apply depending on vendor terms. Rescheduling requests made within 15 days of the travel date will be treated under the cancellation charges above.",
        ],
      },
      {
        heading: "6. How to Request a Cancellation",
        items: [
          "Email: info@tripfactory.co.in",
          "Phone / WhatsApp: +91 85310 20303",
          "Please include your name/institution name, booking reference, travel dates, and reason for cancellation to help us process your request promptly.",
        ],
      },
    ],
  },
  {
    id: "refund-policy",
    title: "Refund Policy",
    intro: [
      "This Refund Policy explains how refunds are calculated and processed when a booking with Trip Factory is cancelled or otherwise eligible for a refund, in accordance with our Cancellation Policy and Terms and Conditions.",
    ],
    blocks: [
      {
        heading: "1. Refund Eligibility",
        paragraphs: [
          "Refunds are calculated after deducting applicable cancellation charges (as set out in our Cancellation Policy), any non-refundable third-party vendor costs already incurred on your behalf (such as hotel or vehicle bookings with strict no-refund terms), and any payment gateway or transaction charges levied by our payment partners.",
        ],
      },
      {
        heading: "2. Refund Timelines",
        paragraphs: [
          "Once a cancellation request is approved and the refundable amount is confirmed, refunds will be processed within 7 to 14 business days to the original mode of payment. Depending on your bank or payment provider, it may take a few additional business days for the amount to reflect in your account.",
        ],
      },
      {
        heading: "3. Non-Refundable Items",
        items: [
          "Advance payments made within 7 days of the travel date, as detailed in our Cancellation Policy.",
          "Amounts already paid to hotels, transport vendors, or attractions that are explicitly non-refundable, as informed at the time of booking.",
          "Payment gateway or bank transaction charges incurred while collecting the original payment.",
          "Any portion of the trip already utilised, in case of a mid-trip cancellation or early departure by the traveller.",
        ],
      },
      {
        heading: "4. Refunds for Services Not Delivered",
        paragraphs: [
          "If Trip Factory is unable to deliver a confirmed, paid-for component of your itinerary (such as a missed sightseeing stop or a downgraded vehicle/hotel) due to reasons attributable to us, we will refund or credit the proportionate value of that component, or offer a suitable alternative, at the traveller's/institution's choice.",
        ],
      },
      {
        heading: "5. Disputed or Failed Transactions",
        paragraphs: [
          "If a payment is deducted from your account but the booking is not confirmed due to a technical or gateway error, please notify us with the transaction reference within 7 days. We will coordinate with our payment partner to verify and refund the amount, subject to the payment gateway's own resolution timelines.",
        ],
      },
      {
        heading: "6. How to Request a Refund",
        paragraphs: [
          "Refund requests are processed as part of a cancellation request. Please contact us with your booking reference, payment details (transaction ID / date), and bank account or UPI details for the refund:",
        ],
        items: ["Email: info@tripfactory.co.in", "Phone / WhatsApp: +91 85310 20303"],
      },
      {
        heading: "7. Changes to This Policy",
        paragraphs: [
          "Trip Factory may revise this Refund Policy from time to time. Any changes will apply to bookings made after the revised policy is published on our Website.",
        ],
      },
    ],
  },
];

export const metadata: Metadata = {
  title: "Legal Policies | TripFactory",
  description: "TripFactory Privacy Policy, Terms and Conditions, Cancellation Policy, and Refund Policy.",
};

function LegalSectionBlock({ block }: { block: LegalBlock }) {
  return (
    <div className="legal-block">
      {block.heading ? <h3>{block.heading}</h3> : null}
      {block.paragraphs?.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
      {block.items?.length ? (
        <ul>
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function LegalDocumentSection({ section }: { section: LegalSection }) {
  return (
    <section id={section.id} className="legal-policy-card">
      <div className="legal-section-kicker">Trip Factory Legal</div>
      <h2>{section.title}</h2>
      {section.intro?.map((paragraph) => (
        <p className="legal-section-intro" key={paragraph}>
          {paragraph}
        </p>
      ))}
      {section.blocks.map((block) => (
        <LegalSectionBlock key={block.heading ?? block.paragraphs?.[0]} block={block} />
      ))}
    </section>
  );
}

export default function LegalPage() {
  return (
    <main className="legal-shell">
      <SiteNavbar currentPath="/legal" label="Legal page navigation" />
      <header className="legal-hero">
        <div>
          <p className="legal-eyebrow">Effective Date: 10 July 2026</p>
          <h1>Legal Policies</h1>
          <p>
            Privacy Policy · Terms and Conditions · Refund Policy · Cancellation Policy for Trip Factory and the services
            offered through www.tripfactory.co.in.
          </p>
        </div>
        <div className="legal-hero-card">
          <span>Trip Factory</span>
          <strong>Travel clear. Book confident.</strong>
          <p>All legal sections are available below and can be opened directly from the footer links.</p>
        </div>
      </header>
      <div className="legal-content">
        {legalSections.map((section) => (
          <LegalDocumentSection key={section.id} section={section} />
        ))}
      </div>
      <SiteFooter />
    </main>
  );
}
