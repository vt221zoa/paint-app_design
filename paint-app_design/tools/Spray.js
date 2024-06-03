import {Tool} from './Tool.js';
import {getCursorPosition} from './utils.js';

export class Spray extends Tool {
    constructor(ctx, canvas, palette, colorIndex, sizePicker, opacitySlider) {
        super();
        this.ctx = ctx;
        this.canvas = canvas;
        this.palette = palette;
        this.colorIndex = colorIndex;
        this.sizePicker = sizePicker;
        this.opacitySlider = opacitySlider;
    }

    draw(e) {
        this.ctx.fillStyle = this.palette[this.colorIndex];
        const [x, y] = getCursorPosition(e, this.canvas);
        for (let i = 0; i < 10; i++) {
            const offsetX = Math.random() * this.sizePicker.value - this.sizePicker.value / 2;
            const offsetY = Math.random() * this.sizePicker.value - this.sizePicker.value / 2;
            this.ctx.globalAlpha = Math.random() * this.opacitySlider.value;
            this.ctx.fillRect(x + offsetX, y + offsetY, 1, 1);
        }
    }
}
