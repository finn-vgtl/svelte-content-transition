import { PAGES, pageUrl } from "../../site/site";

export const prerender = true;

export function GET() {
	const urls = PAGES.map(
		(path) => `\t<url>\n\t\t<loc>${pageUrl(path)}</loc>\n\t</url>`,
	).join("\n");

	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
		{ headers: { "Content-Type": "application/xml" } },
	);
}
