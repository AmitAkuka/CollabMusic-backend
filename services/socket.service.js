const logger = require("./logger.service");
const { getRandomColor } = require("./util.service");

let gIo = null;

const chatRooms = {};
const musicRoomAvatars = {};
const connectedUsers = {};
const musicRoomQueue = {};

function setupSocketAPI(http) {
  gIo = require("socket.io")(http, {
    cors: {
      origin: "*",
    },
  });
  gIo.on("connection", (socket) => {
    logger.info(`New connected socket [id: ${socket.id}]`);
    //Attaching random color to socket.
    const randomColor = getRandomColor();
    socket.color = randomColor;

    socket.on("joinMusicRoom", (data) => {
      const parsedData = JSON.parse(data);
      const { _id, username, isDancing, chatId, avatarData } = parsedData;

      logger.info(`user ${username} has joined chat room ${chatId}. socketId: ${socket.id}`);
      connectedUsers[socket.id] = { username, id: _id };
      if (!chatRooms[chatId]) {
        chatRooms[chatId] = new Set([socket.id]);
        musicRoomQueue[chatId] = [];
        musicRoomAvatars[chatId] = [
          { id: _id, username, isDancing, ...avatarData },
        ];
        socket.join(chatId);
      } else {
        chatRooms[chatId].add(socket.id);
        musicRoomAvatars[chatId].push({
          id: _id,
          username,
          isDancing,
          ...avatarData,
        });
        socket.join(chatId);
        const connectData = {
          sender: connectedUsers[socket.id],
          eventType: "connected",
        };
        socket.broadcast
          .to(chatId)
          .emit("chatUpdate", JSON.stringify(connectData));
      }
    });

    socket.on("getInitialConnectedAmount", (chatId) => {
      emitToEveryone("chatConnectedUpdate", chatRooms[chatId].size, chatId);
    });

    socket.on("getInitialAvatarUpdate", (chatId) => {
      emitToEveryone(
        "avatarUpdate",
        JSON.stringify(musicRoomAvatars[chatId]),
        chatId
      );
    });

    socket.on("avatarDancingStateUpdate", (data) => {
      const parsedData = JSON.parse(data);
      const { chatId, userId, isDancing } = parsedData;
      const userAvatar = musicRoomAvatars[chatId].find(
        (avatar) => avatar.id === userId
      );
      userAvatar.isDancing = isDancing;
      emitToEveryone(
        "avatarDancingStateUpdate",
        JSON.stringify(parsedData),
        chatId
      );
    });

    socket.on("chatMessage", (data) => {
      const parsedData = JSON.parse(data);
      const { chatId, message } = parsedData;

      const sender = connectedUsers[socket.id];
      parsedData.sender = sender;
      parsedData.color = socket.color;

      logger.info(
        `user: ${JSON.stringify(sender)} with socketId: ${
          socket.id
        } has messaged: ${message} in the chat room: ${chatId}`
      );
      emitToEveryone("chatUpdate", JSON.stringify(parsedData), chatId);
    });

    socket.on("disconnect", () => {
      logger.info(`Socket disconnected [id: ${socket.id}]`);

      // When a user disconnects, remove them from all the rooms they belong to.
      for (const chatId in chatRooms) {
        if (!chatRooms[chatId].has(socket.id)) continue;
        logger.info(`user socketId: ${socket.id} has disconnected room ${chatId}.`);

        chatRooms[chatId].delete(socket.id);
        socket.leave(chatId);

        //Sending disconnect event to chat.
        const disconnectedUser = connectedUsers[socket.id];
        if (disconnectedUser) {
          const disconnectData = {
            sender: disconnectedUser,
            eventType: "disconnected",
          };
          socket.broadcast
            .to(chatId)
            .emit("chatUpdate", JSON.stringify(disconnectData));
        }

        const avatarIdx = musicRoomAvatars[chatId].findIndex(
          (a) => a.id === disconnectedUser.id
        );
        musicRoomAvatars[chatId].splice(avatarIdx, 1);
        emitToEveryone(
          "avatarUpdate",
          JSON.stringify(musicRoomAvatars[chatId]),
          chatId
        );
        emitToEveryone("chatConnectedUpdate", chatRooms[chatId].size, chatId);
      }

      delete connectedUsers[socket.id];
    });
  });
}

function emitToEveryone(eventName, data, chatId) {
  // If a chat room is specified, emit only to the users in that chat's room.
  if (chatId && chatRooms[chatId]) {
    console.log(
      `Emitting update to room ${chatId} subscribers: ${JSON.stringify(
        chatRooms[chatId],
        (_key, value) => (value instanceof Set ? [...value] : value)
      )}`,
      eventName
    );
    gIo.to(chatId.toString()).emit(eventName, data);
  } else {
    console.log("Emitting to everyone", eventName);
    gIo.emit(eventName, data);
  }
}

function emitToClient(eventName, data, socketId) {
  gIo.to(socketId).emit(eventName, data);
}

module.exports = {
  // set up the sockets service and define the API
  setupSocketAPI,
  emitToFrontend: emitToEveryone,
};