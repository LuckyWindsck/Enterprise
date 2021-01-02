/* ©
  This code is property of Enterprise™.
© */

global.includedDLs = {};

const CompileError = require('../CompileError');
const dls = require('../dls');

module.exports = {
  helperFunc: {
    list: (head, tail) => [head, ...tail.map(({ 1: lib }) => lib)],
    lib: (libName, location) => {
      if (!dls.includes(libName)) {
        throw new CompileError({
          message: 'Invalid library',
          type: 'invalid_lib',
          value: libName,
          location,
        });
      }

      const lib = libName.split('.').pop();
      const { fn } = require(`../lib/disruptiveLibs/${lib}`);

      global.includedDLs[fn] = true;

      return lib;
    },
  },
  createNode: {
    call: (callee, args, location) => {
      if (!global.includedDLs[callee]) {
        throw new CompileError({
          message: 'Invalid call',
          type: 'invalid_call',
          value: callee,
          location,
        });
      }

      return { type: 'call', callee, args };
    },
    comment: (commentType, value) => (
      {
        type: 'comment',
        commentType,
        value: value.map(([, sourceChar]) => sourceChar).join('').trim(''),
      }
    ),
    variable: (varType, name, value) => (
      {
        type: 'var',
        varType,
        name: name.value,
        value,
      }
    ),
    binary: (init, array) => array.reduce((left, { 1: operator, 3: right }) => ({
      type: 'binary',
      operator,
      left,
      right,
    }), init),
  },
};
