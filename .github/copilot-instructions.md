<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Ollama Chat Interface Project Instructions

This is a HTML/CSS/JavaScript project that creates a web interface for communicating with an Ollama server.

## Project Structure
- `index.html` - Main HTML file with chat interface
- `style.css` - Styling for modern, responsive UI
- `script.js` - JavaScript for API communication with Ollama server

## API Integration
The project integrates with Ollama server at `https://f2ki-h100-1.f2.htw-berlin.de:11435` using these endpoints:
- `/api/chat` - Chat completion
- `/api/generate` - Text completion
- `/api/tags` - List available models

## Key Features
- Model selection and listing
- Chat interface with message history
- Text completion functionality
- Responsive design
- Error handling and loading states
- CORS-friendly implementation

## Code Style Guidelines
- Use modern JavaScript (ES6+)
- Follow semantic HTML structure
- Use CSS Grid/Flexbox for layouts
- Handle async operations properly
- Include proper error handling
- Maintain accessibility standards
