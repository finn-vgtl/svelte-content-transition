enum RollingNumberAlignment {
	Leading = "leading",
	Center = "center",
	Trailing = "trailing",
}

const alignmentFromProp = (
	propValue: string | null | undefined,
): RollingNumberAlignment => {
	switch (propValue) {
		case "center":
			return RollingNumberAlignment.Center;
		case "end":
			return RollingNumberAlignment.Trailing;
		default:
			return RollingNumberAlignment.Leading;
	}
};

export { alignmentFromProp, RollingNumberAlignment };
