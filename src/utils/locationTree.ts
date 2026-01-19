/* eslint-disable @typescript-eslint/no-explicit-any */
export type LocationNode = {
  title: string;
  value: number;
  key: number;
  children?: LocationNode[];
  selectable?: boolean;
};

export function buildLocationTree(locations: any[]): LocationNode[] {
  const map = new Map<number, LocationNode>();

  // create nodes
  locations.forEach((l) => {
    if (!l.is_active) return;

    map.set(l.id, {
      title: l.name,
      value: l.id,
      key: l.id,
      children: [],
      selectable: true, // change to false if you want to disable parent selection
    });
  });

  const tree: LocationNode[] = [];

  locations.forEach((l) => {
    if (!l.is_active) return;

    const node = map.get(l.id)!;

    if (l.parent_id && map.has(l.parent_id)) {
      map.get(l.parent_id)!.children!.push(node);
    } else {
      tree.push(node);
    }
  });

  return tree;
}
