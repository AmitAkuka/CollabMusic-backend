const dbService = require("../../services/db.service");
const socketService = require("../../services/socket.service");

const roomQueues = {
  1000: { isFuncRunning: false, currentlyPlaying: null },
};

async function queryQueueById(roomId) {
  try {
    const collection = await dbService.getCollection("room");
    const roomQueue = await collection.findOne({ roomId });
    if (!roomQueue) {
      const initalRoomObj = {
        roomId,
        musicQueue: [],
        currentlyPlaying: null,
      };
      await collection.insertOne(initalRoomObj);
      logger.debug(`created new room: ${roomId}`);
      return initalRoomObj;
    }

    return roomQueue;
  } catch (err) {
    throw err;
  }
}

async function updateQueueById(roomId, updateEvent) {
  try {
    const collection = await dbService.getCollection("room");
    const { type, data } = updateEvent;
    if (type === "add") {
      await collection.updateOne({ roomId }, { $push: { musicQueue: data } });
    } else {
      await collection.updateOne(
        { roomId },
        { $pull: { musicQueue: { "user.userId": data } } }
      );
    }

    socketService.emitToFrontend("musicQueueUpdate", updateEvent, roomId);
    !roomQueues[roomId].isFuncRunning && _setRoomMusicQueue(roomId);
  } catch (err) {
    throw err;
  }
}

async function updateVoteById(roomId, newVote) {
  try {
    const collection = await dbService.getCollection("room");
    await collection.updateOne(
      { roomId },
      { $push: { "currentlyPlaying.votes": newVote } }
    );
    socketService.emitToFrontend("voteUpdate", newVote, roomId);
  } catch (err) {
    throw err;
  }
}

async function _setRoomMusicQueue(roomId) {
  try {
    roomQueues[roomId].isFuncRunning = true;
    const collection = await dbService.getCollection("room");
    const musicQueue = await _queryMusicQueueById(roomId);
    if (!musicQueue.length) {
      await collection.updateOne(
        { roomId },
        { $set: { musicQueue, currentlyPlaying: null } }
      );
      socketService.emitToFrontend("currentlyPlaying", null, roomId);
      roomQueues[roomId].isFuncRunning = false;
      return;
    }
    const nextSong = musicQueue.shift();
    const musicToPlay = { ...nextSong, votes: [] };
    socketService.emitToFrontend("currentlyPlaying", musicToPlay, roomId);
    musicToPlay.begginingTS = Date.now();
    await collection.updateOne(
      { roomId },
      { $set: { musicQueue, currentlyPlaying: musicToPlay } }
    );
    await new Promise((resolve) =>
      //Could possibly save a play history containing the currentVotes and currentlyPlaying objects instead.
      setTimeout(() => resolve(), musicToPlay.video.duration * 1000 + 2000)
    );
    _setRoomMusicQueue(roomId);
  } catch (err) {
    throw err;
  }
}

async function _queryMusicQueueById(roomId) {
  try {
    const collection = await dbService.getCollection("room");
    const { musicQueue } = await collection.findOne(
      { roomId },
      { projection: { _id: 0, musicQueue: 1 } }
    );
    return musicQueue;
  } catch (err) {
    throw err;
  }
}

module.exports = {
  queryQueueById,
  updateQueueById,
  updateVoteById,
};
