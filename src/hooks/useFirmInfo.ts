import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export function useFirmInfo() {
  const [firmInfo, setFirmInfo] = useState<{ firm_name: string; logo: string | null } | null>(null);

  useEffect(() => {
    const fetchFirmInfo = async () => {
      try {
        const res = await api.get(`/system-settings`);
        if (res.data && res.data.firm_name) {
          setFirmInfo({
            firm_name: res.data.firm_name,
            logo: res.data.logo_url || null
          });
        }
      } catch (err) {
        console.error("Failed to fetch firm info:", err);
      }
    };
    fetchFirmInfo();
  }, []);

  return firmInfo;
}
