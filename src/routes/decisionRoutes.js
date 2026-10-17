
const express = require("express");
const router = express.Router();

const {
    evaluateDecisionRequest,
    sensitivityRequest,
    getDecisionHistory
} = require("../controllers/decisionController");

router.post("/", evaluateDecisionRequest);
router.post("/sensitivity", sensitivityRequest);
router.get("/history", getDecisionHistory);

module.exports = router;
