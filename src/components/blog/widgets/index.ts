import type { ComponentType } from "react";
import { AttackChain } from "./AttackChain";
import { EmgPlayground } from "./EmgPlayground";
import { HalfFilledForm } from "./HalfFilledForm";
import { RequestFlow } from "./RequestFlow";
import { RtscPipeline } from "./RtscPipeline";
import { UseAfterFree } from "./UseAfterFree";

// Custom visual explainers a post can embed with a line like: [widget:use-after-free]
export const postWidgets: Record<string, ComponentType> = {
  "request-flow": RequestFlow,
  "half-filled-form": HalfFilledForm,
  "use-after-free": UseAfterFree,
  "attack-chain": AttackChain,
  "emg-playground": EmgPlayground,
  "rtsc-pipeline": RtscPipeline
};
