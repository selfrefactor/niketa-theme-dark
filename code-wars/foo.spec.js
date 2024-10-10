/**
Write a function, which takes a non-negative integer (seconds) as input and returns the time in a human-readable format (HH:MM:SS)

    HH = hours, padded to 2 digits, range: 00 - 99
    MM = minutes, padded to 2 digits, range: 00 - 59
    SS = seconds, padded to 2 digits, range: 00 - 59

The maximum time never exceeds 359999 (99:59:59)
 */


const Test = require('@codewars/test-compat');

/**
 * function takes list of digits and using permutation, it generates all possible numbers that can be formed from the digits
 * if their order is changed.
 */
function allNumbers (head, list){
	if(list.length === 0){
		return [head];
	}
	let numbers = [];
	for(let i = 0; i < list.length; i++){
		let newHead = head + list[i];
		let newList = list.slice(0,i).concat(list.slice(i+1));
		numbers = numbers.concat(allNumbers(newHead,newList));
	}
	return numbers.map(Number).sort((a,b) => b - a);
}

function nextBiggerx(n){
	let digits = n.toString().split('').map(Number).sort((a,b) => b - a);
	let result = allNumbers('',digits);
	let foundIndex = result.findIndex(num => num === n);
	return result[foundIndex - 1] === n ? -1 : result[foundIndex - 1];
}

function nextBigger(n) {
	let digits = n.toString().split('').map(Number);
	let i = digits.length - 2;

	// Step 2: Find the first digit that is smaller than the digit next to it
	while (i >= 0 && digits[i] >= digits[i + 1]) {
			i--;
	}

	// If no such digit is found, return -1
	if (i === -1) return -1;

	// Step 3: Find the smallest digit on the right side of the found digit that is larger than the found digit
	let j = digits.length - 1;
	while (digits[j] <= digits[i]) {
			j--;
	}

	// Step 4: Swap these two digits
	[digits[i], digits[j]] = [digits[j], digits[i]];

	// Step 5: Sort the digits to the right of the found digit in ascending order
	let right = digits.splice(i + 1).sort((a, b) => a - b);
	digits = digits.concat(right);

	return parseInt(digits.join(''), 10);
}

describe("Tests", () => {
  it("test", () => {
Test.assertEquals(nextBigger(12),21)
Test.assertEquals(nextBigger(513),531)
Test.assertEquals(nextBigger(2017),2071)
Test.assertEquals(nextBigger(414),441)
Test.assertEquals(nextBigger(144),414)
  });
});


function humanReadable (seconds) {
  return [seconds / 3600, seconds % 3600 / 60, seconds % 60].map(n => ('0' + Math.floor(n)).slice(-2)).join(':');
	
}

describe.skip('tests', function() {

  const { strictEqual } = require("chai").assert;

  function doTest(seconds, expected) {
    const actual = humanReadable(seconds);
    strictEqual(actual, expected, `for ${seconds} seconds\n`);
  }

  it('sample tests', function() {
    doTest(     0, '00:00:00');
    doTest(    59, '00:00:59');
    doTest(    60, '00:01:00');
    doTest(    90, '00:01:30');
    doTest(  3599, '00:59:59');
    doTest(  3600, '01:00:00');
    doTest( 45296, '12:34:56');
    doTest( 86399, '23:59:59');
    doTest( 86400, '24:00:00');
    doTest(359999, '99:59:59');
  });
});