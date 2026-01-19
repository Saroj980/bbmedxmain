import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export function useProductAvailability(productId?: number) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!productId) return;

    setLoading(true);
    api
      .get(`/products/${productId}/availability`)
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, [productId]);

  return { data, loading };
}
