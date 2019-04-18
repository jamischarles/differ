// For now just duplicating heavily... resolve that later...

// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const url = require('url');

const diffUtils = require('../../utils/diff');

// adds span with class names for styling the parts the changed.
function renderDiffText(diffStrArr) {
  let output = diffStrArr
    .map(str => {
      if (str.meta.isMatch) {
        return str.value;
      } else {
        return `<span class="no-match">${str.value}</span>`;
      }
    })
    .join(''); // turn into string from array

  return output;
}

// output diff that is up/down...
function renderTopDiff(str1, str2) {
  console.log('str1', str1);
  console.log('str2', str2);
  var diffs = diffUtils.diffChars(str1, str2);
  var stats = getStats(diffs, str1, str2);
  console.log('stats', stats);
  console.log('diff', diffs);

  let output = `
    <h2>Top/down diff</h2>
    <div class="stats">${JSON.stringify(stats)}</div>
    <div class="old no-wrap"><pre>- ${renderDiffText(diffs[0])}</pre></div>
    <div class="new no-wrap"><pre>+ ${renderDiffText(diffs[1])}</pre></div>
  `;

  document.getElementById('topDiff').innerHTML = output;
}

// output the diff...
// FIXME: consider using react for this?
// Or vue. Or lit-html? Something that I don't need a compile step for...
// FIXME: simplify this code A LOT...
function renderSideDiff(data) {
  var rows = data.map(diffItem => {
    // no diff
    if (diffItem.values.length === 1) {
      return `<tr><td>${diffItem.key}</td><td>${diffItem.values[0]}</td><td>${
        diffItem.values[0]
      }</td></tr>`;
    } else {
      return `<tr><td>${diffItem.key}</td><td class="old">${renderDiffText(
        diffItem.diff[0],
      )}</td><td class="new">${renderDiffText(diffItem.diff[1])}</td></tr>`;
    }
  });

  const output = `
  <h2>Side by side diff</h2>
<table border="1">
  <tr>
    <td>Part</td>
    <td>Left side</td>
    <td>Right side</td>
  </tr>
  ${rows}
</table>
  `;

  document.getElementById('sideDiff').innerHTML = output;
}
//
//
// Each problem / use case can really be split into 2 parts: 1) The technical code (backend) to make the comparison correctly and efficiently (fast) and 2) displaying the data in a way that makes for a really really great UX.

// array of arrays of strings...
// We can use this to generate stats of matches, etc...
function getStats(diffArr, str1, str2) {
  var totalCharCount = Math.max(str1.length, str2.length); // use the longer string as total
  var similarCharCount = 0;
  var oldChunksCount = 0; // old string
  var newChunksCount = 0; // new string

  // similarity %: [shared chars]/[total chars of longer string] we should be able to get total matches from just the first str diff
  var diff1 = diffArr[0]; // diff1 is an array of strings with values and matches
  var diff2 = diffArr[1]; // diff2 is an array of strings with values and matches

  // FIXME: better names?
  for (var i = 0; i < diff1.length; i++) {
    var o = diff1[i];

    if (o.meta.isMatch) {
      similarCharCount += o.value.length;
    } else {
      oldChunksCount++;
    }
  }

  // get change chunk count for str2 as well
  diff2.forEach(item => {
    if (!item.meta.isMatch) newChunksCount++;
  });

  //
  //
  return {
    similarCharCount,
    matchPercentage: similarCharCount / totalCharCount * 100,
    str1Count: str1.length,
    str2Count: str2.length,
    str1Chunks: oldChunksCount,
    str2Chunks: newChunksCount,
  };
}

// for now just some hacky code...
function runDiff(e) {
  var el1 = document.getElementById('diff-block-one');
  var el2 = document.getElementById('diff-block-two');

  // FIXME: move this into the sideBySide function?
  // var data = urlDiff(str1, str2);

  // renderSideDiff(data);

  renderTopDiff(el1.value, el2.value);
}

function addEventlisteners() {
  var el = document.getElementById('button');
  el.addEventListener('click', runDiff);
}

function init() {
  addEventlisteners();
}

init();
