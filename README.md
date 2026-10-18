# Life in Algorithms — Decision Simulator

**A full-stack decision-support application that turns complex real-life choices into structured, data-driven comparisons.**

Life in Algorithms helps users evaluate alternatives using weighted criteria, compare results through a scoring algorithm, and understand how changing priorities can affect the final decision.

🌐 **Live Demo:** [Try Life in Algorithms](https://life-in-algorithms-bvbhkf1p9-sidra-tahseen.vercel.app/)

---

## Overview

Everyday decisions often involve competing priorities. Choosing between internships, projects, career paths, or other alternatives can become difficult when several factors matter at once.

**Life in Algorithms** approaches this problem computationally. Users define their alternatives, select evaluation criteria, assign weights to those criteria, and score each alternative. The application calculates weighted scores, ranks the alternatives, and provides sensitivity analysis to explore how changes in priorities may influence the outcome.

The goal is not to make decisions on behalf of users, but to make the reasoning behind them more structured, transparent, and measurable.

## Features

- **Weighted Decision Analysis** — Evaluate alternatives against multiple criteria with customizable importance weights.
- **Benefit and Cost Criteria** — Handle criteria where higher scores are better as well as criteria where lower scores are preferable.
- **Automated Ranking** — Calculate normalized weighted scores and rank alternatives based on their overall performance.
- **Sensitivity Analysis** — Explore how changing criterion weights can affect rankings and potentially change the winning alternative.
- **Decision History** — Save and retrieve previous evaluations using MongoDB Atlas, allowing users to revisit earlier decisions.
- **Full-Stack Integration** — Connect a React frontend to a REST API built with Node.js and Express.
- **Live Deployment** — Run the application through a deployed frontend and backend without setting up the project locally.

## How It Works

1. **Define the decision:** Identify the alternatives you want to compare.
2. **Choose criteria:** Add the factors that matter to the decision.
3. **Assign weights:** Specify the relative importance of each criterion.
4. **Score alternatives:** Rate each alternative against the selected criteria on a scale of 1–5.
5. **Evaluate:** Calculate weighted scores and rank the alternatives.
6. **Analyze sensitivity:** Examine how different weighting choices influence the result.
7. **Review history:** Revisit previously saved evaluations.

## Decision Algorithm

The simulator uses a weighted scoring approach with normalization.

### 1. Weight Normalization

Criterion weights are normalized so their relative importance is preserved, regardless of the original weight values.

For criterion \(i\):

$$
w_i' = \frac{w_i}{\sum_{j=1}^{n} w_j}
$$

### 2. Score Normalization

Each criterion score is rated from 1 to 5 and converted to a utility value between 0 and 1.

For a **benefit criterion**, where higher is better:

$$
u(s) = \frac{s-1}{4}
$$

For a **cost criterion**, where lower is better:

$$
u(s) = \frac{5-s}{4}
$$

Here, \(s\) is the original score.

### 3. Weighted Score Calculation

The normalized utility of each criterion is multiplied by its normalized weight. The contributions are added to calculate the alternative's final score.

$$
S_k = 100\sum_{i=1}^{n} w_i' u_{ik}
$$

Where:

- \(S_k\) is the final score of alternative \(k\), expressed out of 100.
- \(w_i'\) is the normalized weight of criterion \(i\).
- \(u_{ik}\) is the normalized utility of alternative \(k\) for criterion \(i\).

Alternatives are ranked in descending order of their final scores.

### 4. Sensitivity Analysis

The simulator evaluates decisions across multiple weighting scenarios to examine whether the ranking remains stable as criterion importance changes.

This helps identify decisions that are sensitive to the user's priorities. Results should be interpreted as decision-support information rather than a guaranteed objectively best choice.
## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| API | REST API |
| Deployment | Vercel (frontend), Render (backend) |
| Development Tools | Git, GitHub, npm |

## Architecture

```text
User
  |
  v
React + Vite Frontend
  |
  | HTTP Requests
  v
Express REST API
  |
  v
Decision Routes
  |
  v
Decision Controller
  |
  +------> Decision Engine
  |        - Weighted scoring
  |        - Ranking
  |        - Sensitivity analysis
  |
  +------> MongoDB Atlas
           - Saved decisions
           - Decision history
```

The frontend handles user interaction and displays evaluation results. The backend exposes API endpoints, coordinates the decision logic, and communicates with MongoDB Atlas for persistent decision history.

## Project Structure

```text
life-in-algorithms/
├── src/
│   ├── controllers/
│   │   └── decisionController.js
│   ├── logic/
│   │   └── decisionEngine.js
│   ├── models/
│   │   └── Decision.js
│   ├── routes/
│   │   └── decisionRoutes.js
│   └── server.js
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.css
│   └── .env.production
├── .gitignore
└── package.json
```

## Run Locally

### Prerequisites

- Node.js and npm
- A MongoDB Atlas account or another compatible MongoDB deployment
- Git

### 1. Clone the repository

```bash
git clone https://github.com/sidra-tahseen/life-in-algorithms.git
cd life-in-algorithms
```

### 2. Configure the backend

Create a `.env` file in the project root:

```env
MONGODB_URI=your_mongodb_connection_string
PORT=5000
```

Replace the placeholder with your MongoDB connection string. Keep your credentials private and never commit your `.env` file.

### 3. Install dependencies

Install the backend dependencies from the project root:

```bash
npm install
```

Install the frontend dependencies:

```bash
cd client
npm install
```

### 4. Configure the frontend API URL

Create or update `client/.env.development`:

```env
VITE_API_URL=http://localhost:5000
```

The frontend uses this variable to connect to the backend. For production, configure `VITE_API_URL` with your deployed backend URL.

### 5. Start the application

Start the backend in one terminal, from the project root:

```bash
npm run dev
```

If the project does not define a `dev` script, use its configured start script instead, such as `npm start`.

Start the frontend in a second terminal:

```bash
cd client
npm run dev
```

Open the local URL printed by Vite in your terminal.

> **Note:** The commands above assume the standard scripts are available in your `package.json`. Adjust them if your scripts differ.

## Deployment

The application is deployed using separate frontend and backend services.

- **Frontend:** [Vercel](https://vercel.com/)
- **Backend:** [Render](https://render.com/)
- **Database:** [MongoDB Atlas](https://www.mongodb.com/atlas)

The frontend communicates with the deployed backend through `VITE_API_URL`. The backend uses environment variables to configure the database connection and server port.

## What I Learned

Building this project provided practical experience with:

- Translating a real-world decision problem into a computational model.
- Implementing weighted scoring, normalization, and ranking algorithms.
- Exploring sensitivity analysis and the effect of changing input weights.
- Designing REST APIs with Node.js and Express.
- Connecting a React frontend to backend endpoints.
- Persisting application data with MongoDB Atlas.
- Managing environment variables and separating development from production configuration.
- Deploying and testing a full-stack application using Vercel and Render.

## Future Improvements

Potential extensions include:

- Visual charts for comparing alternatives and criteria contributions.
- More detailed sensitivity-analysis visualizations.
- Exporting decision reports.
- Editing, duplicating, and organizing saved decisions.
- Additional decision models for comparing results across different algorithms.

## Author

**Sidra Tahseen**

BE Computer Science and Engineering

[GitHub](https://github.com/sidra-tahseen)

---

*Life in Algorithms — applying computational thinking to everyday decisions.*
