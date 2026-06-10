"use client";

import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { collections as defaultCollections } from "@/data/collections";
import { products as defaultProducts } from "@/data/products";
import { drawings as defaultDrawings } from "@/data/drawings";
import { announcements as defaultAnnouncements } from "@/data/announcements";
import { launches as defaultLaunches } from "@/data/launches";
import { coupons as defaultCoupons } from "@/data/coupons";
import { customerInfo as defaultCustomerInfo } from "@/data/customerInfo";
import type {
  Collection, Product, Drawing, Announcement, Launch, Coupon,
  Lead, MediaItem, CustomerInfo, PlatformSettings
} from "@/types";

type EntityMap = {
  collections: Collection[];
  products: Product[];
  drawings: Drawing[];
  announcements: Announcement[];
  launches: Launch[];
  coupons: Coupon[];
  leads: Lead[];
  media: MediaItem[];
  customerInfo: CustomerInfo[];
};

const defaults: EntityMap = {
  collections: defaultCollections,
  products: defaultProducts,
  drawings: defaultDrawings,
  announcements: defaultAnnouncements,
  launches: defaultLaunches,
  coupons: defaultCoupons,
  leads: [],
  media: [],
  customerInfo: defaultCustomerInfo,
};

function useEntityStore<K extends keyof EntityMap>(key: K, storageKey: string) {
  const [data, setData] = useLocalStorage<EntityMap[K]>(storageKey, defaults[key] as EntityMap[K]);

  const create = useCallback((item: EntityMap[K][number]) => {
    setData((prev) => [...(prev as EntityMap[K]), item] as EntityMap[K]);
  }, [setData]);

  const update = useCallback((id: string, updates: Partial<EntityMap[K][number]>) => {
    setData((prev) =>
      prev.map((item) =>
        (item as { id: string }).id === id ? { ...item, ...updates } : item
      ) as EntityMap[K]
    );
  }, [setData]);

  const remove = useCallback((id: string) => {
    setData((prev) => prev.filter((item) => (item as { id: string }).id !== id) as EntityMap[K]);
  }, [setData]);

  const reset = useCallback(() => {
    setData(defaults[key] as EntityMap[K]);
  }, [setData, key]);

  return { data, create, update, remove, reset, setData };
}

export function useCollections() {
  return useEntityStore("collections", "bcj_collections");
}

export function useProducts() {
  return useEntityStore("products", "bcj_products");
}

export function useDrawings() {
  return useEntityStore("drawings", "bcj_drawings");
}

export function useAnnouncements() {
  return useEntityStore("announcements", "bcj_announcements");
}

export function useLaunches() {
  return useEntityStore("launches", "bcj_launches");
}

export function useCoupons() {
  return useEntityStore("coupons", "bcj_coupons");
}

export function useLeads() {
  return useEntityStore("leads", "bcj_leads");
}

export function useMedia() {
  return useEntityStore("media", "bcj_media");
}

export function useCustomerInfo() {
  return useEntityStore("customerInfo", "bcj_customerInfo");
}

const DEFAULT_SETTINGS: PlatformSettings = {
  siteName: "Bible Coloring Journey",
  brandSlogan: "Faith-filled printable activities for Christian families, homeschool, and Sunday school.",
  supportEmail: "support@biblecoloringjourney.com",
  checkoutUrl: "",
  currency: "USD",
  primaryProduct: "product-genesis-full",
  freeAccessEnabled: true,
  maintenanceMode: false,
  announcementBarEnabled: true,
  defaultLanguage: "en",
  licenseText: "Personal use license. May not be redistributed or resold.",
};

export function useSettings() {
  const [settings, setSettings] = useLocalStorage<PlatformSettings>("bcj_settings", DEFAULT_SETTINGS);

  const updateSettings = useCallback((updates: Partial<PlatformSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, [setSettings]);

  return { settings, updateSettings };
}

export function useAdminLeads() {
  const store = useLeads();

  const addLead = useCallback((lead: Omit<Lead, "id" | "createdAt">) => {
    const newLead: Lead = {
      ...lead,
      id: `lead-${Date.now()}`,
      tags: lead.tags || [],
      createdAt: new Date().toISOString(),
    };
    store.create(newLead);
    return newLead;
  }, [store]);

  return { ...store, addLead };
}
