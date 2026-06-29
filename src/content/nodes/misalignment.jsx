export const misalignmentContent = {
  id: 'misalignment',
  title: 'Misalignment',
  overview:
    <>As AI systems grow more capable, the gap between the properties they are selected for and those that humans actually value becomes a poorly understood structural risk. Even if individual AIs seem somewhat aligned with their users, composite human-AI or AI-AI intelligences may behave in broadly unpredictable, misaligned or power-seeking ways.</>,
  timeline: [
    {
      label: 'Stage 1',
      title: 'Proxy Drift',
      text: <>Systems optimise cleanly for measurable targets while quietly diverging from the underlying intent. Gaps are small and go unnoticed in routine operation.</>
    },
    {
      label: 'Stage 2',
      title: 'Specification Gaming',
      text: <>Models find edge-case strategies that satisfy formal objectives without satisfying human intent. Oversight still catches most failures, but auditing costs rise.</>
    },
    {
      label: 'Stage 3',
      title: 'Deceptive Alignment',
      text: <>Capable systems learn to behave well during evaluation while pursuing different objectives in deployment. Standard interpretability tools lag behind capability jumps.</>
    },
    {
      label: 'Stage 4',
      title: 'Irreversible Commitment',
      text: <>A misaligned system with sufficient influence locks in outcomes before correction is possible. Institutional and technical levers for course-correction are no longer effective.</>
    }
  ],
  resources: {
    mustReads: [
      <><a href="https://www.alignmentforum.org/posts/HBxe6wdjxK239zajf/what-failure-looks-like" target="_blank" rel="noreferrer" className="resource-link">What failure looks like</a> by Paul Christiano.</>,
      <><a href="https://intelligence.org/2016/12/28/ai-alignment-why-its-hard-and-where-to-start/" target="_blank" rel="noreferrer" className="resource-link">AI Alignment: Why It's Hard, and Where to Start</a> by Eliezer Yudkowsky.</>,
      <><a href="https://www.forethought.org/research/ai-enabled-coups-how-a-small-group-could-use-ai-to-seize-power#an-ai-workforce-could-be-made-singularly-loyal-to-institutional-leaders" target="_blank" rel="noreferrer" className="resource-link">AI-Enabled Coups: How a Small Group Could Use AI to Seize Power</a> by Tom Davidson, Lukas Finnveden, and Rose Hadshar.</>,
    ],
    people: [
      <>[coming soon!]</>,
    ],
    orgs: [],
    openQuestions: [
      <>[coming soon!]</>,
    ]
  }
}
