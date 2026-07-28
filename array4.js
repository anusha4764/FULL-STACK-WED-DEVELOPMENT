
let numbers = [10, 20, 30, 40, 50];

console.log("Original Array:", numbers);

numbers.push(60);
console.log("After push():", numbers);

numbers.pop();
console.log("After pop():", numbers);

numbers.unshift(5);
console.log("After unshift():", numbers);

numbers.shift();
console.log("After shift():", numbers);

let index = numbers.indexOf(30);
console.log("Index of 30:", index);


console.log("Contains 40?", numbers.includes(40));

let part = numbers.slice(1, 4);
console.log("slice(1,4):", part);

numbers.splice(2, 1, 35);
console.log("After splice():", numbers);

numbers.reverse();
console.log("After reverse():", numbers);

numbers.sort((a, b) => a - b);
console.log("After sort():", numbers);

let str = numbers.join(" - ");
console.log("After join():", str);
console.log("Length of Array:", numbers.length);