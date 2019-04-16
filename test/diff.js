var test = require('tape');
var colors = require('colors');
var diffUtils = require('../utils/diff');

colors.setTheme({
  remove: ['red', 'bgRed'],
  add: ['green', 'bgGreen'],
});

// TODO: try to apply the "mostly integration tests things... (I think that basically means test inuput, and output of the whole system, rather than of the individual pieces in the middle

// TODO: test console output... we should have a separate tests to verify the console vs html outputs...

//TODO: Test the console output, and render it like I was doing before... if it's too much work, then switch to jest...
//TODO: Create a console version of renderDiffText()

// Test
// FIXME: modify the output so we can chain it separately, or test it so it's output properly...
// Let's get these tests passing properly, then modify the output so we can have them failing, then we can fix the other stringing fn...
// Q: Does using something like snapshot testing make sense here?
//
//
// Since we can't easily test the console output, we'll render the console output so can quickly visualize that it's working as expected.
// Then we'll assert that the content before colorizing is accurate (that will be same for both html and console rendering, since we're just changing the rendering targed).
test('Diff 3|2', function(t) {
  var result = diffUtils.diffChars('3', '2');
  // returns an array of arrays
  var expected = [
    [{value: '3', meta: {isMatch: false}}], //str1Matches (how they match up)
    [{value: '2', meta: {isMatch: false}}], //str2Matches
  ];

  t.plan(1); // how many assertions will run?
  logDiff(result);

  t.deepEqual(result, expected);
});

test('Diff 3|23', function(t) {
  var result = diffUtils.diffChars('3', '23');
  var expected = [
    [{value: '3', meta: {isMatch: true}}], // first line will have 1char
    [{value: '2', meta: {isMatch: false}}, {value: '3', meta: {isMatch: true}}], // second line will have 2 chars, one will be highlighted (first one)
  ];

  t.plan(1); // how many assertions will run?
  logDiff(result);

  t.deepEqual(result, expected);
});

test('Diff 32|332', function(t) {
  var result = diffUtils.diffChars('32', '332');
  var expected = [
    [{value: '32', meta: {isMatch: true}}],
    [
      {value: '3', meta: {isMatch: false}},
      {value: '32', meta: {isMatch: true}},
    ],
  ];

  t.plan(1); // how many assertions will run?
  logDiff(result);

  t.deepEqual(result, expected);
});

test('Diff jamis|jamis2', function(t) {
  var result = diffUtils.diffChars('jamis', 'jamis2');
  var expected = [
    [{value: 'jamis', meta: {isMatch: true}}],
    [
      {value: 'jamis', meta: {isMatch: true}},
      {value: '2', meta: {isMatch: false}},
    ],
  ];

  t.plan(1); // how many assertions will run?
  logDiff(result);

  t.deepEqual(result, expected);
});

test('Diff jamis|jam3is2', function(t) {
  var result = diffUtils.diffChars('jamis', 'jam3is2');
  var expected = [
    [{value: 'jamis', meta: {isMatch: true}}],
    [
      {value: 'jam', meta: {isMatch: true}},
      {value: '3', meta: {isMatch: false}},
      {value: 'is', meta: {isMatch: true}},
      {value: '2', meta: {isMatch: false}},
    ],
  ];

  t.plan(1); // how many assertions will run?
  logDiff(result);

  t.deepEqual(result, expected);
});

test('Diff jamis|jamis22', function(t) {
  var result = diffUtils.diffChars('jamis', 'jamis22');
  var expected = [
    [{value: 'jamis', meta: {isMatch: true}}],
    [
      {value: 'jamis', meta: {isMatch: true}},
      {value: '22', meta: {isMatch: false}},
    ],
  ];

  t.plan(1); // how many assertions will run?
  logDiff(result);

  t.deepEqual(result, expected);
});

test('Diff arstrsatjamis|jamis22', function(t) {
  var result = diffUtils.diffChars('arstrsatjamis', 'jamis22');
  var expected = [
    [
      {value: 'arstrsat', meta: {isMatch: false}},
      {value: 'jamis', meta: {isMatch: true}},
    ],
    [
      {value: 'jamis', meta: {isMatch: true}},
      {value: '22', meta: {isMatch: false}},
    ],
  ];

  t.plan(1); // how many assertions will run?
  logDiff(result);

  t.deepEqual(result, expected);
});

test('Diff arstrsatjamis|jamisarstrsatadam', function(t) {
  var result = diffUtils.diffChars('arstrsatjamis', 'jamisarstrsatadam');
  var expected = [
    [
      {value: 'arstrsat', meta: {isMatch: true}},
      {value: 'jamis', meta: {isMatch: false}},
    ],
    [
      {value: 'jamis', meta: {isMatch: false}},
      {value: 'arstrsat', meta: {isMatch: true}},
      {value: 'adam', meta: {isMatch: false}},
    ],
  ];

  t.plan(1); // how many assertions will run?
  logDiff(result);

  t.deepEqual(result, expected);
});

// poorMansCharDiff('arstrsatjamis', 'jamisarstrsatadam');

/**********************
 * UTIL FNS: TODO: move these out later?
 * *******************/

// Log the diff to the console
// FIXME: Should we test this? haha. Or is this really just a test helper? Like a visualization helper?
// FIXME: Really consider JEST for this sort of thing
function logDiff(strArr) {
  // console.log('');
  console.log(colors.red('-'), colorizeDiffForConsole(strArr[0], 'remove'));
  console.log(colors.green('+'), colorizeDiffForConsole(strArr[1], 'add'));
}
//
// Renders with diff coloring
// (blank line)
// - firstString
// + secondString
// TODO: eventually this will / should be part of the CLI tooling...
function colorizeDiffForConsole(diffStrArr, addOrRemove) {
  let output = diffStrArr
    .map(str => {
      // FIXME: simplify this logic...
      if (str.meta.isMatch) {
        if (addOrRemove === 'remove') {
          return colors.red(str.value);
        } else {
          return colors.green(str.value);
        }
      } else {
        if (addOrRemove === 'remove') {
          return colors.remove(str.value);
        } else {
          return colors.add(str.value);
        }
      }
    })
    .join(''); // turn into string from array

  return output;
}
