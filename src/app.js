const { PrismaClient } = require('@prisma/client');
const { httpError } = require('../config');
const errorHandler = require('../utils/errorHandler');
const { user: userService, tag: tagService } = require('../utils/services');
const {
  replaceKeyInObjectArrayWithValue,
  replaceKeyValueWithMatchingObject,
  extractUniqueKey,
  renameKey,
  renameKeyInArray,
  fetchTagsFromPosts,
} = require('../utils/dro');
// const { clean, filterObject } = require('../utils/dro');

const prisma = new PrismaClient();

async function create(req, res, next) {
  const { user, body: { tags, ...postData } } = req;

  try {
    const createdPost = await prisma.post.create({ data: { ...postData, userId: user.id } });
    const postTags = await tagService
      .createPostTags(createdPost.id, tags, req.headers.authorization) || [];

    return res.send({ ...createdPost, tags: postTags });
  } catch (e) {
    return errorHandler.prismaWrapper(e, next);
  }
}

async function read(req, res, next) {
  const { query, id, userId } = req.query;
  const data = {};
  try {
    data.post = await prisma.post.findMany({
      ...(query && { where: { content: { search: query } } }),
      ...(id && { where: { id: { in: id } } }),
      ...(userId && { where: { userId } }),
      include: {
        _count: {
          select: { comment: true },
        },
      },
      orderBy: [{ createdAt: 'desc' },
      ],
    });
  } catch (e) {
    return errorHandler.prismaWrapper(e, next);
  }
  if (data.post.length !== 0) {
    data.userIds = extractUniqueKey('userId', data.post);
    data.post = renameKeyInArray(data.post, 'userId', 'user');
    data.users = await userService.getUsers(data.userIds, req.headers.authorization);
    data.post = replaceKeyInObjectArrayWithValue(data.post, 'user', data.users, 'id');
    data.post = await fetchTagsFromPosts(data.post, req.headers.authorization);
    data.post = data.post.map(({ _count, ...p }) => ({
      ...p,
      comment: _count.comment,
    }));
  }
  return res.send(data.post);
}

async function readById(req, res, next) {
  const { id } = req.params;

  const data = {};
  try {
    data.post = await prisma.post.findUnique({
      where: { id },
      include: {
        comment: {
          include: {
            _count: {
              select: { comment: true },
            },
          },
        },
      },
    });
  } catch (e) {
    return errorHandler.prismaWrapper(e, next);
  }
  data.userIds = [
    data.post.userId,
    ...extractUniqueKey('userId', data.post.comment),
  ];
  data.post = renameKey(data.post, 'userId', 'user');
  data.users = await userService.getUsers(data.userIds, req.headers.authorization);
  data.post.tags = await tagService.getPostTags(id, req.headers.authorization);
  data.post = replaceKeyValueWithMatchingObject(data.post, 'user', data.users, 'id');
  data.post.comment = renameKeyInArray(data.post.comment, 'userId', 'user');
  data.post.comment = replaceKeyInObjectArrayWithValue(data.post.comment, 'user', data.users, 'id');
  data.post.comment = await fetchTagsFromPosts(data.post.comment, req.headers.authorization);
  data.post.comment = data.post.comment.map(({ _count, ...p }) => ({
    ...p,
    comment: _count.comment,
  }));
  return res.send(data.post);
}

async function updateById(req, res, next) {
  const { user, body, params } = req;
  const { id } = params;
  const data = {};

  data.tags = body.tags || [];
  delete body.tags;

  try {
    data.isOwned = await prisma.post.findFirst({ where: { id, userId: user.id } });
    if (!data.isOwned) {
      return next(httpError.Forbidden());
    }
    data.update = await prisma.post.update({
      where: { id },
      data: { ...body },
    });
  } catch (e) {
    return errorHandler.prismaWrapper(e, next);
  }

  data.tags = await tagService.editPostTags(id, data.tags, req.headers.authorization);

  return res.send({ ...data.update, tags: data.tags });
}

async function deleteById(req, res, next) {
  const { user, params } = req;
  const { id } = params;

  const data = {};
  try {
    data.isOwned = await prisma.post.findFirst({ where: { id, userId: user.id } });
    if (!data.isOwned) {
      return next(httpError.Forbidden());
    }
    data.delete = await prisma.post.delete({
      where: { id },
    });
  } catch (e) {
    return errorHandler.prismaWrapper(e, next);
  }
  await tagService.deletePostTags(id, req.headers.authorization);

  return res.send({ ...data.delete });
}

module.exports = {
  create,
  read,
  readById,
  updateById,
  deleteById,
};
