"use client";

import { useCallback, useState } from "react";
import { useSettings } from "./useAdminData";

export function useCheckout() {
  const { settings } = useSettings();
  const [showModal, setShowModal] = useState(false);

  const openCheckout = useCallback((productCheckoutUrl?: string) => {
    const url = productCheckoutUrl || settings.checkoutUrl || process.env.NEXT_PUBLIC_CHECKOUT_URL;
    if (url) {
      window.open(url, "_blank");
    } else {
      setShowModal(true);
    }
  }, [settings.checkoutUrl]);

  const closeModal = useCallback(() => setShowModal(false), []);

  return { openCheckout, showModal, closeModal };
}
