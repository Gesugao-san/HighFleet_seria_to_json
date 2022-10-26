

function onBusyStart() {
  document.body.classList.add('busy');
  document.body.classList.remove('not-busy');
}
function onBusyEnd() {
  document.body.classList.remove('busy');
  document.body.classList.add('not-busy');
}

function log2html(...input) {
  if (!document.getElementById('output_log').checked) return;
  let logger = document.getElementById('log');
  let output = '';
  let show_as_error = false;
  let show_as_warn = false;
  input.map((x) => {
    if (typeof x == 'object') {
      x = JSON && JSON.stringify ? JSON.stringify(x) : x;
    }
    if (String(x).includes('undefined')) show_as_error = true;
    if (String(x).includes('DUP')) show_as_warn = true;
    return output += x + ' ';
  });
  output = output.slice(0, -1); // last space remove
  if (show_as_error) {
    return logger.innerHTML += '<span class="error">' + output + '</span><br />';
  } else if (show_as_warn) {
    return logger.innerHTML += '<span class="warning">' + output + '</span><br />';
  } else {
    logger.innerHTML += '<span class="ok">' + output + '</span><br />';
  }
}

function convertSeriaStringToJson(input) {
  if (!input || typeof input != 'string') {
    console.warn('Nothing to convert here.');
    log2html('Nothing to convert here.');
    return;
  }
  //setTimeout(() => { alert('Converting in progress, please wait...'); }, 1);

  input = input.replaceAll('\r\n', '\n');
  let array = input.split('\n');

  displayContents(array);
  array.shift();
  array = array.filter(Boolean); // clears newline

  let depth_level = 0;
  let brackets_and_unnamed_nums = {};
  array = array.map((entry, index) => {
    if (entry.includes('=')) {
      let [key, data] = entry.split('=');
      return '"' + key + '": "' + data + '",';
    }
    if (entry == '{') {  //brackets "{"
      depth_level += 1;
      console.log('depth:', depth_level, entry, array[index - 1], array[index + 1]);
      log2html('depth:', depth_level, entry, array[index - 1], array[index + 1]);
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
    if (index > (array.length - 5)) {
      console.log('brackets_and_unnamed_nums:', brackets_and_unnamed_nums);
      log2html('\nbrackets_and_unnamed_nums:', brackets_and_unnamed_nums, '\n');
    }
    return entry;
  });

  array = ['{', ...array]; //array.shift('{');

  depth_level = 0;
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
      console.log('depth:', depth_level, array[line - 1]);
      log2html('depth:', depth_level, array[line - 1]);
    }
    if (el.includes('}')) {
      depth_level -= 1;
      console.log('depth:', depth_level, array[line + 1]);
      log2html('depth:', depth_level, array[line + 1]);
    }
    if (el.includes(':')) {
      let [keyy, dataa] = el.split(': ');
      if (!arr_dup_keys[depth_level]['dup_keys'].includes(keyy)) {
        arr_dup_keys[depth_level]['dup_keys'].push(keyy);
      } else {
        console.warn('DUP:', depth_level, 'KEY:', keyy, 'DATA:', dataa, 'FULL:', el);
        log2html('DUP:', el);
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
  console.log('json:\n', json);
  console.log('arr_dup_keys:\n', arr_dup_keys);
  log2html('\njson:', json, '\n');
  log2html('arr_dup_keys:', arr_dup_keys, '\n');

  let stringified = JSON.stringify(json, undefined, 2);
  //displayContents(stringified);
  const element = document.getElementById('file-content');
  element.textContent = stringified;
}

// https://stackoverflow.com/a/26298948/8175291
function readSingleFile(e) {
  const file = e.target.files[0];
  if (!file) {
    console.warn('Nothing to read here.');
    log2html('Nothing to read here.');
    return;
  }
  onBusyStart();
  console.debug('file name:', file.name);
  log2html('file name:', file.name);
  const reader = new FileReader();
  reader.onload = (e) => {
    const contents = e.target.result;
    displayContents(contents);
  };
  reader.readAsText(file);
  onBusyEnd()
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
  document.getElementById('log').textContent = '';
  document.getElementById('file-save').disabled = true;
  document.getElementById('content-clear').disabled = true;
}

function saveSingleFile() {
  const contents = document.getElementById('file-content').textContent;
  if (contents == '') {
    console.warn('Nothing to save here.');
    log2html('Nothing to save here.');
    return;
  }
  const blob = new Blob([contents]); //, {type: "application/text"}); //, encoding: "UTF-8"
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.target = "_blank";
  link.href = url;
  link.click();
  console.log('link:', link);
  console.log('url:', url);
  log2html('link:', link);
  log2html('url:', url);
}

(() => {
  /* var old = console.log;
  var logger = document.getElementById('console.log');
  console.log = function () {
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
});
