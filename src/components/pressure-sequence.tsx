"use client";

import { useEffect, useRef, useState } from "react";

const stages = [
  {
    detail: "2 files · billing logic",
    eyebrow: "00.00 / Patch captured",
    metric: "+1 −1",
    title: "The agent changes the limit.",
    body: "The implementation moves from five to ten. The existing tests still pass.",
  },
  {
    detail: "subscription-management#SUB-001",
    eyebrow: "00.17 / Intent loaded",
    metric: "5",
    title: "The contract remembers five.",
    body: "Approved behavior remains independent of whatever the implementation currently returns.",
  },
  {
    detail: "contract + billing + blast radius",
    eyebrow: "00.31 / Risk compounded",
    metric: "72",
    title: "The change is not treated equally.",
    body: "Path sensitivity, contract criticality, and changed-test coverage produce an explainable score.",
  },
  {
    detail: "MEM-0143 · related regression",
    eyebrow: "01.08 / Memory recalled",
    metric: "1",
    title: "An old failure returns to the plan.",
    body: "A confirmed historical bug forces its regression test back into verification.",
  },
  {
    detail: "expected 5 · observed 10",
    eyebrow: "03.42 / Decision reached",
    metric: "NO",
    title: "The release stops with a reason.",
    body: "MaruCheck reports the semantic conflict instead of silently changing approved intent.",
  },
] as const;

export function PressureSequence() {
  const [active, setActive] = useState(0);
  const stepsRef = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];
        if (!visible) return;
        const index = Number((visible.target as HTMLElement).dataset.stage);
        if (Number.isInteger(index)) setActive(index);
      },
      { rootMargin: "-28% 0px -42%", threshold: [0.2, 0.45, 0.7] },
    );

    stepsRef.current.forEach((step) => {
      if (step) observer.observe(step);
    });
    return () => observer.disconnect();
  }, []);

  const stage = stages[active];

  return (
    <div className="pressure-sequence">
      <div className="pressure-sequence__instrument">
        <div className="pressure-instrument" data-state={active}>
          <header>
            <span>MARU / LIVE VERIFICATION</span>
            <b>
              <i /> RUNNING
            </b>
          </header>
          <div className="pressure-instrument__field" aria-hidden="true">
            <div className="pressure-orbit pressure-orbit--outer" />
            <div className="pressure-orbit pressure-orbit--middle" />
            <div className="pressure-orbit pressure-orbit--inner" />
            <span className="pressure-instrument__metric">{stage.metric}</span>
            <i className="pressure-instrument__sweep" />
            <i className="pressure-instrument__signal" />
          </div>
          <div className="pressure-instrument__readout" aria-live="polite">
            <span>{stage.eyebrow}</span>
            <strong>{stage.title}</strong>
            <p>{stage.detail}</p>
          </div>
          <footer>
            <span>
              STEP {String(active + 1).padStart(2, "0")} / {String(stages.length).padStart(2, "0")}
            </span>
            <div>
              {stages.map((item, index) => (
                <i className={index <= active ? "is-active" : ""} key={item.eyebrow} />
              ))}
            </div>
          </footer>
        </div>
      </div>
      <div className="pressure-sequence__steps">
        {stages.map((item, index) => (
          <article
            className={index === active ? "is-active" : ""}
            data-stage={index}
            key={item.eyebrow}
            ref={(element) => {
              stepsRef.current[index] = element;
            }}
          >
            <span>{item.eyebrow}</span>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
            <small>{item.detail}</small>
          </article>
        ))}
      </div>
    </div>
  );
}
