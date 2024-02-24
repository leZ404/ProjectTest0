import { Injectable } from '@angular/core';
import { consts } from '@common/consts';
import { Vec2 } from '@common/vec2';

@Injectable({
    providedIn: 'root',
})
export class DrawService {
    isDrawing: boolean = false;
    constructor() {
        window.addEventListener('mouseup', () => {
            this.isDrawing = false;
        });
    }

    drawPencil(context: CanvasRenderingContext2D, currentPos: Vec2, lastPos: Vec2): void {
        context.lineCap = 'round';
        context.beginPath();
        context.moveTo(lastPos.x, lastPos.y);
        context.lineTo(currentPos.x, currentPos.y);
        context.stroke();
    }

    drawRectangle(context: CanvasRenderingContext2D, rectangle: { x: number, y: number, width: number, height: number }) {
        context.clearRect(0, 0, consts.IMAGE_WIDTH, consts.IMAGE_HEIGHT);
        context.fillRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
    }

    drawEraser(context: CanvasRenderingContext2D, currentPos: Vec2,) {
        context.clearRect(currentPos.x - context.lineWidth / 2, currentPos.y - context.lineWidth / 2, context.lineWidth, context.lineWidth);
    }
}
