export class Star {
    constructor(ctx, startX, startY, endX, endY, fill) {
        this.ctx = ctx;
        this.startX = startX;
        this.startY = startY;
        this.endX = endX;
        this.endY = endY;
        this.fill = fill;
    }

    draw() {
        let dx = this.endX - this.startX;
        let dy = this.endY - this.startY;
        let angle = Math.atan2(dy, dx);
        let starRadius = Math.sqrt(dx * dx + dy * dy) / 2;

        this.ctx.lineCap = "round";
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(this.startX + Math.cos(angle) * starRadius, this.startY + Math.sin(angle) * starRadius);

        for (let i = 0; i < 5; i++) {
            this.ctx.lineTo(this.startX + Math.cos(angle + i * Math.PI * 0.4) * starRadius,
                this.startY + Math.sin(angle + i * Math.PI * 0.4) * starRadius);
            this.ctx.lineTo(this.startX + Math.cos(angle + (i + 0.5) * Math.PI * 0.4) * starRadius * 0.5,
                this.startY + Math.sin(angle + (i + 0.5) * Math.PI * 0.4) * starRadius * 0.5);
        }

        this.ctx.closePath();
        if (this.fill) {
            this.ctx.fill();
        } else {
            this.ctx.stroke();
        }

        this.ctx.restore();
    }
}
