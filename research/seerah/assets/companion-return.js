(()=>{'use strict';
const allowed=/^read(?:-preview-1\.9\.0|-restored-1\.8\.0|-1\.7\.0)?\.html#(?:ch-\d\d|s\d\d-[ms]\d\d)$/;
const q=new URLSearchParams(location.search),provided=q.get('return');
let stored=null;try{stored=sessionStorage.getItem('gnamma-seerah-return')}catch{}
const ret=allowed.test(provided||'')?provided:allowed.test(stored||'')?stored:null;
const back=document.querySelector('#return-reading');
if(back){back.href=ret||'read.html';if(ret)back.textContent='↩ Return to the passage';}
document.addEventListener('click',e=>{
 const a=e.target.closest('a[href]');if(!a||!ret)return;
 const u=new URL(a.href,location.href);
 if(u.origin!==location.origin||!/(?:^|\/)(people|subjects|geography|chronology)\.html$/.test(u.pathname))return;
 u.searchParams.set('return',ret);
 a.href=u.href;
},true);
})();