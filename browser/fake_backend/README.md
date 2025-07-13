# Fake Backend Server

This is a simple Express.js server that simulates a backend API for the browser application. It accepts queries and returns 5 fake search result links.

## Setup

1. Navigate to the fake_backend directory:
   ```bash
   cd browser/fake_backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3001`

## API Endpoints

### POST /api/query
Accepts a query and returns 5 fake search result links.

**Request:**
```json
{
  "query": "your search query here"
}
```

**Response:**
```json
{
  "success": true,
  "query": "your search query here",
  "links": [
    {
      "url": "https://www.google.com/search?q=your%20search%20query%20here",
      "title": "your search query here - Search Results",
      "description": "Search result 1 for \"your search query here\""
    },
    // ... 4 more links
  ],
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### GET /api/health
Health check endpoint to verify the server is running.

**Response:**
```json
{
  "status": "ok",
  "message": "Fake backend server is running",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Integration with Browser

The browser application is configured to call this backend when a query is submitted. The backend will return 5 links, and the browser will automatically create 5 tabs, one for each link.

## Fallback Behavior

If the backend server is not running or returns an error, the browser will fall back to creating a single tab with a Google search for the query. 