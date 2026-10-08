/**
 * The text of the Terms of Use, Privacy Policy and Refund Policy.
 *
 * These are DRAFTS written from how the platform actually works (what it collects, who it shares
 * data with, how payments and refunds are handled). They have not been reviewed by a lawyer and
 * every page says so. Lines marked with a "TO CONFIRM" note are business decisions or company
 * details that someone must fill in before the pages are relied on.
 */

export type LegalSection = { heading: string; paragraphs?: string[]; bullets?: string[] };
export type LegalDocument = { slug: "terms" | "privacy" | "refund"; title: string; summary: string; updated: string; sections: LegalSection[] };

export const LEGAL_UPDATED = "8 October 2026";

export const TERMS: LegalDocument = {
  slug: "terms",
  title: "Terms of Use",
  summary: "The rules for using My Course Companion: your account, what you can and can't do, paying, and what we are responsible for.",
  updated: LEGAL_UPDATED,
  sections: [
    {
      heading: "1. Who we are and what this covers",
      paragraphs: [
        "My Course Companion (\"MCC\", \"we\", \"us\") runs a learning platform: exam preparation, courses, live classes with teachers, an AI study assistant called Brainy, flashcards and rewards. These terms cover your use of our websites and apps, including the student, parent and teacher apps.",
        "By creating an account or continuing to use MCC you agree to these terms and to our Privacy Policy and Refund Policy. If you do not agree, please do not use MCC.",
        "TO CONFIRM: the registered company name, registration number and address that these terms are made in the name of.",
      ],
    },
    {
      heading: "2. Your account",
      bullets: [
        "You must give accurate details and keep them up to date.",
        "Keep your password and any codes we send you private. You are responsible for what happens on your account.",
        "You must be at least 18 to hold your own account. If you are younger, a parent or guardian must create the account for you or give their permission, and they are responsible for your use of MCC.",
        "One person, one account. Do not share your account or sell access to it.",
        "Tell us straight away if you think someone else has used your account.",
      ],
    },
    {
      heading: "3. Parents and guardians",
      paragraphs: [
        "A parent can create an account together with a child's account and can see their child's progress, upcoming classes, teachers, level and badges, and can pay for their child's courses. By linking a child's account you confirm that you are their parent or legal guardian and that you accept these terms for them.",
      ],
    },
    {
      heading: "4. Teachers",
      paragraphs: [
        "Teachers apply to teach on MCC. We may ask for proof of identity (for example a national ID number, an ID document and a selfie) and for teaching qualifications, and we may approve, reject or suspend a teacher at our discretion. Teachers are paid for the sessions they deliver according to the arrangements shown to them in the teacher app. Teachers must behave professionally, keep student information confidential and use it only to teach.",
      ],
    },
    {
      heading: "5. What you may and may not do",
      paragraphs: ["You agree to use MCC only for learning and not to:"],
      bullets: [
        "break the law or help anyone else to;",
        "copy, record, resell or share courses, lessons, questions or other content without our written permission;",
        "try to get around payment, daily limits, rewards rules or any other control, or earn points, gems or badges by cheating;",
        "upload anything unlawful, abusive or that you do not have the right to share;",
        "harass other students, teachers or our staff;",
        "probe, attack or overload our systems, or use bots or scrapers on them.",
      ],
    },
    {
      heading: "6. Courses, exam prep and live classes",
      paragraphs: [
        "Courses and exam-prep programs give you access to lessons, quizzes and practice material for as long as shown when you enrol. Live classes depend on a teacher being available and on your own connection; we may reschedule or cancel a class and will try to tell you in good time. We do not guarantee any exam result, grade or admission.",
      ],
    },
    {
      heading: "7. Brainy, our AI study assistant",
      paragraphs: [
        "Brainy uses artificial intelligence to answer questions, mark practice, read notes you give it and make flashcards. It can be wrong. Check important answers against your course material and your teacher. Brainy has a daily free allowance and a monthly allowance from your courses; beyond that, answers cost gems. What you type and upload to Brainy is sent to our AI provider to produce the answer (see the Privacy Policy). Do not give Brainy anything you are not allowed to share.",
      ],
    },
    {
      heading: "8. Points, gems, silver, levels and badges",
      bullets: [
        "Points, gems, silver, XP, levels and badges are rewards inside MCC. They have no cash value and cannot be exchanged for money, except that gems you buy can be used as described below.",
        "Gems you buy with money (\"bought gems\") can be used to unlock courses and to pay for Brainy. Gems you earn can be used for Brainy and extras but not to unlock courses.",
        "We set how rewards are earned and may change the rules, limits and prices. A change applies from when we make it and does not take away rewards already given.",
        "If we find rewards were earned by cheating or by mistake we may remove them.",
      ],
    },
    {
      heading: "9. Prices and payment",
      paragraphs: [
        "Prices are shown in naira (or the currency shown at checkout) and include any VAT we charge. Payments are processed by our payment partner, Flutterwave; we do not see or store your full card number. You authorise us to charge the amount shown. If a payment fails or does not match the price, nothing is unlocked and your payment will be looked into (see the Refund Policy). Access is given once the payment is confirmed, which can take a few minutes. A receipt is emailed to you and kept under Wallet in the student app.",
      ],
    },
    {
      heading: "10. Our content and your content",
      paragraphs: [
        "MCC and its teachers own the lessons, questions and other material on the platform. We give you a personal, non-transferable licence to use it for your own learning while your account is open.",
        "You keep ownership of what you create (notes, study sets, messages). You allow us to store and process it to run MCC and to show it to the people it is meant for, such as your teacher or, for a child's account, their parent.",
      ],
    },
    {
      heading: "11. Suspending or closing accounts",
      paragraphs: [
        "We may suspend or close an account that breaks these terms or puts others at risk, and will tell you why where we can. You can ask us to close your account at any time. Closing an account does not by itself entitle you to a refund (see the Refund Policy).",
      ],
    },
    {
      heading: "12. Availability and our responsibility",
      paragraphs: [
        "We work hard to keep MCC running but cannot promise it will always be available or error-free. To the extent the law allows, we are not responsible for losses that were not reasonably foreseeable, for loss caused by things outside our control (such as network or provider outages), or for your reliance on AI answers. Nothing in these terms limits liability that cannot lawfully be limited, including for fraud or death or personal injury caused by negligence.",
      ],
    },
    {
      heading: "13. Changes, law and contact",
      paragraphs: [
        "We may update these terms. If a change matters to you we will tell you in the app or by email before it applies; continuing to use MCC afterwards means you accept it.",
        "These terms are governed by the laws of the Federal Republic of Nigeria, and the Nigerian courts have jurisdiction unless the law says otherwise. TO CONFIRM: any dispute-resolution steps (for example mediation first).",
        "Questions? Use the contact details at the bottom of this page or the help chat inside the app.",
      ],
    },
  ],
};

export const PRIVACY: LegalDocument = {
  slug: "privacy",
  title: "Privacy Policy",
  summary: "What we collect, why, who we share it with, how long we keep it and the choices you have, written to follow the Nigeria Data Protection Act 2023.",
  updated: LEGAL_UPDATED,
  sections: [
    {
      heading: "1. Who is responsible for your data",
      paragraphs: [
        "My Course Companion (\"MCC\") decides why and how your personal data is used, which makes us the data controller under the Nigeria Data Protection Act 2023 (NDPA). TO CONFIRM: the registered company name and address, and the name and contact details of our data protection officer.",
      ],
    },
    {
      heading: "2. What we collect",
      bullets: [
        "Account details: name, email address, phone number, password (stored only as a one-way hash), username, language, and how you signed in (email, Google, Facebook or WhatsApp).",
        "About you as a learner: your education level, goals, why you joined, how you heard about us, your country, state or city, and whether you are a parent or guardian.",
        "Learning activity: lessons you finish, quiz and practice answers and scores, course and exam-program progress, study sets and flashcard reviews, goals, streaks, points, gems, XP, levels, badges and leaderboard position, certificates, and feedback or survey answers.",
        "What you give Brainy: the questions you type, files and photos you upload, and the answers it gives, which are used to produce the reply and to count your allowance.",
        "Payments: what you bought, the amount, our reference and Flutterwave's reference, the payment method type, and the last four digits and brand of a card. We do not receive or store your full card number or PIN.",
        "Live classes: which classes you joined and for how long, taken from the video-call provider's attendance log, and bookings you make.",
        "Messages: messages with teachers, our team or support, and notifications we send you.",
        "Teachers: in addition, your qualifications, national ID number (NIN) and date of birth, an ID document, a selfie, your bank details for payouts, and the result of our identity check.",
        "Technical data: device and browser type, IP address (used to protect sign-in and sign-up from abuse), the page you came from, and cookies or similar storage that keep you signed in.",
      ],
    },
    {
      heading: "3. Why we use it, and our legal basis",
      bullets: [
        "To run your account and give you the lessons, classes, rewards and tools you signed up for (contract).",
        "To take payments, issue receipts, handle refunds and keep financial records (contract and legal obligation).",
        "To keep MCC safe: preventing fraud, cheating on rewards, brute-force sign-in attempts and misuse (legitimate interests).",
        "To verify teachers' identity and pay them (contract and legitimate interests).",
        "To send you service messages: confirmations, receipts, reminders for classes, password codes and notices about your account (contract). We do not send marketing unless you ask for it or agree to it.",
        "To improve MCC with summaries of how it is used, for example which programs are popular or how students heard about us (legitimate interests).",
        "Where the law requires us to, or to respond to lawful requests (legal obligation).",
      ],
    },
    {
      heading: "4. Children",
      paragraphs: [
        "MCC is used by students under 18. A parent or guardian creates or approves a child's account and can see the child's progress, classes, level and badges. We use a child's data only to provide the service. If you think a child has an account without a parent's permission, tell us and we will deal with it.",
      ],
    },
    {
      heading: "5. Who we share it with",
      paragraphs: ["We do not sell your personal data. We share it only with companies that help us run MCC, under agreements that limit what they may do with it:"],
      bullets: [
        "Flutterwave: payment processing.",
        "Our email provider (Resend) and WhatsApp (Meta): sending you codes, receipts and notices.",
        "Zoom: running live classes and recording who attended.",
        "Our AI provider: Brainy sends the text and images you give it to the provider to generate answers.",
        "VerifyMe: checking a teacher's national ID number against their name.",
        "Our cloud hosting and file-storage providers: keeping the platform and uploaded files running.",
        "Teachers, and a child's parent, see the learning information that is meant for them.",
        "Authorities and advisers, where the law requires it or to protect our rights.",
      ],
    },
    {
      heading: "6. Sending data outside Nigeria",
      paragraphs: [
        "Some of the companies above are based, or store data, outside Nigeria. Where that happens we take steps to make sure your data is protected to a standard the NDPA accepts, for example through the provider's contractual safeguards.",
      ],
    },
    {
      heading: "7. How long we keep it",
      paragraphs: [
        "We keep your data while your account is open and for as long afterwards as needed to meet legal, tax and accounting duties, to settle disputes and to prevent fraud. Payment and receipt records are kept for the period the law requires. TO CONFIRM: exact retention periods for each type of data. When we no longer need data we delete it or make it anonymous.",
      ],
    },
    {
      heading: "8. Security",
      paragraphs: [
        "We protect your data with encrypted connections, hashed passwords, encrypted bank account numbers, short-lived links for private documents, limits on repeated sign-in and code guesses, and restricted staff access. No system is perfectly secure; if a breach puts you at risk we will tell you and the Nigeria Data Protection Commission as the law requires.",
      ],
    },
    {
      heading: "9. Your rights",
      paragraphs: ["Under the NDPA you can ask us to:"],
      bullets: [
        "tell you what we hold about you and give you a copy;",
        "correct anything that is wrong;",
        "delete your data, or restrict how we use it, where the law allows;",
        "stop using it for a purpose based on our legitimate interests, or stop any marketing;",
        "give you your data in a portable format;",
        "not be subject to a decision made only by a machine that significantly affects you.",
      ],
    },
    {
      heading: "10. Cookies and similar storage",
      paragraphs: [
        "We use cookies and browser storage that are needed to keep you signed in, remember your theme and keep the app working. We do not use them to sell advertising. You can clear them in your browser, but parts of MCC will not work while signed out.",
      ],
    },
    {
      heading: "11. Changes and how to reach us",
      paragraphs: [
        "We may update this policy and will tell you about important changes in the app or by email. To use your rights or ask a question, contact us using the details at the bottom of this page or the help chat in the app. You may also complain to the Nigeria Data Protection Commission.",
      ],
    },
  ],
};

export const REFUND: LegalDocument = {
  slug: "refund",
  title: "Refund Policy",
  summary: "How refunds work: when you can ask, what happens to your access, gems and receipts, and how we pay you back.",
  updated: LEGAL_UPDATED,
  sections: [
    {
      heading: "1. The short version",
      bullets: [
        "If you were charged but did not get what you paid for, we will fix it or refund you.",
        "If you changed your mind, ask us. We look at every request on its merits.",
        "Refunds are reviewed and recorded by our team, then paid back to the way you paid. We will tell you how long it will take when we confirm your refund.",
      ],
    },
    {
      heading: "2. When we will refund you",
      bullets: [
        "You were charged twice for the same thing.",
        "You were charged, but the course, exam program or gems were not added to your account and we cannot add them.",
        "The amount charged was different from the price shown.",
        "A paid live class was cancelled and could not be rescheduled to a time that suits you.",
        "Something we told you about a course was materially wrong.",
      ],
    },
    {
      heading: "3. When a refund may be refused",
      bullets: [
        "You have already completed most of the course or used a large part of what you bought.",
        "Your account was suspended for breaking the Terms of Use.",
        "The request is for gems that have already been spent.",
        "The request comes a long time after the purchase. TO CONFIRM: whether MCC will state a fixed request window (for example a number of days), and the exact rules for partly used courses.",
      ],
    },
    {
      heading: "4. How to ask",
      paragraphs: [
        "Contact us from the help chat in the app or using the contact details on this page, and include the receipt number (it starts with MCC- and is under Wallet, then History, in the student app, and in your confirmation email). Tell us what went wrong. We may ask you a few questions.",
      ],
    },
    {
      heading: "5. What happens when a refund is approved",
      bullets: [
        "Course or exam-prep program: your access is removed and the payment is marked refunded. Your receipt stays in your history, marked as refunded.",
        "Gems you bought: the gems are taken back from your wallet. If some have already been spent we may not be able to take them all back, and we will explain the difference when we confirm the refund.",
        "Points and other rewards earned from what you bought may be removed.",
        "A teacher's earnings from that sale are reversed.",
        "We email you to confirm.",
      ],
    },
    {
      heading: "6. Getting your money back",
      paragraphs: [
        "At present refunds are paid by our team through our payment provider or by bank transfer, not automatically, so please allow time for it to arrive and for your bank to process it. Where the payment came from a card, it usually goes back to that card. We never ask you for your card PIN or full card number to refund you.",
      ],
    },
    {
      heading: "7. Failed or pending payments",
      paragraphs: [
        "If your bank took money but MCC shows the payment as pending or failed, do not pay again straight away. We check pending payments with Flutterwave automatically every few minutes, and a payment that really went through is applied to your account. If it did not go through, the money normally returns to you from your bank. If it has not after a few days, contact us with your reference.",
      ],
    },
    {
      heading: "8. Your other rights",
      paragraphs: ["This policy does not take away any rights you have under Nigerian consumer protection law."],
    },
  ],
};

export const DOCUMENTS: Record<LegalDocument["slug"], LegalDocument> = { terms: TERMS, privacy: PRIVACY, refund: REFUND };

/** The footer's legal links: where each goes, and the words that identify them in a column whose links have no address yet. */
export const LEGAL_LINKS: { label: string; href: string; match: RegExp }[] = [
  { label: "Terms", href: "/terms", match: /^terms/i },
  { label: "Privacy", href: "/privacy", match: /^privacy/i },
  { label: "Refund policy", href: "/refund", match: /^refund/i },
];

/** The address for a footer link left blank, if its label names a legal page. */
export function legalFallbackHref(label: string): string {
  return LEGAL_LINKS.find((l) => l.match.test(label.trim()))?.href ?? "";
}
