/* eslint-disable no-control-regex */
import { Prism } from 'prism-react-renderer';

// @ts-ignore
(typeof global !== 'undefined' ? global : window).Prism = Prism;

require('prismjs/components/prism-http');

const smali_instr_low_prio = [
  'add',
  'and',
  'cmp',
  'cmpg',
  'cmpl',
  'const',
  'div',
  'double',
  'float',
  'goto',
  'if',
  'int',
  'long',
  'move',
  'mul',
  'neg',
  'new',
  'nop',
  'not',
  'or',
  'rem',
  'return',
  'shl',
  'shr',
  'sput',
  'sub',
  'throw',
  'ushr',
  'xor',
];
const smali_instr_high_prio = [
  'aget',
  'aput',
  'array',
  'check',
  'execute',
  'fill',
  'filled',
  'goto/16',
  'goto/32',
  'iget',
  'instance',
  'invoke',
  'iput',
  'monitor',
  'packed',
  'sget',
  'sparse',
];
const smali_keywords = [
  'transient',
  'constructor',
  'abstract',
  'final',
  'synthetic',
  'public',
  'private',
  'protected',
  'static',
  'bridge',
  'system',
];

// @ts-ignore
Prism.languages.smali = {
  comment: /^(#|\$)/,
  punctuation: /{|}|,|;|L/,
  string: /".*"/,
  variable: /(v|p)\d+/,
  keyword: [
    /\\s*\\.end\\s[a-zA-Z0-9]*/,
    /^[ ]*\\.[a-zA-Z]*/,
    /\\s:[a-zA-Z_0-9]*/,
    new RegExp(`\\s(${smali_keywords.join('|')})`),
    new RegExp(`\\s(${smali_instr_low_prio.join('|')})\\s`),
    new RegExp(
      `(^|\\s)(${smali_instr_low_prio.join('|')})((\\-|/)[a-zA-Z0-9]+)+\\s`
    ),
    new RegExp(
      `(^|\\s)(${smali_instr_high_prio.join('|')})((\\-|/)[a-zA-Z0-9]+)*\\s`
    ),
  ],
};
