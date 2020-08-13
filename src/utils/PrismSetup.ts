/* eslint-disable no-control-regex */
import { Prism } from 'prism-react-renderer';

// @ts-ignore
(typeof global !== 'undefined' ? global : window).Prism = Prism;

require('prismjs/components/prism-http');
require('prismjs/components/prism-smali');
