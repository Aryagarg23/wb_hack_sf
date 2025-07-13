# GYRUS - Intelligent Browser

> **The browser which gives you ultimate ownership of your work**

GYRUS is an Electron-based browser with AI-powered intent classification that automatically organizes your research into structured tasks and tabs.

## 🚀 Features

### Intent Classification
- **News**: Current events and breaking news
- **Research**: Academic research and deep analysis  
- **Navigational**: Direct website navigation
- **Transactional**: Shopping, booking, forms
- **Answer**: Simple questions and facts

### Task & Tab Management
- **Automatic Task Creation**: News/Research queries create new tasks
- **General Tab**: Permanent workspace for simple queries
- **Auto Tab Creation**: Each search result becomes a tab
- **Task Persistence**: Tasks and tabs persist across sessions

### Search Integration
- **Multi-Engine**: Google search + AI-powered crews for complex queries
- **News Crew**: Specialized for news and current events
- **Research Crew**: Handles academic and research queries
- **Fallback Support**: Google search when AI services unavailable

## 🛠️ Technology Stack

### Frontend
- **Electron**: Desktop application framework
- **HTML5/CSS3**: Modern UI with ITCSS architecture
- **JavaScript**: ES6+ with async/await
- **D3.js**: Network visualization

### Backend
- **Flask**: Python web framework
- **SQLAlchemy**: Database ORM
- **ChromaDB**: Vector database
- **CrewAI**: Multi-agent AI framework
- **SpaCy**: NLP processing

## 📦 Installation

### Prerequisites
- Node.js 14+
- Python 3.8+
- Git

### Setup

1. **Clone Repository**
```bash
git clone <repository-url>
cd gyrus-browser
```

2. **Backend Setup**
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
```

3. **Frontend Setup**
```bash
cd browser
npm install
```

4. **Environment Configuration**
Create `backend/.env`:
```env
OPENAI_API_KEY=your_openai_api_key
DATABASE_URL=sqlite:///gyrus.db
CHROMA_PERSIST_DIRECTORY=./chroma_db
```

## 🚀 Running

### Development Mode
```bash
# Terminal 1: Backend
cd backend
python src/app.py

# Terminal 2: Frontend  
cd browser
npm run dev
```

### Production Build
```bash
cd browser
npm run build
```

## 📖 Usage

### Basic Workflow
1. **Launch Browser**: Opens with General tab active
2. **Submit Query**: Type in query input and press Enter
3. **Intent Classification**: System automatically categorizes your query
4. **Result Organization**: 
   - News/Research → New task with multiple tabs
   - Simple queries → General tab

### Query Examples
- **News**: "Latest AI developments 2024"
- **Research**: "Machine learning algorithms comparison"  
- **Simple**: "weather today", "restaurants near me"

### Keyboard Shortcuts
- `Ctrl+T`: Open query input
- `Ctrl+Enter`: Submit in editor mode
- `Enter`: Submit in pill mode
- `Ctrl+W`: Close active tab

## 🔌 API Endpoints

### Search API
```http
POST /api/search
{
  "query": "your search query"
}
```

### Add Links API
```http
POST /api/add-links
{
  "links": ["https://example.com"],
  "query": "original query",
  "intent": "News"
}
```

### Knowledge Graph API
```http
POST /api/get-all-links-to-concept
GET /api/get-graph
```

## 🏗️ Project Structure

```
gyrus-browser/
├── backend/
│   ├── src/
│   │   ├── app.py              # Flask API endpoints
│   │   ├── fivedvector.py      # Intent classification
│   │   ├── db_schema.py        # Database models
│   │   └── query_orch.py       # Query orchestration
│   ├── MCP/
│   │   ├── newscrew_http.py    # News processing
│   │   ├── researchcrew.py     # Research processing
│   │   └── mcp_server.py       # MCP server
│   └── tools/                  # Utility tools
├── browser/
│   ├── src/
│   │   ├── js/app.js           # Main application logic
│   │   ├── components/         # UI components
│   │   └── styles/             # CSS styling
│   └── main.js                 # Electron main process
└── model-finetune/             # Model training scripts
```

## 🐛 Troubleshooting

### Common Issues

**Backend Won't Start**
```bash
# Check Python version
python --version  # Should be 3.8+

# Check virtual environment
which python  # Should point to venv

# Check dependencies
pip list
```

**Frontend Won't Start**
```bash
# Check Node.js version
node --version  # Should be 14+

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**API Connection Issues**
```bash
# Check backend status
curl http://127.0.0.1:5000/api/health

# Check browser console for errors
# Open DevTools (F12)
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Make changes and test
4. Submit pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file.

---

**GYRUS** - Intelligent browsing for the modern researcher.
