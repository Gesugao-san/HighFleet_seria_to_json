

// https://stackoverflow.com/a/17130415/8175291

// put this outside the event loop..
var canvas = document.getElementById("imgCanvas");
var context = canvas.getContext("2d");

function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

function draw(evt) {
  var pos = getMousePos(canvas, evt);

  context.clearRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = "#FFFFFF"; // "#000000";
  context.fillRect(pos.x, pos.y, 4, 4);

  context.beginPath();
  context.moveTo(pos.x, canvas.height);
  context.lineTo(pos.x, 0);
  context.stroke();
  context.beginPath();
  context.moveTo(canvas.width, pos.y);
  context.lineTo(0, pos.y);
  context.stroke();

  //context.font = 'italic 40pt Calibri';
  context.fillText(`X: ${pos.x}`, 1, 8);
  context.fillText(`Y: ${pos.y}`, 1, 18);
}

if (document) document.addEventListener('DOMContentLoaded', () => {
  draw(event);
});

