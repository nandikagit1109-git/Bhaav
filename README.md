# Bhaav Backend

"It reads what you don't say."

A lightweight writing space designed for wellbeing and self-awareness. The system observes typing behavior rather than content, building a personal baseline to help users notice changes in their own patterns.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Generate demo data (14 days)
npm run generate-demo
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/session` | Submit typing session data |
| GET | `/insight/:user_id` | Get AI-powered pattern insight |

## Architecture

- **Feature Extraction**: Analyzes typing patterns (WPM, pauses, backspace rate, etc.)
- **Personal Baseline**: Compares against the user's own history (not others)
- **Deviation Scoring**: Z-score based measurement of pattern changes
- **AI Insights**: Non-clinical observations about typing pattern changes

## Important

This is a **self-awareness tool**, NOT a clinical diagnostic system. It identifies changes from your personal typing baseline. It never diagnoses or labels mental health conditions.
