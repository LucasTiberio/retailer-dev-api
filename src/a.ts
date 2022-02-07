import common from "./common";

console.log(common.encryptSHA256(JSON.stringify({ item: 'aluysio@lojaintegrada.com.br', timestamp: +new Date() })))