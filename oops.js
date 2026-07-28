class Student {

    constructor(name, age) {

        this.name = name;
        this.age = age;

    }

    display() {

        console.log(this.name);
        console.log(this.age);

    }

}

let s1 = new Student("Anusha",20);
let s2 = new Student("Govi",21);
s1.display();
s2.display();