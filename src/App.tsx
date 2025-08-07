import { useState, useEffect } from 'react'
import Header from './components/Header'
import RepositoryForm from './components/RepositoryForm'
import RepositoryStructure from './components/RepositoryStructure'
import AnalysisCharts from './components/AnalysisCharts'
import ExplanationModal from './components/ExplanationModal'
import CodeChatbot from './components/CodeChatbot'
import FloatingChatbotButton from './components/FloatingChatbotButton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Button } from './components/ui/button'
import { apiService } from './services/apiService'
import './globals.css'

interface Repository {
  id: string
  url: string
  name: string
  description?: string
  analysis_status: string
  created_at: string
  updated_at: string
}

interface Analysis {
  id: string
  repository_id: string
  file_structure: Record<string, unknown>
  technologies_detected: string[]
  complexity_score: number
  vibe_patterns: string[]
  recommendations: string[]
  created_at: string
}

function App() {
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [selectedRepository, setSelectedRepository] = useState<Repository | null>(null)
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Navigation state
  const [activeView, setActiveView] = useState<'dashboard' | 'repositories' | 'analyses' | 'documentation'>('dashboard')
  const [showExplanation, setShowExplanation] = useState(false)
  const [explanationType, setExplanationType] = useState<'platform' | 'analysis' | 'vibe' | null>(null)
  
  // Chatbot state
  const [showChatbot, setShowChatbot] = useState(false)

  /**
   * Handles navigation between different views
   */
  const handleNavigation = (view: 'dashboard' | 'repositories' | 'analyses' | 'documentation') => {
    setActiveView(view);
    console.log(`Navigating to ${view}`);
  };

    /**
   * Shows explanation modal for different topics
   */
  const handleShowExplanation = (type: 'platform' | 'analysis' | 'vibe') => {
    setExplanationType(type);
    setShowExplanation(true);
    console.log(`Showing explanation for ${type}`);
  };

  /**
   * Closes the explanation modal
   */
  const handleCloseExplanation = () => {
    setShowExplanation(false);
    setExplanationType(null);
  };

  /**
   * Toggles the chatbot visibility
   */
  const handleToggleChatbot = () => {
    setShowChatbot(!showChatbot);
    console.log(`Chatbot ${!showChatbot ? 'opened' : 'closed'}`);
  };

  /**
   * Calculates header stats from current data
   */
  const calculateStats = () => {
    const total = repositories.length;
    const completed = repositories.filter(repo => repo.analysis_status === 'completed').length;
    const analyzing = repositories.filter(repo => repo.analysis_status === 'analyzing').length;
    const pending = repositories.filter(repo => repo.analysis_status === 'pending').length;
    const failed = repositories.filter(repo => repo.analysis_status === 'failed').length;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    return { total, completed, analyzing, pending, failed, completionRate };
  };

  /**
   * Fetches repositories from the backend API
   */
  const fetchRepositories = async () => {
    try {
      const data = await apiService.getRepositories()
      setRepositories(data)
    } catch (err) {
      console.error('Error fetching repositories:', err)
      setError('Failed to load repositories')
    }
  }

  /**
   * Fetches analyses from the backend API
   */
  const fetchAnalyses = async () => {
    try {
      const data = await apiService.getAnalyses()
      setAnalyses(data)
    } catch (err) {
      console.error('Error fetching analyses:', err)
      setError('Failed to load analyses')
    }
  }

  /**
   * Submits a new repository for analysis
   */
  const handleRepositorySubmit = async (formData: { url: string; name: string; description: string }) => {
    setIsLoading(true)
    setError(null)

    try {
      const newRepository = await apiService.createRepository(formData)
      setRepositories(prev => [...prev, newRepository])
      
      // Start polling for analysis results
      pollForAnalysis(newRepository.id)
      
    } catch (err) {
      console.error('Error submitting repository:', err)
      setError('Failed to submit repository. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Polls for analysis completion
   */
  const pollForAnalysis = (repositoryId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const analysisData = await apiService.getAnalysesByRepository(repositoryId)
        if (analysisData.length > 0) {
          setAnalyses(prev => [...prev.filter(a => a.repository_id !== repositoryId), ...analysisData])
          clearInterval(pollInterval)
          fetchRepositories() // Refresh repository status
        }
      } catch (err) {
        console.error('Error polling for analysis:', err)
        clearInterval(pollInterval)
        fetchRepositories()
      }
    }, 1000)
  }

  /**
   * Selects a repository and its associated analysis
   */
  const selectRepository = (repository: Repository) => {
    setSelectedRepository(repository)
    const analysis = analyses.find(a => a.repository_id === repository.id)
    setSelectedAnalysis(analysis || null)
  }

  /**
   * Renders content based on active view
   */
  const renderActiveView = () => {
    switch (activeView) {
      case 'repositories':
        return (
          <div className="space-y-6">
            {/* Header with Add New Repository */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Repository History</h2>
                <p className="text-muted-foreground">All submitted repositories and their analysis status</p>
              </div>
              <Button
                onClick={() => handleNavigation('dashboard')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Repository
              </Button>
            </div>

            {/* Repository History List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  All Repositories ({repositories.length})
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {repositories.filter(r => r.analysis_status === 'completed').length} completed
                    </span>
                    <Button
                      onClick={() => handleShowExplanation('platform')}
                      variant="ghost"
                      size="sm"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Help
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>Complete history of repository submissions with timestamps and status</CardDescription>
              </CardHeader>
              <CardContent>
                {repositories.length > 0 ? (
                  <div className="space-y-4">
                    {repositories.map((repo) => (
                      <div key={repo.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3">
                              <h3 className="font-semibold text-lg">{repo.name}</h3>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                repo.analysis_status === 'completed' ? 'bg-green-100 text-green-800' :
                                repo.analysis_status === 'analyzing' ? 'bg-yellow-100 text-yellow-800' :
                                repo.analysis_status === 'failed' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {repo.analysis_status}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 break-all">{repo.url}</p>
                            {repo.description && (
                              <p className="text-sm text-gray-600 mt-1">{repo.description}</p>
                            )}
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-2">
                              <span>Created: {new Date(repo.created_at).toLocaleDateString()} {new Date(repo.created_at).toLocaleTimeString()}</span>
                              <span>Updated: {new Date(repo.updated_at).toLocaleDateString()} {new Date(repo.updated_at).toLocaleTimeString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            {repo.analysis_status === 'completed' && (
                              <Button
                                onClick={() => {
                                  selectRepository(repo);
                                  handleNavigation('analyses');
                                }}
                                variant="default"
                                size="sm"
                              >
                                View Analysis
                              </Button>
                            )}
                            {repo.analysis_status === 'analyzing' && (
                              <Button
                                variant="outline"
                                size="sm"
                                disabled
                              >
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                                Analyzing...
                              </Button>
                            )}
                            {repo.analysis_status === 'failed' && (
                              <Button
                                onClick={() => {
                                  // Retry analysis
                                  setIsLoading(true);
                                  handleRepositorySubmit({ 
                                    url: repo.url, 
                                    name: repo.name, 
                                    description: repo.description || '' 
                                  });
                                }}
                                variant="outline"
                                size="sm"
                              >
                                Retry Analysis
                              </Button>
                            )}
                            <Button
                              onClick={() => selectRepository(repo)}
                              variant="ghost"
                              size="sm"
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No repositories yet</h3>
                    <p className="text-gray-500 mb-4">Get started by adding your first repository for analysis</p>
                    <Button
                      onClick={() => handleNavigation('dashboard')}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Add Your First Repository
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
        
      case 'analyses':
        return (
          <div className="space-y-6">
            {/* Header with Navigation */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Analysis Results</h2>
                <p className="text-muted-foreground">
                  {selectedRepository ? `Detailed analysis for ${selectedRepository.name}` : 'Select a repository to view analysis'}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => handleNavigation('repositories')}
                  variant="outline"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Back to Repositories
                </Button>
                <Button
                  onClick={() => handleShowExplanation('analysis')}
                  variant="ghost"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Help
                </Button>
              </div>
            </div>

            {/* Repository Selection */}
            {analyses.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Available Analyses ({analyses.length})</CardTitle>
                  <CardDescription>Select a repository to view its detailed analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {analyses.map((analysis) => {
                      const repo = repositories.find(r => r.id === analysis.repository_id);
                      const isSelected = selectedAnalysis?.id === analysis.id;
                      return (
                        <div 
                          key={analysis.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                            isSelected ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'
                          }`}
                          onClick={() => {
                            if (repo) selectRepository(repo);
                          }}
                        >
                          <h3 className="font-semibold text-lg mb-2">{repo?.name || 'Unknown Repository'}</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Complexity:</span>
                              <span className={`font-medium ${
                                analysis.complexity_score > 70 ? 'text-red-600' :
                                analysis.complexity_score > 40 ? 'text-yellow-600' :
                                'text-green-600'
                              }`}>
                                {analysis.complexity_score}/100
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Technologies:</span>
                              <span className="font-medium">{analysis.technologies_detected.length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Patterns:</span>
                              <span className="font-medium">{analysis.vibe_patterns.length}</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-3">
                            {analysis.technologies_detected.slice(0, 3).map((tech, idx) => (
                              <span key={idx} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                {tech}
                              </span>
                            ))}
                            {analysis.technologies_detected.length > 3 && (
                              <span className="text-xs text-muted-foreground self-center">+{analysis.technologies_detected.length - 3}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Detailed Analysis View */}
            {selectedAnalysis && selectedRepository ? (
              <div className="space-y-6">
                {/* Repository Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle>Repository Overview</CardTitle>
                    <CardDescription>{selectedRepository.name}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-2">Repository URL</h4>
                      <p className="text-sm break-all bg-gray-50 p-2 rounded">{selectedRepository.url}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-2">Analysis Status</h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedRepository.analysis_status === 'completed' ? 'bg-green-100 text-green-800' :
                        selectedRepository.analysis_status === 'analyzing' ? 'bg-yellow-100 text-yellow-800' :
                        selectedRepository.analysis_status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedRepository.analysis_status}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-2">Analysis Date</h4>
                      <p className="text-sm">{new Date(selectedRepository.updated_at).toLocaleDateString()} {new Date(selectedRepository.updated_at).toLocaleTimeString()}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-2">Key Metrics</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <div className="font-bold text-lg">{selectedAnalysis.complexity_score}</div>
                          <div className="text-xs text-muted-foreground">Complexity</div>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <div className="font-bold text-lg">{selectedAnalysis.technologies_detected.length}</div>
                          <div className="text-xs text-muted-foreground">Technologies</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Analysis Charts */}
                <Card>
                  <CardHeader>
                    <CardTitle>Detailed Analysis</CardTitle>
                    <CardDescription>Comprehensive breakdown of technologies, complexity, and patterns</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AnalysisCharts 
                      analysisData={{
                        technologiesDetected: selectedAnalysis.technologies_detected,
                        complexityScore: selectedAnalysis.complexity_score,
                        vibePatterns: selectedAnalysis.vibe_patterns,
                        fileStructure: selectedAnalysis.file_structure
                      }}
                      repositoryName={selectedRepository.name}
                    />
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Analysis Selected</h3>
                  <p className="text-gray-500 mb-4">
                    {analyses.length === 0 
                      ? 'No completed analyses available. Submit a repository for analysis first.'
                      : 'Select a repository from the list above to view its detailed analysis.'
                    }
                  </p>
                  <Button
                    onClick={() => handleNavigation('dashboard')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Go to Dashboard
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        );
        
      case 'documentation':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Documentation</CardTitle>
                <CardDescription>Learn how to use the platform effectively</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    onClick={() => handleShowExplanation('platform')}
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center space-y-2"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span>Platform Guide</span>
                  </Button>
                  
                  <Button
                    onClick={() => handleShowExplanation('analysis')}
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center space-y-2"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span>Analysis Guide</span>
                  </Button>
                  
                  <Button
                    onClick={() => handleShowExplanation('vibe')}
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center space-y-2"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span>Vibe Patterns</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
        
      default: // 'dashboard'
        return (
          <div className="space-y-8">
            {/* Repository Form Section */}
            <div className="space-y-6">
              {/* Submit New Repository */}
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Analyze Repository
                    <Button
                      onClick={() => handleShowExplanation('platform')}
                      variant="ghost"
                      size="sm"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        How it works
                      </Button>
                    </CardTitle>
                    <CardDescription>Submit a Git repository URL for comprehensive analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RepositoryForm onSubmit={handleRepositorySubmit} isLoading={isLoading} />
                  </CardContent>
                </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Repositories</span>
                      <span className="font-semibold">{repositories.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Completed Analyses</span>
                      <span className="font-semibold text-green-600">
                        {repositories.filter(r => r.analysis_status === 'completed').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">In Progress</span>
                      <span className="font-semibold text-yellow-600">
                        {repositories.filter(r => r.analysis_status === 'analyzing').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Success Rate</span>
                      <span className="font-semibold text-blue-600">
                        {repositories.length > 0 
                          ? Math.round((repositories.filter(r => r.analysis_status === 'completed').length / repositories.length) * 100)
                          : 0}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
            </div>

            {/* Recent Activity Section */}
            <div className="space-y-6">
              {/* Recent Repositories */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Recent Repositories
                    <Button
                      onClick={() => handleNavigation('repositories')}
                      variant="outline"
                      size="sm"
                    >
                      View All
                    </Button>
                  </CardTitle>
                  <CardDescription>Latest repository submissions and their status</CardDescription>
                </CardHeader>
                <CardContent>
                  {repositories.length > 0 ? (
                    <div className="space-y-3">
                      {repositories.slice(0, 4).map((repo) => (
                        <div key={repo.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{repo.name}</h4>
                            <p className="text-sm text-muted-foreground truncate">{repo.url}</p>
                            <div className="flex items-center mt-1">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                repo.analysis_status === 'completed' ? 'bg-green-100 text-green-800' :
                                repo.analysis_status === 'analyzing' ? 'bg-yellow-100 text-yellow-800' :
                                repo.analysis_status === 'failed' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {repo.analysis_status}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-3">
                            {repo.analysis_status === 'completed' && (
                              <Button
                                onClick={() => {
                                  selectRepository(repo);
                                  handleNavigation('analyses');
                                }}
                                variant="outline"
                                size="sm"
                              >
                                View Analysis
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="font-medium">No repositories analyzed yet</p>
                      <p className="text-sm">Submit a repository URL above to get started</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Analyses */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Recent Analyses
                    <Button
                      onClick={() => handleNavigation('analyses')}
                      variant="outline"
                      size="sm"
                    >
                      View All
                    </Button>
                  </CardTitle>
                  <CardDescription>Latest completed repository analyses</CardDescription>
                </CardHeader>
                <CardContent>
                  {analyses.length > 0 ? (
                    <div className="space-y-3">
                      {analyses.slice(0, 4).map((analysis) => {
                        const repo = repositories.find(r => r.id === analysis.repository_id);
                        return (
                          <div key={analysis.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate">{repo?.name || 'Unknown Repository'}</h4>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                                <span>Complexity: {analysis.complexity_score}/100</span>
                                <span>{analysis.technologies_detected.length} techs</span>
                              </div>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {analysis.technologies_detected.slice(0, 3).map((tech, idx) => (
                                  <span key={idx} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                    {tech}
                                  </span>
                                ))}
                                {analysis.technologies_detected.length > 3 && (
                                  <span className="text-xs text-muted-foreground">+{analysis.technologies_detected.length - 3} more</span>
                                )}
                              </div>
                            </div>
                            <Button
                              onClick={() => {
                                if (repo) selectRepository(repo);
                                handleNavigation('analyses');
                              }}
                              variant="outline"
                              size="sm"
                              className="ml-3"
                            >
                              View Details
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="font-medium">No analyses completed yet</p>
                      <p className="text-sm">Complete repository analysis to see results here</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Current Selection Details */}
            {selectedRepository && selectedAnalysis && (
              <div className="space-y-6">
                {/* Repository Structure Visualization */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Repository Structure: {selectedRepository.name}
                      <Button
                        onClick={() => handleNavigation('analyses')}
                        variant="outline"
                        size="sm"
                      >
                        Full Analysis
                      </Button>
                    </CardTitle>
                    <CardDescription>Interactive file hierarchy and organization overview</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RepositoryStructure 
                      fileStructure={selectedAnalysis.file_structure}
                      repositoryName={selectedRepository.name}
                    />
                  </CardContent>
                </Card>

                {/* Analysis Charts Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Analysis Preview
                      <Button
                        onClick={() => {
                          handleShowExplanation('analysis');
                        }}
                        variant="ghost"
                        size="sm"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Explain
                      </Button>
                    </CardTitle>
                    <CardDescription>Key metrics and technology insights</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AnalysisCharts 
                      analysisData={{
                        technologiesDetected: selectedAnalysis.technologies_detected,
                        complexityScore: selectedAnalysis.complexity_score,
                        vibePatterns: selectedAnalysis.vibe_patterns,
                        fileStructure: selectedAnalysis.file_structure
                      }}
                      repositoryName={selectedRepository.name}
                    />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleNavigation('repositories')}>
                <CardContent className="flex items-center justify-center p-6">
                  <div className="text-center">
                    <svg className="w-8 h-8 mx-auto mb-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <h3 className="font-semibold">Repositories</h3>
                    <p className="text-sm text-muted-foreground">Manage all repositories</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleNavigation('analyses')}>
                <CardContent className="flex items-center justify-center p-6">
                  <div className="text-center">
                    <svg className="w-8 h-8 mx-auto mb-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <h3 className="font-semibold">Analyses</h3>
                    <p className="text-sm text-muted-foreground">View all results</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleShowExplanation('platform')}>
                <CardContent className="flex items-center justify-center p-6">
                  <div className="text-center">
                    <svg className="w-8 h-8 mx-auto mb-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <h3 className="font-semibold">Learn More</h3>
                    <p className="text-sm text-muted-foreground">Platform documentation</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      await fetchRepositories()
      await fetchAnalyses()
    }
    
    loadData()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header 
        stats={calculateStats()}
        isLoading={isLoading}
        activeView={activeView}
        onNavigate={handleNavigation}
        onShowExplanation={handleShowExplanation}
        onToggleChatbot={handleToggleChatbot}
        notificationCount={analyses.filter(a => !a.id).length}
      />
      
      <ExplanationModal
        isOpen={showExplanation}
        type={explanationType}
        onClose={handleCloseExplanation}
      />

      <CodeChatbot
        codeContext={{
          repositories,
          analyses,
          selectedRepository,
          selectedAnalysis,
          currentView: activeView
        }}
        isVisible={showChatbot}
        onClose={() => setShowChatbot(false)}
      />

      <FloatingChatbotButton
        onClick={handleToggleChatbot}
        isActive={showChatbot}
      />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setError(null)}
              className="mt-2"
            >
              Dismiss
            </Button>
          </div>
        )}

        {/* Render Active View */}
        {renderActiveView()}
      </main>

      {/* Footer - Positioned at bottom */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>© 2025 unvibe</p>
            <p className="text-sm mt-2">
              Built with React, TypeScript, FastAPI, React Flow, and Chart.js
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
