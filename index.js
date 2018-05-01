'use strict';const symLogAssignment=Symbol('Log Levels Function Assignment'),symStream=Symbol('Log Stream Output Function'),symHeaders=Symbol('Log Headers'),symTopAsString=Symbol('Top Level Property String'),levels={fatal:60,error:50,warn:40,info:30,debug:20,trace:10},optionKeys=['level','stream'],defaultOptions={level:'info',stream:process.stdout};require('console-probe').apply(),module.exports=Object.freeze({create(a){return new Jrep(a)}});class Jrep{constructor(a){this.levels=levels;const b=splitOptions(a);this.options=b.options,this.top=b.top,this[symTopAsString]=b.topAsString,this[symStream]=this.options.stream,this[symHeaders]={},this[symLogAssignment]()}[symLogAssignment](){Object.keys(this.levels).forEach(a=>{this[symHeaders][a]=`{"ver":"1","level":"${a}","lvl":${this.levels[a]}${this[symTopAsString]},"time":`,this[a]=function(...b){if(this.levels[this.options.level]>this.levels[a])return;let c=this[symHeaders][a]+new Date().getTime();const d=stringifyLogItems(b);c+=',"msg":'+d.msg,c+=',"data":'+d.data+'}',this[symStream].write(c+'\n')}})}child(a){return new Jrep(Object.assign({},this.options,this.top,a))}stringify(a,b,c){this[symStream].write(stringify(a,b,c))}json(a){this[symStream].write(stringify(a,null,2))}}function splitOptions(a){let b={options:defaultOptions,top:{},topAsString:''};if(!a)return b;b.options=Object.assign({},defaultOptions,a);let c=[];for(const d in b.options)optionKeys.includes(d)||c.push(d);if(1>c.length)return b;for(const d of c)b.top[d]=b.options[d],b.topAsString+=',"'+d+'":'+stringify(b.options[d]),delete b.options[d];return b}function stringifyLogItems(a){let b={msg:[],data:[]};for(const c of a){if('[object String]'===Object.prototype.toString.call(c)){b.msg.push(c);continue}if(c instanceof Error){b.data.push(serializerr(c)),b.msg.push(c.message);continue}b.data.push(c)}return 1>b.msg.length?b.msg='""':1===b.msg.length&&(b.msg=b.msg[0]),1>b.data.length?b.data='':1===b.data.length&&(b.data=b.data[0]),b.msg=stringify(b.msg),b.data=stringify(b.data),b}const arr=[];function stringify(a,b,c){decirc(a,'',[],void 0);const d=JSON.stringify(a,b,c);for(;0!==arr.length;){const a=arr.pop();a[0][a[1]]=a[2]}return d}function decirc(a,b,c,d){let e;if('object'==typeof a&&null!==a){for(e=0;e<c.length;e++)if(c[e]===a)return d[b]='[Circular]',void arr.push([d,b,a]);if(c.push(a),Array.isArray(a))for(e=0;e<a.length;e++)decirc(a[e],e,c,a);else{const b=Object.keys(a);for(e=0;e<b.length;e++){const d=b[e];decirc(a[d],d,c,a)}}c.pop()}}function serializerr(a={}){const b=protochain(a).filter(a=>a!==Object.prototype);return[a].concat(b).map(a=>Object.getOwnPropertyNames(a)).reduce((b,c)=>(c.forEach(c=>{b[c]=a[c]}),b),{})}function protochain(a){const b=[];for(let c=getPrototypeOf(a);c;)b.push(c),c=getPrototypeOf(c);return b}function getPrototypeOf(a){return null==a?null:Object.getPrototypeOf(Object(a))}
