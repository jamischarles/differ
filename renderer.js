// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const url = require('url');

const diffUtils = require('./diff');

// We can use pretty simple algorithms here...
function urlDiff(urlStr1, urlStr2) {
  // split into the various parts and diff each one...
  const url1 = url.parse(urlStr1);
  const url2 = url.parse(urlStr2);

  console.log('url1', url1);
  console.log('url2', url2);

  // don't need to compare keys here, because all the keys are the same...
  // FIXME: Can we use the json comparision module here? For now just hack it, and then maybe later we can replace the logic here...

  var report = Object.keys(url1)
    .map(key => {
      // console.log('key', key);
      // console.log('url1[key]', url1[key]);
      // console.log('url2[key]', url2[key]);
      //
      // ignore these keys (redundant)
      if (['search', 'path', 'href'].includes(key)) {
        return null;
      }

      let diffObj = {
        key,
        values: [url1[key]], // if same, will only have one result
        // diff: diffString(this.values),
      };

      // if they aren't the same...
      if (url1[key] != url2[key]) {
        diffObj.values.push(url2[key]);
        // diffObj.diff = diffString(url1[key], url2[key]);
        diffObj.diff = diffUtils.diffChars(url1[key], url2[key]);
      }
      return diffObj;
    })
    .filter(item => item !== null); // remove null items (no sparse array)

  console.log('report', report);
  return report;
  // compare the parts
  //
  // store report on what parts are different (and where they are different (like an AST))
  // array of differences?
}

// everything will be based on this...
// How do I diff the 2 strings and generate a good AST-like report...?
// let's use this for a minified, string diff... (make this work for a giant single word diff too? because wdiff only works for word spaces...)
function diffString(str1, str2) {
  let diffs = [];
  diffs.push({
    start: 5,
    end: 10,
    old: 'jamis',
    new: 'jamis22',
  });

  return diffs;
}

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
  var diffs = diffUtils.diffChars(str1, str2);
  console.log('diff', diffs);

  let output = `
    <h2>Top/down diff</h2>
    <div class="old no-wrap">- ${renderDiffText(diffs[0])}</div>
    <div class="new no-wrap">+ ${renderDiffText(diffs[1])}</div>
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
//
//
// TODO: figure out how to tab the sections...?
// var firstUrl =
//   'https://www.msmaster.qa.paypal.com/signin?returnUri=https%3A%2F%2Fwww.msmaster.qa.paypal.com%2Fmyaccount%2Ftransfer&state=%2Fsend%2Fexternal%2Fppme%3Fprofile%3Dsds%26currencyCode%3DUSD%26amount%3D123%26locale.x%3Den_US%26country.x%3DUS%26flowType%3Dsend';
//
// var secondUrl = `https://www.msmaster.qa.paypal.com/signin?returnUri=https%3A%2F%2Fmsmaster.qa.paypal.com%2Fmyaccount%2Ftransfer%2Fsend%2Fexternal%2Fppme%3Fprofile%3Dsds&currencyCode=USD&amount=120&locale.x=en-us&country.x=US&flowType=send&onboardData={"country.x"%3A"US"%2C"locale.x"%3A"en-us"%2C"intent"%3A"paypalme"%2C"redirect_url"%3A"https%3A%2F%2Fmsmaster.qa.paypal.com%2Fmyaccount%2Ftransfer%2Fsend%2Fexternal%2Fppme%3Fprofile%3Dsds%26currencyCode%3DUSD%26amount%3D120%26locale.x%3Den-us%26country.x%3DUS%26flowType%3Dsend"%2C"sendMoneyText"%3A"Rosalind Douglas %24120.00"}`;

// for now just some hacky code...
function runDiff(e) {
  var el = document.getElementById('diff-block');
  // console.log('el', el);
  // console.log('el.innerHTML', el.innerHTML);
  var arr = el.value.split('\n');

  var str1 = arr[0];
  var str2 = arr[1];

  // FIXME: move this into the sideBySide function?
  var data = urlDiff(str1, str2);

  renderSideDiff(data);
  renderTopDiff(str1, str2);
}

function addEventlisteners() {
  var el = document.getElementById('button');
  el.addEventListener('click', runDiff);
}

function init() {
  addEventlisteners();
}

init();
