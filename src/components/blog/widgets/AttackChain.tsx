import { ChainWidget, type ChainLink } from "./ChainWidget";

const links: ChainLink[] = [
  { icon: "📨", title: "Crafted request", text: "The attacker sends **specially crafted HTTP requests** to the website, no login needed." },
  { icon: "🐛", title: "Triggers the bug", text: "The requests are designed to hit one of the **memory bugs** inside PHP." },
  { icon: "🧩", title: "Unsafe state", text: "PHP is now handling its **internal data unsafely**: half-set-up or already freed." },
  { icon: "💻", title: "Remote code execution", text: "If the right conditions are met, the attacker can make the server **run code they chose**." },
  { icon: "🎭", title: "Consequences", text: "Depending on permissions: reading app data, changing what users see, or even a **fake checkout page**." }
];

export function AttackChain() {
  return <ChainWidget title="From one request to a compromised server" links={links} />;
}
