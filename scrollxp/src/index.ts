import { sayHello } from "./hello";

export default class Bla {
  message: string;

  constructor() {
    this.message = sayHello();
  }

  showMessage() {
    console.log('This is a message:', this.message);
  }
}
