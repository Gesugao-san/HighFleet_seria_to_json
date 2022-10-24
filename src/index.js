
/* var input = document.getElementsByTagName('file-input')[0];

input.onclick = function () {
  this.value = null;
};

input.onchange = function () {
  console.log(this.value);
}; */

// https://stackoverflow.com/a/26298948/8175291
function readSingleFile(e) {
  const file = e.target.files[0];
  if (!file) {
    return console.log('Nothing to read here.');
  }
  console.debug('file name:', file.name);
  const reader = new FileReader();
  reader.onload = (e) => {
    const contents = e.target.result;
    displayContents(contents, file);
  };
  reader.readAsText(file);
  var a = document.getElementById('file-content');
  a.style.height = 'auto';
  a.style.height = a.scrollHeight+'px';
}

function displayContents(contents, file) {
  const element = document.getElementById('file-content');
  element.textContent = contents;
  document.getElementById('file-save').disabled = false;
  document.getElementById('content-clear').disabled = false;
  //console.log('contents:\n', contents);
}

function clearContents() {
  //window.location.reload();
  document.getElementById('file-input').value = null;
  document.getElementById('file-content').textContent = '';
  document.getElementById('file-save').disabled = true;
  document.getElementById('content-clear').disabled = true;
}

function saveSingleFile() {
  const element = document.getElementById('file-content');
  const contents = element.textContent;
  if (contents == '') {
    return console.log('Nothing to save here.');
  }
  const blob = new Blob([contents]); //, {type: "application/text"}); //, encoding: "UTF-8"
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.target = "_blank";
  link.href = url;
  link.click();
  console.log('link:', link);
  console.log('url:', url);
}


if (document) document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('file-input').addEventListener('change', readSingleFile, false);
  document.getElementById('file-save').addEventListener('click', saveSingleFile, false);
  document.getElementById('content-clear').addEventListener('click', clearContents, false);
});


function OnInput() {
  this.style.height = 0;
  this.style.height = (this.scrollHeight) + "px";
}
