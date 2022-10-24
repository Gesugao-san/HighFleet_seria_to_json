

function convertSeriaStringToJson(input) {
  if (!input) {
    return console.warn('Nothing to convert here.');
  }
  input = input.replaceAll('\r\n', '\n');
  let array = input.split('\n');
  let brackets_num = 0;
  for (let line = 1; line < array.length; line++) {
    if (array[line].includes('=')) {
      let [key, data] = array[line].split('='); //parseFloat
      if (!isNaN(data)) {
        if (data.includes('.')) {  //warning for scientific notation: 5.00679e-06 -> 0.00000500679
          //console.log(line, array[line], parseFloat(data));
        } else {
          //console.log(line, array[line], parseInt(data));
        }
      } else { // string
        array[line] = '"' + data + '"';
        //console.log(line, array[line], data);
      }
      array[line] = key + ': ' + data;
    } else if (array[line].includes('{')) {  //brackets "{"
      array[line] = 'mm_class' + brackets_num + ': {';
      brackets_num = brackets_num + 1;
      //console.log(line, array[line]);
    } else if (array[line].includes('}') && array[line].length > 1) {  //brackets "}"
      array[line] = '}, ' + data;
      //console.log(line, array[line]);
    } else  { //newline or somathing nonsense
      //console.log(line, array[line]);
    }
  }
  console.log('array:\n', array);
  array = array.map((entry) => {
    if (entry.includes('{')) return entry;
    if (!entry.includes(':')) return entry;
    let [key, data] = entry.split(': ');
    //if ((key.length < 2) || data.length < 2) return entry;
    if (isNaN(data)) return key + ": '"+ data + "',";
    else if (entry[0] == '}') return '}, ' + key + ": '"+ data + "',";
    else return key + ": "+ data + ",";
  });
  array = array.join('\n'); //.toString()
  console.log('array:\n', array);
  const json = JSON.parse(array);
  console.log('json:\n', json);
}

// https://stackoverflow.com/a/26298948/8175291
function readSingleFile(e) {
  const file = e.target.files[0];
  if (!file) {
    return console.warn('Nothing to read here.');
  }
  console.debug('file name:', file.name);
  const reader = new FileReader();
  reader.onload = (e) => {
    const contents = e.target.result;
    displayContents(contents);
  };
  reader.readAsText(file);
}

function displayContents(contents) {
  const element = document.getElementById('file-content');
  element.textContent = contents;
  document.getElementById('file-save').disabled = false;
  document.getElementById('content-clear').disabled = false;
  convertSeriaStringToJson(contents);
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
  const contents = document.getElementById('file-content').textContent;
  if (contents == '') {
    return console.warn('Nothing to save here.');
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

