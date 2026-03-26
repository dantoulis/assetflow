type Identifiable = {
  id: number;
};

export const removeItemById = <T extends Identifiable>(items: T[], id: number): T[] => {
  return items.filter((item) => item.id !== id);
};

export const hasValue = (value: string | null | undefined): value is string =>
  typeof value === 'string' && value.trim().length > 0;
