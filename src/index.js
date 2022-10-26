


function getUserAgent() {
  //console.clear();
  if (window && window.navigator && window.navigator.userAgent) console.debug('userAgent:', window.navigator.userAgent);
}

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

  console.log('Seria to json converting in process...');
  log2html('Seria to json converting in process...');

  input = input.replaceAll('\r\n', '\n');
  let array = input.split('\n');

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

    // TODO: FIX LEVELS!
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
  //const element = document.getElementById('file-seria-content');
  //element.textContent = stringified;
  displayContents(stringified, 'file-json-content');
  document.getElementById('file-save-as-json').disabled = false;

  console.log('Seria to json converting done.');
  log2html('Seria to json converting done.');
}


function convertJsonStringToSeria(input) {
  if (!input || typeof input != 'object') {
    console.warn('Nothing to convert here.', typeof input); //, '\n', input)
    log2html('Nothing to convert here.');
    return;
  }

  console.log('Json to seria converting in process...');
  log2html('Json to seria converting in process...');

  input = JSON.stringify(input, undefined, '\t');
  input = input.replaceAll('\t', '').replaceAll('"', '').replaceAll(': ', '=');
  let array = input.split('\n');

  for (let i = 0; i < array.length; i++) {
    const element = array[i];
    if (element.includes('unnamed__num')) {
      let element_splitted = element.split('=')[1];
      array[i] = element_splitted;
    }
    if (element.includes('__num')) {
      let element_splitted = element.split('=')[0].split('__num')[0] + '=' + element.split('=')[1];
      array[i] = element_splitted;
    }
    if (element.includes('__dup')) {
      let element_splitted = element.split('=')[0].split('__dup')[0] + '=' + element.split('=')[1];
      array[i] = element_splitted;
    }
  }

  array = array.join('\n');

  //console.log('seria:\n', array);
  //log2html('\nseria:', array, '\n');
  console.log('Json to seria converting done.');
  log2html('Json to seria converting done.');

  displayContents(array, 'file-seria-content');
  document.getElementById('file-save-as-seria').disabled = false;
  document.getElementById('file-save-as-seria-minified').disabled = false;
}


// https://stackoverflow.com/a/26298948/8175291
function readSingleFile(e) {
  const file = e.target.files[0];
  if (!file) {
    console.warn('Nothing to read here.');
    log2html('Nothing to read here.');
    return;
  }
  if (!file.name.includes('.')) return alert('File has no extesion! Abort reading.');
  const extesion = file.name.split('.')[1];
  if (!['seria', 'json'].includes(extesion)) return alert('File has unknown extesion!\nAccepts only «.seria» or «.json» files.\nAbort reading.');

  onBusyStart();
  clearContentsSoft();

  console.log('Reading file in process...');
  log2html('Reading file in process...');

  if (document.getElementById('output_log').checked) document.getElementById('log').textContent = '';
  console.debug('file name:', file.name);
  log2html('file name:', file.name);

  const reader = new FileReader();
  /* reader.onload = (e) => {
    const contents = e.target.result;
  }; */

  reader.addEventListener("load", () => {
    // this will then display a text file
    const contents_raw = reader.result;
    if (extesion == 'seria') {
      displayContents(contents_raw, 'file-seria-content');
      //convertSeriaStringToJson(contents_raw);
      document.getElementById('content-process').disabled = false;
    } else if (extesion == 'json') {
      const contents_json = JSON.parse(contents_raw);
      displayContents(JSON.stringify(contents_json, undefined, 2), 'file-json-content');
      //convertJsonStringToSeria(contents_json);
      document.getElementById('content-process').disabled = false;
    } else {
      return alert('Unknown error occurred!\nDetails: extesion "' + extesion + '".\nAbort reading.');
    }
  }, false);

  if (file) {
    reader.readAsText(file);
  }

  onBusyEnd();
  document.getElementById('content-process').disabled = false;

  console.log('Reading file done.');
  log2html('Reading file done.');
}

function displayContents(contents, target) {
  const element = document.getElementById(target);
  element.textContent = contents;
  document.getElementById('content-clear').disabled = false;
  //console.log('contents:\n', contents);
}

function clearContents() {
  document.getElementById('file-input').value = null;
  clearContentsSoft();
}
function clearContentsSoft() {
  let log_placeholder_span = document.createElement('span');
  log_placeholder_span.classList.add('placeholder');
  log_placeholder_span.innerHTML = 'Select file above and mark option to continue...';
  document.getElementById('log').textContent = log_placeholder_span.innerHTML;
  document.getElementById('file-seria-content').textContent = '';
  document.getElementById('file-json-content').textContent = '';
  document.getElementById('content-clear').disabled = true;
  document.getElementById('content-process').disabled = true;
  document.getElementById('file-save-as-json').disabled = true;
  document.getElementById('file-save-as-seria').disabled = true;
  document.getElementById('file-save-as-seria-minified').disabled = true;
}


// https://stackoverflow.com/a/58356250/8175291
function saveSingleFile(contents, extesion) {
  let file_name = document.getElementById('file-input').files[0].name;
  if (!file_name.includes('.')) return console.error('File has no extesion! Abort downloading.');
  file_name = file_name.split('.')[0] + extesion;
  if (contents == '') {
    console.warn('Nothing to save here.');
    log2html('Nothing to save here.');
    return;
  }
  const blob = new Blob([contents]); //, {type: "application/text"}); //, encoding: "UTF-8"
  if (typeof navigator.msSaveBlob == "function")
      return navigator.msSaveBlob(blob, file_name);

  var saver = document.createElementNS("http://www.w3.org/1999/xhtml", "a");
  var blobURL = saver.href = URL.createObjectURL(blob),
      body = document.body;

  saver.download = file_name;

  body.appendChild(saver);
  saver.dispatchEvent(new MouseEvent("click"));
  console.log('url:', blobURL);
  log2html('url:', blobURL);
  body.removeChild(saver);
  URL.revokeObjectURL(blobURL);
}
function saveSingleFileAsJson() {
  const element = document.getElementById('file-json-content');
  const contents = element.textContent;
  saveSingleFile(contents, '.json');
}
function saveSingleFileAsSeria() {
  const element = document.getElementById('file-seria-content');
  const contents = element.textContent;
  saveSingleFile(contents, '.seria');
}
function saveSingleFileAsSeriaMinified() {
  const keys_to_delete = [
    //'m_code',  // unknown for crushing game, need more researching
    //'m_id',  // unknown for crushing game, need more researching
    //'m_state',  // unknown for crushing game, need more researching
    //'m_stage',  // unknown for crushing game, need more researching
    //'m_layer',  // unknown for crushing game, need more researching
    //'m_health_lock',  // unknown for crushing game, need more researching
    //'m_tele_',  // unknown for crushing game, need more researching
    //'m_init_',  // unknown for crushing game, need more researching
    //'m_mesh_color',  // unknown for crushing game, need more researching
    //'m_density',  // unknown for crushing game, need more researching

    //'m_mass',  // NOT SAVE: all parts will have 0 weight. WHY, KONSTANTIN?! WHY YOU SAVE SO SENSETIVE DATA TO SAVE?!!
    'm_burn_hp',  // don't crushing game on load, but is it save for delete? need more researching
    //'m_animation_',  // NOT SAVE: no any sprites will be shown at open in game
    'm_type',  // don't crushing game on load, but is it save for delete? need more researching
    'm_bind',  // don't crushing game on load, but is it save for delete? need more researching
    'is_loot'  // don't crushing game on load, but is it save for delete? need more researching
  ];
  const element = document.getElementById('file-seria-content');
  let contents = element.textContent.replaceAll('\r', '').split('\n');
  //let out = [];
  for (let i = 0; i < contents.length; i++) {
    let [key, data] = contents[i].split('=');
    //if (key.startsWith('m_')) key = key.split('m_')[1];
    for (let ii = 0; ii < keys_to_delete.length; ii++) {
      if (key.includes(keys_to_delete[ii])) {
        console.log('delete contents[i]:', contents[i]);
        delete contents[i];
        break;
      };
    }
  }
  console.log('contents:', contents);
  contents = contents.filter(Boolean); // clears newline
  saveSingleFile(contents.join('\r\n'), '_min.seria');
}

function contentProcess() {
  const seria_content = document.getElementById('file-seria-content').textContent;
  const json_content_raw = document.getElementById('file-json-content').textContent;
  const json_content = JSON.parse(json_content_raw != '' ? json_content_raw : '{}');

  if (seria_content == '') {
    console.log('Convertion mode: json to seria');
    log2html('Convertion mode: json to seria');
    document.getElementById('file-save-as-json').disabled = false;
    convertJsonStringToSeria(json_content);
  } else if (json_content_raw == '') {
    console.log('Convertion mode: seria to json');
    log2html('Convertion mode: seria to json');
    //console.log('seria_content:', seria_content);
    document.getElementById('file-save-as-seria').disabled = false;
    document.getElementById('file-save-as-seria-minified').disabled = false;
    convertSeriaStringToJson(seria_content);
  } else {
    return alert('No data provided to process!\nPlease clear all before contunue.\nAbort processing.')
  }
}


/* (() => {
})(); */

if (document) document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('file-input').addEventListener('change', readSingleFile, false);
  document.getElementById('file-save-as-json').addEventListener('click', saveSingleFileAsJson, false);
  document.getElementById('file-save-as-seria').addEventListener('click', saveSingleFileAsSeria, false);
  document.getElementById('file-save-as-seria-minified').addEventListener('click', saveSingleFileAsSeriaMinified, false);
  document.getElementById('content-clear').addEventListener('click', clearContents, false);
  document.getElementById('content-process').addEventListener('click', contentProcess, false);
  getUserAgent();
});
