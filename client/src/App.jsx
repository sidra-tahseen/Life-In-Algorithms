
import { useState } from "react";
import "./App.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
function App() {
    const [scenario, setScenario] = useState("");
    const [criteria, setCriteria] = useState([
        { name: "Learning", weight: 5, type: "benefit" },
        { name: "Stipend", weight: 3, type: "benefit" },
        { name: "Stress", weight: 2, type: "cost" }
    ]);

    const [options, setOptions] = useState([
        { name: "Internship", scores: {} },
        { name: "Personal Projects", scores: {} }
    ]);

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [sensitivityCriterion, setSensitivityCriterion] = useState("Stress");
    const [sensitivityResult, setSensitivityResult] = useState(null);
    const [sensitivityLoading, setSensitivityLoading] = useState(false);
    const [sensitivityError, setSensitivityError] = useState("");
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState("");
    function updateCriterion(index, field, value) {
        setCriteria(current =>
            current.map((criterion, i) =>
                i === index
                    ? { ...criterion, [field]: value }
                    : criterion
            )
        );
        setResult(null);
    }

    function updateOptionName(index, value) {
        setOptions(current =>
            current.map((option, i) =>
                i === index ? { ...option, name: value } : option
            )
        );
        setResult(null);
    }

    function updateScore(optionIndex, criterionName, value) {
        setOptions(current =>
            current.map((option, i) =>
                i === optionIndex
                    ? {
                        ...option,
                        scores: {
                            ...option.scores,
                            [criterionName]: Number(value)
                        }
                    }
                    : option
            )
        );
        setResult(null);
    }

    function addCriterion() {
        setCriteria(current => [
            ...current,
            {
                name: `Criterion ${current.length + 1}`,
                weight: 1,
                type: "benefit"
            }
        ]);
        setResult(null);
    }

    function addOption() {
        setOptions(current => [
            ...current,
            {
                name: `Option ${current.length + 1}`,
                scores: {}
            }
        ]);
        setResult(null);
    }

    async function evaluateDecision() {
        setError("");
        setResult(null);

        if (!scenario.trim()) {
            setError("Please describe the decision you want to make.");
            return;
        }

        if (
            criteria.length === 0 ||
            criteria.some(c => !c.name.trim()) ||
            new Set(criteria.map(c => c.name.trim())).size !== criteria.length
        ) {
            setError("Criterion names must be non-empty and unique.");
            return;
        }

        if (
            options.length < 2 ||
            options.some(o => !o.name.trim()) ||
            new Set(options.map(o => o.name.trim())).size !== options.length
        ) {
            setError("Add at least two options with unique, non-empty names.");
            return;
        }

        if (
            criteria.some(c =>
                !Number.isFinite(Number(c.weight)) ||
                c.weight === "" ||
                Number(c.weight) < 0
            ) ||
            criteria.reduce((sum, c) => sum + Number(c.weight), 0) <= 0
        ) {
            setError("Weights must be non-negative and total more than zero.");
            return;
        }

        if (
            criteria.some(c => !["benefit", "cost"].includes(c.type))
        ) {
            setError("Choose Benefit or Cost for every criterion.");
            return;
        }

        if (
            options.some(o =>
                criteria.some(c => {
                    const score = o.scores[c.name];
                    return !Number.isFinite(score) || score < 1 || score > 5;
                })
            )
        ) {
            setError("Please score every option against every criterion from 1 to 5.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/decisions`, 
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        scenario: scenario.trim(),
                        criteria: criteria.map(c => ({
                            ...c,
                            name: c.name.trim(),
                            weight: Number(c.weight)
                        })),
                        options: options.map(o => ({
                            ...o,
                            name: o.name.trim()
                        }))
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Could not evaluate the decision."
                );
            }

            setResult(data);
        } catch (err) {
            setError(
                err.message === "Failed to fetch"
                    ? "Cannot reach the backend. Make sure your server is running on port 5000."
                    : err.message
            );
        } finally {
            setLoading(false);
        }
    }

    
async function runSensitivityAnalysis() {
    setSensitivityError("");
    setSensitivityResult(null);

    if (!result) {
        setSensitivityError("Evaluate a decision first.");
        return;
    }

    if (!criteria.some(c => c.name === sensitivityCriterion)) {
        setSensitivityError("Choose a valid criterion.");
        return;
    }

    setSensitivityLoading(true);

    try {
        const response = await fetch(
            `${API_BASE_URL}/api/decisions/sensitivity`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    criteria: criteria.map(c => ({
                        ...c,
                        name: c.name.trim(),
                        weight: Number(c.weight)
                    })),
                    options: options.map(o => ({
                        ...o,
                        name: o.name.trim()
                    })),
                    criterionName: sensitivityCriterion
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Sensitivity analysis failed.");
        }

        setSensitivityResult(data);
    } catch (err) {
        setSensitivityError(
            err.message === "Failed to fetch"
                ? "Cannot reach the backend. Check that your server is running."
                : err.message
        );
    } finally {
        setSensitivityLoading(false);
    }
}


    function startNewDecision() {
        setResult(null);
        setError("");
        setScenario("");
        setCriteria([
            { name: "Learning", weight: 5, type: "benefit" },
            { name: "Stipend", weight: 3, type: "benefit" },
            { name: "Stress", weight: 2, type: "cost" }
        ]);
        setOptions([
            { name: "Option A", scores: {} },
            { name: "Option B", scores: {} }
        ]);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function loadHistory() {
    setHistoryLoading(true);
    setHistoryError("");

    try {
        const response = await fetch(
            `${API_BASE_URL}/api/decisions/history`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Could not load decision history.");
        }

        setHistory(data.decisions || []);
    } catch (err) {
        setHistoryError(
            err.message === "Failed to fetch"
                ? "Cannot reach the backend. Check that the server is running."
                : err.message
        );
    } finally {
        setHistoryLoading(false);
    }
}

    return (
        <main className="app">
            <header className="header">
                <p className="eyebrow">THINK CLEARLY. CHOOSE BETTER.</p>
                <h1>Life in <span>Algorithms</span></h1>
                <p className="subtitle">
                    Turn difficult choices into structured, explainable decisions.
                </p>
            </header>

            <section className="panel">
                <h2>01 / Your decision</h2>
                <label htmlFor="scenario">
                    What are you trying to decide?
                </label>
                <textarea
                    id="scenario"
                    value={scenario}
                    onChange={e => {
                        setScenario(e.target.value);
                        setResult(null);
                    }}
                    placeholder="Should I take an internship or focus on personal projects?"
                />
            </section>

            <section className="panel">
                <h2>02 / Decision criteria</h2>
                <p className="hint">
                    Set the importance and type of each factor.
                    Higher weights mean greater importance.
                </p>

                {criteria.map((criterion, index) => (
                    <div className="criterion" key={index}>
                        <input
                            aria-label="Criterion name"
                            value={criterion.name}
                            onChange={e =>
                                updateCriterion(index, "name", e.target.value)
                            }
                        />
                        <input
                            aria-label="Criterion weight"
                            type="number"
                            min="0"
                            value={criterion.weight}
                            onChange={e =>
                                updateCriterion(index, "weight", e.target.value)
                            }
                        />
                        <select
                            aria-label="Criterion type"
                            value={criterion.type}
                            onChange={e =>
                                updateCriterion(index, "type", e.target.value)
                            }
                        >
                            <option value="benefit">Benefit</option>
                            <option value="cost">Cost</option>
                        </select>
                    </div>
                ))}

                <button className="secondary" onClick={addCriterion}>
                    + Add criterion
                </button>
            </section>

            <section className="panel">
                <h2>03 / Your options</h2>
                <p className="hint">
                    Score each option from 1 (lowest) to 5 (highest).
                    For cost criteria, a higher score means more cost or difficulty.
                </p>

                {options.map((option, optionIndex) => (
                    <div className="option" key={optionIndex}>
                        <input
                            aria-label="Option name"
                            value={option.name}
                            onChange={e =>
                                updateOptionName(optionIndex, e.target.value)
                            }
                        />

                        {criteria.map(criterion => (
                            <label
                                className="score-row"
                                key={criterion.name}
                            >
                                <span>{criterion.name || "Unnamed criterion"}</span>
                                <select
                                    aria-label={`${option.name}: ${criterion.name}`}
                                    value={option.scores[criterion.name] ?? ""}
                                    onChange={e =>
                                        updateScore(
                                            optionIndex,
                                            criterion.name,
                                            e.target.value
                                        )
                                    }
                                >
                                    <option value="" disabled>
                                        Select score
                                    </option>
                                    {[1, 2, 3, 4, 5].map(score => (
                                        <option key={score} value={score}>
                                            {score}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        ))}
                    </div>
                ))}

                <button className="secondary" onClick={addOption}>
                    + Add option
                </button>
            </section>

            {error && (
                <div className="error-message" role="alert">
                    <strong>Something needs attention</strong>
                    <p>{error}</p>
                </div>
            )}

            <button
                className="evaluate"
                onClick={evaluateDecision}
                disabled={loading}
            >
                {loading ? "Evaluating decision..." : "Evaluate my decision →"}
            </button>

            {result && (
                <section className="results" aria-live="polite">
                    <div className="results-heading">
                        <p className="eyebrow">YOUR ANALYSIS</p>
                        <h2>Decision results</h2>
                        <p className="results-scenario">{result.scenario}</p>
                        <p className="hint">
                            Total criterion weight: {result.totalWeight}
                        </p>
                    </div>

                    {result.rankings.map((ranking, index) => (
                        <article
                            className={`result-card ${index === 0 ? "winner" : ""}`}
                            key={ranking.name}
                        >
                            <div className="result-top">
                                <div className="rank-number">
                                    {String(ranking.rank).padStart(2, "0")}
                                </div>

                                <div className="result-name">
                                    <p className="rank-label">
                                        {index === 0 ? "HIGHEST-RANKED OPTION" : `RANK ${ranking.rank}`}
                                    </p>
                                    <h3>{ranking.name}</h3>
                                </div>

                                <div className="result-score">
                                    <strong>{Number(ranking.score).toFixed(2)}</strong>
                                    <span>/ 100</span>
                                </div>
                            </div>

                            <div
                                className="score-track"
                                role="progressbar"
                                aria-label={`${ranking.name} score`}
                                aria-valuenow={Number(ranking.score)}
                                aria-valuemin={0}
                                aria-valuemax={100}
                            >
                                <div
                                    className="score-fill"
                                    style={{
                                        width: `${Math.max(0, Math.min(100, Number(ranking.score)))}%`
                                    }}
                                />
                            </div>

                            <details className="breakdown">
                                <summary>View score breakdown</summary>

                                <div className="contribution-list">
                                    {ranking.contributions.map((item, i) => (
                                        <div
                                            className="contribution"
                                            key={`${item.criterion}-${i}`}
                                        >
                                            <div className="contribution-top">
                                                <span>{item.criterion}</span>
                                                <strong>
                                                    {(Number(item.contribution) * 100).toFixed(2)} pts
                                                </strong>
                                            </div>

                                            <div className="contribution-track">
                                                <div
                                                    className="contribution-fill"
                                                    style={{
                                                        width: `${Math.max(0, Math.min(100, Number(item.contribution) * 100))}%`
                                                    }}
                                                />
                                            </div>

                                            <p>
                                                Raw score: {item.rawScore}/5
                                                {" · "}Weight: {item.weight}
                                                {" · "}Utility: {(Number(item.utility) * 100).toFixed(0)}%
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </details>
                        </article>
                    ))}

                    <p className="results-note">
                        The highest score is the algorithm's recommendation
                        based on your inputs and weights. It supports your
                        judgment; it does not replace it.
                    </p>

                    
<section className="sensitivity-panel">
    <p className="eyebrow">WHAT-IF ANALYSIS</p>
    <h3>Sensitivity analysis</h3>
    <p className="hint">
        Explore how changing a criterion's weight affects the winning option.
    </p>

    <label htmlFor="sensitivity-criterion">
        Choose a criterion
    </label>

    <select
        id="sensitivity-criterion"
        value={sensitivityCriterion}
        onChange={e => {
            setSensitivityCriterion(e.target.value);
            setSensitivityResult(null);
            setSensitivityError("");
        }}
    >
        {criteria.map(criterion => (
            <option key={criterion.name} value={criterion.name}>
                {criterion.name}
            </option>
        ))}
    </select>

    <button
        className="evaluate sensitivity-button"
        onClick={runSensitivityAnalysis}
        disabled={sensitivityLoading}
    >
        {sensitivityLoading ? "Analyzing..." : "Run sensitivity analysis →"}
    </button>

    {sensitivityError && (
        <p className="sensitivity-error" role="alert">
            {sensitivityError}
        </p>
    )}

    {sensitivityResult && (
        <div className="sensitivity-results">
            <p>
                Testing different weights for{" "}
                <strong>{sensitivityResult.criterion}</strong>.
            </p>

            <div className="sensitivity-table-wrap">
                <table className="sensitivity-table">
                    <thead>
                        <tr>
                            <th>Test weight</th>
                            <th>Winning option</th>
                            <th>Top score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sensitivityResult.scenarios.map((scenario, index) => (
                            <tr key={`${scenario.testedWeight}-${index}`}>
                                <td>{scenario.testedWeight}</td>
                                <td>{scenario.winner}</td>
                                <td>
                                    {Number(
                                        scenario.rankings[0].score
                                    ).toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <p className="hint">
                These are simulated weights, not predictions of future outcomes.
                If two options tie, the current backend may still list one first.
            </p>
        </div>
    )}
</section>


                    <button className="secondary new-decision" onClick={startNewDecision}>
                        + Start a new decision
                    </button>
                </section>
            )}

        
<section className="history-section">
    <div className="history-heading">
        <div>
            <p className="eyebrow">YOUR PAST CHOICES</p>
            <h2>Decision history</h2>
            <p className="hint">
                Revisit decisions you've already evaluated.
            </p>
        </div>

        <button
            className="secondary"
            onClick={loadHistory}
            disabled={historyLoading}
        >
            {historyLoading ? "Loading..." : "Load history"}
        </button>
    </div>

    {historyError && (
        <p className="error-message" role="alert">{historyError}</p>
    )}

    {!historyLoading && history.length === 0 && !historyError && (
        <p className="history-empty">
            Click "Load history" to see your saved decisions.
        </p>
    )}

    {history.map(decision => (
        <article className="history-card" key={decision._id}>
            <div className="history-card-top">
                <div>
                    <h3>{decision.scenario}</h3>
                    <p className="history-date">
                        {decision.createdAt
                            ? new Date(decision.createdAt).toLocaleString()
                            : "Date unavailable"}
                    </p>
                </div>

                {decision.rankings?.length > 0 && (
                    <div className="history-score">
                        <span>TOP SCORE</span>
                        <strong>
                            {Number(decision.rankings[0].score).toFixed(2)}
                        </strong>
                    </div>
                )}
            </div>

            {decision.rankings?.length > 0 && (
                <p className="history-winner">
                    Highest-ranked: <strong>{decision.rankings[0].name}</strong>
                </p>
            )}

            <details className="breakdown">
                <summary>View saved results</summary>

                <ol className="history-rankings">
                    {(decision.rankings || []).map(ranking => (
                        <li key={`${decision._id}-${ranking.rank}`}>
                            <span>{ranking.name}</span>
                            <strong>{Number(ranking.score).toFixed(2)} / 100</strong>
                        </li>
                    ))}
                </ol>
            </details>
        </article>
    ))}
</section>
  

            <footer>Structured thinking for real-life choices.</footer>
        </main>
    );

}

export default App;
