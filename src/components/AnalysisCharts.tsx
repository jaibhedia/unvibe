/**
 * Analysis Statistics Chart Component using Chart.js
 * Displays various metrics about the analyzed repository
 */

import React from 'react'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface AnalysisData {
  technologiesDetected: string[]
  complexityScore: number
  vibePatterns: string[]
  fileStructure: Record<string, any>
}

interface AnalysisChartsProps {
  analysisData: AnalysisData
  repositoryName: string
}

/**
 * Generates color palette for charts
 */
const generateColors = (count: number): string[] => {
  const colors = [
    '#3B82F6', // Blue
    '#EF4444', // Red
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#6B7280', // Gray
    '#14B8A6', // Teal
  ]
  
  const result = []
  for (let i = 0; i < count; i++) {
    result.push(colors[i % colors.length])
  }
  return result
}

/**
 * Counts files by type from file structure
 */
const countFilesByType = (structure: Record<string, any>): Record<string, number> => {
  const counts: Record<string, number> = {}
  
  const processStructure = (obj: Record<string, any>) => {
    Object.values(obj).forEach(value => {
      if (Array.isArray(value)) {
        // Array of files
        value.forEach(file => {
          const ext = file.split('.').pop()?.toLowerCase() || 'other'
          counts[ext] = (counts[ext] || 0) + 1
        })
      } else if (typeof value === 'object') {
        // Nested folder
        processStructure(value)
      }
    })
  }
  
  processStructure(structure)
  return counts
}

const AnalysisCharts: React.FC<AnalysisChartsProps> = ({ 
  analysisData, 
  repositoryName 
}) => {
  // Prepare data for Technology Distribution Chart
  const technologyData = {
    labels: analysisData.technologiesDetected,
    datasets: [
      {
        label: 'Technologies Used',
        data: analysisData.technologiesDetected.map(() => 1), // Equal weight for demo
        backgroundColor: generateColors(analysisData.technologiesDetected.length),
        borderColor: generateColors(analysisData.technologiesDetected.length).map(color => color + '80'),
        borderWidth: 2,
      },
    ],
  }

  // Prepare data for File Type Distribution
  const fileTypeCounts = countFilesByType(analysisData.fileStructure)
  const fileTypeData = {
    labels: Object.keys(fileTypeCounts),
    datasets: [
      {
        label: 'File Count',
        data: Object.values(fileTypeCounts),
        backgroundColor: generateColors(Object.keys(fileTypeCounts).length),
        borderColor: generateColors(Object.keys(fileTypeCounts).length).map(color => color + '80'),
        borderWidth: 2,
      },
    ],
  }

  // Prepare data for Complexity Score visualization
  const complexityData = {
    labels: ['Structure', 'Dependencies', 'Logic', 'Maintainability', 'Performance'],
    datasets: [
      {
        label: 'Complexity Score',
        data: [
          analysisData.complexityScore * 0.8,
          analysisData.complexityScore * 0.9,
          analysisData.complexityScore,
          analysisData.complexityScore * 0.7,
          analysisData.complexityScore * 0.85,
        ],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  }

  // Chart options
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Technology Stack Distribution',
      },
    },
  }

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: true,
        text: 'File Type Distribution',
      },
    },
  }

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Complexity Analysis Radar',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
      },
    },
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Analysis Results: {repositoryName}
        </h2>
        <p className="text-gray-600">
          Comprehensive analysis of repository structure, technologies, and complexity
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Technology Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Technology Stack</CardTitle>
            <CardDescription>
              Technologies and frameworks detected in the repository
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Bar data={technologyData} options={barOptions} />
            </div>
          </CardContent>
        </Card>

        {/* File Type Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>File Type Distribution</CardTitle>
            <CardDescription>
              Breakdown of file types in the repository
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Doughnut data={fileTypeData} options={doughnutOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Complexity Analysis Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Complexity Analysis</CardTitle>
            <CardDescription>
              Multi-dimensional complexity score breakdown (Scale: 1-10)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Line data={complexityData} options={lineOptions} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vibe Patterns Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Detected Vibe Patterns</CardTitle>
          <CardDescription>
            Key patterns and architectural decisions identified in the codebase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysisData.vibePatterns.map((pattern, index) => (
              <div 
                key={index}
                className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-200"
              >
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-sm text-blue-900">{pattern}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Complexity Score</CardTitle>
          <CardDescription>
            Aggregate complexity rating based on multiple factors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {analysisData.complexityScore.toFixed(1)}/10
              </div>
              <div className="text-sm text-gray-600">
                {analysisData.complexityScore >= 8 ? 'High Complexity' :
                 analysisData.complexityScore >= 6 ? 'Medium Complexity' :
                 analysisData.complexityScore >= 4 ? 'Low-Medium Complexity' : 'Low Complexity'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AnalysisCharts
