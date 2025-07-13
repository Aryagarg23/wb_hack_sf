# GYRUS - The Intelligent Browser

> **The browser which gives you ultimate ownership of your work**

GYRUS is an intelligent, Electron-based browser that combines traditional web browsing with AI-powered query processing, intent classification, and automated research workflows. It features a sophisticated backend that can understand user intent and automatically organize information into structured tasks and tabs.

## 🚀 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Installation & Setup](#installation--setup)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Development Guide](#development-guide)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## 📋 Overview

GYRUS is not just a browser—it's an intelligent workspace that understands your research needs. When you submit a query, GYRUS:

1. **Analyzes your intent** using advanced NLP classification
2. **Routes queries intelligently** based on intent (News, Research, Navigational, etc.)
3. **Automatically organizes results** into structured tasks and tabs
4. **Maintains a knowledge graph** of your research connections
5. **Provides a unified interface** for both simple searches and complex research workflows

### Key Concepts

- **Intent Classification**: Automatically categorizes queries into News, Research, Navigational, Transactional, or Answer intents
- **Task Management**: Organizes research into logical task groups with multiple tabs
- **General Tab**: A permanent workspace for simple queries and navigation
- **Knowledge Graph**: Connects related queries and links for future reference
- **MCP Integration**: Uses Model Context Protocol for advanced AI workflows

## 🏗️ Architecture

### System Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   AI Services   │
│   (Electron)    │◄──►│   (Flask)       │◄──►│   (MCP/CrewAI)  │
│                 │    │                 │    │                 │
│ • Browser UI    │    │ • Intent Class. │    │ • News Crew     │
│ • Tab Mgmt      │    │ • Query Proc.   │    │ • Research Crew │
│ • Task Org.     │    │ • Knowledge DB  │    │ • Vector Search │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Component Architecture

#### Frontend (Electron Browser)
- **Main Process**: Handles window management and system integration
- **Renderer Process**: Manages the browser UI and web content
- **IPC Communication**: Secure communication between processes
- **Webview Integration**: Native web content rendering

#### Backend (Flask API)
- **Intent Classification**: Uses `fivedvector.py` for query intent analysis
- **Query Processing**: Routes queries based on intent classification
- **Knowledge Management**: Maintains connections between queries and links
- **MCP Integration**: Orchestrates AI workflows for complex queries

#### AI Services (MCP/CrewAI)
- **News Crew**: Specialized for news and current events queries
- **Research Crew**: Handles academic and research-oriented queries
- **Vector Search**: Semantic search capabilities using embeddings
- **Knowledge Graph**: Maintains relationships between concepts

## ✨ Features

### 🎯 Intelligent Query Processing

#### Intent Classification
GYRUS automatically classifies your queries into five categories:

- **News** (`News`): Current events, breaking news, recent developments
- **Research** (`Research`): Academic research, deep analysis, comprehensive studies
- **Navigational** (`Navigational`): Direct website navigation, specific URLs
- **Transactional** (`Transactional`): Shopping, booking, form submissions
- **Answer** (`Answer`): Simple questions, definitions, quick facts

#### Query Routing
- **News/Research**: Creates dedicated tasks with multiple processed links
- **Navigational/Transactional/Answer**: Uses Google search in the General tab

### 📚 Task & Tab Management

#### Task Organization
- **Automatic Task Creation**: News and Research queries create new tasks
- **Task Naming**: Intelligent task titles based on query content
- **Task Icons**: Automatic icon detection based on content analysis
- **Task Persistence**: Tasks persist across browser sessions

#### Tab Management
- **Auto Tab Creation**: Each search result becomes a tab
- **Tab Grouping**: Tabs are organized within their respective tasks
- **Tab Persistence**: Tab state is maintained during navigation
- **Tab Duplication**: Support for duplicating existing tabs

#### General Tab
- **Permanent Workspace**: Always available for simple queries
- **Google Integration**: Direct Google search for basic queries
- **Query History**: Maintains recent search queries
- **No Task Overhead**: Simple queries don't create unnecessary tasks

### 🔍 Advanced Search Capabilities

#### Multi-Engine Search
- **Google Search**: Primary search engine for simple queries
- **Specialized Crews**: AI-powered search for complex queries
- **Fallback Support**: Graceful degradation when services are unavailable

#### Content Analysis
- **Link Analysis**: Automatic favicon and title extraction
- **Content Categorization**: Intelligent categorization of search results
- **Snippet Generation**: Automatic snippet generation for search results

### 🧠 Knowledge Management

#### Query-Link Connections
- **Automatic Linking**: Connects queries to their search results
- **Intent Tracking**: Maintains intent classification for each query
- **Relationship Mapping**: Builds connections between related queries

#### Concept Management
- **Similarity Detection**: Finds similar concepts using vector embeddings
- **Concept Creation**: Automatically creates new concepts for unique queries
- **Concept Linking**: Connects related queries to existing concepts

### 🎨 User Interface

#### Modern Design
- **Dark Theme**: Eye-friendly dark color scheme
- **Responsive Layout**: Adapts to different window sizes
- **Smooth Animations**: Fluid transitions and interactions
- **Custom Controls**: Native-looking window controls

#### Navigation Features
- **Sidebar Navigation**: Collapsible task and tab navigation
- **URL Bar**: Direct URL input and navigation
- **Keyboard Shortcuts**: Efficient keyboard navigation
- **Focus Mode**: Distraction-free browsing experience

## 🛠️ Technology Stack

### Frontend Technologies
- **Electron**: Cross-platform desktop application framework
- **HTML5/CSS3**: Modern web standards for UI
- **JavaScript (ES6+)**: Modern JavaScript with async/await
- **D3.js**: Data visualization and network graphs

### Backend Technologies
- **Flask**: Lightweight Python web framework
- **SQLAlchemy**: Database ORM and management
- **ChromaDB**: Vector database for embeddings
- **Neo4j**: Graph database for knowledge relationships

### AI & ML Technologies
- **CrewAI**: Multi-agent AI framework
- **LangChain**: LLM orchestration and integration
- **Sentence Transformers**: Text embedding models
- **SpaCy**: Natural language processing
- **OpenAI API**: Advanced language model integration

### Development Tools
- **ESLint**: JavaScript code linting
- **Prettier**: Code formatting
- **Electron Builder**: Application packaging
- **Python venv**: Virtual environment management

## 📦 Installation & Setup

### Prerequisites

#### System Requirements
- **Operating System**: Windows 10+, macOS 10.14+, or Linux
- **Node.js**: Version 14.0.0 or higher
- **Python**: Version 3.8 or higher
- **Memory**: Minimum 4GB RAM (8GB recommended)
- **Storage**: 2GB free disk space

#### Development Requirements
- **Git**: Version control system
- **npm**: Node.js package manager
- **pip**: Python package manager
- **Virtual Environment**: Python virtual environment support

### Installation Steps

#### 1. Clone the Repository
```bash
git clone https://github.com/your-username/gyrus-browser.git
cd gyrus-browser
```

#### 2. Backend Setup

##### Create Python Virtual Environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

##### Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

##### Environment Configuration
Create a `.env` file in the backend directory:
```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Database Configuration
DATABASE_URL=sqlite:///gyrus.db

# Vector Database
CHROMA_PERSIST_DIRECTORY=./chroma_db

# Neo4j Configuration (optional)
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password
```

#### 3. Frontend Setup

##### Install Node.js Dependencies
```bash
cd browser
npm install
```

##### Development Dependencies
```bash
npm install --save-dev electron-builder eslint prettier
```

#### 4. Database Initialization

##### Initialize Knowledge Graph
```bash
cd backend
python -c "from src.db_schema import init_db; init_db()"
```

##### Initialize Vector Database
```bash
python -c "from src.fivedvector import init_vector_db; init_vector_db()"
```

### Quick Start

#### Development Mode
```bash
# Terminal 1: Start Backend
cd backend
python src/app.py

# Terminal 2: Start Frontend
cd browser
npm run dev
```

#### Production Mode
```bash
# Build the application
cd browser
npm run build

# Run the built application
./dist/Gyrus Browser.exe  # Windows
./dist/Gyrus Browser.app   # macOS
./dist/Gyrus Browser       # Linux
```

## 🎮 Usage

### Basic Usage

#### 1. Starting the Browser
- Launch the Gyrus Browser application
- The browser opens with the General tab active
- The left sidebar shows available tasks
- The right sidebar shows tabs for the active task

#### 2. Making Queries
- **Simple Queries**: Type directly in the query input
- **Complex Queries**: Use the expanded query input for longer queries
- **Keyboard Shortcuts**:
  - `Enter`: Submit query in pill mode
  - `Ctrl+Enter`: Submit query in editor mode
  - `Shift+Enter`: Toggle editor mode

#### 3. Understanding Results
- **News/Research Queries**: Create new tasks with multiple tabs
- **Simple Queries**: Open in the General tab
- **Task Organization**: Results are automatically organized by intent

### Advanced Usage

#### Task Management
- **Creating Tasks**: Tasks are automatically created for News/Research queries
- **Switching Tasks**: Click on task names in the left sidebar
- **Closing Tasks**: Use the close button on task items
- **Task Icons**: Automatically assigned based on content analysis

#### Tab Management
- **Auto Tab Creation**: Each search result becomes a tab
- **Tab Navigation**: Click on tab names in the right sidebar
- **Tab Closing**: Use the close button on tab items
- **Tab Duplication**: Use `@duplicate` command in URL bar

#### URL Bar Commands
- **Direct URLs**: Enter any valid URL
- **Search Engines**: Use `@google`, `@bing`, `@duckduckgo`
- **Tab Duplication**: Use `@duplicate tab_name`
- **Multiple URLs**: Separate with `|`, `;`, or `,`

#### Keyboard Navigation
- **Ctrl+T**: Open query input
- **Ctrl+W**: Close active tab
- **Ctrl+Shift+T**: Reopen closed tab
- **F11**: Toggle fullscreen
- **Escape**: Exit editor mode

### Query Examples

#### News Queries
```
"Latest AI developments 2024"
"Breaking news about climate change"
"Recent tech company acquisitions"
```

#### Research Queries
```
"Machine learning algorithms comparison"
"Quantum computing research papers"
"Blockchain technology applications"
```

#### Simple Queries
```
"weather today"
"restaurants near me"
"how to cook pasta"
```

## 🔌 API Documentation

### Backend API Endpoints

#### Search API
```http
POST /api/search
Content-Type: application/json

{
  "query": "your search query here"
}
```

**Response Format**
```json
{
  "intent": "News|Research|Navigational|Transactional|Answer",
  "links": [
    {
      "link": "https://example.com",
      "title": "Example Title",
      "snippet": "Example description"
    }
  ]
}
```

#### Add Links API
```http
POST /api/add-links
Content-Type: application/json

{
  "links": ["https://example.com"],
  "query": "original query",
  "intent": "News"
}
```

#### Knowledge Graph API
```http
POST /api/get-all-links-to-concept
Content-Type: application/json

{
  "query": "concept name"
}
```

```http
GET /api/get-graph
```

### Frontend API Integration

#### Query Submission
```javascript
const response = await fetch('http://127.0.0.1:5000/api/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: userQuery })
});
```

#### Link Addition
```javascript
await fetch('http://127.0.0.1:5000/api/add-links', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    links: [tabUrl],
    query: currentQuery,
    intent: currentIntent
  })
});
```

## 🛠️ Development Guide

### Project Structure

```
gyrus-browser/
├── backend/                    # Python Flask backend
│   ├── src/
│   │   ├── app.py             # Main Flask application
│   │   ├── db_schema.py       # Database models and schema
│   │   ├── fivedvector.py     # Intent classification
│   │   └── query_orch.py      # Query orchestration
│   ├── MCP/                   # Model Context Protocol
│   │   ├── newscrew_http.py   # News processing crew
│   │   ├── researchcrew.py    # Research processing crew
│   │   └── weavewithcrew.py   # Crew orchestration
│   ├── tools/                 # Utility tools
│   │   ├── concept_categorizer.py
│   │   ├── intent_categorizer.py
│   │   └── sources_parser.py
│   └── requirements.txt       # Python dependencies
├── browser/                   # Electron frontend
│   ├── src/
│   │   ├── js/
│   │   │   └── app.js         # Main application logic
│   │   ├── components/        # UI components
│   │   └── styles/            # CSS styling
│   ├── main.js               # Electron main process
│   ├── preload.js            # Preload scripts
│   └── package.json          # Node.js dependencies
├── model-finetune/           # Model fine-tuning scripts
└── README.md                 # This file
```

### Development Workflow

#### 1. Setting Up Development Environment
```bash
# Clone and setup
git clone <repository>
cd gyrus-browser

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt

# Frontend setup
cd ../browser
npm install
```

#### 2. Running in Development Mode
```bash
# Terminal 1: Backend
cd backend
python src/app.py

# Terminal 2: Frontend
cd browser
npm run dev
```

#### 3. Code Quality
```bash
# JavaScript linting
cd browser
npm run lint

# Python formatting
cd backend
black src/
flake8 src/
```

### Adding New Features

#### Frontend Features
1. **UI Components**: Add new components in `browser/src/components/`
2. **Styling**: Add CSS in `browser/src/styles/`
3. **Logic**: Extend `browser/src/js/app.js`
4. **Configuration**: Update `browser/package.json`

#### Backend Features
1. **API Endpoints**: Add routes in `backend/src/app.py`
2. **Database Models**: Extend `backend/src/db_schema.py`
3. **AI Integration**: Add crews in `backend/MCP/`
4. **Tools**: Add utilities in `backend/tools/`

#### Intent Classification
1. **Model Training**: Use `model-finetune/` directory
2. **Classification Logic**: Modify `backend/src/fivedvector.py`
3. **Intent Types**: Add new intents in classification logic

### Testing

#### Frontend Testing
```bash
cd browser
npm test
```

#### Backend Testing
```bash
cd backend
python -m pytest tests/
```

#### Integration Testing
```bash
# Start both services
npm run dev

# Run integration tests
npm run test:integration
```

## ⚙️ Configuration

### Environment Variables

#### Backend Configuration
```env
# API Keys
OPENAI_API_KEY=your_openai_api_key
COHERE_API_KEY=your_cohere_api_key

# Database
DATABASE_URL=sqlite:///gyrus.db
CHROMA_PERSIST_DIRECTORY=./chroma_db

# Neo4j (optional)
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password

# Server
FLASK_ENV=development
FLASK_DEBUG=1
PORT=5000
```

#### Frontend Configuration
```json
{
  "backendUrl": "http://127.0.0.1:5000",
  "devMode": true,
  "enableLogging": true,
  "maxTabsPerTask": 50,
  "defaultSearchEngine": "google"
}
```

### Customization Options

#### Intent Classification
- **Thresholds**: Adjust classification confidence thresholds
- **Models**: Switch between different classification models
- **Categories**: Add or modify intent categories

#### UI Customization
- **Themes**: Modify color schemes in CSS variables
- **Layout**: Adjust sidebar widths and positioning
- **Animations**: Customize transition effects

#### Search Behavior
- **Engines**: Configure different search engines
- **Results**: Adjust number of results per query
- **Fallbacks**: Configure fallback search behavior

## 🐛 Troubleshooting

### Common Issues

#### Backend Issues

**Problem**: Backend won't start
```bash
# Check Python version
python --version  # Should be 3.8+

# Check virtual environment
which python  # Should point to venv

# Check dependencies
pip list  # Should show all required packages
```

**Problem**: API calls failing
```bash
# Check server status
curl http://127.0.0.1:5000/api/health

# Check logs
tail -f backend/logs/app.log
```

**Problem**: Intent classification errors
```bash
# Check model files
ls backend/models/

# Reinstall models
python -m spacy download en_core_web_sm
```

#### Frontend Issues

**Problem**: Browser won't start
```bash
# Check Node.js version
node --version  # Should be 14+

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Problem**: Tabs not creating
```bash
# Check browser console
# Open DevTools (F12) and check for errors

# Check backend connection
# Verify backend is running on correct port
```

**Problem**: UI not responsive
```bash
# Check for JavaScript errors
# Open DevTools and check Console tab

# Restart the application
# Close and reopen the browser
```

### Performance Issues

#### Slow Query Processing
- **Check API Keys**: Verify OpenAI/Cohere API keys are valid
- **Monitor Resources**: Check CPU and memory usage
- **Optimize Models**: Use smaller models for faster processing

#### Memory Issues
- **Limit Tab Count**: Reduce maximum tabs per task
- **Clear Cache**: Clear browser cache and data
- **Restart Application**: Restart to free up memory

#### Network Issues
- **Check Connectivity**: Verify internet connection
- **Proxy Settings**: Configure proxy if behind corporate firewall
- **API Limits**: Check API rate limits and quotas

### Debug Mode

#### Enable Debug Logging
```bash
# Backend debug
export FLASK_DEBUG=1
python src/app.py

# Frontend debug
npm run dev -- --debug
```

#### Log Files
- **Backend Logs**: `backend/logs/app.log`
- **Frontend Logs**: Browser DevTools Console
- **System Logs**: Check system event logs

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Code Standards
- **JavaScript**: Follow ESLint configuration
- **Python**: Follow PEP 8 style guide
- **CSS**: Use BEM methodology
- **Git**: Use conventional commit messages

### Testing Guidelines
- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test API endpoints and workflows
- **End-to-End Tests**: Test complete user workflows
- **Performance Tests**: Test with large datasets

### Documentation
- **Code Comments**: Add inline documentation
- **API Documentation**: Update API docs for new endpoints
- **User Documentation**: Update README for new features
- **Architecture Docs**: Update architecture diagrams

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Electron Team**: For the amazing desktop app framework
- **OpenAI**: For providing the GPT models
- **CrewAI**: For the multi-agent AI framework
- **LangChain**: For LLM orchestration tools
- **SpaCy**: For natural language processing capabilities

## 📞 Support

- **Issues**: Report bugs on GitHub Issues
- **Discussions**: Join discussions on GitHub Discussions
- **Documentation**: Check the docs folder for detailed guides
- **Community**: Join our Discord server for community support

---

**GYRUS** - Empowering your research with intelligent browsing.
