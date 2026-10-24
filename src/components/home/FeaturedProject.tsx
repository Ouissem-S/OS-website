import { navigateTo } from "../../lib/router";
import { Reveal } from "../Reveal";

const BASE = import.meta.env.BASE_URL;
const COVER =
  "blog-media/1778794768669-real-time-data-sensor-calibration-university-of-nottingham-school-of-computer-science-cover-1778827606882-tw8wjm.jpg";

// Headline numbers from the RTSC write-up, for recruiters skimming the home page.
const highlights = [
  { value: "Top team", label: "chosen over several competing applicant teams" },
  { value: "13–16 ms", label: "end-to-end latency (target: under 50 ms)" },
  { value: "60 Hz", label: "live EMG streaming & visualisation" },
  { value: "Team admin", label: "for a team of 6 across 8 months" }
];

const stack = ["React", "TypeScript", "WebSockets", "ESP32", "Bluetooth LE", "EMG signal processing"];

export function FeaturedProject() {
  return (
    <Reveal as="section" className="featured-project">
      <div className="featured-project__media">
        <img src={`${BASE}${COVER}`} alt="The RTSC team at the University of Nottingham showcase" loading="lazy" />
        <span className="featured-project__tag">⭐ Featured project</span>
      </div>

      <div className="featured-project__body">
        <p className="eyebrow">University of Nottingham · 2025/26</p>
        <h2>Real-Time Sensor Calibration</h2>
        <p className="featured-project__pitch">
          A real-time system that reads muscle signals (EMG), calibrates them for each person and streams them live to a
          React dashboard, used at demo day to play a game and control a Kinova robot arm with muscle activity.
        </p>

        <dl className="featured-project__stats">
          {highlights.map((item) => (
            <div key={item.value}>
              <dt>{item.value}</dt>
              <dd>{item.label}</dd>
            </div>
          ))}
        </dl>

        <ul className="featured-project__stack" aria-label="Tech used">
          {stack.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <div className="featured-project__actions">
          <a className="pink-button" href="#/post/rtsc" onClick={navigateTo("/post/rtsc")}>
            Read the case study
          </a>
          <a className="ghost-button" href="https://youtube.com/shorts/6Us6lDBx-PE" target="_blank" rel="noreferrer">
            ▶ Watch the robot demo
          </a>
        </div>
      </div>
    </Reveal>
  );
}
