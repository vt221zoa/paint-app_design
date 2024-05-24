document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('paintCanvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const colorPicker = document.getElementById('colorPicker');
    const sizePicker = document.getElementById('sizePicker');
    const clearCanvasButton = document.getElementById('clearCanvas');
    const saveCanvasButton = document.getElementById('saveCanvas');
    const brushToolButton = document.getElementById('brushTool');
    const eraserToolButton = document.getElementById('eraserTool');
    const sprayToolButton = document.getElementById('sprayTool');
    const toolInfo = document.getElementById('toolInfo');

    let painting = false;
    let tool = 'brush';
    let undoStack = [];
    const MAX_UNDO_STEPS = 20;

    undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));

    function startPosition(e) {
        painting = true;
        draw(e);
    }

    function endPosition() {
        if (painting) {
            undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
            if (undoStack.length > MAX_UNDO_STEPS) {
                undoStack.shift();
            }
        }
        painting = false;
        ctx.beginPath();
    }

    function draw(e) {
        if (!painting) {
            return;
        }

        if (tool === 'brush') {
            ctx.lineWidth = sizePicker.value;
            ctx.lineCap = 'round';
            ctx.strokeStyle = colorPicker.value;

            ctx.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
        } else if (tool === 'eraser') {
            ctx.lineWidth = sizePicker.value;
            ctx.lineCap = 'round';
            ctx.strokeStyle = '#ffffff';

            ctx.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
        } else if (tool === 'spray') {
            ctx.fillStyle = colorPicker.value;
            for (let i = 0; i < 10; i++) {
                const offsetX = Math.random() * sizePicker.value - sizePicker.value / 2;
                const offsetY = Math.random() * sizePicker.value - sizePicker.value / 2;
                ctx.fillRect(e.clientX - canvas.offsetLeft + offsetX, e.clientY - canvas.offsetTop + offsetY, 1, 1);
            }
        }
    }

    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        undoStack = [];
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
            alert("Більше не можна повернути дії. Стан збережений зараз.");
        }
    }

    function setActiveTool(newTool, button) {
        tool = newTool;
        document.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        updateToolInfo();
    }

    function updateToolInfo() {
        toolInfo.textContent = `Tool: ${tool.charAt(0).toUpperCase() + tool.slice(1)}, Size: ${sizePicker.value}`;
    }

    canvas.addEventListener('mousedown', startPosition);
    canvas.addEventListener('mouseup', endPosition);
    canvas.addEventListener('mousemove', draw);
    clearCanvasButton.addEventListener('click', clearCanvas);
    saveCanvasButton.addEventListener('click', saveCanvas);

    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'z') {
            undoLastAction();
        }
    });

    brushToolButton.addEventListener('click', () => {
        setActiveTool('brush', brushToolButton);
    });

    eraserToolButton.addEventListener('click', () => {
        setActiveTool('eraser', eraserToolButton);
    });

    sprayToolButton.addEventListener('click', () => {
        setActiveTool('spray', sprayToolButton);
    });

    colorPicker.addEventListener('input', () => {
        setActiveTool('brush', brushToolButton);
    });

    sizePicker.addEventListener('input', updateToolInfo);

    setActiveTool('brush', brushToolButton);
    updateToolInfo();
});
