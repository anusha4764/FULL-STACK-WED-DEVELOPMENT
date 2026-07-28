
let numbers = [25, 10, 45, 78, 32, 90, 56];


let largest = numbers[0];


for (let i = 1; i < numbers.length; i++) {
    if (numbers[i] > largest) {
        largest = numbers[i];
    }
}
console.log("Array:", numbers);
console.log("Largest Element:", largest);