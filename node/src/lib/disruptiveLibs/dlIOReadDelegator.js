module.exports = {
  fn: 'read',
  code: `const readline = require('readline');

const read = (question) => {
  const ___rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => ___rl.question(question, (answer) => {
    resolve(answer);
    ___rl.close();
  }));
};`,
};
