
const {
    evaluateDecision,
    analyzeSensitivity
} = require("../logic/decisionEngine");

const Decision = require("../models/Decision");

async function evaluateDecisionRequest(req, res) {
    try {
        const body = req.body;

        if (!body || typeof body !== "object" || Array.isArray(body)) {
            return res.status(400).json({
                error: "Request body must be a JSON object."
            });
        }

        const { scenario, criteria, options } = body;

        if (typeof scenario !== "string" || !scenario.trim()) {
            return res.status(400).json({
                error: "Scenario is required."
            });
        }

        // Evaluate the decision using the existing algorithm
        const result = evaluateDecision(criteria, options);

        // Save the evaluated decision to MongoDB
        const savedDecision = await Decision.create({
            scenario: scenario.trim(),
            criteria,
            options,
            rankings: result.rankings,
            totalWeight: result.totalWeight
        });

        return res.status(200).json({
            decisionId: savedDecision._id,
            scenario: savedDecision.scenario,
            ...result,
            createdAt: savedDecision.createdAt
        });
    } catch (error) {
        if (error.name === "ValidationError" ||
            error.name === "CastError" ||
            error instanceof TypeError ||
            error instanceof RangeError) {
            return res.status(400).json({
                error: error.message
            });
        }

        console.error("Error evaluating or saving decision:", error.message);

        return res.status(500).json({
            error: "Could not save the decision. Please try again."
        });
    }
}

function sensitivityRequest(req, res) {
    try {
        const { criteria, options, criterionName } = req.body || {};

        if (typeof criterionName !== "string" || !criterionName.trim()) {
            return res.status(400).json({
                error: "Criterion name is required."
            });
        }

        const result = analyzeSensitivity(
            criteria,
            options,
            criterionName.trim()
        );

        return res.status(200).json(result);
    } catch (error) {
        return res.status(400).json({
            error: error.message
        });
    }
}

async function getDecisionHistory(req, res) {
    try {
        const decisions = await Decision.find()
            .sort({ createdAt: -1 });

        return res.status(200).json({
            count: decisions.length,
            decisions
        });
    } catch (error) {
        console.error("Error fetching decision history:", error.message);

        return res.status(500).json({
            error: "Could not retrieve decision history."
        });
    }
}

async function getDecisionHistory(req, res) {
    try {
        const decisions = await Decision.find()
            .sort({ createdAt: -1 });

        return res.status(200).json({
            count: decisions.length,
            decisions
        });
    } catch (error) {
        return res.status(500).json({
            error: "Failed to retrieve decision history."
        });
    }
}

module.exports = {
    evaluateDecisionRequest,
    sensitivityRequest,
    getDecisionHistory
};
