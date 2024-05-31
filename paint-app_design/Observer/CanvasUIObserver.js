import { CanvasObserver } from './CanvasObserver.js';
export default class CanvasUIObserver extends CanvasObserver {
    constructor(canvasSubject) {
        super();
        this.canvasSubject = canvasSubject;
        this.canvasSubject.addObserver(this);
    }

    update() {
        console.log('UPDATE')
    }
}
