import type { Location } from "@/types/location";

export const flattenLocations = (tree: Location[]): Location[] => {
  const result: Location[] = [];

  const walk = (nodes: Location[]) => {
    nodes.forEach((node) => {
      result.push({
        ...node,
        hasChildren: node.children && node.children.length > 0,
      });

      if (node.children?.length) {
        walk(node.children);
      }
    });
  };

  walk(tree);
  return result;
};
