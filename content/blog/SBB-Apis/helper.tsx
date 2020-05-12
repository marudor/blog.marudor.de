import { SHA1, SHA256 } from 'jshashes';

// @ts-ignore
global.SHA1 = new SHA1();

// @ts-ignore
global.SHA256 = new SHA256();
