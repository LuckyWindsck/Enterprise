/* ©
  This code is property of Enterprise™.
© */

global.includedDLs = {};

const CompileError = require('../CompileError');
const dls = require('../dls');

const call = (callee, args, location) => {
  if (global.includedDLs[callee]) {
    return { type: 'call', callee, args };
  }

  throw new CompileError({
    message: `Invalid call '${callee}' at ${JSON.stringify(location)}`,
    type: 'invalid_call',
    value: callee,
    location,
  });
};

const lib = (libName, location) => {
  if (dls[libName]) {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    const { fn, type } = require(`../lib/disruptiveLibs/${dls[libName]}`);

    global.includedDLs[fn] = type;
    return dls[libName];
  }

  throw new CompileError({
    message: `Invalid lib ${libName} at ${JSON.stringify(location)}`,
    type: 'invalid_lib',
    value: libName,
    location,
  });
};

const comment = (commentType, value) => ({ type: 'comment', commentType, value: value.map((i) => i.join('')).join('').trim('') });

const v = (varType, name, value) => ({
  type: 'var', varType, name: name.value, value,
});

const map = (fn, array) => {
  const result = new Array(array.length); let
    i;

  for (i = 0; i < array.length; i += 1) { result[i] = fn(array[i]); }

  return result;
};

const list = (head, tail, index) => [head].concat(map((item) => item[index], tail));

const reduce = (fn) => (init, array) => {
  let result = init; let
    i;

  for (i = 0; i < array.length; i += 1) { result = fn(result, array[i]); }

  return result;
};

const binary = reduce((result, element) => ({
  type: 'binary',
  operator: element[1],
  left: result,
  right: element[3],
}));

module.exports = {
  CompileError,
  dls,
  call,
  lib,
  comment,
  v,
  map,
  list,
  reduce,
  binary,
};
