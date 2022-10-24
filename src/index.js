

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
  /* for (let line = 1; line < array.length; line++) {
    if (array[line].includes('{')) {  //brackets "{"
      array[line] = 'mm_class_' + brackets_num + ': {';
      brackets_num = brackets_num + 1;
      //console.log(line, array[line]);
    } else if ((array[line].includes('}')) && (array[line].length > 1)) {  //brackets "}"
      console.log(line, array[line]);
      array[line] = '}, ' + data;
      console.log(line, array[line]);
    } else if ((array[line].includes('}')) && (array[line].length == 1) && ((array.length - line) < 2)) {  //brackets "}"
      console.log(line, array[line]);
      array[line] = '}, ';
      console.log(line, array[line]);
    } else if ((!array[line].includes('=')) && (array[line].length > 1)) {  //brackets "}"
      array[line] = 'unnamed_column_' + unnamed_column_num + ': ' + array[line];
      unnamed_column_num = unnamed_column_num + 1;
    } else if (array[line].includes('=')) {
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
    } else { //newline or somathing nonsense
      //console.log(line, array[line]);
    }
  } */
  displayContents(array);
  console.log('array[0]:', array[0]);
  array.shift();
  console.log('array[0]:', array[0]);
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


    /* if (entry.includes('{')) {  //brackets "{"
      brackets_num = brackets_num + 1;
      return '"mm_class_' + brackets_num + '": {';
    } else if ((entry.includes('}')) && (entry.length > 1)) {  //brackets "}"
      return '}, ' + data;
    } else if ((entry.includes('}')) && (entry.length == 1) && ((array.length - index) < 2)) {  //brackets "}"
      return '}, ';
    } else if ((!entry.includes('=')) && (entry.length > 1)) {  //brackets "}"
      unnamed_column_num = unnamed_column_num + 1;
      return '"unnamed_column_' + unnamed_column_num + '": ' + entry;
    } else if (entry.includes('=')) {
      let [key, data] = entry.split('='); //parseFloat
      if (isNaN(data)) { // string
        return '"' + key + ': "' + data + '"';
      } else {
        return '"' + key + ': ' + data;
      }
    } */

    /* //if (entry.includes('{')) return entry;
    if (!entry.includes(':')) return entry;
    let [key, data] = entry.split(': ');
    //if ((key.length < 2) || data.length < 2) return entry;
    if (isNaN(data)) return '"' + key + '": "'+ data + '",';
    else if (data.includes('{')) '"' + key + '": ' + data;
    else if (entry[0] == '}') return '}, "' + key + '": "'+ data + '",';
    else return '"' + key + '": ' + data + ','; */
  });

  array = ['{', ...array]; //array.shift('{');

  //let depth_level = 0;
  for (let line = 0; line < array.length; line++) {
    const el = array[line];
    if (el.at(-1) == ',' && (array[line + 1] == '},' || array[line + 1] == '}')) {
      array[line] = array[line].replace(',', '');
    }
    /* if (el.includes('{')) {
      depth_level = depth_level + 1;
    }
    if (el.includes('}')) {
      depth_level = depth_level - 1;
    } */
    if (el.includes(':')) {
      let keyy = el.split(':')[0];
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
        //console.log('dupd:', keyy, 'and:', el);
      } else {
        console.warn('dup:', keyy, 'and:', el);
        array[line] = '"' + keyy + '__dup' + arr_dup_keys_num + '": "' + data + '",';
        arr_dup_keys_num = arr_dup_keys_num + 1;
      }
    }
  }


  //console.log('array:\n', array);
  array = array.join('\n'); //.toString()
  //console.log('array:\n', array);
  console.log('arr_dup_keys:', arr_dup_keys);

  const json = JSON.parse(array);
  console.log('json:\n', json);
  let stringified = JSON.stringify(json, undefined, 4);
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

