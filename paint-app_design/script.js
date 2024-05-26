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
    const fillToolButton = document.getElementById('fillTool');
    const undoButton = document.getElementById('undoButton');
    const redoButton = document.getElementById('redoButton');
    const canvasWidthInput = document.getElementById('canvasWidth');
    const canvasHeightInput = document.getElementById('canvasHeight');
    const resizeCanvasButton = document.getElementById('resizeCanvas');
    const toolInfo = document.getElementById('toolInfo');

    let painting = false;
    let tool = 'brush';
    let undoStack = [];
    let redoStack = [];
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
            redoStack = [];
            if (undoStack.length > MAX_UNDO_STEPS) {
                undoStack.shift();
            }
        }
        painting = false;
        ctx.beginPath();
    }

    function draw(e) {
        if (!painting) return;

        switch (tool) {
            case 'brush':
                drawTool(e, colorPicker.value);
                break;
            case 'eraser':
                drawTool(e, '#ffffff');
                break;
            case 'spray':
                drawSpray(e);
                break;
            case 'fill':
                fillObject(e);
                break;
            default:
                break;
        }
    }

    function drawTool(e, color) {
        ctx.lineWidth = sizePicker.value;
        ctx.lineCap = 'round';
        ctx.strokeStyle = color;

        const [x, y] = getCursorPosition(e);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    }

    function drawSpray(e) {
        ctx.fillStyle = colorPicker.value;
        const [x, y] = getCursorPosition(e);
        for (let i = 0; i < 10; i++) {
            const offsetX = Math.random() * sizePicker.value - sizePicker.value / 2;
            const offsetY = Math.random() * sizePicker.value - sizePicker.value / 2;
            ctx.fillRect(x + offsetX, y + offsetY, 1, 1);
        }
    }

    function fillObject(e) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const [x, y] = getCursorPosition(e);
        const pixelStack = [{ x, y }];
        const fillColor = hexToRgb(colorPicker.value);
        const targetColor = ctx.getImageData(x, y, 1, 1).data;

        function hexToRgb(hex) {
            return {
                r: parseInt(hex.substring(1, 3), 16),
                g: parseInt(hex.substring(3, 5), 16),
                b: parseInt(hex.substring(5, 7), 16)
            };
        }

        function matchColor(pixelPos) {
            const r = imageData.data[pixelPos];
            const g = imageData.data[pixelPos + 1];
            const b = imageData.data[pixelPos + 2];
            return r === targetColor[0] && g === targetColor[1] && b === targetColor[2];
        }

        function setColor(pixelPos) {
            imageData.data[pixelPos] = fillColor.r;
            imageData.data[pixelPos + 1] = fillColor.g;
            imageData.data[pixelPos + 2] = fillColor.b;
            imageData.data[pixelPos + 3] = 255;
        }

        let isEmpty = true;
        for (let i = 0; i < imageData.data.length; i += 4) {
            if (imageData.data[i + 3] !== 0) {
                isEmpty = false;
                break;
            }
        }

        if (isEmpty) {
            ctx.fillStyle = colorPicker.value;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            return;
        }

        while (pixelStack.length) {
            const newPos = pixelStack.pop();
            const x = newPos.x;
            let y = newPos.y;
            let pixelPos = (y * canvas.width + x) * 4;

            while (y-- >= 0 && matchColor(pixelPos)) {
                pixelPos -= canvas.width * 4;
            }
            pixelPos += canvas.width * 4;
            ++y;

            let reachLeft = false;
            let reachRight = false;

            while (y++ < canvas.height - 1 && matchColor(pixelPos)) {
                setColor(pixelPos);

                if (x > 0) {
                    if (matchColor(pixelPos - 4)) {
                        if (!reachLeft) {
                            pixelStack.push({ x: x - 1, y: y });
                            reachLeft = true;
                        }
                    } else if (reachLeft) {
                        reachLeft = false;
                    }
                }

                if (x < canvas.width - 1) {
                    if (matchColor(pixelPos + 4)) {
                        if (!reachRight) {
                            pixelStack.push({ x: x + 1, y: y });
                            reachRight = true;
                        }
                    } else if (reachRight) {
                        reachRight = false;
                    }
                }

                pixelPos += canvas.width * 4;
            }
        }

        ctx.putImageData(imageData, 0, 0);
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
            case 'fill':
                fill(e);
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
        redoStack = [];
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
    function redoLastAction() {
        if (redoStack.length > 0) {
            const imageData = redoStack.pop();
            undoStack.push(imageData);
            ctx.putImageData(imageData, 0, 0);
        } else {
            alert("Cannot redo further.");
        }
    }

    function updateToolInfo() {
        toolInfo.textContent = `Tool: ${tool.charAt(0).toUpperCase() + tool.slice(1)}, Size: ${sizePicker.value}`;
    }

    function setActiveTool(newTool, button) {
        tool = newTool;
        document.querySelectorAll('.btn.tool').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        updateToolInfo();
    }

    function getCursorPosition(e) {
        return [e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop];
    }

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
    drawRectButton.addEventListener('click', () => setActiveTool('rectangle', drawRectButton));
    drawCircleButton.addEventListener('click', () => setActiveTool('circle', drawCircleButton));
    drawLineButton.addEventListener('click', () => setActiveTool('line', drawLineButton));
    drawTriangleButton.addEventListener('click', () => setActiveTool('triangle', drawTriangleButton));
    fillToolButton.addEventListener('click', () => setActiveTool('fill', fillToolButton));

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
    sizePicker.addEventListener('input', updateToolInfo);

    setActiveTool('brush', brushToolButton);
    updateToolInfo();
});
