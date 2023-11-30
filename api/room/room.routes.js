const express = require("express");
const { requireAuth } = require("../../middlewares/requireAuth.middleware");
const {
  getRoomQueueById,
  updateMusicQueue,
  updateCurrentMusicVote,
} = require("./room.controller");
const router = express.Router();

router.get("/:roomId", requireAuth, getRoomQueueById);
router.put("/musicQueue/:roomId", requireAuth, updateMusicQueue);
router.put("/vote/:roomId", requireAuth, updateCurrentMusicVote);

module.exports = router;
