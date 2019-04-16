// FIXME: use this as basis for unit tests..
// This is the 1-2 hard things that Marco Arment talked about... Everything else is pretty easy-ish...
var colors = require('colors');

colors.setTheme({
  remove: ['red', 'bgRed'],
  add: ['green', 'bgGreen'],
});

// FIXME: GET features from here...
// TODO: make use cases with LOOOONG urls much more friendly...
// lots of options... like hiding common parts. Lining things up nicely.
// Splitting up the url by parts and keeping it down down...
// Hiding all the parts of the url (like host, etc, that are the same...)
// for input, add a line split, and line items... Make it really easy to work with it and show where the split will e
// Make it not explode if you remove parts of the url

// TODO:
// 1) Write a quick assertion for the previous use cases (add proper unit testing framework later).
// Try tap? or something else from substack?

// TODO: can we use the common chunks as a splitting point? So we remove those pieces from future matches?
//
// TODO: set up repo and track differences...

function poorMansCharDiff(str1, str2) {
  // Goal: find the common parts between 2 strings. (if % common is very low, then abandon char diffing...)
  // let's start with high threshold, 3 char chunks...
  // this is fairly similar to the island algo challenge I did at FB.

  // take first 2 chars, and see if they match up with any part of string2.
  // Q: Do I want to do this manually or use builtins? A: For now, let's use builtins...
  // FIXME: add char length check... or a minimum length to abandon this check...
  // TODO: make this recursive

  // FIXME: make this better and clean this up...
  var str1Matches = [];
  var str2Matches = [];

  // we want to keep track of both, because after a match, we don't want to revisit the same part of str1. We want to look forward...
  // TODO: Does this mean we should keep track of match points and ignore those during the actual walking of the string?
  // FIXME: This can and should be improved...
  var str1Pos = 0;
  var str2Pos = 0;

  // run until we've reached the end of the string
  while (str1Pos < str1.length) {
    // console.log('str1Pos', str1Pos);
    // FIXME: this can / should be improved with a better matching algorithm...
    // FIXME: Using bigger number (2) yields greater accuracy... Change to 3?
    var chunk = str1.slice(str1Pos, str1Pos + 3); // 2 chars at a time?
    var matchIndex = str2.indexOf(chunk, str2Pos); // does this chunk exist in 2nd string? Starting at str2Pos (so we don't re-match the same parts over and over again)

    if (matchIndex > -1) {
      // if it matches, find end of match (start of diff)
      // Q: Should we advance one char at a time, or keep using indexOf? Test perf later...
      // find end of match...
      var res = findMatchStartEnd(str1, str2, str1Pos, matchIndex);

      // console.log('res', res);

      str1Pos = res.str1.end + 1;
      str2Pos = res.str2.end + 1;

      // FIXME: this seems like a really awkward data structure for ranges of strings...
      // maybe it'd be better to split the string into an array, and pass metadata along with it (match) or no match...
      // then when we console we can assemble the string with coloring that way
      str1Matches.push({start: res.str1.start, end: res.str1.end});
      str2Matches.push({start: res.str2.start, end: res.str2.end});
    } else {
      // move on to next chunk
      str1Pos += 2;
    }
  }

  // if running in test...
  // FIXME: Add a check for the test runner or the env...
  // FIXME: is thist a code smell? Should we add this to the test?
  //
  // var removeStr = renderDiffTextForConsole(
  //   splitStringByMatch(str1, str1Matches),
  //   'remove',
  // );
  // var addStr = renderDiffTextForConsole(
  //   splitStringByMatch(str2, str2Matches),
  //   'add',
  // );
  // console.log('');
  // console.log(colors.red('-'), removeStr);
  // console.log(colors.green('+'), addStr);

  // console.log('');
  // console.log(colors.red('-'), colorizeDiffLine(str1, 'remove', str1Matches));
  // console.log(colors.green('+'), colorizeDiffLine(str2, 'add', str2Matches));
  //
  // console.log('str1Matches', str1Matches);

  // assemble strings to output diff report...
  //
  return [
    splitStringByMatch(str1, str1Matches),
    splitStringByMatch(str2, str2Matches),
  ];

  // USED FOR Colorizing the output. FIXME: use this for command line testing, and/or diff CLI
  // console.log('');
  // console.log(colors.red('-'), colorizeDiffLine(str1, 'remove', str1Matches));
  // console.log(colors.green('+'), colorizeDiffLine(str2, 'add', str2Matches));
}

// returns start, end of matching string positions for two strings
// @params: first 2 strings. Then the positions where they match up
// This will search forward and backwards in the strings to find match boundaries
// FIXME: simplify?
function findMatchStartEnd(str1, str2, str1Pos, str2Pos) {
  // find start of match (verify if str1Pos:str2Pos is actual start of match, or some preceeding chars are good for match)
  // go backwards searching for earlier match than passed in (happens sometimes...0
  while (str1Pos > -1 && str2Pos > -1) {
    // break on first deviation
    if (str1.charAt(str1Pos) != str2.charAt(str2Pos)) {
      // reset str1Pos and str2Pos to last known match (previous iteration)
      str1Pos++;
      str2Pos++;
      break;
    }

    // if we've reached start of string, bail
    if (str1Pos === 0 || str2Pos === 0) break;

    str1Pos--;
    str2Pos--;
  }

  // start at match positions for each string, and step forward one at a time...
  for (var i = 0; i < str1.length; i++) {
    // break on first deviation
    if (str1.charAt(str1Pos + i) != str2.charAt(str2Pos + i)) {
      break;
    }
  }

  return {
    str1: {
      start: str1Pos,
      end: str1Pos + i,
    },
    str2: {
      start: str2Pos,
      end: str2Pos + i,
    },
  };
}

// returns an array of objects with string and metadata
// they are split by whether they are matches or not
// [match, nomatch, match]
//
// for now just [{value:'', meta: {isMatch: true}}]
// FIXME: can we change this so this array is created during the actual match process?
// FIXME: Simplify this... With unit tests... When we get there...
// TODO: ADD: when we reach end of string without matches, what then?
function splitStringByMatch(str, diffData) {
  // split the strings according to where the matches are
  let arr = [];

  let buffer = '';
  let currentBufferIsMatch; // boolean. When there's a change, we save buffer off to arr[]

  for (let i = 0; i < str.length; i++) {
    // when there is a change in match/no-match, save it to array, and clear buffer
    let isMatch = isNumberInRange(i, diffData);

    if (i === 0) {
      currentBufferIsMatch = isMatch;
    }

    if (currentBufferIsMatch !== isMatch) {
      // there's a change in matchStatus, so flush the buffer
      arr.push({
        value: buffer,
        meta: {
          isMatch: currentBufferIsMatch,
        },
      });

      buffer = '';
      currentBufferIsMatch = isMatch;
    }

    // save the letter to buffer
    buffer += str[i];
  }

  // if we reach the end, and buffer still has letters in it, flush...
  // this handles cases where it's all match or no match... and if there's only 1 letter...
  if (buffer.length > 0) {
    arr.push({
      value: buffer,
      meta: {
        isMatch: currentBufferIsMatch,
      },
    });
  }

  return arr;
}

// FIXME: simplify this? Separate styling from what it is...
// FIXME: move the colorizing to the test... And/or the command line util for diffing...?
// Consider open sourcing the command line part for free...
function colorizeDiffLine(str, addOrRemove, diffData) {
  var output = str
    .split('')
    .map((letter, i) => {
      // return letter;
      // is this in range?
      // if not, then it's not a string match, so highlight it (that means it's added, or removed)

      // FIXME: clean up this nested if statement
      if (isNumberInRange(i, diffData)) {
        if (addOrRemove === 'remove') {
          return colors.red(letter);
        } else {
          return colors.green(letter);
        }
      } else {
        if (addOrRemove === 'remove') {
          return colors.remove(letter);
        } else {
          return colors.add(letter);
        }
      }
    })
    .join(''); // turn back into string

  return output;
}

function renderDiffTextForConsole(diffStrArr, addOrRemove) {
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

  // var output = str
  //   .split('')
  //   .map((letter, i) => {
  //     // return letter;
  //     // is this in range?
  //     // if not, then it's not a string match, so highlight it (that means it's added, or removed)
  //
  //     // FIXME: clean up this nested if statement
  //     if (isNumberInRange(i, diffData)) {
  //       if (addOrRemove === 'remove') {
  //         return colors.red(letter);
  //       } else {
  //         return colors.green(letter);
  //       }
  //     } else {
  //       if (addOrRemove === 'remove') {
  //         return colors.remove(letter);
  //       } else {
  //         return colors.add(letter);
  //       }
  //     }
  //   })
  //   .join(''); // turn back into string
  //
  // return output;
}

// tells us if the number is in range of string matches
function isNumberInRange(number, arrayOfRangeObj) {
  // loop through the array of match obj. [{start:0, end:5}] etc
  //
  for (var i = 0; i < arrayOfRangeObj.length; i++) {
    var start = arrayOfRangeObj[i].start;
    var end = arrayOfRangeObj[i].end;

    // is the number between start and end?
    // 5-9. 5 and 9 are inclusive. Q: should end be <=?
    if (number >= start && number < end) return true;
  }

  return false;
}

// TESTING SECTION...

// FIXME: Abstract this stuff into tests...
// being called from command line
if (require.main === module) {
  // TODO: add all these as unit tests...
  poorMansCharDiff('3', '2');
  poorMansCharDiff('3', '23');
  poorMansCharDiff('32', '332');
  poorMansCharDiff('jamis', 'jamis2');
  poorMansCharDiff('jamis', 'jam3is2');
  poorMansCharDiff('jamis', 'jamis22');
  poorMansCharDiff('arstrsatjamis', 'jamis22');
  poorMansCharDiff('arstrsatjamis', 'jamisarstrsatadam');

  var firstUrl =
    'https://www.msmaster.qa.paypal.com/signin?returnUri=https%3A%2F%2Fwww.msmaster.qa.paypal.com%2Fmyaccount%2Ftransfer&state=%2Fsend%2Fexternal%2Fppme%3Fprofile%3Dsds%26currencyCode%3DUSD%26amount%3D123%26locale.x%3Den_US%26country.x%3DUS%26flowType%3Dsend';

  var secondUrl = `https://www.msmaster.qa.paypal.com/signin?returnUri=https%3A%2F%2Fmsmaster.qa.paypal.com%2Fmyaccount%2Ftransfer%2Fsend%2Fexternal%2Fppme%3Fprofile%3Dsds&currencyCode=USD&amount=120&locale.x=en-us&country.x=US&flowType=send&onboardData={"country.x"%3A"US"%2C"locale.x"%3A"en-us"%2C"intent"%3A"paypalme"%2C"redirect_url"%3A"https%3A%2F%2Fmsmaster.qa.paypal.com%2Fmyaccount%2Ftransfer%2Fsend%2Fexternal%2Fppme%3Fprofile%3Dsds%26currencyCode%3DUSD%26amount%3D120%26locale.x%3Den-us%26country.x%3DUS%26flowType%3Dsend"%2C"sendMoneyText"%3A"Rosalind Douglas %24120.00"}`;

  poorMansCharDiff(firstUrl, secondUrl);
  // else being required in...
} else {
  module.exports = {
    diffChars: poorMansCharDiff,
  };
}

// TODO: since we know that we are dealing with a url, can/should we use word boundaries like `&`, `.`, `:`, `/`, `=` to create delimeters that we can use to make diffing easier?
//
//
