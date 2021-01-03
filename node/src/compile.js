/* ©
  This code is property of Enterprise™.
© */

const fs = require('fs');
const { gray, red, bold } = require('colors/safe');
const beautify = require('js-beautify').js;

const parseAST = require('./ast');
const CompileError = require('./CompileError');
const dls = require('./dls');

const delay = (turbo) => (fnCall) => {
  const delayedFnCall = turbo
    ? fnCall
    : `new Promise((resolve) => { setTimeout(async () => { resolve(await ${fnCall}) }, 1000) })`;

  return `await ${delayedFnCall}`;
};

const compile = (turbo) => function compileNodeList(ast) {
  const compileNode = (node) => {
    let code = '';

    switch (node.type) {
      case 'comment':
        break;
      case 'import':
        code = `${require(`./lib/disruptiveLibs/${node.lib}`).code}\n`;
        break;
      case 'finalDisruptiveClass':
        code = `class ${node.name} {${compileNodeList(node.body)}}\n\nnew ${node.name}().main()`;
        break;
      case 'mainMethod':
        code = `async main () {${compileNodeList(node.body)}}`;
        break;
      case 'var':
        code = `var ${node.name}=${compileNode(node.value)}`;
        break;
      case 'while':
        code = `while (${compileNode(node.test)}) {${compileNodeList(node.body)}}`;
        break;
      case 'if':
        code = `if (${compileNode(node.test)}) {${compileNodeList(node.then)}} else {${compileNodeList(node.else)}}`;
        break;
      case 'binary':
        code = `${compileNode(node.left)} ${node.operator} ${compileNode(node.right)}`;
        break;
      case 'call':
        code = delay(turbo)(`${node.callee}(${node.args.map(compileNode).join(', ')})`);
        break;
      case 'mutate':
        code = `${node.var}${node.mutation}`;
        break;
      case 'varName':
      case 'numVarName':
        code = node.value;
        break;
      default:
        code = JSON.stringify(node);
        break;
    }

    return code;
  };

  return ast.map(compileNode).filter(Boolean).join('\n');
};

const formatCodeError = (file, location) => {
  const pipe = (input, pipelines) => pipelines.reduce((arg, fn) => fn(arg), input);

  const hintError = (errorLineNumber) => ([...errorCode]) => {
    const dashLine = gray('-'.repeat(location.start.column - 1));
    const redCarets = red('^'.repeat(location.end.column - location.start.column));
    const errorLine = dashLine + redCarets;

    errorCode.splice(errorLineNumber, 0, { lineContent: errorLine, numberable: false });

    return errorCode;
  };

  const numberLine = (separator = '') => (codeLines) => {
    const codeLengthDigitCount = codeLines.length.toString().length;

    return codeLines.map((codeLine, idx) => {
      let { lineContent, numberable } = codeLine;
      let numberString = '';

      if (numberable) {
        const lineNumber = String(idx + 1).padStart(codeLengthDigitCount);

        numberString = lineNumber + separator;
        numberable = false;
      } else {
        const hiddenLineNumber = ' '.repeat(codeLengthDigitCount);
        const hiddenSeparator = ' '.repeat(separator.length);

        numberString = hiddenLineNumber + hiddenSeparator;
      }

      lineContent = gray(numberString) + lineContent;

      return { lineContent, numberable };
    });
  };

  const sourceLines = fs.readFileSync(file, 'utf8')
    .split('\n')
    .map((line) => ({ lineContent: line, numberable: true }));
  const errorLineNumber = location.start.line;
  const paddingSpaceLength = 1;
  const separator = ' | ';

  return pipe(sourceLines, [hintError(errorLineNumber), numberLine(separator)])
    .map(({ lineContent }) => ' '.repeat(paddingSpaceLength) + lineContent)
    .join('\n');
};

const displayCompileError = ({
  compilerMessage, type, value, location,
}, file) => {
  const errorMessage = [];
  const emptyLine = '';
  const waveLine = '~'.repeat(20);

  errorMessage.push(emptyLine);
  errorMessage.push(red(`${compilerMessage} ${bold(value)}\n`));

  if (type === 'invalid_lib') {
    errorMessage.push('Pick one of:');
    errorMessage.push(...dls.map((libName) => `  - ${libName}`));
  }

  errorMessage.push(emptyLine);
  errorMessage.push(gray(waveLine));
  errorMessage.push(formatCodeError(file, location));
  errorMessage.push(gray(waveLine));

  return errorMessage.join('\n');
};

module.exports = (file, turbo, evalMode) => {
  try {
    const ast = parseAST(file);
    const compiled = compile(turbo)(ast);

    return evalMode ? compiled : beautify(compiled, { indent_size: 2, space_in_empty_paren: true });
  } catch (e) {
    if (e instanceof CompileError) return displayCompileError(e, file);

    throw e;
  }
};
