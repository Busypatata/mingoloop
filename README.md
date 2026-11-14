# Resume Ranker – Growth For Impact

A resume screening and ranking prototype built for the Growth For Impact Software Engineering Assignment.

**[Live Demo](https://resumeranker-flame.vercel.app/)**

## Features

- Processes 47 anonymised resumes against two job descriptions.
- Extracts skills, experience, education, projects and certifications.
- Classifies candidates based on their suitability for each role.
- Assigns separate scores out of 100 for both roles.
- Displays score breakdowns and supporting evidence.
- Provides candidate details, original resumes and extraction issues.
- Supports searching, filtering and sorting candidates.
- Allows reviewers to upload new resumes (`.pdf`, `.docx`, `.txt`, up to 4 MB).

## Job Profiles

| Role | Description |
|---|---|
| JD1 | LCA Consultant |
| JD2 | UI/UX Design Intern |

## Technology Stack

- Next.js
- TypeScript
- Mammoth
- unpdf
- TF-IDF and cosine similarity
- Vercel

## How It Works

1. Extracts text from resumes.
2. Identifies relevant skills, experience, education and projects.
3. Matches extracted information against both job descriptions.
4. Calculates weighted scores for each role.
5. Classifies and ranks candidates.
6. Displays scoring explanations and missing information.

## Project Structure

```text
app/          Application pages and upload API
components/   UI components
lib/          Extraction, scoring and classification
scripts/      Data generation and validation
data/         Candidate data and job descriptions
public/       Original resumes
```

## Getting Started

**Requirements:** Node.js 20.9+ and npm.

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd <YOUR_PROJECT_FOLDER>
npm install
npm run dev
```

Open http://localhost:3000.

### Available Commands

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build-data` | Regenerate candidate data |
| `npm run validate` | Validate extracted data |
| `npm run review` | Review candidate summaries |
| `npm run build` | Build for production |
| `npm start` | Start production server |

## Methodology

The application uses deterministic, rule-based scoring with predefined weights and a keyword lexicon. TF-IDF cosine similarity is used to measure resume similarity against each job description.

Detailed scoring rules are available at `/methodology`.

## Limitations

- Scanned resumes and image-only PDFs are not supported.
- Extraction accuracy may vary with complex resume layouts.
- Keyword-based matching may not capture full context.
- Scores are intended to assist reviewers, not replace human hiring decisions.

## Deployment

**Live Application:** https://resumeranker-flame.vercel.app/

Deployed on Vercel using Next.js. No environment variables are required.
