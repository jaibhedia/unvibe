# Vibe Reverse Engineer Platform - Bhatiyani Assessment

## Overview

The Vibe Reverse Engineer Platform is a comprehensive full-stack application designed to analyze and reverse engineer vibecoded projects from git repositories. This platform allows users to submit git repository URLs and receive detailed analysis including file structure visualization, technology detection, complexity scoring, and AI-generated recommendations.

## Tech Stack

### Frontend
- **React 18** with **TypeScript** - Modern component-based UI
- **shadcn/ui** - Beautiful, accessible UI component library
- **React Flow** - Interactive repository structure visualization
- **Chart.js** with **react-chartjs-2** - Data visualization and analytics
- **Tailwind CSS** - Utility-first CSS framework for responsive design
- **Vite** - Fast build tool and development server
- **JSON Server** - Mock backend for frontend data

### Backend
- **FastAPI** - Modern Python web framework with automatic API documentation
- **Pydantic** - Data validation and serialization
- **Uvicorn** - ASGI server for FastAPI
- **CORS Middleware** - Cross-origin resource sharing for frontend integration
- **Background Tasks** - Asynchronous repository analysis

## Project Structure

```
vibe-reverse-engineer_bhatiyani/
├── src/                          # Frontend source code
│   ├── components/               # React components
│   │   ├── ui/                   # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   └── input.tsx
│   │   ├── Header.tsx            # Navigation header
│   │   ├── RepositoryForm.tsx    # Repository submission form
│   │   ├── RepositoryStructure.tsx # React Flow visualization
│   │   └── AnalysisCharts.tsx    # Chart.js analytics
│   ├── lib/                      # Utility functions
│   │   └── utils.ts
│   ├── App.tsx                   # Main application component
│   ├── main.tsx                  # React entry point
│   └── globals.css               # Global styles with Tailwind
├── backend/                      # Python FastAPI backend
│   ├── main.py                   # FastAPI application with CRUD operations
│   └── requirements.txt          # Python dependencies
├── data/                         # JSON Server data
│   └── db.json                   # Mock data for frontend development
├── .github/                      # GitHub configuration
│   └── copilot-instructions.md   # Copilot customization
├── package.json                  # Node.js dependencies and scripts
├── vite.config.ts                # Vite configuration with path aliases
├── tailwind.config.js            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
├── README.md                     # Project documentation
└── prompts.md                    # AI usage documentation
```

## Features

### Core Functionality
1. **Repository Analysis** - Submit git repository URLs for comprehensive analysis
2. **Interactive Visualization** - React Flow-powered repository structure visualization
3. **Technology Detection** - Automatic identification of frameworks and technologies
4. **Complexity Scoring** - Multi-dimensional complexity analysis (1-10 scale)
5. **Vibe Pattern Recognition** - Detection of architectural patterns and code styles
6. **AI Recommendations** - Intelligent suggestions for code improvements
7. **Real-time Updates** - Live status updates during analysis processing

### Technical Features
1. **Responsive Design** - Mobile-first design with Tailwind CSS
2. **Type Safety** - Full TypeScript implementation
3. **API Documentation** - Automatic FastAPI documentation at `/docs`
4. **Error Handling** - Comprehensive error handling and user feedback
5. **Background Processing** - Non-blocking repository analysis
6. **Data Visualization** - Multiple chart types for analysis results

## Installation and Setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- Git

### Frontend Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Start JSON Server (separate terminal):**
   ```bash
   npx json-server --watch data/db.json --port 3001
   ```

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\\Scripts\\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Start FastAPI server:**
   ```bash
   python main.py
   ```

### Development URLs
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs
- **JSON Server:** http://localhost:3001

## API Endpoints

### Repositories
- `GET /repositories` - Get all repositories
- `POST /repositories` - Create new repository analysis
- `GET /repositories/{id}` - Get specific repository
- `PUT /repositories/{id}` - Update repository
- `DELETE /repositories/{id}` - Delete repository

### Analyses
- `GET /analyses` - Get all analyses
- `GET /analyses/repository/{id}` - Get analyses for specific repository
- `GET /analyses/{id}` - Get specific analysis

## Usage Instructions

### Analyzing a Repository

1. **Access the Platform:** Open http://localhost:5173 in your browser
2. **Submit Repository:** 
   - Enter a valid git repository URL (GitHub, GitLab, or Bitbucket)
   - Provide a descriptive name
   - Add optional description
   - Click "Start Analysis"
3. **View Results:**
   - Select the repository from the dashboard
   - Explore interactive file structure visualization
   - Review technology stack analysis
   - Examine complexity metrics and charts
   - Read AI-generated recommendations

### Understanding Analysis Results

- **Repository Structure:** Interactive React Flow diagram showing file organization
- **Technology Distribution:** Bar chart of detected frameworks and libraries
- **File Type Distribution:** Doughnut chart showing file type breakdown
- **Complexity Analysis:** Line chart with multi-dimensional scoring
- **Vibe Patterns:** Identified architectural patterns and coding styles
- **Recommendations:** AI-generated suggestions for improvements

## AI Usage Documentation

This project extensively uses AI tools for development assistance and code generation. See [prompts.md](./prompts.md) for detailed documentation of AI usage.

## Deployment

### Frontend Deployment (Vercel/Netlify)
1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting platform
3. Configure environment variables for API endpoints

### Backend Deployment (Heroku/Railway)
1. Create requirements.txt with all dependencies
2. Configure production ASGI server (e.g., Gunicorn)
3. Set environment variables for CORS origins
4. Deploy to your chosen platform

## Comments and Code Quality

All main functions and components are thoroughly commented with:
- **JSDoc comments** for functions and components
- **Inline comments** explaining complex logic
- **Type annotations** for TypeScript safety
- **Error handling** with descriptive messages

## Responsive Design

The application is fully responsive with:
- **Mobile-first approach** using Tailwind CSS
- **Flexible grid layouts** that adapt to screen size
- **Touch-friendly interactions** for mobile devices
- **Optimized performance** across devices

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with proper comments
4. Test thoroughly
5. Submit a pull request

## License

This project is created for the Bhatiyani Full Stack Developer Assessment.

---

**Live URLs:** 
- Frontend: [To be deployed]
- Backend API: [To be deployed]

**Repository:** vibe-reverse-engineer_bhatiyani
