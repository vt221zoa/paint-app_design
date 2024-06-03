import {Tool} from './Tool.js';
import {getCursorPosition} from './utils.js';

export class Eraser extends Tool {
    constructor(ctx, canvas, sizePicker) {
        super();
        this.ctx = ctx;
        this.canvas = canvas;
        this.sizePicker = sizePicker;
    }

    draw(e) {
        this.ctx.lineWidth = this.sizePicker.value;
        this.ctx.lineCap = 'round';
        this.ctx.strokeStyle = '#ffffff';

        const [x, y] = getCursorPosition(e, this.canvas);
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
    }
}