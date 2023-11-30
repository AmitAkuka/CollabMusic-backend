const logger = require("../../services/logger.service");
const roomService = require("./room.service");

async function getRoomQueueById(req, res) {
  try {
    const { roomId } = req.params;
    const roomQueue = await roomService.queryQueueById(roomId);
    res.status(200).json(roomQueue);
  } catch (err) {
    logger.error("Failed to get room queue" + err);
    res.status(401).send({ err });
  }
}

async function updateMusicQueue(req, res) {
  try {
    const { roomId } = req.params;
    const updateEvent = req.body;    
    await roomService.updateQueueById(roomId, updateEvent);
    res.status(200).send();
  } catch (err) {
    logger.error("Failed to update room queue" + err);
    res.status(401).send({ err });
  }
}

async function updateCurrentMusicVote(req, res) {
  try {
    const { roomId } = req.params;
    const newVote = req.body;
    await roomService.updateVoteById(roomId, newVote);
    res.status(200).send();
  } catch (err) {
    logger.error("Failed to update room queue" + err);
    res.status(401).send({ err });
  }
}

module.exports = {
  getRoomQueueById,
  updateMusicQueue,
  updateCurrentMusicVote,
};
