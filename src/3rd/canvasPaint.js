

// https://stackoverflow.com/a/17130415/8175291

// put this outside the event loop..
var canvas = document.getElementById("imgCanvas");
var context = canvas.getContext("2d");

function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: Math.floor(evt.clientX - rect.left),
    y: Math.floor(evt.clientY - rect.top)
  };
}

function draw(event) {
  var pos = getMousePos(canvas, event);

  context.clearRect(0, 0, canvas.width, canvas.height);
  // context.clearRect(0, 0, 35, 20);

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
  /*

  // save canvas image as data url (png format by default)
  var dataURL = canvas.toDataURL();

  // set canvasImg image src to dataURL
  // so it can be saved as an image
  document.getElementById('canvasImg').src = dataURL;
  */

}

function drawLine(event) {
  draw(event);
  var pos = getMousePos(canvas, evt);

  context.fillStyle = "#000000";
  context.fillRect (pos.x, pos.y, 4, 4);
}


if (document) document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('imgCanvas').addEventListener('mousemove', draw, false);
  document.getElementById('imgCanvas').addEventListener('mousedown', drawLine, false);
  draw(event);
});

