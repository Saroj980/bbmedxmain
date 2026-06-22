import { PurchaseItem } from "@/types/purchase-item";
import dayjs from "dayjs";

export function resolveExpiryDate(item: PurchaseItem): string | null {
  if (item.expiry_mode === "date") {
    return item.expiry_date;
  }

  if (
    item.manufactured_date &&
    item.shelf_life_value &&
    item.shelf_life_unit
  ) {
    return dayjs(item.manufactured_date)
      .add(item.shelf_life_value, item.shelf_life_unit)
      .format("YYYY-MM-DD");
  }

  return null;
}
