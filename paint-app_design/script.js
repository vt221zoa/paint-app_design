import {CanvasSubject} from './Observer/CanvasSubject.js';
import {Brush} from './tools/Brush.js';
import {Eraser} from './tools/Eraser.js';
import {Spray} from './tools/Spray.js';
import {Marker} from './tools/Marker.js';
import {OilBrush} from './tools/OilBrush.js';
import {Line} from './shapes/Line.js';
import {Rectangle} from './shapes/Rectangle.js';
import {Circle} from './shapes/Circle.js';
import {Triangle} from './shapes/Triangle.js';
import {Star} from './shapes/Star.js';
import {Heart} from './shapes/Heart.js';

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('paintCanvas');
    const ctx = canvas.getContext('2d', {willReadFrequently: true});

    const colorPicker = document.getElementById('colorPicker');
    const sizePicker = document.getElementById('sizePicker');

    const clearCanvasButton = document.getElementById('clearCanvas');
    const saveCanvasButton = document.getElementById('saveCanvas');

    const drawRectButton = document.getElementById('drawRect');
    const drawCircleButton = document.getElementById('drawCircle');
    const drawLineButton = document.getElementById('drawLine');
    const drawTriangleButton = document.getElementById('drawTriangle');
    const drawHeartButton = document.getElementById('drawHeart');
    const drawStarButton = document.getElementById('drawStar');
    const fillCheckbox = document.getElementById('fillCheckbox');

    const brushToolButton = document.getElementById('brushTool');
    const eraserToolButton = document.getElementById('eraserTool');
    const sprayToolButton = document.getElementById('sprayTool');
    const oilBrushToolButton = document.getElementById('oilBrushTool');
    const markerToolButton = document.getElementById('markerTool');

    const undoButton = document.getElementById('undoButton');
    const redoButton = document.getElementById('redoButton');

    const canvasWidthInput = document.getElementById('canvasWidth');
    const canvasHeightInput = document.getElementById('canvasHeight');
    const resizeCanvasButton = document.getElementById('resizeCanvas');

    const toolInfo = document.getElementById('toolInfo');

    const paletteContainer = document.querySelector('.palette');

    const canvasSubject = new CanvasSubject();


    const palette = [
        "#000000", "#2D2D2D", "#5B5B5B", "#878787", "#B2B2B2", "#E0E0E0", "#FFFFFF", "#FFFFFF",
        "#FF6A00", "#FFD800", "#00FF21", "#0094FF", "#0026FF", "#B200FF", "#FFFFFF", "#FFFFFF"
    ];
    let colorIndex = 0;

    let painting = false;
    let tool = 'brush';
    let activeShape = null;
    let undoStack = [];
    let redoStack = [];
    const MAX_UNDO_STEPS = 20;

    undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));

    function startPosition(e) {
        painting = true;
        const rect = canvas.getBoundingClientRect();
        if (['rectangle', 'circle', 'line', 'triangle', 'heart', 'star'].includes(activeShape)) {
            canvas.startX = e.clientX - rect.left;
            canvas.startY = e.clientY - rect.top;
        } else {
            draw(e);
            canvasSubject.notifyObservers();
        }
    }

    function endPosition(e) {
        if (painting) {
            if (['rectangle', 'circle', 'line', 'triangle', 'heart', 'star'].includes(activeShape)) {
                drawShape(e);
            }
            undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
            redoStack = [];
            if (undoStack.length > MAX_UNDO_STEPS) {
                undoStack.shift();
            }
        }
        painting = false;
        ctx.beginPath();
    }

    function updatePalette() {
        paletteContainer.innerHTML = "";
        paletteContainer.append(...palette.map((color, idx) => {
            const unit = document.createElement("div");
            unit.classList.add("paletteUnit");
            if (idx === colorIndex) {
                unit.classList.add("current");
                colorPicker.value = color;
            }
            unit.style.backgroundColor = color;
            unit.onclick = () => {
                colorIndex = idx;
                colorPicker.value = color;
                updatePalette();
            };
            return unit;
        }));
    }

    updatePalette();

    function draw(e) {
        if (!painting || activeShape) return;
        currentTool.draw(e);
    }

    class ToolFactory {
        static createTool(type, ctx, colorPicker, sizePicker, palette, colorIndex, opacitySlider) {
            switch (type) {
                case 'brush':
                    return new Brush(ctx, canvas, colorPicker, sizePicker, opacitySlider);
                case 'eraser':
                    return new Eraser(ctx, canvas, sizePicker);
                case 'spray':
                    return new Spray(ctx, canvas, palette, colorIndex, sizePicker, opacitySlider);
                case 'oilBrush':
                    return new OilBrush(ctx, canvas, colorPicker, sizePicker, opacitySlider);
                case 'marker':
                    return new Marker(ctx, canvas, colorPicker, sizePicker, opacitySlider);
                default:
                    throw new Error("Unknown tool type.");
            }
        }
    }

    let currentTool = ToolFactory.createTool('brush', ctx, canvas, colorPicker, sizePicker, palette, colorIndex);

    const opacitySlider = document.getElementById('opacitySlider');

    opacitySlider.addEventListener('input', () => {
        if (currentTool && currentTool.hasOwnProperty('opacitySlider')) {
            currentTool.opacitySlider = opacitySlider;
        }
    });


    function drawShape(e) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const startX = canvas.startX;
        const startY = canvas.startY;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.putImageData(undoStack[undoStack.length - 1], 0, 0);

        ctx.lineWidth = sizePicker.value;
        ctx.strokeStyle = palette[colorIndex];
        ctx.fillStyle = palette[colorIndex];
        canvasSubject.notifyObservers();

        switch (activeShape) {
            case 'rectangle':
                const rectangle = new Rectangle(ctx, startX, startY, mouseX, mouseY, fillCheckbox.checked);
                rectangle.draw();
                break;
            case 'circle':
                const circle = new Circle(ctx, startX, startY, mouseX, mouseY, fillCheckbox.checked);
                circle.draw();
                break;
            case 'line':
                const line = new Line(ctx, startX, startY, mouseX, mouseY);
                line.draw();
                break;
            case 'triangle':
                const triangle = new Triangle(ctx, startX, startY, mouseX, mouseY, fillCheckbox.checked);
                triangle.draw();
                break;
            case 'star':
                const star = new Star(ctx, startX, startY, mouseX, mouseY, fillCheckbox.checked);
                star.draw();
                break;
            case 'heart':
                const heart = new Heart(ctx, startX, startY, mouseX, mouseY, fillCheckbox.checked);
                heart.draw();
                break;
            default:
                break;
        }
    }


    function clearCanvas() {
        const confirmation = confirm('Are you sure you want to clear the canvas?');
        if (confirmation) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            undoStack = [];
            redoStack = [];
            undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
        }
    }

    function saveCanvas() {
        const fileName = prompt('Enter the name for your painting:');
        if (fileName) {
            const link = document.createElement('a');
            link.download = `${fileName}.png`;
            link.href = canvas.toDataURL();
            link.click();
        }
    }

    function undoLastAction() {
        if (undoStack.length > 1) {
            redoStack.push(undoStack.pop());
            const imageData = undoStack[undoStack.length - 1];
            ctx.putImageData(imageData, 0, 0);
        } else {
            alert("Cannot undo further.");
        }
    }

    function redoLastAction() {
        if (redoStack.length > 0) {
            const imageData = redoStack.pop();
            undoStack.push(imageData);
            ctx.putImageData(imageData, 0, 0);
        } else {
            alert("Cannot redo further.");
        }
    }

    function updateObjectInfo(object, size) {
        toolInfo.textContent = `Tool: ${object.charAt(0).toUpperCase() + object.slice(1)}, Size: ${size.value}`;
    }

    function setActiveTool(toolType, button) {
        activeShape = null;
        tool = toolType;
        currentTool = ToolFactory.createTool(toolType, ctx, colorPicker, sizePicker, palette, colorIndex, opacitySlider);
        document.querySelectorAll('.btn.tool').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        updateObjectInfo(tool, sizePicker);
    }

    function setActiveShape(shapeType, button) {
        tool = null;
        activeShape = shapeType;
        document.querySelectorAll('.btn.tool').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        updateObjectInfo(activeShape, sizePicker);
    }

    const shapeSelector = document.getElementById('shapeSelector');

    shapeSelector.addEventListener('change', function () {
        const selectedShape = shapeSelector.value;
        setActiveShape(selectedShape);
    });


    canvas.addEventListener('mousedown', startPosition);
    canvas.addEventListener('mouseup', endPosition);
    canvas.addEventListener('mousemove', draw);

    clearCanvasButton.addEventListener('click', clearCanvas);
    saveCanvasButton.addEventListener('click', saveCanvas);

    undoButton.addEventListener('click', undoLastAction);
    redoButton.addEventListener('click', redoLastAction);

    brushToolButton.addEventListener('click', () => setActiveTool('brush', brushToolButton));
    eraserToolButton.addEventListener('click', () => setActiveTool('eraser', eraserToolButton));
    sprayToolButton.addEventListener('click', () => setActiveTool('spray', sprayToolButton));
    oilBrushToolButton.addEventListener('click', () => setActiveTool('oilBrush', oilBrushToolButton));
    markerToolButton.addEventListener('click', () => setActiveTool('marker', markerToolButton));

    drawRectButton.addEventListener('click', () => setActiveShape('rectangle', drawRectButton));
    drawCircleButton.addEventListener('click', () => setActiveShape('circle', drawCircleButton));
    drawLineButton.addEventListener('click', () => setActiveShape('line', drawLineButton));
    drawTriangleButton.addEventListener('click', () => setActiveShape('triangle', drawTriangleButton));
    drawHeartButton.addEventListener('click', () => setActiveShape('heart', drawHeartButton));
    drawStarButton.addEventListener('click', () => setActiveShape('star', drawStarButton));


    resizeCanvasButton.addEventListener('click', () => {
        const width = parseInt(canvasWidthInput.value);
        const height = parseInt(canvasHeightInput.value);

        if (width > 0 && height > 0) {
            canvas.width = width;
            canvas.height = height;
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            undoStack = [];
            redoStack = [];
            undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
        } else {
            alert("Invalid canvas size.");
        }
    });

    colorPicker.addEventListener('input', (e) => {
        palette[colorIndex] = e.target.value;
        updatePalette();
    });

    setActiveTool('brush', brushToolButton);
});