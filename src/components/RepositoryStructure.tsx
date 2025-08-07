/**
 * Repository Structure Visualizer using React Flow
 * Displays the file structure and dependencies of analyzed repositories
 */

import React, { useCallback, useMemo } from 'react'
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  Panel,
} from 'reactflow'
import type { Node, Edge, Connection } from 'reactflow'
import 'reactflow/dist/style.css'

interface RepositoryStructureProps {
  fileStructure: Record<string, any>
  repositoryName: string
}

/**
 * Converts file structure object to React Flow nodes and edges
 */
const convertToFlowData = (structure: Record<string, any>, repoName: string) => {
  const nodes: Node[] = []
  const edges: Edge[] = []
  let nodeId = 0

  // Add root node
  nodes.push({
    id: 'root',
    type: 'default',
    position: { x: 250, y: 50 },
    data: { 
      label: repoName,
      style: { background: '#4F46E5', color: 'white', fontWeight: 'bold' }
    },
    style: { background: '#4F46E5', color: 'white', fontWeight: 'bold' }
  })

  /**
   * Recursively processes file structure to create nodes and edges
   */
  const processStructure = (
    obj: Record<string, any>, 
    parentId: string, 
    level: number = 1, 
    xOffset: number = 0
  ) => {
    const keys = Object.keys(obj)
    const itemsPerLevel = Math.max(3, keys.length)
    const spacing = 200

    keys.forEach((key, index) => {
      nodeId++
      const currentId = `node-${nodeId}`
      
      const x = (index - (keys.length - 1) / 2) * spacing + xOffset
      const y = level * 120

      // Determine node type and style based on content
      const isFolder = typeof obj[key] === 'object' && !Array.isArray(obj[key])
      const isFileArray = Array.isArray(obj[key])
      
      let nodeStyle = { background: '#f3f4f6', color: '#374151' }
      let nodeType = 'default'
      
      if (isFolder) {
        nodeStyle = { background: '#FEF3C7', color: '#92400E' }
      } else if (isFileArray) {
        nodeStyle = { background: '#DBEAFE', color: '#1E40AF' }
      } else if (key.endsWith('.tsx') || key.endsWith('.ts')) {
        nodeStyle = { background: '#ECFDF5', color: '#065F46' }
      } else if (key.endsWith('.css') || key.endsWith('.scss')) {
        nodeStyle = { background: '#FDF2F8', color: '#9D174D' }
      }

      // Create node
      nodes.push({
        id: currentId,
        type: nodeType,
        position: { x, y },
        data: { 
          label: key,
          style: nodeStyle
        },
        style: nodeStyle
      })

      // Create edge from parent to current node
      edges.push({
        id: `edge-${parentId}-${currentId}`,
        source: parentId,
        target: currentId,
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#6B7280' }
      })

      // If current item is a folder, recursively process its contents
      if (isFolder) {
        processStructure(obj[key], currentId, level + 1, x)
      }
      
      // If current item is an array of files, create child nodes for each file
      if (isFileArray) {
        obj[key].forEach((file: string, fileIndex: number) => {
          nodeId++
          const fileNodeId = `file-${nodeId}`
          
          const fileX = x + (fileIndex - (obj[key].length - 1) / 2) * 100
          const fileY = (level + 1) * 120

          let fileStyle = { background: '#F3F4F6', color: '#374151' }
          if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            fileStyle = { background: '#ECFDF5', color: '#065F46' }
          } else if (file.endsWith('.css')) {
            fileStyle = { background: '#FDF2F8', color: '#9D174D' }
          }

          nodes.push({
            id: fileNodeId,
            type: 'default',
            position: { x: fileX, y: fileY },
            data: { 
              label: file,
              style: fileStyle
            },
            style: fileStyle
          })

          edges.push({
            id: `edge-${currentId}-${fileNodeId}`,
            source: currentId,
            target: fileNodeId,
            type: 'smoothstep',
            animated: false,
            style: { stroke: '#9CA3AF' }
          })
        })
      }
    })
  }

  processStructure(structure, 'root')
  return { nodes, edges }
}

const RepositoryStructure: React.FC<RepositoryStructureProps> = ({ 
  fileStructure, 
  repositoryName 
}) => {
  // Convert file structure to flow data
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => convertToFlowData(fileStructure, repositoryName),
    [fileStructure, repositoryName]
  )

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  /**
   * Handles new connections between nodes
   */
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  return (
    <div className="w-full h-96 border border-gray-200 rounded-lg bg-white">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        attributionPosition="bottom-left"
      >
        <Controls />
        <MiniMap 
          style={{
            height: 120,
            backgroundColor: '#f8f9fa'
          }}
          zoomable
          pannable
        />
        <Background color="#aaa" gap={16} />
        <Panel position="top-left">
          <div className="bg-white p-3 rounded-lg shadow-md">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              Repository Structure: {repositoryName}
            </h3>
            <div className="text-xs text-gray-600 space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-200 rounded"></div>
                <span>Folders</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-200 rounded"></div>
                <span>File Groups</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-200 rounded"></div>
                <span>TypeScript/React</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-pink-200 rounded"></div>
                <span>Styles</span>
              </div>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  )
}

export default RepositoryStructure
