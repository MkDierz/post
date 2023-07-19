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
  const { user, body } = req;
  const data = Object;
  data.tags = body.tags;
  delete body.tags;

  try {
    data.created = await prisma.post.create({ data: { ...body, userId: user.id } });
  } catch (e) {
    return errorHandler.prismaWrapper(e, next);
  }
  data.tags = await tagService.createPostTags(
    data.created.id,
    data.tags,
    req.headers.authorization,
  ) || [];
  return res.send({ ...data.created, tags: data.tags });
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
          select: { children: true },
        },
      },
      orderBy: [{ createdAt: 'desc' },
      ],
    });
  } catch (e) {
    return errorHandler.prismaWrapper(e, next);
  }
  if (data.post) {
    data.userIds = extractUniqueKey('userId', data.post);
    data.post = renameKeyInArray(data.post, 'userId', 'user');
    data.users = await userService.getUsers(data.userIds, req.headers.authorization);
    data.post = replaceKeyInObjectArrayWithValue(data.post, 'user', data.users, 'id');
    data.post = await fetchTagsFromPosts(data.post, req.headers.authorization);
    data.post = data.post.map(({ _count, ...p }) => ({
      ...p,
      children: _count.children,
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
        children: {
          include: {
            _count: {
              select: { children: true },
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
    ...extractUniqueKey('userId', data.post.children),
  ];
  data.post = renameKey(data.post, 'userId', 'user');
  data.users = await userService.getUsers(data.userIds, req.headers.authorization);
  data.post.tags = await tagService.getPostTags(id, req.headers.authorization);
  data.post = replaceKeyValueWithMatchingObject(data.post, 'user', data.users, 'id');
  data.post.children = renameKeyInArray(data.post.children, 'userId', 'user');
  data.post.children = replaceKeyInObjectArrayWithValue(data.post.children, 'user', data.users, 'id');
  data.post.children = await fetchTagsFromPosts(data.post.children, req.headers.authorization);
  data.post.children = data.post.children.map(({ _count, ...p }) => ({
    ...p,
    children: _count.children,
  }));
  return res.send(data.post);
}

async function updateById(req, res, next) {
  const { user, body, params } = req;
  const { id } = params;
  const data = Object;

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

  const data = Object;
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
