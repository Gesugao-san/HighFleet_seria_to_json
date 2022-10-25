

function log2html(input) {
  var logger = document.getElementById('log');
  if (typeof input == 'object') {
    console.log(input); //.dir //.table
    logger.innerHTML += (JSON && JSON.stringify ? JSON.stringify(input) : input) + '<br />';
  } else {
    console.log(input.join(', '));
    logger.innerHTML += input + '<br />';
  }
}
function cleanup_input(...input) {
  return input.join(' ').replaceAll('\n', '');
}
function log(...input) {
  log2html(input);
  input = cleanup_input(input);
  console.log(input);
}
function warn(...input) {
  log2html(input);
  input = cleanup_input(input);
  console.warn(input);
}

function convertSeriaStringToJson(input) {
  if (!input || typeof input != 'string') {
    return console.warn('Nothing to convert here.');
  }
  input = input.replaceAll('\r\n', '\n');
  let array = input.split('\n');

  displayContents(array);
  array.shift();
  array = array.filter(Boolean); // clears newline

  let depth_level = -1;
  let brackets_and_unnamed_nums = {};
  array = array.map((entry, index) => {
    if (entry.includes('=')) {
      let [key, data] = entry.split('=');
      return '"' + key + '": "' + data + '",';
    }
    if (entry == '{') {  //brackets "{"
      depth_level += 1;
      log('depth_level:', depth_level, entry, array[index - 1], array[index + 1]);
      if (!brackets_and_unnamed_nums[depth_level]) {
        brackets_and_unnamed_nums[depth_level] = {
          'brackets_num': 0,
          'unnamed_column_num': 0
        }
      }
      brackets_and_unnamed_nums[depth_level]['brackets_num'] += 1;
      return '"mm_class__num' + brackets_and_unnamed_nums[depth_level]['brackets_num'] + '": {';
    }
    if (entry == '}' && (array.length - index) > 1) {  //brackets "{"
      depth_level -= 1;
      return '},';
    }
    if (!isNaN(entry)) {
      if (!brackets_and_unnamed_nums[depth_level]) {
        brackets_and_unnamed_nums[depth_level] = {
          'brackets_num': 0,
          'unnamed_column_num': 0
        }
      }
      brackets_and_unnamed_nums[depth_level]['unnamed_column_num'] += 1;
      return '"unnamed__num' + brackets_and_unnamed_nums[depth_level]['unnamed_column_num'] + '": "' + entry + '",';
    }
    if (index > (array.length - 5)) log('brackets_and_unnamed_nums', brackets_and_unnamed_nums);
    return entry;
  });

  array = ['{', ...array]; //array.shift('{');

  depth_level = -1;
  let arr_dup_keys = {};
  for (let line = 0; line < array.length; line++) {
    const el = array[line];
    if (el.includes('{')) {
      depth_level += 1;
      if (!arr_dup_keys[depth_level]) {
        arr_dup_keys[depth_level] = {
          'dup_keys_num': 0,
          'dup_keys': []
        }
      }
      log('depth_level:', depth_level, array[line - 1]);
    }
    if (el.includes('}')) {
      depth_level -= 1;
      log('depth_level:', depth_level, array[line + 1]);
    }
    if (el.includes(':')) {
      let [keyy, dataa] = el.split(': ');
      if (!arr_dup_keys[depth_level]['dup_keys'].includes(keyy)) {
        arr_dup_keys[depth_level]['dup_keys'].push(keyy);
      } else {
        console.warn('dup:', depth_level, 'key:', keyy, 'data:', dataa, 'full:', el);
        array[line] = '"' + keyy.replaceAll('"', '') + '__dup' + arr_dup_keys[depth_level]['dup_keys_num'] + '": ' + dataa;
        arr_dup_keys[depth_level]['dup_keys_num'] += 1;
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
  log('json:\n', json);
  log('arr_dup_keys:\n', arr_dup_keys);

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
  //log('contents:\n', contents);
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
  log('link:', link);
  log('url:', url);
}

(() => {
  /* var old = log;
  var logger = document.getElementById('log');
  log = function () {
    for (var i = 0; i < arguments.length; i++) {
      if (typeof arguments[i] == 'object') {
          logger.innerHTML += (JSON && JSON.stringify ? JSON.stringify(arguments[i], undefined, 2) : arguments[i]) + '<br />';
      } else {
          logger.innerHTML += arguments[i] + '<br />';
      }
    }
  } */
});

if (document) document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('file-input').addEventListener('change', readSingleFile, false);
  document.getElementById('file-save').addEventListener('click', saveSingleFile, false);
  document.getElementById('content-clear').addEventListener('click', clearContents, false);
})();
