// routes/collabRoutes.js
const express        = require("express");
const router         = express.Router();
const collabController = require("../controllers/collabController");
const verifyToken    = require("../middleware/authMiddleware"); // ← your actual middleware file

router.get ("/teachers",  verifyToken, collabController.getAllTeachers);
router.post("/request",   verifyToken, collabController.sendRequest);
router.put ("/respond",   verifyToken, collabController.respondToRequest);
router.get ("/sent",      verifyToken, collabController.getSentRequests);
router.get ("/incoming",  verifyToken, collabController.getIncomingRequests);
router.get ("/partners",  verifyToken, collabController.getCollaborations);

module.exports = router;