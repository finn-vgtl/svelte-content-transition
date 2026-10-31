const SITE_NAME = "svelte-content-transition";

// Absolute URL of the deployed site, without a trailing slash. Canonical links, Open Graph tags and
// the sitemap need absolute URLs, which the prerendered pages can't derive from the request.
const SITE_URL = "https://finn-vgtl.github.io/svelte-content-transition";

const REPOSITORY_URL = "https://github.com/finn-vgtl/svelte-content-transition";
const NPM_URL = "https://www.npmjs.com/package/svelte-content-transition";

// Every indexable page, as paths relative to SITE_URL.
const PAGES = ["/", "/docs"] as const;

type SitePath = (typeof PAGES)[number];

/** Absolute URL of a page. Prerendered pages have no trailing slash, except the root. */
function pageUrl(path: SitePath): string {
	return path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`;
}

export type { SitePath };
export { NPM_URL, PAGES, pageUrl, REPOSITORY_URL, SITE_NAME };
