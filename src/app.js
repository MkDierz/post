const { PrismaClient } = require('@prisma/client');
const { httpError } = require('../config');
const errorHandler = require('../utils/errorHandler');
const { exclude, clean, filterObject } = require('../utils/dro');
const { auth } = require('../utils/services');

const prisma = new PrismaClient();

async function profile(req, res, next) {
  const { user } = req;
  const data = Object;

  data.found = await prisma.user.findUnique({
    where: { id: user.id },
    include: { Profile: true },
  });
  if (data.found) {
    return res.send({ ...data.found });
  }

  try {
    data.created = await prisma.user.create({
      data: {
        ...exclude(user, ['iat', 'exp']),
        Profile: {
          create: {},
        },
      },
      include: {
        Profile: true,
      },
    });
  } catch (e) {
    const errorMessage = errorHandler.prisma(e);
    return next(httpError.Conflict({ detail: errorMessage, field: e.meta.target }));
  }
  return res.send({ ...data.created });
}

async function updateProfile(req, res, next) {
  const { user } = req;
  const body = clean(req.body);
  if (Object.keys(body).length === 0) {
    return next(httpError.BadRequest());
  }
  const data = Object;

  const authField = ['username', 'password', 'email'];
  const profileField = ['bio', 'location'];
  const userField = ['username', 'email', 'name'];

  data.auth = filterObject(authField, body, data);
  if (!(Object.keys({ ...data.auth }).length === 0)) {
    data.auth = await auth.update({ ...data.auth }, req.headers.authorization);
  }
  if (data.auth.status !== 200) {
    return next(httpError.BadRequest());
  }
  data.profileData = filterObject(profileField, body);
  data.userData = {
    ...filterObject(userField, user),
    ...filterObject(userField, body),
  };
  try {
    data.user = await prisma.user.upsert({
      where: {
        id: user.id,
      },
      update: {
        ...data.userData,
      },
      create: {
        id: user.id,
        ...data.userData,
      },
    });
    data.profile = await prisma.profile.upsert({
      where: {
        userId: user.id,
      },
      update: {
        ...data.profileData,
      },
      create: {
        userId: user.id,
        ...data.profileData,
      },
    });
  } catch (e) {
    const errorMessage = errorHandler.prisma(e);
    return next(httpError.Conflict({ detail: errorMessage, field: e?.meta?.target }));
  }
  return res.send({ user: data.user, profile: data.profile });
}

async function sendFriendRequest(req, res, next) {
  const { user } = req;
  const { username } = req.body;
  const data = Object;

  data.receiver = await prisma.user.findUnique({
    where: { username },
  });
  if (!data.receiver) {
    return next(httpError.NotFound('user not found'));
  }

  data.sender = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (data.receiver.username === data.sender.username) {
    return next(httpError.BadRequest());
  }

  data.request = await prisma.friendRequest.findFirst({
    where: {
      senderId: data.sender.id,
      receiverId: data.receiver.id,
    },
  });

  data.message = 'friend request already sent';

  if (!data.request) {
    data.message = 'friend request sent';
    data.request = await prisma.friendRequest.create(
      {
        data: {
          sender: { connect: { id: data.sender.id } },
          receiver: { connect: { id: data.receiver.id } },
        },
      },
    );
  }

  return res.send({ ...data });
}

async function friendRequest(req, res, next) {
  const { user } = req;

  const data = Object;
  data.receiver = await prisma.user.findUnique({
    where: { id: user.id },
  });
  if (!data.receiver) { return next(httpError.NotFound('user not found')); }
  data.request = await prisma.friendRequest.findMany({
    where: {
      receiverId: data.receiver.id,
    },
    include: {
      sender: true,
    },
  });
  return res.send({ ...data.request });
}

async function friendRequestSent(req, res, next) {
  const { user } = req;

  const data = Object;
  data.sender = await prisma.user.findUnique({
    where: { id: user.id },
  });
  if (!data.sender) { return next(httpError.NotFound('user not found')); }
  data.request = await prisma.friendRequest.findMany({
    where: {
      senderId: data.sender.id,
    },
    include: {
      sender: true,
    },
  });
  return res.send({ ...data.request });
}

async function updateFriendRequest(req, res, next) {
  const { user } = req;
  const { username, status } = req.body;
  const data = Object;

  data.receiver = await prisma.user.findUnique({
    where: { id: user.id },
  });
  data.sender = await prisma.user.findUnique({
    where: { username },
  });
  if (!data.sender) { return next(httpError.NotFound('user not found')); }
  data.request = await prisma.friendRequest.findFirst({
    where: {
      receiverId: data.receiver.id,
      senderId: data.sender.id,
    },
  });
  if (!data.request) { return next(httpError.NotFound('request not found')); }
  data.requestUpdated = await prisma.friendRequest.update({
    where: {
      id: data.request.id,
    },
    data: {
      status,
    },
  });
  if (!data.request) { return next(httpError.InternalServerError('unable to accept friend')); }
  if (status === 'ACCEPTED') {
    await prisma.$transaction([
      prisma.friendList.deleteMany({
        where: {
          friendId: [data.sender.id, data.receiverId.id],
          friendOfId: [data.sender.id, data.receiverId.id],
        },
      }),
      prisma.friendList.createMany({
        data: [
          { friendId: data.sender.id, friendOfId: data.receiver.id },
          { friendId: data.receiver.id, friendOfId: data.sender.id },
        ],
      }),
    ]);
  }
  if (status === 'UNACCEPTED') {
    await prisma.$transaction([
      prisma.friendList.deleteMany({
        where: {
          friendId: [data.sender.id, data.receiverId.id],
          friendOfId: [data.sender.id, data.receiverId.id],
        },
      }),
    ]);
  }
  return res.send({ ...data.requestUpdated });
}

async function friendList(req, res) {
  const { user } = req;

  const data = Object;
  data.friends = await prisma.friendList.findMany({
    where: { friendOfId: user.id },
    include: {
      friend: true,
    },
  });
  return res.send({ ...data.friends });
}

async function findUser(req, res) {
  const { query } = req.query;
  // const { user } = req;
  const data = Object;
  data.userList = await prisma.user.findMany({
    where: {
      username: {
        search: query,
      },
      name: {
        search: query,
      },
    },
  });
  return res.send({ ...data.userList });
}

module.exports = {
  profile,
  updateProfile,
  sendFriendRequest,
  friendRequest,
  friendRequestSent,
  updateFriendRequest,
  friendList,
  findUser,
};
