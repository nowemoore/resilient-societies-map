import { useCallback, useEffect, useState } from 'react'
import {
  ReactFlow,
  Controls,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { nodeContentById } from './content/nodes'
import './App.css'

// ─── icons ─────────────────────────────────────────────────────────────────────

const NODE_ICONS = {
  social:                'fa-users',
  emotionalSafety:       'fa-heart',
  economics:             'fa-sack-dollar',
  epistemicRisk:         'fa-brain',
  politicalImpacts:      'fa-building-columns',
  gradualDisempowerment: 'fa-faucet-drip',
  misalignment:          'fa-arrow-right-arrow-left',
}

// ─── graph data ────────────────────────────────────────────────────────────────

const CLICKABLE = new Set(Object.keys(nodeContentById))

// tier 1 = societal resilience, 2 = human/systems, 3 = clickable problems, 4 = leaf context
const rawNodes = [
  // ── top leaf row (human branch +75) ────────────────────────────────────
  { id: 'isolation',             label: 'isolation',              x: -160, y: 235, dominant: false, tier: 4 },
  { id: 'psychosis',             label: 'psychosis',              x: 430,  y: 91,  dominant: false, tier: 4 },
  { id: 'parasocialAttachment',  label: 'parasocial attachment',  x: 570,  y: 91,  dominant: false, tier: 4 },
  { id: 'identity',              label: 'identity destabilisation', x: 220, y: 99,  dominant: false, tier: 4 },
  { id: 'deterioration',         label: 'social skill atrophy',   x: -160, y: 139, dominant: false, tier: 4 },

  // ── upper mid ────────────────────────────────────────────────────────────
  { id: 'social',                label: 'community risks',        x: -10,  y: 215, dominant: true,  tier: 3 },
  { id: 'emotionalSafety',       label: 'emotional safety',       x: 312,  y: 215, dominant: true,  tier: 3 },
  { id: 'economics',             label: 'economic impacts',       x: 904,  y: 65,  dominant: true,  tier: 3 },

  // ── central spine ────────────────────────────────────────────────────────
  { id: 'humanInfluence',        label: 'human influence',        x: 168,  y: 347, dominant: false, tier: 2 },
  { id: 'societalResilience',    label: 'societal resilience',    x: 580,  y: 272, dominant: false, tier: 1 },
  { id: 'systemsInfluence',      label: 'systems influence',      x: 920,  y: 197, dominant: false, tier: 2 },

  // ── lower mid ────────────────────────────────────────────────────────────
  { id: 'epistemicRisk',         label: 'epistemic risk',         x: 168,  y: 483, dominant: true,  tier: 3 },
  { id: 'gradualDisempowerment', label: 'gradual disempowerment', x: 800,  y: 370, dominant: true,  tier: 3 },
  { id: 'politicalImpacts',      label: 'political impacts',      x: 1190, y: 175, dominant: true,  tier: 3 },

  // ── econ leaves (sys branch -75) ─────────────────────────────────────────
  { id: 'liabilityVacuum',       label: 'liability vacuum',       x: 700,  y: -15,  dominant: false, tier: 4 },
  { id: 'redistributionFailure', label: 'redistribution failure', x: 758,  y: -80,  dominant: false, tier: 4 },
  { id: 'taxBaseErosion',        label: 'tax base erosion',       x: 923,  y: -100, dominant: false, tier: 4 },
  { id: 'transitionShock',       label: 'transition shock',       x: 1073, y: -80,  dominant: false, tier: 4 },
  { id: 'marketConcentration',   label: 'market concentration',   x: 1150, y: -15,  dominant: false, tier: 4 },

  // ── misalignment (sys branch) ────────────────────────────────────────────
  { id: 'misalignment',         label: 'misalignment',           x: 1190, y: 420, dominant: true,  tier: 3 },

  // ── COP leaves (sys branch -75) ──────────────────────────────────────────
  { id: 'concentrationOfPower',  label: 'concentration of power', x: 1420, y: 100, dominant: false, tier: 4 },
  { id: 'stateCollapse',         label: 'state collapse',         x: 1420, y: 237, dominant: false, tier: 4 },

  // ── bottom leaf row ──────────────────────────────────────────────────────
  { id: 'offloading',            label: 'offloading',             x: -20,  y: 643, dominant: false, tier: 4 },
  { id: 'informationSafety',     label: 'information safety',     x: 168,  y: 643, dominant: false, tier: 4 },
  { id: 'knowledgeCollapse',     label: 'knowledge collapse',     x: 430,  y: 543, dominant: false, tier: 4 },
  { id: 'collectiveCognition',   label: 'collective cognition',   x: 580,  y: 643, dominant: false, tier: 4 },
  { id: 'culture',               label: 'cultural displacement',  x: 800,  y: 500, dominant: false, tier: 4 },
]

const rawEdges = [
  ['humanInfluence',        'social',                'left-src', 'bottom-tgt'],

  ['emotionalSafety',       'psychosis',             'top-src',  'bottom-tgt'],
  ['emotionalSafety',       'parasocialAttachment',  'top-src',  'bottom-tgt'],
  ['emotionalSafety',       'identity',              'top-src',  'bottom-tgt'],
  ['humanInfluence',        'emotionalSafety',        'top-src',  'bottom-tgt'],
  ['humanInfluence',        'epistemicRisk',         'bottom',   'top'],
  ['social',                'isolation',             'left-src', 'right-tgt'],
  ['social',                'deterioration',         'left-src', 'right-tgt'],
  ['isolation',             'deterioration',         'top-src',  'bottom-tgt'],
  ['deterioration',         'identity',              'right',    'left'],
  ['epistemicRisk',         'offloading',            'bottom',   'top'],
  ['epistemicRisk',         'informationSafety',     'bottom',   'top'],
  ['epistemicRisk',         'collectiveCognition',   'bottom',   'left'],
  ['collectiveCognition',   'psychosis',             'top-src',  'bottom-tgt'],
  ['collectiveCognition',   'knowledgeCollapse',     'top-src',  'bottom-tgt'],
  ['knowledgeCollapse',     'epistemicRisk',         'left-src', 'right-tgt'],
  ['systemsInfluence',      'economics',             'top-src',  'bottom-tgt'],
  ['economics',             'postAGIEconomics',      'top-src',  'bottom-tgt'],
  ['economics',             'redistributionFailure', 'top-src',  'bottom-tgt'],
  ['economics',             'liabilityVacuum',       'top-src',  'bottom-tgt'],
  ['economics',             'taxBaseErosion',        'top-src',  'bottom-tgt'],
  ['economics',             'transitionShock',       'top-src',  'bottom-tgt'],
  ['economics',             'marketConcentration',   'top-src',  'bottom-tgt'],
  ['systemsInfluence',      'misalignment',          'right',    'left'],
  ['systemsInfluence',      'gradualDisempowerment', 'bottom',   'top'],
  ['systemsInfluence',      'politicalImpacts',      'right',    'left'],
  ['politicalImpacts',      'concentrationOfPower',  'right',    'left'],
  ['concentrationOfPower',  'economics',             'top-src',  'bottom-tgt'],
  ['politicalImpacts',      'stateCollapse',         'right',    'left'],
  ['gradualDisempowerment', 'economics',             'top-src',  'left'],
  ['gradualDisempowerment', 'culture',               'bottom',   'top'],
  ['gradualDisempowerment', 'politicalImpacts',      'right',     'left'],
  ['culture',               'collectiveCognition',   'left-src', 'right-tgt'],
  ['humanInfluence',        'societalResilience',    'right',    'left'],
  ['societalResilience',    'systemsInfluence',      'right',    'left'],
]

const initialNodes = rawNodes.map((n) => ({
  id: n.id,
  position: { x: n.x, y: n.y },
  data: { label: n.label, dominant: n.dominant, clickable: CLICKABLE.has(n.id), tier: n.tier, icon: NODE_ICONS[n.id] ?? null },
  type: 'resilienceNode',
}))

const tierById = Object.fromEntries(rawNodes.map((n) => [n.id, n.tier]))

const initialEdges = rawEdges.map(([source, target, sourceHandle, targetHandle]) => ({
  id: `${source}--${target}`,
  source,
  target,
  sourceHandle,
  targetHandle,
  style: {
    stroke: 'var(--color-edge)',
    strokeWidth: 1.5,
    ...(tierById[source] === tierById[target] ? { strokeDasharray: '5 5' } : {}),
  },
}))

// ─── custom node ─────────────────────────────────────────────────────────────

function ResilienceNode({ data }) {
  const cls = [
    'rf-node',
    data.dominant ? 'rf-node--dominant' : 'rf-node--context',
    data.clickable ? 'rf-node--clickable' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={cls} data-tier={data.tier}>
      <Handle type="target" position={Position.Top}    id="top"       className="rf-handle" />
      <Handle type="source" position={Position.Top}    id="top-src"   className="rf-handle" />
      <Handle type="target" position={Position.Left}   id="left"      className="rf-handle" />
      <Handle type="source" position={Position.Left}   id="left-src"  className="rf-handle" />
      <span className="rf-node__label">
        {data.icon && <i className={`fa-solid ${data.icon} rf-node__icon`} />}
        {data.label}
      </span>
      <Handle type="source" position={Position.Bottom} id="bottom"    className="rf-handle" />
      <Handle type="target" position={Position.Bottom} id="bottom-tgt" className="rf-handle" />
      <Handle type="source" position={Position.Right}  id="right"     className="rf-handle" />
      <Handle type="target" position={Position.Right}  id="right-tgt" className="rf-handle" />
    </div>
  )
}

const nodeTypes = { resilienceNode: ResilienceNode }

// ─── modal ───────────────────────────────────────────────────────────────────

function ResourceList({ items, icon }) {
  return (
    <ul className="resource-items">
      {items.map((item, i) => (
        <li key={i}>
          <i className={`fa-solid ${icon} resource-bullet`} aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function NodeModal({ nodeContent, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  if (!nodeContent) return null

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <article
        className="detail-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-topbar">
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close details">
            <i className="fa-solid fa-circle-xmark" />
          </button>
        </header>

        <div className="modal-body">
          <section className="modal-section">
            <p className="section-kicker">Problem overview</p>
            <h2 id="modal-title">{nodeContent.title}</h2>
            <p className="overview-copy">{nodeContent.overview}</p>
          </section>

          <section className="modal-section">
            <p className="section-kicker">Resource hub</p>

            {nodeContent.resources.mustReads?.length > 0 && (
              <div className="resource-subsection">
                <h3>Must-Reads</h3>
                <ResourceList items={nodeContent.resources.mustReads} icon="fa-book" />
              </div>
            )}

            {nodeContent.resources.people?.length > 0 && (
              <div className="resource-subsection">
                <h3>People</h3>
                <ResourceList items={nodeContent.resources.people} icon="fa-users" />
              </div>
            )}

            {nodeContent.resources.orgs?.length > 0 && (
              <div className="resource-subsection">
                <h3>Orgs</h3>
                <ResourceList items={nodeContent.resources.orgs} icon="fa-building-columns" />
              </div>
            )}

            {nodeContent.resources.openQuestions?.length > 0 && (
              <div className="resource-subsection">
                <h3>Open Questions</h3>
                <ResourceList items={nodeContent.resources.openQuestions} icon="fa-magnifying-glass" />
              </div>
            )}
          </section>
        </div>
      </article>
    </div>
  )
}

// ─── app ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)
  const [activeNodeId, setActiveNodeId] = useState(null)

  const activeNodeContent = activeNodeId ? nodeContentById[activeNodeId] : null

  useEffect(() => {
    document.body.style.overflow = activeNodeContent ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [activeNodeContent])

const onNodeClick = useCallback((_event, node) => {
    if (node.data.clickable) setActiveNodeId(node.id)
  }, [])

  return (
    <>
      <div className="app-shell">
        <header className="page-hero">
          <p className="page-kicker">Field Map</p>
          <h1>Hot Topics in Societal Resilience</h1>
          <p className="page-intro">
            A lot of AIS research lacks long-term vision. Many people look into how to make AI more capable and less mean, but very few ask: "And then what?" For humanity to survive <em>and</em> flourish in AI-augmented futures, we need to be asking these questions. This page exists to lower the barriers to strategy research, hand-pick the most relevant resources, and help anyone who cares about future societies think more strategically, starting now.
          </p>
          <p className="page-description">
            drag to pan · pinch to zoom · click a highlighted node to learn more
          </p>
        </header>

        <div className="graph-wrap">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            fitView
            fitViewOptions={{ padding: 0.18 }}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            zoomOnScroll={false}
            zoomOnDoubleClick={false}
            preventScrolling={false}
            proOptions={{ hideAttribution: true }}
            defaultEdgeOptions={{ pathOptions: { curvature: 0.7 } }}
          >
            <Controls
              showInteractive={false}
              style={{
                background: 'var(--color-control-bg)',
                border: '1px solid var(--color-border-control)',
                borderRadius: 10,
              }}
            />
          </ReactFlow>
        </div>
      </div>

      <div className="section-divider">
        <span className="section-divider__line" />
        <i className="fa-solid fa-seedling section-divider__icon" />
        <span className="section-divider__line" />
      </div>

      <section className="faq-section">
        <div className="faq-inner">
          <h2 className="faq-heading">Frequently Asked Questions</h2>
          <div className="faq-list">
            <details className="faq-item">
              <summary className="faq-question">
                What is this map? What do the nodes actually represent?
                <i className="fa-solid fa-circle-chevron-down faq-chevron" />
              </summary>
              <p className="faq-answer">This is a map of research directions on the interface of AI safety and humanity's (long-term) resilience. The further out of the center, the more specific the focus area, with the outmost nodes representing specific problems.</p>
            </details>
            <details className="faq-item">
              <summary className="faq-question">
                Who is this map for?
                <i className="fa-solid fa-circle-chevron-down faq-chevron" />
              </summary>
              <p className="faq-answer">If you're an aspiring conceptual researcher, a transitioning technical researcher, or just curious about open problems in societal resilience, this map may be for you.</p>
            </details>
            <details className="faq-item">
              <summary className="faq-question">
                Why should I trust the author hasn't missed anything important?
                <i className="fa-solid fa-circle-chevron-down faq-chevron" />
              </summary>
              <p className="faq-answer">You shouldn't! This is a living project. If you know of a research direction or topic in societal resilience that should be included but isn't, email nowe.moore@gmail.com.</p>
            </details>
             <details className="faq-item">
              <summary className="faq-question">
                What makes the author qualified to curate these resources?
                <i className="fa-solid fa-circle-chevron-down faq-chevron" />
              </summary>
              <p className="faq-answer">Not much, which is why the author called some of the most well-read and sharp people she knows to rescue. Shout out to Maria Kostylew, Duncan McClemments, Charles Dillon, and others for their thoughtful contributions.</p>
            </details>
          </div>
        </div>
      </section>

      <NodeModal nodeContent={activeNodeContent} onClose={() => setActiveNodeId(null)} />
    </>
  )
}
