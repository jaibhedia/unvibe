import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'

/**
 * Message interface for chat conversation
 */
interface ChatMessage {
  id: string
  content: string
  type: 'user' | 'bot'
  timestamp: Date
  codeContext?: string
  relatedFiles?: string[]
}

/**
 * Code context interface for providing file information to the chatbot
 */
interface CodeContext {
  repositories: any[]
  analyses: any[]
  selectedRepository?: any
  selectedAnalysis?: any
  currentView: string
}

/**
 * Props interface for the CodeChatbot component
 */
interface CodeChatbotProps {
  codeContext: CodeContext
  isVisible: boolean
  onClose: () => void
}

/**
 * Interactive chatbot component for code assistance and Q&A
 * Provides contextual help based on current repository and analysis data
 */
const CodeChatbot: React.FC<CodeChatbotProps> = ({ codeContext, isVisible, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  /**
   * Initial welcome message when chatbot opens
   */
  useEffect(() => {
    if (isVisible && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: generateMessageId(),
        content: `👋 **I can help you with**:

**Repository Questions**:
• "Tell me about my repository"
• "What's the status of my project?"
• "How is my code organized?"

**Analysis Questions**:
• "Explain my complexity score"
• "What technologies were detected?"
• "What do these vibe patterns mean?"

**Code Improvement**:
• "How can I improve my code?"
• "What are the recommendations?"
• "How to reduce complexity?"

Ask me anything about your code...`,
        type: 'bot',
        timestamp: new Date()
      }
      setMessages([welcomeMessage])
    }
  }, [isVisible, codeContext.selectedRepository])

  /**
   * Auto-scroll to bottom when new messages arrive
   */
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  /**
   * Generates unique message ID
   */
  const generateMessageId = (): string => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Scrolls chat to bottom
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  /**
   * Analyzes user input to determine intent and provide contextual responses
   */
  const analyzeUserIntent = (input: string): string => {
    const lowerInput = input.toLowerCase()
    
    // Repository-specific questions
    if (lowerInput.includes('repository') || lowerInput.includes('repo') || lowerInput.includes('project')) {
      if (codeContext.selectedRepository) {
        return generateRepositoryResponse()
      }
      return "I'd be happy to help with repository questions! Please select a repository first to get specific insights."
    }

    // Analysis-specific questions
    if (lowerInput.includes('analysis') || lowerInput.includes('complexity') || lowerInput.includes('score')) {
      if (codeContext.selectedAnalysis) {
        return generateAnalysisResponse()
      }
      return "To discuss analysis results, please select a repository that has completed analysis."
    }

    // Vibe pattern questions
    if (lowerInput.includes('vibe') || lowerInput.includes('pattern')) {
      return generateVibePatternResponse()
    }

    // Technology questions
    if (lowerInput.includes('technology') || lowerInput.includes('tech') || lowerInput.includes('framework') || lowerInput.includes('language')) {
      if (codeContext.selectedAnalysis) {
        return generateTechnologyResponse()
      }
      return "I can help explain technologies! Select an analyzed repository to see detected technologies."
    }

    // File structure questions
    if (lowerInput.includes('file') || lowerInput.includes('structure') || lowerInput.includes('folder') || lowerInput.includes('directory')) {
      return generateFileStructureResponse()
    }

    // Help/guidance questions
    if (lowerInput.includes('help') || lowerInput.includes('how') || lowerInput.includes('what') || lowerInput.includes('explain')) {
      return generateHelpResponse()
    }

    // Recommendations
    if (lowerInput.includes('recommend') || lowerInput.includes('improve') || lowerInput.includes('better') || lowerInput.includes('optimize')) {
      if (codeContext.selectedAnalysis) {
        return generateRecommendationResponse()
      }
      return "I can provide recommendations once you have analysis data. Please analyze a repository first!"
    }

    // Default response with suggestions
    return generateDefaultResponse()
  }

  /**
   * Formats markdown-style text for display
   */
  const formatMessageContent = (content: string): React.ReactElement => {
    // Split by line breaks first to preserve structure
    const lines = content.split('\n')
    
    return (
      <div className="space-y-2">
        {lines.map((line, lineIndex) => {
          // Skip empty lines but preserve spacing
          if (line.trim() === '') {
            return <div key={lineIndex} className="h-1"></div>
          }
          
          // Handle bullet points
          const isBulletPoint = line.trim().startsWith('•') || line.trim().startsWith('-')
          
          // Handle bold text (**text**)
          const parts = line.split(/(\*\*.*?\*\*)/g)
          
          return (
            <div key={lineIndex} className={isBulletPoint ? 'ml-2' : ''}>
              {parts.map((part, partIndex) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  // Remove the ** and make bold
                  const boldText = part.slice(2, -2)
                  return (
                    <strong key={partIndex} className="font-semibold text-gray-900">
                      {boldText}
                    </strong>
                  )
                }
                return <span key={partIndex}>{part}</span>
              })}
            </div>
          )
        })}
      </div>
    )
  }

  /**
   * Generates repository-specific response
   */
  const generateRepositoryResponse = (): string => {
    const repo = codeContext.selectedRepository
    const analysis = codeContext.selectedAnalysis
    
    return `**${repo.name}** Repository Insights:

**Status**: ${repo.analysis_status}
**Description**: ${repo.description || 'No description provided'}
**Created**: ${new Date(repo.created_at).toLocaleDateString()}

${analysis ? `
**Analysis Summary**:
- **Complexity Score**: ${analysis.complexity_score}/100
- **Technologies**: ${analysis.technologies_detected.join(', ')}
- **Vibe Patterns**: ${analysis.vibe_patterns.join(', ')}
` : 'Run analysis to get detailed insights!'}

What specific aspect would you like to explore?`
  }

  /**
   * Generates analysis-specific response
   */
  const generateAnalysisResponse = (): string => {
    const analysis = codeContext.selectedAnalysis
    
    return `**Analysis Results**:

**Complexity Score**: ${analysis.complexity_score}/100
${analysis.complexity_score > 70 ? 'High complexity - consider refactoring' : 
  analysis.complexity_score > 40 ? 'Moderate complexity - manageable' : 
  'Low complexity - well-structured'}

**Technologies Detected**:
${analysis.technologies_detected.map((tech: string) => `• ${tech}`).join('\n')}

**Vibe Patterns**:
${analysis.vibe_patterns.map((pattern: string) => `• ${pattern}`).join('\n')}

**Recommendations**:
${analysis.recommendations.map((rec: string) => `• ${rec}`).join('\n')}

Need clarification on any of these metrics?`
  }

  /**
   * Generates vibe pattern explanation
   */
  const generateVibePatternResponse = (): string => {
    return `**Vibe Patterns Explained**:

Vibe patterns represent the overall "feel" and architectural style of your codebase:

**Common Patterns**:
• **Clean Architecture** - Well-organized, separated concerns
• **Monolithic** - Single large application structure
• **Microservices** - Distributed service architecture
• **Legacy Code** - Older patterns, potential technical debt
• **Modern Framework** - Uses current best practices
• **Experimental** - Cutting-edge or unconventional approaches

${codeContext.selectedAnalysis ? `
**Your Project's Vibes**: ${codeContext.selectedAnalysis.vibe_patterns.join(', ')}
` : ''}

Which pattern would you like me to explain in detail?`
  }

  /**
   * Generates technology stack response
   */
  const generateTechnologyResponse = (): string => {
    const analysis = codeContext.selectedAnalysis
    
    return `**Technology Stack Analysis**:

**Detected Technologies**:
${analysis.technologies_detected.map((tech: string) => {
      // Add context about each technology
      const techInfo = getTechnologyInfo(tech)
      return `• **${tech}**: ${techInfo}`
    }).join('\n')}

**Stack Assessment**:
${analysis.technologies_detected.length > 5 ? 
  'High tech diversity - may increase complexity' :
  'Focused tech stack - easier to maintain'}

Want to know more about any specific technology or how they work together?`
  }

  /**
   * Gets information about a specific technology
   */
  const getTechnologyInfo = (tech: string): string => {
    const techMap: Record<string, string> = {
      'React': 'Frontend library for building user interfaces',
      'TypeScript': 'Typed superset of JavaScript for better development',
      'Node.js': 'JavaScript runtime for backend development',
      'Python': 'Versatile programming language for various applications',
      'FastAPI': 'Modern Python web framework for building APIs',
      'Vite': 'Fast build tool and development server',
      'Tailwind CSS': 'Utility-first CSS framework for styling',
      'JavaScript': 'Core programming language for web development'
    }
    
    return techMap[tech] || 'Technology detected in your codebase'
  }

  /**
   * Generates file structure response
   */
  const generateFileStructureResponse = (): string => {
    if (!codeContext.selectedAnalysis) {
      return "To analyze file structure, please select a repository with completed analysis."
    }

    return `**File Structure Insights**:

Your project structure shows:
- Organized component architecture
- Clear separation of concerns
- Modern project layout

**Key Observations**:
• Frontend components in \`src/components/\`
• Services layer for API communication
• Type definitions for better code quality
• Configuration files for build tools

Want me to explain any specific part of your file organization?`
  }

  /**
   * Generates help response with available commands
   */
  const generateHelpResponse = (): string => {
    return `🤝 **I can help you with**:

**Repository Questions**:
• "Tell me about my repository"
• "What's the status of my project?"
• "How is my code organized?"

**Analysis Questions**:
• "Explain my complexity score"
• "What technologies were detected?"
• "What do these vibe patterns mean?"

**Code Improvement**:
• "How can I improve my code?"
• "What are the recommendations?"
• "How to reduce complexity?"

**Technical Support**:
• "Explain this technology"
• "How do these frameworks work together?"
• "What's the best practice for...?"

Just ask me anything about your code!`
  }

  /**
   * Generates recommendation response
   */
  const generateRecommendationResponse = (): string => {
    const analysis = codeContext.selectedAnalysis
    
    return `**Personalized Recommendations**:

${analysis.recommendations.map((rec: string, index: number) => `
**${index + 1}. ${rec}**
${getRecommendationDetails(rec)}
`).join('\n')}

**Next Steps**:
1. Prioritize high-impact improvements
2. Address complexity hotspots first
3. Maintain good documentation
4. Regular code reviews

Would you like me to elaborate on any specific recommendation?`
  }

  /**
   * Gets detailed explanation for recommendations
   */
  const getRecommendationDetails = (recommendation: string): string => {
    const lowerRec = recommendation.toLowerCase()
    
    if (lowerRec.includes('refactor')) {
      return '→ Break down large functions, improve naming, reduce dependencies'
    }
    if (lowerRec.includes('test')) {
      return '→ Add unit tests, integration tests, improve test coverage'
    }
    if (lowerRec.includes('documentation')) {
      return '→ Add inline comments, update README, create API docs'
    }
    if (lowerRec.includes('performance')) {
      return '→ Optimize algorithms, reduce bundle size, improve loading times'
    }
    
    return '→ Implementation depends on your specific use case'
  }

  /**
   * Generates default response with suggestions
   */
  const generateDefaultResponse = (): string => {
    const suggestions = [
      "Tell me about my repository structure",
      "Explain my complexity score",
      "What vibe patterns were detected?",
      "How can I improve my code?",
      "What technologies are in my project?"
    ]
    
    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)]
    
    return `I'd love to help! I can answer questions about your code, explain analysis results, and provide recommendations.

**Try asking**:
• "${randomSuggestion}"
• "How does [technology] work in my project?"
• "What should I focus on improving?"

What would you like to know?`
  }

  /**
   * Handles sending a new message
   */
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: ChatMessage = {
      id: generateMessageId(),
      content: inputValue,
      type: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)
    setIsTyping(true)

    // Simulate typing delay for better UX
    setTimeout(() => {
      const botResponse = analyzeUserIntent(inputValue)
      
      const botMessage: ChatMessage = {
        id: generateMessageId(),
        content: botResponse,
        type: 'bot',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, botMessage])
      setIsLoading(false)
      setIsTyping(false)
    }, 1000 + Math.random() * 1000) // Random delay 1-2 seconds
  }

  /**
   * Handles Enter key press in input
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  /**
   * Clears chat history
   */
  const handleClearChat = () => {
    setMessages([])
    // Re-add welcome message
    const welcomeMessage: ChatMessage = {
      id: generateMessageId(),
      content: "Chat cleared! How can I help you with your code today?",
      type: 'bot',
      timestamp: new Date()
    }
    setMessages([welcomeMessage])
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-white/20 backdrop-blur-md flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl h-[80vh] flex flex-col bg-white/95 backdrop-blur-lg shadow-2xl border border-white/30">
        <CardHeader className="flex-shrink-0 bg-white/90 backdrop-blur-sm border-b border-gray-200/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                Code Assistant
                {isTyping && (
                  <span className="text-sm text-muted-foreground animate-pulse">
                    AI is typing...
                  </span>
                )}
              </CardTitle>
              <CardDescription className="text-gray-600">
                Ask questions about your code, get explanations, and receive personalized recommendations
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearChat}
                title="Clear chat history"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                title="Close chatbot"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col bg-white/90 backdrop-blur-sm">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto mb-4 space-y-4 max-h-[50vh] bg-gray-50/80 backdrop-blur-sm p-4 rounded-lg border border-white/30">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg backdrop-blur-sm ${
                    message.type === 'user'
                      ? 'bg-blue-600/90 text-white border border-blue-500/30'
                      : 'bg-white/90 border border-gray-200/50 text-gray-900'
                  }`}
                >
                  <div className="text-sm">
                    {formatMessageContent(message.content)}
                  </div>
                  <div className={`text-xs mt-1 ${
                    message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/90 backdrop-blur-sm border border-gray-200/50 p-3 rounded-lg">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="flex gap-2 bg-white/90 backdrop-blur-sm p-4 border-t border-gray-200/50">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your code..."
              disabled={isLoading}
              className="flex-1 bg-white/80 backdrop-blur-sm border-gray-300/50 text-gray-900"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              size="sm"
              className="bg-blue-600/90 hover:bg-blue-700/90 text-white backdrop-blur-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </Button>
          </div>

          {/* Context Info */}
          <div className="mt-2 text-xs text-gray-500 px-4 pb-2">
            {codeContext.selectedRepository && (
              <span>Context: {codeContext.selectedRepository.name}</span>
            )}
            {codeContext.selectedAnalysis && (
              <span> • Analysis available</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CodeChatbot
