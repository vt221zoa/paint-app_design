import {Tool} from './Tool.js';
import {getCursorPosition} from './utils.js';

export class OilBrush extends Tool {
    constructor(ctx, canvas, colorPicker, sizePicker, opacitySlider) {
        super();
        this.ctx = ctx;
        this.canvas = canvas;
        this.colorPicker = colorPicker;
        this.sizePicker = sizePicker;
        this.opacitySlider = opacitySlider;
        this.density = 5;
        this.initialAlpha = 0.2;
    }

    draw(e) {
        this.ctx.lineWidth = this.sizePicker.value;
        this.ctx.lineCap = 'round';
        this.ctx.strokeStyle = this.colorPicker.value;
        this.ctx.globalAlpha = this.initialAlpha * this.opacitySlider.value;

        const [x, y] = getCursorPosition(e, this.canvas);
        for (let i = 0; i < this.density; i++) {
            const offsetX = Math.random() * this.sizePicker.value - this.sizePicker.value / 2;
            const offsetY = Math.random() * this.sizePicker.value - this.sizePicker.value / 2;
            this.ctx.beginPath();
            this.ctx.moveTo(x + offsetX, y + offsetY);
            this.ctx.lineTo(x, y);
            this.ctx.stroke();
        }
        this.resetAlpha();
    }

    resetAlpha() {
        this.ctx.globalAlpha = 1;
    }
}