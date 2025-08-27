# Overview

MicroMood is a static web-based mental health application designed specifically for youth wellness and career development. The application combines daily mood tracking with client-side sentiment analysis and personalized microtask recommendations. Built with a focus on privacy and simplicity, all user data is stored locally in the browser. The system uses JavaScript-based keyword matching for sentiment analysis to provide insights into emotional patterns over time.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: Pure HTML5, CSS3, and JavaScript for static web deployment
- **UI Components**: Responsive design with tabbed navigation and mobile-friendly layout
- **Visualization**: Chart.js library for interactive mood tracking charts
- **State Management**: JavaScript localStorage for maintaining data persistence across browser sessions

## Backend Architecture
- **Core Logic**: Client-side JavaScript processing with modular function design
- **Sentiment Analysis**: Custom keyword-based sentiment analysis using positive/negative word lists
- **Data Processing**: JavaScript array methods for data manipulation and trend analysis
- **File I/O**: Browser localStorage for persistent JSON data storage

## Data Storage
- **Storage Type**: Browser localStorage using JSON format
- **Data Key**: `moodData` key in localStorage for persistent mood tracking data
- **Privacy Model**: All data remains in user's browser - no server storage or external data transmission
- **Data Structure**: JSON arrays storing mood entries with timestamps, stress levels, text descriptions, and sentiment scores

## Application Flow
- **Data Initialization**: Automatic loading of existing mood data from localStorage on page load
- **Real-time Processing**: Immediate client-side sentiment analysis of user mood text entries
- **Persistent Storage**: Automatic saving of mood data to browser localStorage after each entry
- **Error Handling**: Try-catch blocks for localStorage operations and sentiment analysis processing

# External Dependencies

## Core Libraries
- **Chart.js**: Interactive charting library loaded via CDN for mood visualization
- **HTML5/CSS3/JavaScript**: Native web technologies for the user interface
- **No external API dependencies**: All processing happens client-side

## Browser APIs Used
- **localStorage**: For persistent data storage in the browser
- **Date**: Native JavaScript Date object for timestamp handling
- **JSON**: Native JavaScript JSON methods for data serialization

## Development Requirements
- **Modern Web Browser**: Chrome, Firefox, Safari, or Edge with JavaScript enabled
- **HTTP Server**: Simple Python HTTP server or any static file server for development

## Deployment Requirements
- **Static Web Hosting**: Can be deployed on any static hosting service (Replit Static Deployments, GitHub Pages, Netlify, Vercel)
- **No Server Requirements**: Pure client-side application requiring no backend infrastructure