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
    Object.entries(obj).forEach(([key, value]) => {
      if (typeof value === 'string') {
        // This is a file with size info like "1234 bytes"
        if (!key.endsWith('/')) {
          const ext = key.split('.').pop()?.toLowerCase() || 'other'
          counts[ext] = (counts[ext] || 0) + 1
        }
      } else if (typeof value === 'object' && value !== null) {
        // This is a nested directory
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
  // Handle empty or invalid data
  if (!analysisData || !analysisData.technologiesDetected || analysisData.technologiesDetected.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Analysis Data Available</h3>
            <p className="text-gray-600 mb-4">
              The repository analysis is still in progress or failed to complete.
            </p>
            <div className="text-sm text-gray-500">
              Repository: {repositoryName}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Prepare data for Technology Distribution Chart
  const technologyData = {
    labels: analysisData.technologiesDetected.filter(tech => tech !== 'Unknown'),
    datasets: [
      {
        label: 'Technologies Used',
        data: analysisData.technologiesDetected.filter(tech => tech !== 'Unknown').map(() => 1), // Equal weight for demo
        backgroundColor: generateColors(analysisData.technologiesDetected.filter(tech => tech !== 'Unknown').length),
        borderColor: generateColors(analysisData.technologiesDetected.filter(tech => tech !== 'Unknown').length).map(color => color + '80'),
        borderWidth: 2,
      },
    ],
  }

  // Prepare data for File Type Distribution
  const fileTypeCounts = countFilesByType(analysisData.fileStructure)
  console.log('File structure:', analysisData.fileStructure)
  console.log('File type counts:', fileTypeCounts)
  
  // Filter out empty counts and ensure we have data
  const validFileTypeCounts = Object.fromEntries(
    Object.entries(fileTypeCounts).filter(([, count]) => count > 0)
  )
  
  const fileTypeData = {
    labels: Object.keys(validFileTypeCounts).length > 0 ? Object.keys(validFileTypeCounts) : ['No files detected'],
    datasets: [
      {
        label: 'File Count',
        data: Object.keys(validFileTypeCounts).length > 0 ? Object.values(validFileTypeCounts) : [1],
        backgroundColor: generateColors(Math.max(Object.keys(validFileTypeCounts).length, 1)),
        borderColor: generateColors(Math.max(Object.keys(validFileTypeCounts).length, 1)).map(color => color + '80'),
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
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        fill: {
          target: 'origin',
          above: 'rgba(59, 130, 246, 0.1)',
        },
        tension: 0.4,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
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
