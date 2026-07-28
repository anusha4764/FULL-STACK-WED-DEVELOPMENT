
function welcome() {
    console.log("Welcome to JavaScript Functions");
}

welcome();



//  Function with Parameters

function add(a, b) {
    console.log("Addition =", a + b);
}

add(10, 20);



// Function with Return Value

function multiply(a, b) {
    return a * b;
}

let result = multiply(5, 6);

console.log("Multiplication =", result);



//  Default Parameters

function greet(name = "Guest") {
    console.log("Hello", name);
}

greet("Anusha");
greet();



//  Function Expression

const square = function(num) {
    return num * num;
};

console.log("Square =", square(8));



//  Arrow Function


const cube = (num) => {
    return num * num * num;
};

console.log("Cube =", cube(3));



//  Anonymous Function

let message = function() {
    console.log("This is an Anonymous Function");
};

message();



//  Function Calling Another Function

function displayName(name) {
    console.log("Name:", name);
}

function student() {
    displayName("Anusha");
}

student();




