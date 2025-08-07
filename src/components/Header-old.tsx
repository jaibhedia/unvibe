/**
 * Header component for the Vibe Reverse Engineer Platform
 * Provides navigation and branding for the application
 */

import React from 'react'

interface HeaderProps {
  stats?: {
    total: number;
    completed: number;
    analyzing: number;
    pending: number;
    failed: number;
    completionRate: number;
  };
  isLoading?: boolean;
  notificationCount?: number;
  activeView?: string;
  onNavigate?: (view: 'dashboard' | 'repositories' | 'analyses' | 'documentation') => void;
  onShowExplanation?: (type: 'platform' | 'analysis' | 'vibe') => void;
  onToggleChatbot?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  stats, 
  isLoading, 
  notificationCount,
  activeView = 'dashboard',
  onNavigate,
  onShowExplanation,
  onToggleChatbot
}) => {
  
  const handleNavClick = (view: 'dashboard' | 'repositories' | 'analyses' | 'documentation') => {
    onNavigate?.(view);
  };

  const handleExplanationClick = (type: 'platform' | 'analysis' | 'vibe') => {
    onShowExplanation?.(type);
  };
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and App Name - Simplified */}
          <div className="flex items-center space-x-3">
            {/* Code Emoji Logo */}
            <div className="text-2xl hover:scale-110 transition-transform duration-200">
              💻
            </div>
            {/* App Name */}
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Vibe
            </h1>
            {isLoading && (
              <div className="loading-spinner w-4 h-4 text-primary ml-2"></div>
            )}
          </div>

          {/* Navigation - Simplified */}
          <nav className="flex items-center space-x-4">
            {/* Main Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              <button
                onClick={() => handleNavClick('dashboard')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeView === 'dashboard' 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => handleNavClick('repositories')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeView === 'repositories' 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                Repositories
              </button>
              <button
                onClick={() => handleNavClick('analyses')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeView === 'analyses' 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                Analyses
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {/* AI Chatbot Button */}
              <button
                onClick={() => onToggleChatbot?.()}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Open AI Code Assistant"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </button>

              {/* Help Button */}
              <button
                onClick={() => handleExplanationClick('vibe')}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Learn about Vibe patterns"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
          </nav>
            </div>

            {/* Notification Bell */}
            {notificationCount !== undefined && notificationCount > 0 && (
              <div className="relative">
                <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3-3V9a6 6 0 10-12 0v5l-3 3h5a3 3 0 106 0z" />
                  </svg>
                </button>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
