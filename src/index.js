

function convertSeriaStringToJson(input) {
  if (!input || typeof input != 'string') {
    return console.warn('Nothing to convert here.');
  }
  input = input.replaceAll('\r\n', '\n');
  let array = input.split('\n');
  let brackets_num = 0;
  let unnamed_column_num = 0;
  let arr_dup_keys = [];
  let arr_dup_keys_num = 0;

  displayContents(array);
  array.shift();
  array = array.filter(Boolean); // clears newline

  array = array.map((entry, index) => {
    if (entry.includes('=')) {
      let [key, data] = entry.split('=');
      return '"' + key + '": "' + data + '",';
    }
    if (entry.includes('{')) {  //brackets "{"
      brackets_num = brackets_num + 1;
      return '"mm_class__dup' + brackets_num + '": {';
    }
    if (entry == '}' && (array.length - index) > 1) {  //brackets "{"
      brackets_num = brackets_num + 1;
      return '},';
    }
    if (!isNaN(entry)) {
      unnamed_column_num = unnamed_column_num + 1;
      return '"unnamed__dup' + unnamed_column_num + '": "' + entry + '",';
    }
    return entry;
  });

  array = ['{', ...array]; //array.shift('{');

  //let depth_level = 0;
  for (let line = 0; line < array.length; line++) {
    const el = array[line];
    /* if (el.includes('{')) {
      depth_level = depth_level + 1;
    }
    if (el.includes('}')) {
      depth_level = depth_level - 1;
    } */
    if (el.includes(':')) {
      //let keyy = el.split(':')[0];
      let [keyy, dataa] = el.split(': ');
      /* if (!arr_dup_keys[key]) {
        arr_dup_keys[key] = {line, data};
      } else {
        array[arr_dup_keys[key][0]] = '"' + key + '__dup' + arr_dup_keys_num + '": "' + arr_dup_keys[key][1] + '",';
        arr_dup_keys_num = arr_dup_keys_num + 1;
        array[line] = '"' + key + '__dup' + arr_dup_keys_num + '": "' + data + '",';
        arr_dup_keys_num = arr_dup_keys_num + 1;
      } */
      if (!arr_dup_keys[keyy]) {
        arr_dup_keys.push(keyy);
      } else {
        console.warn('dup:', keyy, 'and:', el);
        array[line] = '"' + keyy + '__dup' + arr_dup_keys_num + '": "' + data + '",';
        arr_dup_keys_num = arr_dup_keys_num + 1;
      }
      dataa = dataa.replaceAll('"', '').replaceAll(',', '');
      if (!isNaN(dataa) && !el.includes('}')) {
        if (dataa.includes('.')) {  //warning for scientific notation: 5.00679e-06 -> 0.00000500679
          array[line] = keyy + ': ' + parseFloat(dataa) + ',';
        } else {
          array[line] = keyy + ': ' + parseInt(dataa) + ',';
        }
      }
      if (['false', 'true'].includes(dataa)) {
        array[line] = keyy+ ': ' + (dataa === 'true') + ',';
      }
    }
    if (el.at(-1) == ',' && (array[line + 1] == '},' || array[line + 1] == '}')) {
      array[line] = array[line].replace(',', '');
    }
  }

  array = array.join('\n');

  const json = JSON.parse(array);
  console.log('json:\n', json);
  let stringified = JSON.stringify(json, undefined, 2);
  //displayContents(stringified);
  const element = document.getElementById('file-content');
  element.textContent = stringified;
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

