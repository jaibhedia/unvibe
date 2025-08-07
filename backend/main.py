"""
Main FastAPI application for Vibe Reverse Engineer Platform
This application provides CRUD operations for analyzing vibecoded git repositories
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
from typing import List, Optional, Dict, Any
import httpx
import json
import os
from datetime import datetime
import uuid
import re
import base64
from urllib.parse import urlparse
import asyncio

# Initialize FastAPI app
app = FastAPI(
    title="Vibe Reverse Engineer API",
    description="API for analyzing and reverse engineering vibecoded projects from git repositories",
    version="1.0.0",
    docs_url="/docs" if os.getenv("ENVIRONMENT", "development") != "production" else None,
    redoc_url="/redoc" if os.getenv("ENVIRONMENT", "development") != "production" else None,
)

# CORS configuration for production and development
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:5174", 
    "http://localhost:5175",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5175",
    "https://unvibe-*.vercel.app",  # Vercel preview deployments
    "https://*.vercel.app"

]

# Add production origins from environment variable
if os.getenv("CORS_ORIGINS"):
    production_origins = os.getenv("CORS_ORIGINS").split(",")
    allowed_origins.extend([origin.strip() for origin in production_origins])

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint for monitoring
@app.get("/health")
async def health_check():
    """Health check endpoint for deployment monitoring"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "service": "vibe-api"
    }

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Vibe Reverse Engineer API",
        "version": "1.0.0",
        "docs": "/docs" if os.getenv("ENVIRONMENT", "development") != "production" else "Documentation disabled in production"
    }

# Pydantic models for API request/response
class GitRepository(BaseModel):
    """Model for git repository data"""
    id: Optional[str] = None
    url: HttpUrl
    name: str
    description: Optional[str] = None
    language: Optional[str] = None
    framework: Optional[str] = None
    analysis_status: Optional[str] = "pending"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class RepositoryAnalysis(BaseModel):
    """Model for repository analysis results"""
    id: str
    repository_id: str
    file_structure: Dict[str, Any]
    technologies_detected: List[str]
    complexity_score: float
    vibe_patterns: List[str]
    recommendations: List[str]
    created_at: datetime

class CreateRepositoryRequest(BaseModel):
    """Request model for creating a new repository analysis"""
    url: HttpUrl
    name: str
    description: Optional[str] = None

# In-memory storage (in production, use a database)
repositories: Dict[str, GitRepository] = {}
analyses: Dict[str, RepositoryAnalysis] = {}

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Vibe Reverse Engineer API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "active"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "service": "vibe-api"
    }

@app.get("/repositories", response_model=List[GitRepository])
async def get_repositories():
    """
    Get all repositories
    Returns a list of all registered repositories
    """
    return list(repositories.values())

@app.get("/repositories/{repository_id}", response_model=GitRepository)
async def get_repository(repository_id: str):
    """
    Get a specific repository by ID
    """
    if repository_id not in repositories:
        raise HTTPException(status_code=404, detail="Repository not found")
    return repositories[repository_id]

@app.post("/repositories", response_model=GitRepository)
async def create_repository(request: CreateRepositoryRequest, background_tasks: BackgroundTasks):
    """
    Create a new repository for analysis
    This endpoint registers a new git repository and starts background analysis
    """
    repository_id = str(uuid.uuid4())
    
    # Create repository record
    repository = GitRepository(
        id=repository_id,
        url=request.url,
        name=request.name,
        description=request.description,
        analysis_status="pending",
        created_at=datetime.now(),
        updated_at=datetime.now()
    )
    
    repositories[repository_id] = repository
    
    # Start background analysis
    background_tasks.add_task(analyze_repository, repository_id, str(request.url))
    
    return repository

@app.put("/repositories/{repository_id}", response_model=GitRepository)
async def update_repository(repository_id: str, request: CreateRepositoryRequest):
    """
    Update an existing repository
    """
    if repository_id not in repositories:
        raise HTTPException(status_code=404, detail="Repository not found")
    
    repository = repositories[repository_id]
    repository.url = request.url
    repository.name = request.name
    repository.description = request.description
    repository.updated_at = datetime.now()
    
    repositories[repository_id] = repository
    return repository

@app.delete("/repositories/{repository_id}")
async def delete_repository(repository_id: str):
    """
    Delete a repository and its associated analyses
    """
    if repository_id not in repositories:
        raise HTTPException(status_code=404, detail="Repository not found")
    
    # Delete associated analyses
    analyses_to_delete = [analysis_id for analysis_id, analysis in analyses.items() 
                         if analysis.repository_id == repository_id]
    for analysis_id in analyses_to_delete:
        del analyses[analysis_id]
    
    # Delete repository
    del repositories[repository_id]
    
    return {"message": "Repository deleted successfully"}

@app.get("/analyses", response_model=List[RepositoryAnalysis])
async def get_analyses():
    """
    Get all repository analyses
    """
    return list(analyses.values())

@app.get("/analyses/repository/{repository_id}", response_model=List[RepositoryAnalysis])
async def get_analyses_by_repository(repository_id: str):
    """
    Get all analyses for a specific repository
    """
    repository_analyses = [analysis for analysis in analyses.values() 
                          if analysis.repository_id == repository_id]
    return repository_analyses

@app.get("/analyses/{analysis_id}", response_model=RepositoryAnalysis)
async def get_analysis(analysis_id: str):
    """
    Get a specific analysis by ID
    """
    if analysis_id not in analyses:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return analyses[analysis_id]

async def analyze_github_repository(owner: str, repo_name: str):
    """
    Analyze a GitHub repository by fetching its actual content and structure
    """
    async with httpx.AsyncClient() as client:
        try:
            # Get repository information
            repo_response = await client.get(f"https://api.github.com/repos/{owner}/{repo_name}")
            if repo_response.status_code != 200:
                raise ValueError(f"Repository not found or not accessible: {repo_response.status_code}")
            
            repo_data = repo_response.json()
            
            # Get repository contents (files and directories)
            contents_response = await client.get(f"https://api.github.com/repos/{owner}/{repo_name}/contents")
            if contents_response.status_code != 200:
                # Repository might be empty or private
                return await create_minimal_analysis(repo_data)
            
            contents = contents_response.json()
            
            # Analyze file structure recursively
            file_structure = await build_file_structure(client, owner, repo_name, contents)
            
            # Detect technologies from files and content
            technologies_detected = detect_technologies(file_structure, repo_data)
            
            # Analyze vibe patterns based on actual code structure
            vibe_patterns = analyze_code_patterns(file_structure, technologies_detected)
            
            # Generate recommendations based on actual analysis
            recommendations = generate_recommendations(file_structure, technologies_detected, repo_data)
            
            # Calculate complexity score based on actual metrics
            complexity_score = calculate_complexity_score(file_structure, technologies_detected, repo_data)
            
            return file_structure, technologies_detected, vibe_patterns, recommendations, complexity_score
            
        except Exception as e:
            print(f"Error analyzing GitHub repository: {str(e)}")
            # Fallback to basic analysis if API fails
            return await create_fallback_analysis(repo_name)

async def build_file_structure(client: httpx.AsyncClient, owner: str, repo_name: str, contents, path=""):
    """
    Recursively build file structure from GitHub API
    """
    structure = {}
    
    for item in contents[:20]:  # Limit to avoid API rate limits
        if item['type'] == 'dir':
            try:
                # Get directory contents
                dir_response = await client.get(f"https://api.github.com/repos/{owner}/{repo_name}/contents/{item['path']}")
                if dir_response.status_code == 200:
                    dir_contents = dir_response.json()
                    if isinstance(dir_contents, list):
                        structure[f"{item['name']}/"] = await build_file_structure(client, owner, repo_name, dir_contents[:10], item['path'])
                    else:
                        structure[f"{item['name']}/"] = []
                else:
                    structure[f"{item['name']}/"] = []
            except:
                structure[f"{item['name']}/"] = []
        else:
            structure[item['name']] = f"{item.get('size', 0)} bytes"
    
    return structure

def detect_technologies(file_structure, repo_data):
    """
    Detect technologies based on file extensions and structure
    """
    technologies = set()
    
    # Language from GitHub API
    if repo_data.get('language'):
        technologies.add(repo_data['language'])
    
    # Detect from file structure
    def scan_files(structure):
        for name, content in structure.items():
            if isinstance(content, dict):
                scan_files(content)
            else:
                # File extensions
                if name.endswith('.tsx') or name.endswith('.jsx'):
                    technologies.update(['React', 'JavaScript'])
                elif name.endswith('.ts'):
                    technologies.add('TypeScript')
                elif name.endswith('.vue'):
                    technologies.add('Vue.js')
                elif name.endswith('.py'):
                    technologies.add('Python')
                elif name.endswith('.java'):
                    technologies.add('Java')
                elif name.endswith('.go'):
                    technologies.add('Go')
                elif name.endswith('.rs'):
                    technologies.add('Rust')
                elif name.endswith('.php'):
                    technologies.add('PHP')
                elif name.endswith('.rb'):
                    technologies.add('Ruby')
                elif name.endswith('.swift'):
                    technologies.add('Swift')
                elif name.endswith('.kt'):
                    technologies.add('Kotlin')
                elif name.endswith('.dart'):
                    technologies.add('Dart')
                
                # Framework detection
                if name == 'package.json':
                    technologies.update(['Node.js', 'npm'])
                elif name == 'Cargo.toml':
                    technologies.add('Rust')
                elif name == 'requirements.txt' or name == 'pyproject.toml':
                    technologies.add('Python')
                elif name == 'pom.xml' or name == 'build.gradle':
                    technologies.add('Java')
                elif name == 'Gemfile':
                    technologies.add('Ruby')
                elif name == 'composer.json':
                    technologies.add('PHP')
                elif name == 'pubspec.yaml':
                    technologies.update(['Dart', 'Flutter'])
                elif name == 'vite.config.ts' or name == 'vite.config.js':
                    technologies.add('Vite')
                elif name == 'webpack.config.js':
                    technologies.add('Webpack')
                elif name == 'tailwind.config.js':
                    technologies.add('Tailwind CSS')
                elif name == 'next.config.js':
                    technologies.add('Next.js')
                elif name == 'nuxt.config.js':
                    technologies.add('Nuxt.js')
                elif name == 'angular.json':
                    technologies.add('Angular')
                elif name == 'vue.config.js':
                    technologies.add('Vue.js')
                elif name == 'svelte.config.js':
                    technologies.add('Svelte')
                elif name == 'Dockerfile':
                    technologies.add('Docker')
                elif name == 'docker-compose.yml':
                    technologies.add('Docker Compose')
                elif name == '.github':
                    technologies.add('GitHub Actions')
    
    scan_files(file_structure)
    return list(technologies)

def analyze_code_patterns(file_structure, technologies):
    """
    Analyze code patterns based on file structure and technologies
    """
    patterns = []
    
    # Check for common patterns
    def has_directory(name):
        return any(name in str(key) for key in file_structure.keys())
    
    def has_file(name):
        def search_structure(structure):
            for key, value in structure.items():
                if name in key:
                    return True
                if isinstance(value, dict) and search_structure(value):
                    return True
            return False
        return search_structure(file_structure)
    
    # Architecture patterns
    if has_directory('components'):
        patterns.append('Component-based architecture')
    if has_directory('pages') or has_directory('views'):
        patterns.append('Page-based routing')
    if has_directory('hooks'):
        patterns.append('Custom hooks pattern')
    if has_directory('services') or has_directory('api'):
        patterns.append('Service layer architecture')
    if has_directory('utils') or has_directory('helpers'):
        patterns.append('Utility functions organization')
    if has_directory('models') or has_directory('entities'):
        patterns.append('Data modeling patterns')
    if has_directory('controllers'):
        patterns.append('MVC architecture')
    if has_directory('middleware'):
        patterns.append('Middleware pattern')
    if has_directory('store') or has_directory('redux'):
        patterns.append('State management patterns')
    if has_directory('tests') or has_directory('__tests__'):
        patterns.append('Test-driven development')
    if has_file('docker'):
        patterns.append('Containerization patterns')
    if has_file('.env'):
        patterns.append('Environment configuration')
    if has_file('README'):
        patterns.append('Documentation practices')
    
    # Technology-specific patterns
    if 'TypeScript' in technologies:
        patterns.append('Type-safe development')
    if 'React' in technologies:
        patterns.append('React functional components')
    if 'Vue.js' in technologies:
        patterns.append('Vue composition patterns')
    if 'Next.js' in technologies:
        patterns.append('Full-stack React framework')
    if 'Tailwind CSS' in technologies:
        patterns.append('Utility-first CSS')
    
    return patterns

def generate_recommendations(file_structure, technologies, repo_data):
    """
    Generate recommendations based on actual repository analysis
    """
    recommendations = []
    
    def has_directory(name):
        return any(name in str(key) for key in file_structure.keys())
    
    def has_file(name):
        def search_structure(structure):
            for key, value in structure.items():
                if name in key:
                    return True
                if isinstance(value, dict) and search_structure(value):
                    return True
            return False
        return search_structure(file_structure)
    
    # Testing recommendations
    if not has_directory('test') and not has_directory('__tests__'):
        recommendations.append('Add unit tests to improve code reliability')
    
    # Documentation
    if not has_file('README'):
        recommendations.append('Add a comprehensive README.md file')
    
    # CI/CD
    if not has_directory('.github'):
        recommendations.append('Set up GitHub Actions for CI/CD')
    
    # Environment
    if not has_file('.env') and ('Node.js' in technologies or 'Python' in technologies):
        recommendations.append('Add environment configuration files')
    
    # Docker
    if not has_file('Dockerfile') and len(technologies) > 2:
        recommendations.append('Consider containerizing the application with Docker')
    
    # Type safety
    if 'JavaScript' in technologies and 'TypeScript' not in technologies:
        recommendations.append('Consider migrating to TypeScript for better type safety')
    
    # Code quality
    if 'JavaScript' in technologies or 'TypeScript' in technologies:
        if not has_file('eslint'):
            recommendations.append('Add ESLint for code quality enforcement')
        if not has_file('prettier'):
            recommendations.append('Add Prettier for consistent code formatting')
    
    # Security
    if has_file('package.json'):
        recommendations.append('Regular dependency updates and security audits')
    
    # Performance
    if 'React' in technologies:
        recommendations.append('Implement code splitting and lazy loading')
    
    # Repository health
    if repo_data.get('stargazers_count', 0) > 100:
        recommendations.append('Consider adding contributor guidelines')
    
    return recommendations

def calculate_complexity_score(file_structure, technologies, repo_data):
    """
    Calculate complexity score based on actual repository metrics
    """
    score = 1.0
    
    # Base complexity from file count
    file_count = count_files(file_structure)
    score += min(3.0, file_count / 20)  # Max 3 points for file count
    
    # Technology diversity
    score += min(2.0, len(technologies) / 5)  # Max 2 points for tech diversity
    
    # Repository size (approximation)
    if repo_data.get('size', 0) > 1000:  # KB
        score += 1.0
    if repo_data.get('size', 0) > 10000:
        score += 1.0
    
    # Repository activity
    if repo_data.get('stargazers_count', 0) > 10:
        score += 0.5
    if repo_data.get('forks_count', 0) > 5:
        score += 0.5
    
    # Advanced technologies
    advanced_tech = ['TypeScript', 'Rust', 'Go', 'Docker', 'Kubernetes']
    score += sum(0.3 for tech in technologies if tech in advanced_tech)
    
    return round(min(10.0, score), 1)

def count_files(structure):
    """
    Count total files in the structure
    """
    count = 0
    for key, value in structure.items():
        if isinstance(value, dict):
            count += count_files(value)
        else:
            count += 1
    return count

async def create_minimal_analysis(repo_data):
    """
    Create minimal analysis for empty or inaccessible repositories
    """
    return (
        {"README.md": "Repository content not accessible"},
        [repo_data.get('language', 'Unknown')] if repo_data.get('language') else ['Unknown'],
        ['Repository structure not analyzable'],
        ['Repository appears to be empty or private', 'Add public content for analysis'],
        1.0
    )

async def create_fallback_analysis(repo_name):
    """
    Create fallback analysis when API fails
    """
    return (
        {"error": "Unable to analyze repository structure"},
        ['Unknown'],
        ['Analysis failed due to API limitations'],
        ['Repository could not be analyzed', 'Check repository accessibility'],
        1.0
    )

async def analyze_repository(repository_id: str, repository_url: str):
    """
    Background task to analyze a git repository using GitHub API
    This function fetches real repository data and performs actual analysis
    """
    try:
        # Update repository status
        if repository_id in repositories:
            repositories[repository_id].analysis_status = "analyzing"
        
        # Parse GitHub URL
        parsed_url = urlparse(repository_url)
        if 'github.com' not in parsed_url.netloc:
            raise ValueError("Only GitHub repositories are supported")
        
        # Extract owner and repo name from URL
        path_parts = parsed_url.path.strip('/').split('/')
        if len(path_parts) < 2:
            raise ValueError("Invalid GitHub repository URL")
        
        owner = path_parts[0]
        repo_name = path_parts[1]
        
        # Analyze repository using GitHub API
        file_structure, technologies_detected, vibe_patterns, recommendations, complexity_score = await analyze_github_repository(owner, repo_name)
        
        # Create analysis record
        analysis_id = str(uuid.uuid4())
        analysis = RepositoryAnalysis(
            id=analysis_id,
            repository_id=repository_id,
            file_structure=file_structure,
            technologies_detected=technologies_detected,
            complexity_score=complexity_score,
            vibe_patterns=vibe_patterns,
            recommendations=recommendations,
            created_at=datetime.now()
        )
        
        analyses[analysis_id] = analysis
        
        # Update repository status
        if repository_id in repositories:
            repositories[repository_id].analysis_status = "completed"
            
    except Exception as e:
                # Update repository status to failed
        if repository_id in repositories:
            repositories[repository_id].analysis_status = "failed"
        print(f"Analysis failed for repository {repository_id}: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
