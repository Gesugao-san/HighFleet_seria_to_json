#!/usr/bin/env node

let a, a2 = [];
let s = '';
let d = {};

/*
s = '{\r\n1=2\r\n{\r\n3=4\r\n}\r\n5=6\r\n6=6\r\n6=6\r\n}\r\n';
const brackets = {
  'start': [
    '{'
  ],
  'end': [
    '}'
  ]
};
if (['{'].includes()) {}
if (brackets.start.includes()) {}
function isThisSymbolBracketIn(e) {return e.includes('{');}
function isThisSymbolBracketOut(e) {return e.includes('}');}
function isThisSymbolKeyPair(e) {return e.includes('=');}
*/

function clearArrayFromEmptyElements(array) {
  console.log('filtering array...');
  return array.filter(Boolean);
}

const isSymbol = {
  KeyPair:          (e) => {return e.includes('=');},
  SoftBracketIn:    (e) => {return e.includes('{');},
  SoftBracketOut:   (e) => {return e.includes('}');},
  StrictBracketIn:  (e) => {return e == '{';},
  StrictBracketOut: (e) => {return e == '}';}
};


(() => {
  s = [
    '{\r\nm_classname=Node\r\nm_rnd_key1=data\r\nm_rnd_key2=data',
    '{\r\nm_classname=Body\r\nm_rnd_key3=data\r\nm_rnd_key4=data',
    '}\r\nm_classname=Body\r\nm_rnd_key5=data\r\nm_rnd_key6=data',
    '}\r\n'
  ].join('\r\n');  // SAMPLE DATA
  console.log('s:', [JSON.stringify(s)]);
  a = s.replaceAll('\r', '').split('\n');
  a = clearArrayFromEmptyElements(a);
  console.log('a:', a);

  console.log('processing...');
  let depth = 0;
  let dup_num = 0;
  a2 = a.map((e, i) => {
    if (i == a.length - 1) return '}\n}';
    /* if (i == 0) {
      depth++;
      const [k, v] = a[i + 1].split('=');  // m_classname
      return '{\n"' + v + '__' + depth + '": {';
    } */
    if (isSymbol.KeyPair(e)) {
      const [k, v] = e.split('=');
      return '"' + k + '": "' + v + '"' + (!isSymbol.StrictBracketOut(a[i + 1]) ? ',' : '');
    }
    if (isSymbol.StrictBracketIn(e)) {
      depth++;
      const [k, v] = a[i + 1].split('=');  // m_classname
      return (i == 0 ? '{\n' : '') + '"' + v + '__' + depth + '": {';
    }
    if (isSymbol.StrictBracketOut(e)) {
      //depth--;
      //a[i - 1] = a[i - 1].slice(0, -1); // last space coma
      return '},';
    }
    console.warn('e:', e);
    return e;
  });

  console.log('a2:', a2.join(' '));
  a2 = a2.join('\n');
  d = JSON.parse(a2);
  console.log('d:', d);
  console.log(JSON.stringify(d));
})();

