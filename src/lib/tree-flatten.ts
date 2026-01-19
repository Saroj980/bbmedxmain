import { Account } from "@/types/account";
import type { Category } from "@/types/category";

export function flattenCategories(
  categories: Category[],
  depth = 0
): Category[] {
  let flat: Category[] = [];

  categories.forEach((cat) => {
    flat.push({
      ...cat,
      depth,
      hasChildren: cat.children && cat.children.length > 0,
    });

    if (cat.children && cat.children.length > 0) {
      flat = flat.concat(flattenCategories(cat.children, depth + 1));
    }
  });

  return flat;
}

export function flattenAccounts(
  accounts: Account[],
  depth = 0
): Account[] {
  let flat: Account[] = [];

  accounts.forEach((acc) => {
    flat.push({
      ...acc,
      depth,
      hasChildren: acc.children && acc.children.length > 0,
    });

    if (acc.children && acc.children.length > 0) {
      flat = flat.concat(flattenAccounts(acc.children, depth + 1));
    }
  });

  return flat;
}
