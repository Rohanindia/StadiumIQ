/**
 * @fileoverview Custom hook for dynamically updating the page <title> element.
 * Used across all pages to ensure proper SEO and browser tab labelling.
 */

import { useEffect } from 'react';

/** Base title suffix appended to every page */
const BASE_TITLE = 'StadiumIQ — FIFA World Cup 2026';

/**
 * Updates `document.title` on mount and resets to the base title on unmount.
 *
 * @param pageTitle - The page-specific portion of the title (e.g. 'CrowdIQ')
 *
 * @example
 * usePageTitle('CrowdIQ'); // sets: "CrowdIQ | StadiumIQ — FIFA World Cup 2026"
 */
export function usePageTitle(pageTitle: string): void {
  useEffect(() => {
    const previous = document.title;
    document.title = `${pageTitle} | ${BASE_TITLE}`;
    return () => {
      document.title = previous;
    };
  }, [pageTitle]);
}
