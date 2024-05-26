document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('paintCanvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const colorPicker = document.getElementById('colorPicker');
    const sizePicker = document.getElementById('sizePicker');
    const clearCanvasButton = document.getElementById('clearCanvas');
    const saveCanvasButton = document.getElementById('saveCanvas');
    const drawRectButton = document.getElementById('drawRect');
    const drawCircleButton = document.getElementById('drawCircle');
    const drawLineButton = document.getElementById('drawLine');
    const drawTriangleButton = document.getElementById('drawTriangle');
    const fillCheckbox = document.getElementById('fillCheckbox');
    const brushToolButton = document.getElementById('brushTool');
    const eraserToolButton = document.getElementById('eraserTool');
    const sprayToolButton = document.getElementById('sprayTool');
    const undoButton = document.getElementById('undoButton');
    const redoButton = document.getElementById('redoButton');
    const canvasWidthInput = document.getElementById('canvasWidth');
    const canvasHeightInput = document.getElementById('canvasHeight');
    const resizeCanvasButton = document.getElementById('resizeCanvas');

    let painting = false;
    let tool = 'brush';
    let undoStack = [];
    const MAX_UNDO_STEPS = 20;

    undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));

    function startPosition(e) {
        painting = true;
        const rect = canvas.getBoundingClientRect();
        if (['rectangle', 'circle', 'line', 'triangle'].includes(tool)) {
            canvas.startX = e.clientX - rect.left;
            canvas.startY = e.clientY - rect.top;
        } else {
            draw(e);
        }
    }

    function endPosition(e) {
        if (painting) {
            if (['rectangle', 'circle', 'line', 'triangle'].includes(tool)) {
                drawShape(e);
            }
            undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
            if (undoStack.length > MAX_UNDO_STEPS) {
                undoStack.shift();
            }
        }
        painting = false;
        ctx.beginPath();
    }

    function draw(e) {
        if (!painting) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.lineWidth = sizePicker.value;
        ctx.lineCap = 'round';

        if (tool === 'brush') {
            ctx.strokeStyle = colorPicker.value;
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y);
        } else if (tool === 'eraser') {
            ctx.strokeStyle = '#ffffff';
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y);
        } else if (tool === 'spray') {
            ctx.fillStyle = colorPicker.value;
            for (let i = 0; i < 10; i++) {
                const offsetX = Math.random() * sizePicker.value - sizePicker.value / 2;
                const offsetY = Math.random() * sizePicker.value - sizePicker.value / 2;
                ctx.fillRect(x + offsetX, y + offsetY, 1, 1);
            }
        }
    }

    function drawShape(e) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const startX = canvas.startX;
        const startY = canvas.startY;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.putImageData(undoStack[undoStack.length - 1], 0, 0);

        ctx.lineWidth = sizePicker.value;
        ctx.strokeStyle = colorPicker.value;
        ctx.fillStyle = colorPicker.value;

        switch (tool) {
            case 'rectangle':
                drawRectangle(startX, startY, mouseX, mouseY);
                break;
            case 'circle':
                drawCircle(startX, startY, mouseX, mouseY);
                break;
            case 'line':
                drawLine(startX, startY, mouseX, mouseY);
                break;
            case 'triangle':
                drawTriangle(startX, startY, mouseX, mouseY);
                break;
        }
    }

    function drawRectangle(startX, startY, endX, endY) {
        if (fillCheckbox.checked) {
            ctx.fillRect(startX, startY, endX - startX, endY - startY);
        } else {
            ctx.strokeRect(startX, startY, endX - startX, endY - startY);
        }
    }

    function drawCircle(startX, startY, endX, endY) {
        const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
        ctx.beginPath();
        ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
        if (fillCheckbox.checked) {
            ctx.fill();
        } else {
            ctx.stroke();
        }
    }

    function drawLine(startX, startY, endX, endY) {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
    }

    function drawTriangle(startX, startY, endX, endY) {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.lineTo(startX + (startX - endX), endY);
        ctx.closePath();
        if (fillCheckbox.checked) {
            ctx.fill();
        } else {
            ctx.stroke();
        }
    }

    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        undoStack = [];
        undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    }

    function saveCanvas() {
        const link = document.createElement('a');
        link.download = 'painting.png';
        link.href = canvas.toDataURL();
        link.click();
    }

    function undoLastAction() {
        if (undoStack.length > 1) {
            undoStack.pop();
            const imageData = undoStack[undoStack.length - 1];
            ctx.putImageData(imageData, 0, 0);
        } else {
            alert("Cannot undo further.");
        }
    }

    function setActiveTool(newTool, button) {
        tool = newTool;
        document.querySelectorAll('.btn.tool').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
    }

    canvas.addEventListener('mousedown', startPosition);
    canvas.addEventListener('mouseup', endPosition);
    canvas.addEventListener('mousemove', draw);
    clearCanvasButton.addEventListener('click', clearCanvas);
    saveCanvasButton.addEventListener('click', saveCanvas);
    undoButton.addEventListener('click', undoLastAction);

    brushToolButton.addEventListener('click', () => setActiveTool('brush', brushToolButton));
    eraserToolButton.addEventListener('click', () => setActiveTool('eraser', eraserToolButton));
    sprayToolButton.addEventListener('click', () => setActiveTool('spray', sprayToolButton));
    drawRectButton.addEventListener('click', () => setActiveTool('rectangle', drawRectButton));
    drawCircleButton.addEventListener('click', () => setActiveTool('circle', drawCircleButton));
    drawLineButton.addEventListener('click', () => setActiveTool('line', drawLineButton));
    drawTriangleButton.addEventListener('click', () => setActiveTool('triangle', drawTriangleButton));

    resizeCanvasButton.addEventListener('click', () => {
        const width = parseInt(canvasWidthInput.value);
        const height = parseInt(canvasHeightInput.value);

        if (width > 0 && height > 0) {
            canvas.width = width;
            canvas.height = height;
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            undoStack = [];
            undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
        } else {
            alert("Invalid canvas size.");
        }
    });
});
