import { PUBLIC_BASE } from "../../config";
import type { BlogPost } from "./types";

// Shown until the live posts.json loads, or if it is empty or unreachable.
export const samplePosts: BlogPost[] = [
  {
    id: "ai-robotics-physical-world",
    title: "AI Is Starting to Move Into the Physical World",
    excerpt:
      "Recent robotics news shows AI moving beyond screens and into machines that can learn, move, and act in real spaces.",
    category: "AI + Robotics",
    image: `${PUBLIC_BASE}gabriele-malaspina-CjWsslYVnPI-unsplash.jpg`,
    content: `## Why this caught my attention
A lot of AI news still focuses on chatbots, image generators, and software agents. But one of the most interesting shifts happening right now is that AI is starting to move into the physical world.

---

## From language to action
Recent robotics news makes that clear. Meta has acquired a humanoid robotics startup to strengthen its work on AI for robots, while Boston Dynamics is working with Google DeepMind on the next generation of Atlas. The interesting part is not only the hardware. It is the idea that robots may need foundation models of their own: systems trained to understand movement, objects, space, and physical interaction.

> Intelligence becomes more than prediction. It becomes action.

That changes how I think about AI. A chatbot can be wrong and correct itself in text, but a robot acting in the real world has to deal with gravity, friction, timing, safety, and uncertainty. Intelligence becomes more than prediction. It becomes action.

## Why robotics feels exciting
This is why robotics feels like one of the most exciting areas of AI. It combines perception, language, control, planning, and real-world feedback. It also shows how difficult "general intelligence" really is. Understanding a sentence is one challenge. Understanding how to pick up a fragile object, navigate a room, or work safely near people is another.

For me, this is the kind of AI progress worth watching: not just models that can answer questions, but systems that can eventually help in homes, hospitals, factories, and everyday environments.`,
    date: "2026-05-14"
  }
];
