import { Announcement } from "@/types";

export const announcements: Announcement[] = [
  {
    id: "ann-1",
    title: "Genesis Pack Now Available!",
    message: "The Genesis Coloring Book for Kids is here! Start your free adventure today.",
    type: "launch",
    placement: "home",
    ctaLabel: "Start Free",
    ctaUrl: "/free-adventure",
    backgroundColor: "#A9C8D8",
    startDate: "2024-01-01T00:00:00Z",
    endDate: "2025-12-31T00:00:00Z",
    status: "active",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "ann-2",
    title: "Exodus Collection Coming Soon",
    message: "Join the waitlist and be the first to know when the Exodus Coloring Book launches!",
    type: "promo",
    placement: "all",
    ctaLabel: "Join Waitlist",
    ctaUrl: "/waitlist",
    backgroundColor: "#D8B76A",
    startDate: "2024-06-01T00:00:00Z",
    endDate: "2025-12-31T00:00:00Z",
    status: "active",
    createdAt: "2024-06-01T00:00:00Z",
    updatedAt: "2024-06-01T00:00:00Z",
  },
];
