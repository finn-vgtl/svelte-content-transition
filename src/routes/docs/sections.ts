interface DocSection {
	title: string;
	items: { id: string; title: string }[];
}

const DOC_SECTIONS: DocSection[] = [
	{
		title: "Getting started",
		items: [
			{ id: "introduction", title: "Introduction" },
			{ id: "installation", title: "Installation" },
			{ id: "quick-start", title: "Quick start" },
		],
	},
	{
		title: "Guides",
		items: [
			{ id: "formatting", title: "Formatting values" },
			{ id: "direction", title: "Direction" },
			{ id: "tuning-motion", title: "Tuning the motion" },
			{ id: "typography", title: "Typography" },
			{ id: "disabling-animation", title: "Disabling animation" },
			{ id: "accessibility", title: "Accessibility" },
			{ id: "ssr", title: "Server rendering" },
		],
	},
	{
		title: "API reference",
		items: [
			{ id: "props-content", title: "Content props" },
			{ id: "props-transition", title: "Transition props" },
			{ id: "html-attributes", title: "HTML attributes" },
			{ id: "types", title: "Types" },
		],
	},
];

export type { DocSection };
export { DOC_SECTIONS };
