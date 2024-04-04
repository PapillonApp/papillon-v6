import { type ReactNode, type ReactElement, Children, isValidElement, cloneElement } from 'react';

/**
 * Maps the given children with keys with the
 * following format : "child-(index)".
 * 
 * A `last` attribute is also given in the
 * last children of the list. 
 */
const mapChildrenWithKeys = (children: ReactNode) => {
  const count = Children.count(children);

  return Children.map(children, (child, index) => {
    // remove null/undefined children
    if (!isValidElement(child)) {
      return null;
    }

    // Check if this is the last child and add last={true} prop if it is
    const isLastChild = index === count - 1;
    const isFirstChild = index === 0;
    return cloneElement(child as ReactElement, { key: `child-${index}`, last: isLastChild, first: isFirstChild });
  });
};

export default mapChildrenWithKeys;
