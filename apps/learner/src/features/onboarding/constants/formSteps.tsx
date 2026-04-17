import {FormSteps} from "../formTypes";

export const formSteps: FormSteps = [
  {
    id: "step1",
    title: "lets personalize your experience",
    inputType: "mixed",
    fields: [
      {
        id: "nickname",
        inputType: "text",
        question: "What would you like us to call you?",
        placeholder: "mac",
        validation: {required: "This field is required"},
      },
      {
        id: "language",
        inputType: "select",
        question: "Preferred Language",
        options: [
          {value: "en-gb", label: "English (UK)", icon: "🇬🇧"},
          {value: "en-us", label: "English (US)", icon: "🇺🇸"},
        ],
        default: "en-gb",
        validation: {},
      },
      {
        id: "role",
        inputType: "select",
        question: "What best describes you?",
        options: [
          {value: "undergrad", label: "Undergraduate Student", icon: "🎓"},
          {value: "grad", label: "Graduate Student", icon: "🎓"},
          {value: "other", label: "Other", icon: "❓"},
        ],
        default: "undergrad",
        validation: {},
      },
    ],
  },
  {
    id: "step2",
    inputType: "tile-multi",
    fieldId: "referral",
    question: "How did you hear about us?",
    options: [
      {
        value: "tiktok",
        label: "Tiktok",
        icon: "ic:outline-tiktok",
      },
      {
        value: "instagram",
        label: "Instagram",
        icon: "line-md:instagram",
      },
      {
        value: "youtube",
        label: "Youtube",
        icon: "line-md:youtube",
      },
      {
        value: "x",
        label: "X (Twitter)",
        icon: "line-md:twitter-x",
      },
      {
        value: "linkedin",
        label: "LinkedIn",
        icon: "line-md:linkedin",
      },
      {
        value: "facebook",
        label: "Facebook",
        icon: "line-md:facebook",
      },
      {
        value: "google search",
        label: "Google Search",
        icon: "ri:google-fill",
      },
      {
        value: "chatgpt",
        label: "ChatGPT",
        icon: "hugeicons:chat-gpt",
      },
      {
        value: "advertisement",
        label: "Advertisement",
        icon: "ri:bell-line",
      },
      {
        value: "infuencer",
        label: "Influencer or Creator",
        icon: "hugeicons:internet",
      },
      {
        value: "friend",
        label: "Friend or Colleague",
        icon: "solar:user-bold",
      },
      {
        value: "other",
        label: "Others (Tell us more)",
        icon: "line-md:cloud-filled",
      },
    ],
    validation: {required: "Please select at least one"},
  },
];
