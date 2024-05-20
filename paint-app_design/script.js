document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('paintCanvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const colorPicker = document.getElementById('colorPicker');
    const sizePicker = document.getElementById('sizePicker');
    const clearCanvasButton = document.getElementById('clearCanvas');
    const saveCanvasButton = document.getElementById('saveCanvas');

    let painting = false;
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
        ctx.lineWidth = sizePicker.value;
        ctx.lineCap = 'round';
        ctx.strokeStyle = colorPicker.value;

        ctx.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
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
        }
        else {
            alert("Більше не можна повернути дії. Стан збережений зараз.");
        }
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
});
