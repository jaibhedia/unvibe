<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Copilot Instructions for Vibe Reverse Engineer Platform

## Project Context
This is a full-stack web application for analyzing and reverse engineering git repositories. The platform allows users to submit repository URLs and receive comprehensive analysis including file structure visualization, technology detection, and complexity scoring.

## Tech Stack
- Frontend: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- Visualization: React Flow + Chart.js
- Backend: Python FastAPI with CRUD operations
- Data: JSON Server for mock data

## Code Style Guidelines
- Use TypeScript for all frontend code with strict type checking
- Follow React functional component patterns with hooks
- Use Tailwind CSS for styling with responsive design principles
- Implement proper error handling and loading states
- Add comprehensive JSDoc comments for all main functions
- Use semantic HTML and accessibility best practices

## Component Guidelines
- Create reusable UI components in `/src/components/ui/`
- Use shadcn/ui styling patterns consistently
- Implement proper prop validation with TypeScript interfaces
- Follow the composition pattern for complex components
- Ensure all components are responsive and mobile-friendly

## API Guidelines
- Use FastAPI with Pydantic models for data validation
- Implement proper HTTP status codes and error responses
- Add comprehensive documentation for all endpoints
- Use background tasks for long-running operations
- Implement CORS properly for frontend integration

## Data Visualization
- Use Chart.js for statistical data visualization
- Use React Flow for interactive diagrams and flow charts
- Ensure all visualizations are responsive and accessible
- Implement proper loading states for data fetching

## Best Practices
- Always handle errors gracefully with user-friendly messages
- Implement proper loading states for all async operations
- Use semantic variable and function names
- Follow the single responsibility principle
- Write self-documenting code with clear comments
- Ensure proper separation of concerns between components

## File Organization
- Keep components focused and single-purpose
- Use proper TypeScript imports with path aliases
- Organize related functionality in logical directories
- Maintain consistent naming conventions throughout

## Testing Considerations
- Write testable code with clear inputs and outputs
- Mock external dependencies appropriately
- Test error conditions and edge cases
- Ensure components work with different data states
