/**
 * Repository Analysis Form Component
 * Allows users to submit git repository URLs for analysis
 */

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface RepositoryFormProps {
  onSubmit: (data: { url: string; name: string; description: string }) => Promise<void>
  isLoading?: boolean
}

const RepositoryForm: React.FC<RepositoryFormProps> = ({ onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState({
    url: '',
    name: '',
    description: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  /**
   * Validates the form data before submission
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validate URL
    if (!formData.url.trim()) {
      newErrors.url = 'Repository URL is required'
    } else {
      try {
        const url = new URL(formData.url)
        if (!url.hostname.includes('github.com') && !url.hostname.includes('gitlab.com') && !url.hostname.includes('bitbucket.org')) {
          newErrors.url = 'Please enter a valid git repository URL (GitHub, GitLab, or Bitbucket)'
        }
      } catch {
        newErrors.url = 'Please enter a valid URL'
      }
    }

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Repository name is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * Handles form submission with validation
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      await onSubmit(formData)
      // Reset form on successful submission
      setFormData({ url: '', name: '', description: '' })
      setErrors({})
    } catch (error) {
      console.error('Error submitting repository:', error)
    }
  }

  /**
   * Updates form field values and clears related errors
   */
  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto card-hover">
      <CardHeader>
        <CardTitle className="text-responsive-lg">Add Repository for Analysis</CardTitle>
        <CardDescription>
          Submit a git repository URL to analyze its patterns and get reverse engineering insights
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Repository URL Field */}
          <div className="space-y-2">
            <label htmlFor="url" className="text-sm font-medium text-foreground">
              Repository URL <span className="text-red-500">*</span>
            </label>
            <Input
              id="url"
              type="url"
              placeholder="https://github.com/username/repository"
              value={formData.url}
              onChange={(e) => updateField('url', e.target.value)}
              className={`transition-all duration-200 ${errors.url ? 'border-red-500 focus:ring-red-500' : 'focus:ring-primary'}`}
              disabled={isLoading}
            />
            {errors.url && (
              <p className="text-sm text-red-600 flex items-center space-x-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{errors.url}</span>
              </p>
            )}
          </div>

          {/* Repository Name Field */}
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-foreground">
              Repository Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="name"
              type="text"
              placeholder="My Awesome Project"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              className={errors.name ? 'border-red-500' : ''}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-gray-900">
              Description (Optional)
            </label>
            <Input
              id="description"
              type="text"
              placeholder="Brief description of the project"
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            disabled={isLoading}
          >
            {isLoading ? 'Analyzing Repository...' : 'Start Analysis'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default RepositoryForm
