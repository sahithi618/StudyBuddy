"use client"
import { useMemo, useState, useCallback } from "react"
import ReactFlow, { 
  MiniMap, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState,
  addEdge,
  Handle,
  Position
} from "reactflow"
import "reactflow/dist/style.css"

const CustomNode = ({ data, selected }) => {
  const isCenter = data.isCenter
  
  return (
    <div
      className={`
        px-4 py-3 rounded-xl shadow-lg transition-all duration-300 cursor-pointer
        ${isCenter 
          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-lg min-w-[140px] text-center' 
          : selected
            ? 'bg-white border-2 border-purple-400 shadow-xl transform scale-105'
            : 'bg-white border border-gray-200 hover:border-purple-300 hover:shadow-md'
        }
        ${!isCenter && 'max-w-[280px]'}
      `}
      style={{ 
        wordWrap: 'break-word',
        lineHeight: '1.4'
      }}
    >
      {!isCenter && <Handle type="target" position={Position.Top} />}
      <div className={`${isCenter ? 'text-center' : 'text-sm text-gray-700'}`}>
        {data.label}
      </div>
      {isCenter && <Handle type="source" position={Position.Bottom} />}
    </div>
  )
}

const nodeTypes = {
  customNode: CustomNode,
}

export default function Mindmap({ summarization }) {
  const [selectedNode, setSelectedNode] = useState(null)
  const [expandedNodes, setExpandedNodes] = useState(new Set())

  const points = useMemo(() => {
    if (!summarization?.summary) return []

    let rawPoints = summarization.summary
      .split(/(?<=[.?!])\s+|\n+/)
      .map(s => s.trim())
      .filter(s => s.length > 10 && !s.match(/^[^a-zA-Z]*$/)) 
      .slice(0, 12) 

    return rawPoints
  }, [summarization])

  const { nodes, edges } = useMemo(() => {
    if (points.length === 0) return { nodes: [], edges: [] }

    const centerNode = {
      id: "center",
      type: "customNode",
      data: { 
        label: summarization?.title || "Summary Overview",
        isCenter: true 
      },
      position: { x: 400, y: 100 },
      draggable: true,
    }

    const radius = Math.max(200, points.length * 25)
    const angleStep = (2 * Math.PI) / points.length
    
    const pointNodes = points.map((point, i) => {
      const angle = i * angleStep - Math.PI / 2 
      const x = 400 + radius * Math.cos(angle)
      const y = 300 + radius * Math.sin(angle)

      return {
        id: `point-${i}`,
        type: "customNode",
        data: { 
          label: point.length > 120 ? point.substring(0, 120) + "..." : point,
          fullText: point,
          isCenter: false
        },
        position: { x: x - 140, y }, 
        draggable: true,
      }
    })

    const nodeArray = [centerNode, ...pointNodes]

    const edgeArray = points.map((_, i) => ({
      id: `edge-${i}`,
      source: "center",
      target: `point-${i}`,
      animated: true,
      style: { 
        stroke: "#8b5cf6",
        strokeWidth: 2,
      },
      type: "smoothstep",
    }))

    return { nodes: nodeArray, edges: edgeArray }
  }, [points, summarization])

  const [reactFlowNodes, setNodes, onNodesChange] = useNodesState(nodes)
  const [reactFlowEdges, setEdges, onEdgesChange] = useEdgesState(edges)

  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge(params, eds))
  }, [setEdges])

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node.id === selectedNode ? null : node.id)
    
    if (node.data.fullText && node.data.fullText !== node.data.label) {
      console.log("Full text:", node.data.fullText)
    }
  }, [selectedNode])

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  const updatedNodes = useMemo(() => {
    return reactFlowNodes.map(node => ({
      ...node,
      selected: node.id === selectedNode
    }))
  }, [reactFlowNodes, selectedNode])

  if (points.length === 0) {
    return (
      <div className="h-[600px] w-full border rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="text-lg font-medium mb-2">No Summary Available</div>
          <div className="text-sm">Provide a summarization to generate the mindmap</div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[600px] w-full border rounded-lg overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50">
      <ReactFlow
        nodes={updatedNodes}
        edges={reactFlowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{
          padding: 0.2,
          minZoom: 0.3,
          maxZoom: 1.2
        }}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        minZoom={0.2}
        maxZoom={2}
        attributionPosition="bottom-left"
      >
        <MiniMap 
          style={{
            height: 100,
            width: 150,
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0"
          }}
          nodeColor={(node) => node.data.isCenter ? "#8b5cf6" : "#ffffff"}
          maskColor="rgba(139, 92, 246, 0.1)"
        />
        <Controls 
          style={{
            button: {
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              color: "#374151"
            }
          }}
        />
        <Background 
          gap={20} 
          size={1}
          color="#e2e8f0"
          variant="dots"
        />
      </ReactFlow>

      {selectedNode && (
        <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-lg border max-w-sm z-10">
          <div className="text-sm font-medium text-gray-900 mb-2">Selected Point</div>
          <div className="text-sm text-gray-600">
            {reactFlowNodes.find(n => n.id === selectedNode)?.data.fullText || 
             reactFlowNodes.find(n => n.id === selectedNode)?.data.label}
          </div>
          <button 
            onClick={() => setSelectedNode(null)}
            className="mt-2 text-xs text-purple-600 hover:text-purple-800"
          >
            Close
          </button>
        </div>
      )}

      <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-sm border text-sm">
        <div className="text-gray-600">
          <div><strong>{points.length}</strong> key points</div>
          <div className="text-xs text-gray-400 mt-1">Click nodes to expand</div>
        </div>
      </div>
    </div>
  )
}