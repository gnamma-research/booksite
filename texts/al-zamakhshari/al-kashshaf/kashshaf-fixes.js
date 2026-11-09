(function(){'use strict';
const R=window.BahrReader;
// Preserve access to an explicitly linked commentary paragraph even when its layer was hidden.
function linkedLayer(){const at=new URLSearchParams(location.hash.split('?')[1]||'').get('at');const el=at&&document.getElementById(at);if(el?.closest('.tibi-layer')&&R.prefs.tibi===false)R.changeSetting('tibi',true);}
window.addEventListener('hashchange',()=>setTimeout(linkedLayer,150));linkedLayer();
// A live announcement describes the layer change without moving the reading position.
document.addEventListener('change',e=>{if(e.target.matches('[data-setting="tibi"]'))R.toast(e.target.checked?'Ṭībī’s commentary shown.':'Ṭībī’s commentary hidden.');});
})();
