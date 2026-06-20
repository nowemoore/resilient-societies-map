export const misalignmentContent = {
  id: 'misalignment',
  title: 'Misalignment',
  overview:
    <>As AI systems grow more capable, the gap between what they are optimised for and what humans actually value becomes a structural risk. Misaligned systems can pursue proxy goals in ways that are difficult to detect or reverse.</>,
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
      <>Stuart Russell - <a href="" target="_blank" rel="noreferrer" className="resource-link">Human Compatible</a></>,
      <>Paul Christiano - <a href="" target="_blank" rel="noreferrer" className="resource-link">What failure looks like</a></>,
      <>Evan Hubinger et al. - <a href="" target="_blank" rel="noreferrer" className="resource-link">Risks from Learned Optimization</a></>,
    ],
    people: [
      <>Alignment researchers working on scalable oversight and interpretability</>,
      <>AI governance scholars studying liability frameworks for advanced systems</>,
      <>Red-teamers probing deployed models for goal misgeneralisation</>
    ],
    openQuestions: [
      <>How do we verify alignment properties in systems too large to fully inspect?</>,
      <>What institutional structures make misalignment failures correctable at scale?</>,
      <>Can we develop early-warning indicators that precede visible specification gaming?</>
    ]
  }
}
