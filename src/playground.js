#!/usr/bin/env node

let a = [];
let s, s2 = '';
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
  BracketIn:  (e) => {return e.includes('{');},
  BracketOut: (e) => {return e.includes('}');},
  KeyPair:    (e) => {return e.includes('=');}
};


(() => {
  s = [
    '{\r\nm_classname=Node\r\nm_rnd_key1=data\r\nm_rnd_key2=data',
    '{\r\nm_classname=Body\r\nm_rnd_key1=data\r\nm_rnd_key2=data',
    '}\r\nm_classname=Body\r\nm_rnd_key1=data\r\nm_rnd_key2=data',
    '}\r\n'
  ].join('\r\n');  // SAMPLE DATA
  console.log('s:', [JSON.stringify(s)], '\n', s);

  s2 = s + '}█';
  s2 = s2.replaceAll('\r', '').replaceAll('\n', '\r\n').replaceAll('\r\n\r\n', '\r\n');
  s2 = s
    .replace('{', '[[')
    .replace('}\r\n}█', ']]')
    .replace('}\n}█', ']]')
    .replaceAll('{', '[')
    .replaceAll('}', ']')
    .replaceAll('=', '":"')
    .replaceAll('\r\n', '"\r\n"')
    .replaceAll('"\r\n', '",\r\n')
    .replaceAll('[",\r\n', '[\r\n')
    .replaceAll('\r\n"]', '\r\n]')
    .replaceAll(']",\r\n', ']\r\n')
    .replaceAll('\r\n"[', '\r\n[');

  s2 = JSON.parse(s2);
  console.log('s2:', s2);

  a = s.replaceAll('\r', '').split('\n');
  a = clearArrayFromEmptyElements(a);
  console.log('a:', a);

  console.log('processing...');
  let d = {};
  let depth = 0;
  let dup_num = 0;
  let upper_key = '';
  for (let i = 0; i < a.length; i++) {
    const e = a[i];
    if ([0, a.length].includes(i)) continue; // ignore depth level 0
    if (isSymbol.BracketOut(e)) depth--;
    if (isSymbol.BracketIn(e)) {
      depth++;
      upper_key = a[i - 1];
    }
    if (isSymbol.KeyPair(e)) {
      const [k, v] = e.split('=');
      if (!d['depth__' + depth]) d['depth__' + depth] = {};
      if (!d['depth__' + depth][k]) {
        d['depth__' + depth][k] = v;
      } else {
        dup_num++;
        d['depth__' + depth][k + '__dup' + dup_num] = v;
      }
    };
  }
  console.log('d:', d);
})();

