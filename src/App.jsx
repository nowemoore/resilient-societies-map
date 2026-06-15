import { useCallback, useEffect, useState } from 'react'
import {
  ReactFlow,
  Controls,
  MiniMap,
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
}

// ─── graph data ────────────────────────────────────────────────────────────────

const CLICKABLE = new Set(Object.keys(nodeContentById))

// tier 1 = societal resilience, 2 = human/systems, 3 = clickable problems, 4 = leaf context
const rawNodes = [
  // ── top leaf row (human branch +75) ────────────────────────────────────
  { id: 'isolation',             label: 'isolation',              x: -160, y: 235, dominant: false, tier: 4 },
  { id: 'psychosis',             label: 'psychosis',              x: 430,  y: 91,  dominant: false, tier: 4 },
  { id: 'identity',              label: 'identity',               x: 264,  y: 99,  dominant: false, tier: 4 },
  { id: 'deterioration',         label: 'social skill decline',   x: -160, y: 139, dominant: false, tier: 4 },

  // ── upper mid ────────────────────────────────────────────────────────────
  { id: 'social',                label: 'social implications',    x: -10,  y: 215, dominant: true,  tier: 3 },
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
  { id: 'postAGIEconomics',      label: 'post-AGI economics',     x: 940,  y: -55, dominant: false, tier: 4 },

  // ── COP leaves (sys branch -75) ──────────────────────────────────────────
  { id: 'concentrationOfPower',  label: 'concentration of power', x: 1420, y: 157, dominant: false, tier: 4 },
  { id: 'stateCollapse',         label: 'state collapse',         x: 1420, y: 237, dominant: false, tier: 4 },

  // ── bottom leaf row ──────────────────────────────────────────────────────
  { id: 'offloading',            label: 'offloading',             x: -20,  y: 643, dominant: false, tier: 4 },
  { id: 'informationSafety',     label: 'information safety',     x: 168,  y: 643, dominant: false, tier: 4 },
  { id: 'knowledgeCollapse',     label: 'knowledge collapse',     x: 430,  y: 543, dominant: false, tier: 4 },
  { id: 'collectiveCognition',   label: 'collective cognition',   x: 580,  y: 643, dominant: false, tier: 4 },
  { id: 'culture',               label: 'culture',                x: 800,  y: 500, dominant: false, tier: 4 },
]

const rawEdges = [
  ['humanInfluence',        'social',                'left-src', 'bottom-tgt'],

  ['emotionalSafety',       'psychosis',             'top-src',  'bottom-tgt'],
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
  ['systemsInfluence',      'gradualDisempowerment', 'bottom',   'top'],
  ['systemsInfluence',      'politicalImpacts',      'right',    'left'],
  ['politicalImpacts',      'concentrationOfPower',  'right',    'left'],
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
    stroke: 'rgba(255,255,255,0.52)',
    strokeWidth: 1.5,
    ...(tierById[source] === 4 && tierById[target] === 4 ? { strokeDasharray: '5 5' } : {}),
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


const TIMELINE_YEARS = ['2031', '2036', '2056', '2076']

function NodeModal({ nodeContent, onClose }) {
  const [activeTimelineIndex, setActiveTimelineIndex] = useState(0)

  useEffect(() => {
    setActiveTimelineIndex(0)
  }, [nodeContent?.id])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  if (!nodeContent) return null

  const point = nodeContent.timeline[activeTimelineIndex]

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <article
        className="detail-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close details">
          <i className="fa-solid fa-circle-xmark" />
        </button>

        <section className="modal-section">
          <p className="section-kicker">Problem overview</p>
          <h2 id="modal-title">{nodeContent.title}</h2>
          <p className="overview-copy">{nodeContent.overview}</p>
        </section>

        <section className="modal-section">
          <p className="section-kicker">Timeline</p>
          <div className="timeline-track" role="tablist">
            {nodeContent.timeline.map((pt, i) => (
              <button
                key={pt.title}
                type="button"
                role="tab"
                aria-selected={i === activeTimelineIndex}
                className={`timeline-dot${i === activeTimelineIndex ? ' is-active' : ''}`}
                onClick={() => setActiveTimelineIndex(i)}
              >
                <span className="timeline-dot-marker" />
                <span className="timeline-year">{TIMELINE_YEARS[i]}</span>
              </button>
            ))}
          </div>
          <div className="timeline-detail">
            <h3>{point.title}</h3>
            <p>{point.text}</p>
          </div>
        </section>

        <section className="modal-section">
          <p className="section-kicker">Resource hub</p>
          <div className="resource-grid">
            <div>
              <h3>Must-reads</h3>
              <ul>{nodeContent.resources.mustReads.map((item, i) => <li key={i}>{item}</li>)}</ul>
            </div>
            <div>
              <h3>People and orgs</h3>
              <ul>{nodeContent.resources.people.map((item, i) => <li key={i}>{item}</li>)}</ul>
            </div>
            <div>
              <h3>Open questions</h3>
              <ul>{nodeContent.resources.openQuestions.map((item, i) => <li key={i}>{item}</li>)}</ul>
            </div>
          </div>
        </section>
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
          <p className="page-description">
            Drag to pan · Wheel to zoom · Click a highlighted node to open its briefing
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
            proOptions={{ hideAttribution: true }}
            defaultEdgeOptions={{ pathOptions: { curvature: 0.7 } }}
          >
            <Controls
              showInteractive={false}
              style={{
                background: 'rgba(14,17,23,0.82)',
                border: '1px solid rgba(255,255,255,0.14)',
                borderRadius: 10,
              }}
            />
            <MiniMap
              nodeColor={(n) =>
                n.data.dominant ? 'rgba(255,255,255,0.85)' : 'rgba(120,128,140,0.7)'
              }
              maskColor="rgba(7,9,14,0.74)"
              style={{ background: 'rgba(10,13,18,0.82)', borderRadius: 10 }}
            />
          </ReactFlow>
        </div>
      </div>

      <NodeModal nodeContent={activeNodeContent} onClose={() => setActiveNodeId(null)} />
    </>
  )
}
