
function evaluateDecision(criteria, options) {
    if (!Array.isArray(criteria) || criteria.length === 0) {
        throw new Error("At least one criterion is required.");
    }

    if (!Array.isArray(options) || options.length < 2) {
        throw new Error("At least two options are required.");
    }

    const criterionNames = new Set();

    for (const criterion of criteria) {
        if (
            !criterion.name ||
            typeof criterion.name !== "string" ||
            criterionNames.has(criterion.name.trim().toLowerCase())
        ) {
            throw new Error("Criterion names must be unique and non-empty.");
        }

        criterionNames.add(criterion.name.trim().toLowerCase());

        if (
            typeof criterion.weight !== "number" ||
            !Number.isFinite(criterion.weight) ||
            criterion.weight < 0
        ) {
            throw new Error("Criterion weights must be non-negative numbers.");
        }

        if (!["benefit", "cost"].includes(criterion.type)) {
            throw new Error("Criterion type must be benefit or cost.");
        }
    }

    const totalWeight = criteria.reduce(
        (sum, criterion) => sum + criterion.weight,
        0
    );

    if (totalWeight <= 0) {
        throw new Error("The total criterion weight must be greater than zero.");
    }

    const optionNames = new Set();

    for (const option of options) {
        if (
            typeof option.name !== "string" ||
            !option.name.trim() ||
            optionNames.has(option.name.trim().toLowerCase())
        ) {
            throw new Error("Option names must be unique and non-empty.");
        }

        optionNames.add(option.name.trim().toLowerCase());

        if (!option.scores || typeof option.scores !== "object" ||
            Array.isArray(option.scores)) {
            throw new Error("Every option must contain a scores object.");
        }

        for (const criterion of criteria) {
            const score = option.scores[criterion.name];

            if (
                typeof score !== "number" ||
                !Number.isFinite(score) ||
                score < 1 ||
                score > 5
            ) {
                throw new Error(
                    `Score for "${criterion.name}" must be a number from 1 to 5.`
                );
            }
        }
    }

    const results = options.map(option => {
        let totalScore = 0;

        const contributions = criteria.map(criterion => {
            const normalizedWeight = criterion.weight / totalWeight;
            const rawScore = option.scores[criterion.name];

            // Higher scores are better for benefits.
            // Lower scores are better for costs.
            const utility = criterion.type === "benefit"
                ? (rawScore - 1) / 4
                : (5 - rawScore) / 4;

            const contribution = Number((normalizedWeight * utility).toFixed(4));
            totalScore += contribution;

            return {
                criterion: criterion.name,
                weight: normalizedWeight,
                rawScore,
                utility,
                contribution
            };
        });

        return {
            name: option.name,
            score: Number((totalScore * 100).toFixed(2)),
            contributions
        };
    });

    results.sort((a, b) => b.score - a.score);

    return {
        rankings: results.map((result, index) => ({
            rank: index + 1,
            ...result
        })),
        totalWeight
    };
}

function analyzeSensitivity(criteria, options, criterionName) {
    if (!Array.isArray(criteria)) {
        throw new Error("Criteria must be an array.");
    }

    const selectedCriterion = criteria.find(
        criterion => criterion.name === criterionName
    );

    if (!selectedCriterion) {
        throw new Error("Criterion not found: " + criterionName);
    }

    const testWeights = [1, 2, 3, 4, 5, 7, 10];

    const scenarios = testWeights.map(weight => {
        const modifiedCriteria = criteria.map(criterion => ({
            ...criterion,
            weight: criterion.name === criterionName
                ? weight
                : criterion.weight
        }));

        const result = evaluateDecision(modifiedCriteria, options);

        return {
            testedWeight: weight,
            winner: result.rankings[0].name,
            rankings: result.rankings
        };
    });

    return {
        criterion: criterionName,
        scenarios
    };
}

module.exports = {
    evaluateDecision,
    analyzeSensitivity
};
