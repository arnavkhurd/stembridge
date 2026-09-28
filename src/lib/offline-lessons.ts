import type { DomainId } from "./types";

export type OfflineLesson = {
  id: string;
  domain: DomainId;
  title: string;
  summary: string;
  minutes: number;
  steps: string[];
  check: string;
  prompt: string;
};

// Original STEMBridge exercises. These are not downloaded copies of linked documentation.
export const offlineLessons: OfflineLesson[] = [
  {
    id: "numpy-beginners",
    domain: "data-ai",
    title: "Make sense of an array",
    minutes: 10,
    summary:
      "Practise thinking about rows, columns and simple calculations. No Python installation needed.",
    steps: [
      "Imagine two learners recorded their study minutes on three days: [[20, 30, 40], [15, 25, 35]]. Draw this as a table.",
      "Count its rows and columns. An array's shape describes these dimensions. Write the shape as (rows, columns).",
      "Add 5 to every value. Then calculate the total for each learner. Keep the two totals separate.",
      "Explain why adding 5 to every entry is different from adding a new column. Write your explanation below.",
    ],
    check:
      "The shape is (2, 3). After adding 5, the rows are [25, 35, 45] and [20, 30, 40]; the totals are 105 and 90. A new column would change the shape.",
    prompt:
      "What did you notice about shape? What would you ask a mentor about arrays?",
  },
  {
    id: "pandas-introduction",
    domain: "data-ai",
    title: "Clean a tiny table",
    minutes: 12,
    summary: "Decide what to do with incomplete data before writing any code.",
    steps: [
      "Write three rows with columns name, sessions and minutes: Asha, 2, 40; Noor, 3, blank; Tara, 1, 25.",
      "Identify the missing value. Write why a blank does not necessarily mean zero.",
      "Filter the table to people with at least two sessions. Which rows remain?",
      "Choose a way to handle the missing minutes: ask for the value, keep it missing, or exclude it from a particular calculation. Explain the tradeoff.",
    ],
    check:
      "Asha and Noor remain after the filter. The missing minutes are unknown, not automatically zero. A useful cleaning decision records what is missing and why a treatment was chosen.",
    prompt:
      "My cleaning decision, its limitation, and one question for a reviewer…",
  },
  {
    id: "scikit-learn-start",
    domain: "data-ai",
    title: "Keep your test data separate",
    minutes: 10,
    summary: "Learn why an impressive score can give the wrong impression.",
    steps: [
      "Imagine you have 100 labelled examples. Reserve 20 for a final test and use the other 80 for learning and development.",
      "A teammate repeatedly checks the final test score and changes the model to improve it. Describe why the test is no longer independent.",
      "Plan a separate validation split within the development data, or cross-validation. Save the final test for the end.",
      "List another risk: duplicate examples in different splits, future information, or people from the same household appearing in both sets.",
    ],
    check:
      "The model and your choices can become tuned to a repeatedly consulted test set. Split before fitting preprocessing, use development data for decisions, and explain what the final test can and cannot show.",
    prompt: "My split plan and one possible source of data leakage…",
  },
  {
    id: "ml-practice-notebook",
    domain: "data-ai",
    title: "Plan a small, honest ML project",
    minutes: 15,
    summary:
      "Leave with a project brief you can show a peer when you reconnect.",
    steps: [
      "Pick a small prediction task. Describe the input and the output in one sentence. Use practice or public data without personal identifiers.",
      "Describe a simple baseline, such as predicting the most common class. How will you compare your model with it?",
      "Write your train, validation and test plan. Choose one useful metric and explain what it misses.",
      "Add one limitation and a task a partner could review. Keep the first version small enough to finish in one study session.",
    ],
    check:
      "A reviewable brief names the task, data, baseline, evaluation and limitation. A plan is progress; it is not evidence that a trained model performs well.",
    prompt: "My project brief and the specific feedback I want…",
  },
  {
    id: "arduino-examples",
    domain: "robotics",
    title: "Trace a blinking light",
    minutes: 10,
    summary: "Reason through a repeating program on paper. No board needed.",
    steps: [
      "Imagine a loop that turns an LED on, waits 1000 milliseconds, turns it off, and waits another 1000 milliseconds.",
      "Draw a timeline for six seconds, starting just as the LED turns on. Mark each on and off interval.",
      "Change the on-time to 500 milliseconds and keep the off-time at 1000. Find the duration of one full cycle.",
      "Write what setup runs once and what belongs in the repeating loop. Board-specific pin details can be checked in the official guide when online.",
    ],
    check:
      "The first loop takes about 2 seconds per cycle, ignoring tiny instruction overhead. The changed loop takes about 1.5 seconds. Initial pin configuration belongs in setup; repeated switching belongs in the loop.",
    prompt: "My timeline and the part of the program I want explained…",
  },
  {
    id: "circuit-planning-exercise",
    domain: "robotics",
    title: "Sketch before you connect",
    minutes: 12,
    summary:
      "Plan an LED circuit on paper. This exercise does not require powering hardware.",
    steps: [
      "Draw an unpowered low-voltage board, LED and current-limiting resistor. Label the intended signal pin and ground.",
      "Sketch a series path through the resistor and LED. Mark the LED's polarity; leave board-specific ratings as questions to check.",
      "Explain in your own words why the resistor matters. List the voltage and current information needed before selecting its value.",
      "Write a pre-power checklist: check the board documentation, check component ratings and polarity, and ask a knowledgeable person to review wiring. Do not connect to mains electricity.",
    ],
    check:
      "An LED needs current limiting and correct polarity. This sketch is a planning exercise, not a universal wiring diagram. Resistor choice and pin limits depend on the actual board and LED.",
    prompt:
      "My sketch description and what I need a mentor to check before building…",
  },
  {
    id: "sensor-practice-build",
    domain: "robotics",
    title: "Question a sensor reading",
    minutes: 10,
    summary:
      "Use an imaginary set of readings to practise measurement thinking without hardware.",
    steps: [
      "A sensor reports 21, 22, 21, 65, 22 for the same room. Write what looks unusual without assuming which number is correct.",
      "List possible explanations: a real change, a loose connection, a different unit, or a measurement error.",
      "Plan a repeat measurement while holding conditions steady. Describe what reference or second instrument would help.",
      "Decide what to record with each value: time, unit, conditions and equipment. Do not silently remove 65 without explaining why.",
    ],
    check:
      "65 is unusual compared with the others, but unusual does not automatically mean invalid. Repeat, compare and document before deciding how to treat it.",
    prompt:
      "My measurement plan, possible causes and one question for a reviewer…",
  },
  {
    id: "share-your-prototype",
    domain: "robotics",
    title: "Explain your prototype clearly",
    minutes: 15,
    summary: "Draft a short README and a useful request for peer feedback.",
    steps: [
      "Write three lines: the problem, who it helps, and what your prototype actually does today.",
      "List the parts and software someone would need. Separate completed work from ideas you have not tested.",
      "Describe one test: what you changed, what you observed and whether it matched your expectation.",
      "Finish with one limitation and a precise peer-review question. Practise explaining the project aloud in two minutes.",
    ],
    check:
      "A useful README lets someone understand the current build, try a test and see its limitations. Specific requests such as 'Can you check this wiring assumption?' are easier to answer than 'Any feedback?'.",
    prompt: "My README draft and the review question I will share…",
  },
];
