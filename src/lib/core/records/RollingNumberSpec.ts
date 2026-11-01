import { TransitionSprings } from "../animation/TransitionSprings";
import { RollingNumberAlignment, TransitionDirection } from "../enums";
import {
	TRANSITION_SHAPE_DEFAULTS,
	type TransitionShape,
} from "./TransitionShape";

interface RollingNumberSpec {
	text: string;
	alignment: RollingNumberAlignment;
	direction: TransitionDirection;
	decimalSeparator: string;
	shape: TransitionShape;
	clipEnabled: boolean;
	animationsEnabled: boolean;
	duration: number;
	bounce: number;
}

const createRollingNumberSpec = (): RollingNumberSpec => ({
	text: "",
	alignment: RollingNumberAlignment.Leading,
	direction: TransitionDirection.Auto,
	decimalSeparator: ".",
	shape: { ...TRANSITION_SHAPE_DEFAULTS },
	clipEnabled: true,
	animationsEnabled: true,
	duration: TransitionSprings.REFERENCE_DURATION,
	bounce: TransitionSprings.DEFAULT_BOUNCE,
});

const isBlurActive = (spec: RollingNumberSpec): boolean =>
	spec.shape.blurIntensity > 0;

const specsEqual = (lhs: RollingNumberSpec, rhs: RollingNumberSpec): boolean =>
	lhs.text === rhs.text &&
	lhs.alignment === rhs.alignment &&
	lhs.direction === rhs.direction &&
	lhs.decimalSeparator === rhs.decimalSeparator &&
	lhs.clipEnabled === rhs.clipEnabled &&
	lhs.animationsEnabled === rhs.animationsEnabled &&
	lhs.duration === rhs.duration &&
	lhs.bounce === rhs.bounce &&
	lhs.shape.blurIntensity === rhs.shape.blurIntensity &&
	lhs.shape.maxBlurRadius === rhs.shape.maxBlurRadius &&
	lhs.shape.enterScale === rhs.shape.enterScale &&
	lhs.shape.travelRatio === rhs.shape.travelRatio;

export type { RollingNumberSpec };
export { createRollingNumberSpec, isBlurActive, specsEqual };
