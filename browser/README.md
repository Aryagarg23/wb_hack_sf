# Gyrus Browser with Fake Backend

An Electron-based browser application with a fake backend that accepts queries and returns 5 search result links, automatically creating tabs for each result.

## Features

- **Query Input**: Type queries in the query box and get 5 search results
- **Auto Tab Creation**: Each search result automatically opens in a new tab
- **Fake Backend**: Simulated API that returns 5 different search engine links
- **Fallback Support**: If backend is unavailable, falls back to Google search

## Setup

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. Install browser dependencies:
   ```bash
   cd browser
   npm install
   ```

2. Install fake backend dependencies:
   ```bash
   cd fake_backend
   npm install
   ```

## Running the Application

### Option 1: Run Both Together (Recommended)
```bash
cd browser
npm run dev
```

This will start both the fake backend server and the Electron browser simultaneously.

### Option 2: Run Separately

1. Start the fake backend server:
   ```bash
   cd browser
   npm run fake-backend
   ```
   
   Or use the provided scripts:
   ```bash
   # Windows
   start-fake-backend.bat
   
   # PowerShell
   .\start-fake-backend.ps1
   ```

2. In a new terminal, start the browser:
   ```bash
   cd browser
   npm start
   ```

## How It Works

1. **Query Submission**: Type a query in the query input box and press Enter or click Send
2. **Backend Call**: The browser sends the query to `http://localhost:3001/api/query`
3. **Response Processing**: The backend returns 5 fake search result links
4. **Tab Creation**: The browser automatically creates 5 new tabs, one for each link
5. **Fallback**: If the backend is unavailable, creates a single Google search tab

## Fake Backend API

The fake backend runs on `http://localhost:3001` and provides:

- **POST /api/query**: Accepts queries and returns 5 search result links
- **GET /api/health**: Health check endpoint

### Example Response
```json
{
  "success": true,
  "query": "javascript tutorial",
  "links": [
    {
      "url": "https://www.google.com/search?q=javascript%20tutorial",
      "title": "javascript tutorial - Search Results",
      "description": "Search result 1 for \"javascript tutorial\""
    },
    {
      "url": "https://www.bing.com/search?q=javascript%20tutorial",
      "title": "javascript tutorial - Information",
      "description": "Search result 2 for \"javascript tutorial\""
    }
    // ... 3 more links
  ]
}
```

## Development

### Project Structure
```
browser/
├── src/
│   ├── js/
│   │   └── app.js          # Main browser logic with backend integration
│   ├── components/
│   │   └── query-input.html # Query input component
│   └── ...
├── fake_backend/
│   ├── server.js           # Express server with query API
│   ├── package.json        # Backend dependencies
│   └── README.md           # Backend documentation
└── package.json            # Browser dependencies
```

### Customizing the Fake Backend

You can modify `fake_backend/server.js` to:
- Change the search engines used
- Modify the number of links returned
- Add different types of search results
- Implement more sophisticated query processing

### Adding New Features

The browser's `app.js` file contains the integration logic in the `submitQuery` function. You can extend this to:
- Add loading states
- Implement error handling
- Add query history
- Support different types of queries

## Troubleshooting

### Backend Not Starting
- Check if port 3001 is available
- Ensure all dependencies are installed
- Check the console for error messages

### Browser Can't Connect to Backend
- Verify the backend is running on `http://localhost:3001`
- Check the browser's developer console for network errors
- The browser will fall back to Google search if backend is unavailable

### Tabs Not Creating
- Check the browser's developer console for JavaScript errors
- Verify the query input is working properly
- Ensure the backend is returning valid JSON responses 