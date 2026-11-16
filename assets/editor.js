const $=id=>document.getElementById(id);let config,defaults;const clone=o=>JSON.parse(JSON.stringify(o));const store=()=>{localStorage.setItem('blog-draft',JSON.stringify(config));send()};const send=()=>{$('preview').contentWindow?.postMessage({type:'preview-config',config},location.origin)};
function field(parent,label,value,callback,type='text'){const l=document.createElement('label');l.textContent=label;const i=document.createElement('input');i.type=type;i.value=value||'';i.addEventListener('input',()=>{callback(i.value);store()});l.append(i);parent.append(l)}
function redrawLinks(){const host=$('link-editor');host.replaceChildren();config.links.forEach((l,i)=>{const el=document.createElement('div');el.className='item';field(el,'Title',l.title,v=>l.title=v);field(el,'Description',l.subtitle,v=>l.subtitle=v);field(el,'URL',l.url,v=>l.url=v);field(el,'Icon (emoji or symbol)',l.icon,v=>l.icon=v);field(el,'Icon file path',l.iconPath,v=>l.iconPath=v);field(el,'Card image path',l.imagePath,v=>l.imagePath=v);field(el,'Card variant class',l.stylePath,v=>l.stylePath=v);const chk=document.createElement('label');chk.className='check';const input=document.createElement('input');input.type='checkbox';input.checked=l.enabled!==false;input.addEventListener('change',()=>{l.enabled=input.checked;store()});chk.append(input,document.createTextNode('Visible'));el.append(chk);const actions=document.createElement('div');actions.className='item-actions';[['↑',()=>move(config.links,i,-1)],['↓',()=>move(config.links,i,1)],['Delete',()=>{config.links.splice(i,1);store();redrawLinks()}]].forEach(([t,fn])=>{const b=document.createElement('button');b.className='ghost';b.textContent=t;b.addEventListener('click',fn);actions.append(b)});el.append(actions);host.append(el)})}
function redrawSocials(){const host=$('social-editor');host.replaceChildren();config.socials.forEach((s,i)=>{const el=document.createElement('div');el.className='item';field(el,'Label',s.label,v=>s.label=v);field(el,'URL',s.url,v=>s.url=v);field(el,'Icon',s.icon,v=>s.icon=v);field(el,'Icon image path',s.iconPath,v=>s.iconPath=v);const b=document.createElement('button');b.className='ghost';b.textContent='Delete';b.addEventListener('click',()=>{config.socials.splice(i,1);store();redrawSocials()});el.append(b);host.append(el)})}
function move(arr,i,d){const j=i+d;if(j<0||j>=arr.length)return;[arr[i],arr[j]]=[arr[j],arr[i]];store();redrawLinks()}
function sync(){['name','handle','bio','theme','shape','background'].forEach(k=>{$('edit-'+k).value=config[k]||''});redrawLinks();redrawSocials();syncExtras();store()}
async function init(){const r=await fetch('config.json');defaults=await r.json();try{config={...clone(defaults),...JSON.parse(localStorage.getItem('blog-draft')||'null')}}catch{config=clone(defaults)}if(!config||!Array.isArray(config.links)||!Array.isArray(config.socials))config=clone(defaults);sync();bindExtras();$('preview').addEventListener('load',send);window.addEventListener('message',e=>{if(e.origin===location.origin&&e.data?.type==='preview-ready')send()});['name','handle','bio','theme','shape','background'].forEach(k=>{$('edit-'+k).addEventListener('input',e=>{config[k]=e.target.value;store()})});$('add-link').onclick=()=>{config.links.push({title:'New link',subtitle:'',url:'https://example.com',icon:'↗',iconPath:'',imagePath:'',stylePath:'',enabled:true});sync()};$('add-social').onclick=()=>{config.socials.push({label:'Social',url:'https://example.com',icon:'✦',iconPath:''});sync()};$('reset').onclick=()=>{if(confirm('Reset all editor changes to the published default?')){config=clone(defaults);sync()}};$('remove-avatar').onclick=()=>{config.avatar='';$('edit-avatar').value='';store()};$('edit-avatar').onchange=e=>{const f=e.target.files?.[0];if(!f)return;if(f.size>1024*1024||!['image/png','image/jpeg','image/webp','image/gif'].includes(f.type)){alert('Choose a PNG, JPEG, WebP or GIF under 1 MB');return}const reader=new FileReader();reader.onload=()=>{config.avatar=reader.result;store()};reader.readAsDataURL(f)};function download(name,content,type){const b=new Blob([content],{type});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}$('export').onclick=()=>download('config.json',JSON.stringify(config,null,2)+'\n','application/json');$('export-js').onclick=()=>download('preference.js','const preference = '+JSON.stringify(config,null,2)+';\n','text/javascript');$('import').onclick=()=>$('file').click();$('file').onchange=async e=>{try{const source=await e.target.files[0].text();const data=e.target.files[0].name.toLowerCase().endsWith('.js')?parseImportedPreference(source):JSON.parse(source);if(!data||!Array.isArray(data.links)||!Array.isArray(data.socials))throw Error('Missing links or socials');config={...clone(defaults),...data};sync()}catch(err){alert('Invalid configuration: '+err.message)}e.target.value=''}}init().catch(err=>alert('Cannot load config.json. Run a local server. '+err.message));

function parseImportedPreference(source){const match=source.trim().match(/^(?:const|let|var)\s+preference\s*=\s*([\s\S]*?)\s*;?\s*$/);if(!match)throw Error('Expected const preference = {...};');return JSON.parse(match[1].trim().replace(/;$/, ''))}

const extraFields={design:['cardStyle','layout','maxWidth','cardStylePath','customCSS','backgroundImage','backgroundImagePosition','backgroundImageSize'],typography:['fontFamily','customFontPath','nameSize','bioSize','cardTitleSize','cardSubtitleSize'],assets:['avatarPath','faviconPath','defaultCardIconPath'],music:['path','title','volume','loop','showPlayer','buttonOnly','autoplay']};
const extraId=(section,k)=>section==='music'?'edit-music'+k[0].toUpperCase()+k.slice(1):section==='assets'?'edit-'+k:'edit-'+k;
function syncExtras(){if(!config)return;
 const footerToggle=$('edit-showFooter');if(footerToggle)footerToggle.checked=config.showFooter!==false;
 config.socialStyle||={};
 $('edit-socialBackgroundEnabled').checked=config.socialStyle.backgroundEnabled===true;
 $('edit-socialShape').value=['circle','square','rounded'].includes(config.socialStyle.shape)?config.socialStyle.shape:'circle';
 $('edit-socialBackgroundColor').value=/^#[0-9a-f]{6}$/i.test(config.socialStyle.backgroundColor||'')?config.socialStyle.backgroundColor:'#ffffff';for(const [section,keys] of Object.entries(extraFields)){config[section]||={};for(const k of keys){const el=$(extraId(section,k));if(!el)continue;if(el.type==='checkbox')el.checked=config[section][k]===true;else el.value=config[section][k]??''}}
 const color=config.colors||{};for(const k of ['background','background2','accent','card','text','muted']){const el=$('edit-color-'+k);if(!el)continue;const themeColor=({lavender:['#f0eaff','#dcd2ff','#6e52b6','#ffffff','#242135','#77738a'],peach:['#fff1e8','#ffd9c6','#ae5e42','#ffffff','#242135','#77738a'],mint:['#e5f8f0','#bdebd9','#26745c','#ffffff','#242135','#77738a'],sky:['#e7f3ff','#c4dfff','#3568a4','#ffffff','#242135','#77738a'],midnight:['#141827','#242d48','#b4c8ff','#222b43','#f5f5ff','#aeb7ce']})[config.theme]||[];const i=['background','background2','accent','card','text','muted'].indexOf(k);el.value=/^#[0-9a-f]{6}$/i.test(color[k]||'')?color[k]:themeColor[i]||'#ffffff'} }
let extrasBound=false;
function bindExtras(){if(extrasBound)return;extrasBound=true;
 $('edit-showFooter')?.addEventListener('change',e=>{config.showFooter=e.target.checked;store()});
 for(const [id,key,event] of [['edit-socialBackgroundEnabled','backgroundEnabled','change'],['edit-socialShape','shape','change'],['edit-socialBackgroundColor','backgroundColor','input']]){
   $(id).addEventListener(event,e=>{config.socialStyle||={};config.socialStyle[key]=key==='backgroundEnabled'?e.target.checked:e.target.value;store()});
 }for(const [section,keys] of Object.entries(extraFields)){for(const k of keys){const el=$(extraId(section,k));if(!el)continue;el.addEventListener(el.type==='checkbox'?'change':'input',()=>{config[section]||={};config[section][k]=el.type==='checkbox'?el.checked:el.type==='number'?Number(el.value):el.value;store()})}}
 for(const k of ['background','background2','accent','card','text','muted']){$('edit-color-'+k)?.addEventListener('input',e=>{config.colors||={};config.colors[k]=e.target.value;store()})}
 $('reset-colors')?.addEventListener('click',()=>{config.colors={};syncExtras();store()})}


// Compact editor actions on mobile; preserve the desktop navbar.
(() => {
  const toggle = document.getElementById('mobile-nav-toggle');
  const nav = document.querySelector('.editor-body .topbar');
  const actions = document.getElementById('editor-actions');
  if (!toggle || !nav || !actions) return;
  const setOpen = open => {
    nav.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close editor actions' : 'Open editor actions');
    const icon = toggle.querySelector('.nav-toggle-icon');
    if (icon) icon.textContent = open ? '✕' : '☰';
    const label = toggle.querySelector('.nav-toggle-label');
    if (label) label.textContent = open ? 'Close' : 'Menu';
  };
  toggle.addEventListener('click', () => setOpen(!nav.classList.contains('nav-open')));
  actions.addEventListener('click', event => {
    if (event.target.closest('a, button')) setOpen(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav.classList.contains('nav-open')) {
      setOpen(false);
      toggle.focus();
    }
  });
  const desktop = window.matchMedia('(min-width: 701px)');
  desktop.addEventListener('change', event => { if (event.matches) setOpen(false); });
})();
