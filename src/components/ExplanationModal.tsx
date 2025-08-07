/**
 * Explanation Modal Component
 * Provides detailed explanations about the platform, analysis, and Vibe patterns
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

interface ExplanationModalProps {
  isOpen: boolean;
  type: 'platform' | 'analysis' | 'vibe' | null;
  onClose: () => void;
}

const explanationContent = {
  platform: {
    title: "About unvibe Platform",
    description: "A comprehensive tool for analyzing and understanding code repositories",
    content: (
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-blue-600 mb-2">Purpose</h4>
          <p className="text-gray-700 leading-relaxed">
            The unvibe platform helps developers analyze Git repositories to understand 
            code structure, detect technologies, and identify patterns. It's designed to provide 
            comprehensive insights into any codebase.
          </p>
        </div>
        
        <div>
          <h4 className="font-semibold text-blue-600 mb-2">Features</h4>
          <ul className="text-gray-700 space-y-1">
            <li>• Repository structure visualization</li>
            <li>• Technology stack detection</li>
            <li>• Code complexity analysis</li>
            <li>• Pattern recognition</li>
            <li>• Performance recommendations</li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold text-blue-600 mb-2">How to Use</h4>
          <ol className="text-gray-700 space-y-1">
            <li>1. Submit a Git repository URL</li>
            <li>2. Wait for analysis to complete</li>
            <li>3. Explore the results and insights</li>
            <li>4. Download reports or share findings</li>
          </ol>
        </div>
      </div>
    )
  },
  
  analysis: {
    title: "Understanding Analysis Results",
    description: "Learn how to interpret the analysis data and metrics",
    content: (
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-blue-600 mb-2">Metrics Explained</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <strong className="text-blue-800">Complexity Score:</strong> 
              <span className="text-gray-700"> Measures code complexity (0-100)</span>
            </div>
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <strong className="text-green-800">File Structure:</strong> 
              <span className="text-gray-700"> Directory tree and organization</span>
            </div>
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <strong className="text-purple-800">Technologies:</strong> 
              <span className="text-gray-700"> Detected frameworks and libraries</span>
            </div>
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <strong className="text-orange-800">Patterns:</strong> 
              <span className="text-gray-700"> Architectural and design patterns found</span>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold text-blue-600 mb-2">Visualization Types</h4>
          <ul className="text-gray-700 space-y-1">
            <li>• <strong>Tree View:</strong> Hierarchical file structure</li>
            <li>• <strong>Charts:</strong> Technology distribution and metrics</li>
            <li>• <strong>Flow Diagrams:</strong> Architecture patterns</li>
            <li>• <strong>Heatmaps:</strong> Code complexity distribution</li>
          </ul>
        </div>
      </div>
    )
  },
  
  vibe: {
    title: "What are Vibe Patterns?",
    description: "Understanding the unique pattern detection system",
    content: (
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-blue-600 mb-2">Vibe Patterns Defined</h4>
          <p className="text-gray-700 leading-relaxed">
            Vibe patterns are unique architectural and coding patterns that represent the "vibe" 
            or characteristic style of a codebase. They help identify the development approach, 
            team preferences, and project maturity.
          </p>
        </div>
        
        <div>
          <h4 className="font-semibold text-blue-600 mb-2">Pattern Categories</h4>
          <div className="grid gap-3">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <strong className="text-green-700">Architectural Patterns:</strong>
              <span className="text-gray-700 ml-2">MVC, Microservices, Monolith</span>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <strong className="text-blue-700">Design Patterns:</strong>
              <span className="text-gray-700 ml-2">Singleton, Factory, Observer</span>
            </div>
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <strong className="text-purple-700">Code Style Patterns:</strong>
              <span className="text-gray-700 ml-2">Functional, OOP, Procedural</span>
            </div>
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <strong className="text-orange-700">Project Patterns:</strong>
              <span className="text-gray-700 ml-2">Testing approach, Documentation style</span>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold text-blue-600 mb-2">Why It Matters</h4>
          <ul className="text-gray-700 space-y-1">
            <li>• Understand project architecture quickly</li>
            <li>• Identify best practices and anti-patterns</li>
            <li>• Make informed refactoring decisions</li>
            <li>• Learn from other codebases</li>
          </ul>
        </div>
      </div>
    )
  }
};

const ExplanationModal: React.FC<ExplanationModalProps> = ({ isOpen, type, onClose }) => {
  if (!isOpen || !type) return null;

  const content = explanationContent[type];

  return (
    <div className="fixed inset-0 bg-white/20 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto bg-white/95 backdrop-blur-lg shadow-2xl border border-white/30">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-white/90 backdrop-blur-sm border-b border-gray-200/50">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl font-bold text-gray-900">{content.title}</CardTitle>
            <CardDescription className="mt-2 text-gray-600">{content.description}</CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="ml-4 hover:bg-gray-100/80 text-gray-500 hover:text-gray-700"
            title="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </CardHeader>
        <CardContent className="pt-4 bg-white/90 backdrop-blur-sm text-gray-900">
          {content.content}
          <div className="mt-6 flex justify-end">
            <Button 
              onClick={onClose} 
              variant="outline"
              className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700"
            >
              Got it!
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExplanationModal;
