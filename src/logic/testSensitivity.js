
const {
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

try {
    const result = analyzeSensitivity(
        criteria,
        options,
        "Stress"
    );

    console.log(JSON.stringify(result, null, 2));
} catch (error) {
    console.error("Sensitivity error:", error.message);
}
