function exclude(data, keys) {
  const returnValue = { ...data };
  keys.forEach((key) => {
    delete returnValue[key];
  });
  return returnValue;
}

function clean(data) {
  const obj = { ...data };
  Object.keys(obj).forEach((key) => {
    if ((obj[key] === null) || (obj[key] === undefined)) {
      delete obj[key];
    }
  });
  return obj;
}

function containsAny(obj, keys) {
  return keys.some((key) => key in obj);
}

function filterObject(fields, object) {
  const returnValue = {};
  fields.forEach((key) => {
    if (Object.hasOwnProperty.call(object, key)) {
      returnValue[key] = object[key];
    }
  });
  return returnValue;
}

module.exports = {
  exclude,
  clean,
  containsAny,
  filterObject,
};
