import { ChainWidget, type ChainLink } from "./ChainWidget";

const links: ChainLink[] = [
  { icon: "💪", title: "EMG sensor / CSV replay", text: "Live muscle signals are collected from the **EMG sensor**, or replayed from recorded **CSV samples**." },
  { icon: "🧹", title: "Filter & smooth", text: "The raw signal goes through **filtering and smoothing** stages to tame the noise." },
  { icon: "🗃️", title: "Real-time buffer", text: "Processed samples are stored in a **real-time buffer**, ready to be used straight away." },
  { icon: "🎯", title: "Calibration & profiles", text: "The backend runs the **calibration workflows** and saves **reusable calibration profiles** for each user." },
  { icon: "⚡", title: "WebSocket stream", text: "**WebSocket streaming** sends the data to the frontend with low latency, typically **13–16 ms** end to end." },
  { icon: "📊", title: "React dashboard", text: "The frontend shows **live graphs**, contraction feedback bars, calibration controls and system monitoring tools." }
];

export function RtscPipeline() {
  return <ChainWidget title="Follow one muscle signal through RTSC" links={links} flowing />;
}
