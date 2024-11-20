// src/utils/domSelection.ts
import { ElementInfo } from '../types/domSelection';

/**
 * Get the DOM path from root to the given element as an array of indices
 */
export const getElementPath = (element: HTMLElement): number[] => {
  const path: number[] = [];
  let current = element;

  while (current.parentElement) {
    const parent = current.parentElement;
    const children = Array.from(parent.children);
    const index = children.indexOf(current);
    path.unshift(index);
    current = parent;
  }

  return path;
};

/**
 * Find an element in the DOM using a path of indices
 */
export const getElementByPath = (path: number[]): HTMLElement | null => {
  let current: HTMLElement = document.documentElement;

  try {
    for (const index of path) {
      const children = Array.from(current.children) as HTMLElement[];
      if (index >= children.length) return null;
      current = children[index];
    }
  } catch (error) {
    console.error(`[getElementByPath] ${path} is not a valid path`);
    return null;
  }

  return current;
};

/**
 * Get the opening HTML tag of an element
 */
export const getElementStartTag = (element: HTMLElement): string => {
  const clone = element.cloneNode(false) as HTMLElement;
  return clone.outerHTML.split('>')[0] + '>';
};

/**
 * Truncate a string to a maximum length for display
 */
export const truncateStartTag = (tag: string, maxLength = 20): string => {
  return tag.length > maxLength ? `${tag.slice(0, maxLength)}...` : tag;
};

/**
 * Build a tree representation of an element and its children
 */
export const buildElementTree = (
  element: HTMLElement,
  currentPath: number[] = []
): ElementInfo[] => {
  const children = Array.from(element.children).flatMap((child, index) => {
    const childPath = [...currentPath, index];
    return buildElementTree(child as HTMLElement, childPath);
  });

  return [
    {
      startTag: getElementStartTag(element),
      path: currentPath,
      children,
    },
  ];
};

/**
 * Create an ElementInfo object for a given element
 */
export const createElementInfo = (element: HTMLElement): ElementInfo => {
  const path = getElementPath(element);
  return {
    startTag: getElementStartTag(element),
    path,
    children: buildElementTree(element, path),
  };
};
