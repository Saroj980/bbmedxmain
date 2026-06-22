import type { Location } from "@/types/location";

export function buildLocationTree(list: Location[]): Location[] {
  const map = new Map<number, Location>();

  // Prepare map and empty children
  list.forEach((loc) => {
    map.set(loc.id, { ...loc, children: [] });
  });

  const roots: Location[] = [];

  list.forEach((loc) => {
    const node = map.get(loc.id)!;

    if (loc.parent_id === null) {
      roots.push(node);
    } else {
      const parent = map.get(loc.parent_id);
      if (parent) {
        parent.children!.push(node);
      }
    }
  });

  return roots;
}
