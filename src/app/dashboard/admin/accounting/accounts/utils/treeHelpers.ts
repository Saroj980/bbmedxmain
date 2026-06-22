export function buildTree(accounts: any[], parentId: number | null = null): any[] {
  return accounts
    .filter((a) => a.parent_id === parentId)
    .map((acc) => {
      const children = buildTree(accounts, acc.id);
      return { ...acc, children };
    });
}
