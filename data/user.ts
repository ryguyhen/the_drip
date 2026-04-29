import { User } from "@/types";

export const MOCK_USER: User = {
  id: "user-1",
  name: "Alex Chen",
  email: "alex@example.com",
  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
  city: "New York",
  isPremium: false,
  preferences: ["espresso-first", "pour-over", "minimalist"],
  shopsRanked: 14,
  citiesExplored: 3,
  savedShopsCount: 7,
};

export const MOCK_PREMIUM_USER: User = {
  ...MOCK_USER,
  id: "user-2",
  name: "Jordan Park",
  isPremium: true,
};
