import { Coupon } from "@/types";

export const coupons: Coupon[] = [
  {
    id: "coupon-welcome10",
    code: "WELCOME10",
    description: "10% off for new customers",
    discountType: "percentage",
    discountValue: 10,
    productIds: [],
    startDate: "2024-01-01T00:00:00Z",
    endDate: "2025-12-31T00:00:00Z",
    maxUses: 100,
    currentUses: 23,
    status: "active",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "coupon-sunday5",
    code: "SUNDAY5",
    description: "$5 off for Sunday school teachers",
    discountType: "fixed",
    discountValue: 5,
    productIds: ["product-genesis-full", "product-classroom"],
    startDate: "2024-01-01T00:00:00Z",
    endDate: "2025-12-31T00:00:00Z",
    maxUses: 50,
    currentUses: 8,
    status: "active",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
];
