import { useEffect, useRef } from 'react';
import equal from '@gilbarbara/deep-equal';
import treeChanges, { Data, KeyType, TreeChanges } from 'tree-changes';

export default function useTreeChanges<T extends Data>(value: T) {
  // Props that were found to be part of circular structures.
  const strippedValue = {
    ...value,
    _owner: undefined,
    alternative: undefined,
  }
  const previousValue = useRef(strippedValue);
  const isEqual = equal(previousValue.current, strippedValue);
  const previousIsEqual = useRef(isEqual);
  const instance = useRef<TreeChanges<KeyType<T, typeof previousValue.current>>>(
    treeChanges(previousValue.current, strippedValue),
  );

  useEffect(() => {
    previousValue.current = strippedValue;
  });

  if (previousIsEqual.current !== isEqual || !isEqual) {
    previousIsEqual.current = isEqual;
    instance.current = treeChanges(previousValue.current, strippedValue);
  }

  return instance.current;
}

// eslint-disable-next-line unicorn/prefer-export-from
export { treeChanges };
export * from 'tree-changes';
