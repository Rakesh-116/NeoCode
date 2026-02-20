# Time Complexity Analysis Feature - Setup Guide

## Overview
This feature adds AI-powered time complexity analysis to your NeoCode platform using Google's Gemini API. When users submit code, they can click an "Analyze Complexity" button to get the Big O notation of their algorithm.

## Features Implemented
- ✅ AI-powered complexity analysis using Gemini API
- ✅ Smart caching system (localStorage) to avoid repeated API calls
- ✅ Clean UI integration in submission modal
- ✅ Support for Java, Python, C++, JavaScript, and C
- ✅ Proper error handling and loading states

## Setup Instructions

### 1. Install Dependencies

**Backend (bz-server):**
```bash
cd bz-server
npm install @google/generative-ai
```

**Frontend (bz-client):**
```bash
cd bz-client
npm install crypto-js
```

### 2. Environment Configuration

Add your Gemini API key to your backend environment file:

**Create/Update `.env` in bz-server:**
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=your_port_number
# ... other existing environment variables
```

**Get Gemini API Key:**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy and paste it into your .env file

### 3. Files Added/Modified

**New Files Created:**
- `bz-server/src/services/geminiComplexityAnalyzer.js` - AI service for complexity analysis
- `bz-server/src/controllers/complexity.controller.js` - API controller
- `bz-server/src/routes/complexity.routes.js` - API routes
- `bz-client/src/utils/complexityCache.js` - Caching utility

**Modified Files:**
- `bz-server/src/index.js` - Added complexity route
- `bz-client/src/components/pages/Submissions/SubmissionViewPage.jsx` - Added UI and functionality

### 4. API Endpoint

**New Endpoint Added:**
```
POST /api/complexity/analyze
Authorization: Bearer <jwt_token>
Content-Type: application/json

Request Body:
{
  "code": "your_source_code_here",
  "language": "java" // or "python", "cpp", etc.
}

Response:
{
  "success": true,
  "complexity": "O(n²)",
  "language": "java",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 5. How It Works

1. **User Submits Code** → Normal submission flow works as before
2. **Submission Modal Opens** → New "Time Complexity" column appears
3. **User Clicks "✨ Analyze"** → Button sends request to backend
4. **Backend Calls Gemini** → AI analyzes the code and returns Big O notation
5. **Result Cached** → Future requests for same code return instantly from cache
6. **Result Displayed** → Shows complexity like "O(n²)" with cache indicator

### 6. Caching System

The caching system is intelligent:
- **Key Generation**: Uses MD5 hash of `language:code` combination
- **LRU Eviction**: Removes oldest entries when cache exceeds 100 items
- **Automatic Cleanup**: Removes entries older than 7 days
- **Storage**: Uses localStorage for persistence across sessions

### 7. Error Handling

The system handles various error scenarios:
- **No API Key**: Returns service not configured error
- **Network Issues**: Shows connection error to user
- **Invalid Code**: Gemini returns appropriate error message
- **Rate Limiting**: Shows rate limit exceeded message
- **Cache Full**: Automatically clears old entries

### 8. UI Features

- **Sparkle Icon (✨)**: Indicates AI-powered feature
- **Loading Animation**: Shows spinner while analyzing
- **Cache Indicator**: Shows "cached" for previously analyzed code
- **Error Display**: Shows user-friendly error messages
- **Responsive Design**: Works on mobile and desktop

### 9. System Prompt

The Gemini AI uses a carefully crafted system prompt that:
- Forces only Big O notation responses (no explanations)
- Handles nested loops, recursion, and complex algorithms
- Returns worst-case complexity
- Works across multiple programming languages

### 10. Testing

To test the feature:
1. Start your backend server
2. Make sure GEMINI_API_KEY is set in environment
3. Submit any code in the frontend
4. Click the "✨ Analyze" button in the submission modal
5. Verify complexity appears and gets cached

### 11. Cost Considerations

- **Caching Reduces Costs**: Same code won't call API repeatedly
- **Efficient Prompts**: Short, focused prompts minimize token usage
- **Rate Limiting**: Consider implementing if needed for production

## Example Usage

```javascript
// Example code that would be analyzed
function bubbleSort(arr) {
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr.length - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            }
        }
    }
    return arr;
}

// Expected AI Response: "O(n²)"
```

## Troubleshooting

**Common Issues:**
1. **API Key Error**: Make sure GEMINI_API_KEY is in .env file
2. **Dependencies Missing**: Run npm install commands
3. **CORS Issues**: Ensure frontend URL is in CORS allowedOrigins
4. **Cache Issues**: Clear localStorage if needed: `localStorage.removeItem('neocode_complexity_cache')`

The feature is now ready to use! Users will see a new "Time Complexity" column in their submission modals with an AI-powered analyze button.