export class Rectangle {
    constructor(ctx, startX, startY, endX, endY, fill) {
        this.ctx = ctx;
        this.startX = startX;
        this.startY = startY;
        this.endX = endX;
        this.endY = endY;
        this.fill = fill;
    }

    draw() {
        if (this.fill) {
            this.ctx.fillRect(this.startX, this.startY, this.endX - this.startX, this.endY - this.startY);
        } else {
            this.ctx.strokeRect(this.startX, this.startY, this.endX - this.startX, this.endY - this.startY);
        }
    }
}
