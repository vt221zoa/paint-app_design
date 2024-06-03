import {Tool} from './Tool.js';
import {getCursorPosition} from './utils.js';

export class Marker extends Tool {
    constructor(ctx, canvas, colorPicker, sizePicker, opacitySlider) {
        super();
        this.ctx = ctx;
        this.canvas = canvas;
        this.colorPicker = colorPicker;
        this.sizePicker = sizePicker;
        this.opacitySlider = opacitySlider;
        this.initialAlpha = 0.5;
    }

    draw(e) {
        this.ctx.lineWidth = this.sizePicker.value;
        this.ctx.lineCap = 'round';
        this.ctx.strokeStyle = this.colorPicker.value;
        this.ctx.globalAlpha = this.initialAlpha * this.opacitySlider.value;

        const [x, y] = getCursorPosition(e, this.canvas);
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);

        this.resetAlpha();
    }

    resetAlpha() {
        this.ctx.globalAlpha = 1;
    }
}