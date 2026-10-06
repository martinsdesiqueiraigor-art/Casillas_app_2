export default [{
 files:['js/core/**/*.js','js/modules/consultor/**/*.js','js/modules/guia/**/*.js','js/modules/guia.js','js/db.js','js/app.js'],
 languageOptions:{ecmaVersion:2022,sourceType:'module',globals:Object.fromEntries(['caches','DOMParser','document','window','navigator','indexedDB','crypto','console','setTimeout','clearTimeout','URL','URLSearchParams','CustomEvent','Event','alert','location','Infinity','structuredClone'].map(k=>[k,'readonly']))},
 rules:{'no-undef':'error','no-implicit-globals':'error'}
}];
