
const { test } = require("node:test");
const assert = require("node:assert/strict");

const {
    evaluateDecision,
    analyzeSensitivity
} = require("./decisionEngine");

const criteria = [
    { name: "Learning", weight: 5, type: "benefit" },
    { name: "Stipend", weight: 3, type: "benefit" },
    { name: "Stress", weight: 2, type: "cost" }
];

const options = [
    {
        name: "Internship",
        scores: {
            Learning: 5,
            Stipend: 4,
            Stress: 4
        }
    },
    {
        name: "Personal Projects",
        scores: {
            Learning: 4,
            Stipend: 1,
            Stress: 2
        }
    }
];

test("ranks options by their weighted scores", () => {
    const result = evaluateDecision(criteria, options);

    assert.equal(result.rankings[0].name, "Internship");
    assert.equal(result.rankings[0].score, 77.5);
    assert.equal(result.rankings[1].name, "Personal Projects");
    assert.equal(result.rankings[1].score, 52.5);
});

test("rejects an empty criteria array", () => {
    assert.throws(
        () => evaluateDecision([], options),
        /criterion/i
    );
});

test("rejects scores outside the 1-5 range", () => {
    const invalidOptions = [
        {
            name: "Option A",
            scores: { Learning: 6, Stipend: 4, Stress: 3 }
        },
        {
            name: "Option B",
            scores: { Learning: 4, Stipend: 3, Stress: 2 }
        }
    ];

    assert.throws(
        () => evaluateDecision(criteria, invalidOptions),
        /score/i
    );
});

test("detects when sensitivity analysis changes the winner", () => {
    const result = analyzeSensitivity(criteria, options, "Stress");

    assert.equal(result.scenarios.length, 7);
    assert.equal(result.scenarios[0].winner, "Internship");
    assert.equal(result.scenarios[6].winner, "Personal Projects");
});
