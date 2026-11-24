/* link: GitHub Pages multi-profile rendering; preference.js is parsed as JSON, NEVER executed. */
const themes={lavender:['#f0eaff','#dcd2ff','#6e52b6','#ffffff'],peach:['#fff1e8','#ffd9c6','#ae5e42','#ffffff'],mint:['#e5f8f0','#bdebd9','#26745c','#ffffff'],sky:['#e7f3ff','#c4dfff','#3568a4','#ffffff'],midnight:['#141827','#242d48','#b4c8ff','#222b43']};
const $=id=>document.getElementById(id);
const defaults={design:{},colors:{},typography:{},assets:{},music:{}};
const number=(n,f,min,max)=>Number.isFinite(Number(n))?Math.min(max,Math.max(min,Number(n))):f;
const safeColor=c=>typeof c==='string'&&(/^(#[0-9a-f]{3,8}|(?:rgb|hsl)a?\([\d.% ,]+\))$/i.test(c.trim()))?c.trim():'';
const safeUrl=url=>{try{const u=new URL(url,location.href);return ['https:','http:','mailto:','tel:'].includes(u.protocol)?u.href:'#'}catch{return '#'}};
/* Paths point into the user's GitHub repository by default, not into the central page site. */
function assetURL(value,repoBase=''){
 if(typeof value!=='string'||!value.trim())return '';
 const s=value.trim();
 if(/^data:image\/(png|jpeg|webp|gif|svg\+xml);base64,[a-z\d+/=]+$/i.test(s)&&s.length<1600000)return s;
 if(/^https:\/\//i.test(s)){try{const u=new URL(s);return u.username||u.password?'':u.href}catch{return ''}}
 if(s.startsWith('/')||s.startsWith('//')||s.includes('\\')||s.includes('?')||s.includes('#'))return '';
 const pieces=s.split('/');if(pieces.some(x=>!x||x==='.'||x==='..'||/[\u0000-\u001F\u007F<>:"|*]/u.test(x)))return '';
 return new URL(pieces.map(encodeURIComponent).join('/'),repoBase||new URL('./',location.href)).href;
}
function freshAsset(url){if(!url || url.startsWith('data:'))return url;try{const u=new URL(url,location.href);if(!['http:','https:'].includes(u.protocol))return url;const version=String(window.LINK_ASSET_VERSION||'2026.11.24.1');u.searchParams.set('v',version);return u.href}catch{return url}}
function stylesheet(href,key){let e=document.getElementById(key);if(e)e.remove();if(!href)return;e=document.createElement('link');e.id=key;e.rel='stylesheet';e.href=freshAsset(href);document.head.append(e)}
function icon(node,symbol,path,base){
 // A filename in `icon` is a real image path, including names with spaces.
 // Explicit iconPath takes priority, then icon-as-path, then the default icon.
 const isImagePath=v=>typeof v==='string'&&/\.(?:svg|png|webp|gif|jpe?g|ico|avif)(?:[?#].*)?$/i.test(v.trim());
 const selected=isImagePath(path)?path:(isImagePath(symbol)?symbol:path);
 const src=assetURL(selected,base);
 node.replaceChildren();
 if(src){
  const im=document.createElement('img');im.src=freshAsset(src);im.alt='';im.loading='lazy';im.referrerPolicy='no-referrer';
  im.addEventListener('error',()=>{im.remove();node.classList.remove('has-image');node.textContent='↗'},{once:true});
  node.classList.add('has-image');node.append(im);
 }else{node.classList.remove('has-image');node.textContent=isImagePath(symbol)?'↗':symbol||'↗'}
}
function applyTheme(c,base){
 const t=themes[c.theme]||themes.lavender;const color=c.colors||{};
 const vars={'--bg':safeColor(color.background)||t[0],'--bg2':safeColor(color.background2)||t[1],'--accent':safeColor(color.accent)||t[2],'--card':safeColor(color.card)||t[3],'--ink':safeColor(color.text)||(c.theme==='midnight'?'#f5f5ff':'#242135'),'--muted':safeColor(color.muted)||(c.theme==='midnight'?'#aeb7ce':'#77738a')};
 for(const [k,v] of Object.entries(vars))document.documentElement.style.setProperty(k,v);
 document.body.dataset.avatarFrame=c.avatarFrame===false?'off':'on';
 document.body.dataset.disableDragSelect=c.interactionStyle?.disableDragSelect===true?'on':'off';
 document.body.dataset.shape=['rounded','pill','square'].includes(c.shape)?c.shape:'rounded';document.body.dataset.background=['gradient','solid','image'].includes(c.background)?c.background:'gradient';
 const d=c.design||{},typ=c.typography||{};
 document.body.dataset.cardStyle=['glass','solid','outline','minimal','neon'].includes(d.cardStyle)?d.cardStyle:'glass';
 document.body.dataset.layout=['centered','wide'].includes(d.layout)?d.layout:'centered';
 document.documentElement.style.setProperty('--profile-width',number(d.maxWidth,510,300,1000)+'px');
 for(const [k,v,f] of [['--name-size',typ.nameSize,29],['--bio-size',typ.bioSize,15],['--card-title-size',typ.cardTitleSize,15],['--card-subtitle-size',typ.cardSubtitleSize,12]])document.documentElement.style.setProperty(k,number(v,f,9,70)+'px');
 const allowedFonts={'DM Sans':'"DM Sans",system-ui,sans-serif','system':'system-ui,sans-serif','serif':'Georgia,serif','monospace':'ui-monospace,monospace'};
 document.documentElement.style.setProperty('--profile-font',allowedFonts[typ.fontFamily]||allowedFonts['DM Sans']);
 let fontEl=document.getElementById('link-custom-font');if(fontEl)fontEl.remove();
 const font=assetURL(typ.customFontPath,base);if(font&&/\.(woff2?|ttf|otf)(?:$|\?)/i.test(font)){
   fontEl=document.createElement('style');fontEl.id='link-custom-font';fontEl.textContent='@font-face{font-family:"LinkCustom";src:url("'+freshAsset(font).replace(/"/g,'%22')+'");font-display:swap}';document.head.append(fontEl);document.documentElement.style.setProperty('--profile-font','"LinkCustom",system-ui,sans-serif');
 }
 const background=assetURL(d.backgroundImage||(c.assets||{}).backgroundPath,base);
 document.documentElement.style.setProperty('--background-image',background?'url("'+freshAsset(background).replace(/"/g,'%22')+'")':'none');
 document.documentElement.style.setProperty('--background-position',(['center','top','bottom','left','right'].includes(d.backgroundImagePosition)?d.backgroundImagePosition:'center'));
 document.documentElement.style.setProperty('--background-size',(['cover','contain','auto'].includes(d.backgroundImageSize)?d.backgroundImageSize:'cover'));
 stylesheet(assetURL(d.cardStylePath,base),'link-card-custom-css');stylesheet(assetURL(d.customCSS,base),'link-custom-css');
 const favicon=assetURL((c.assets||{}).faviconPath,base);let fav=document.querySelector('link[rel="icon"]');if(!fav){fav=document.createElement('link');fav.rel='icon';document.head.append(fav)}if(favicon)fav.href=freshAsset(favicon);else fav.removeAttribute('href');
 // Global social-icon background: custom shape/color, with a transparent off state.
 const social=c.socialStyle||{};
 document.body.dataset.socialBackground=social.backgroundEnabled===true?'on':'off';
 document.body.dataset.socialShape=['circle','square','rounded'].includes(social.shape)?social.shape:'circle';
 document.documentElement.style.setProperty('--social-bg-color',safeColor(social.backgroundColor)||'#ffffff');
 const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=vars['--bg'];
}
/* YouTube and YouTube Music use the YouTube embedded player, not <audio>. */
function youtubeEmbed(value,loop=true){
 if(typeof value!=='string'||!value.trim())return null;
 let url;try{url=new URL(value.trim())}catch{return null}
 if(url.protocol!=='https:')return null;
 const host=url.hostname.toLowerCase().replace(/\.$/,'');
 if(!['youtube.com','www.youtube.com','m.youtube.com','music.youtube.com','youtu.be','www.youtu.be','www.youtube-nocookie.com','youtube-nocookie.com'].includes(host))return null;
 const segments=url.pathname.split('/').filter(Boolean);
 let video='',playlist='';
 if(host==='youtu.be'||host==='www.youtu.be')video=segments[0]||'';
 else if(segments[0]==='watch')video=url.searchParams.get('v')||'';
 else if(['shorts','live','embed'].includes(segments[0]))video=segments[1]||'';
 else if(segments[0]==='playlist')playlist=url.searchParams.get('list')||'';
 else return {error:'This YouTube URL is not a video or playlist. Paste a video or playlist link instead.'};
 if(!playlist&&video)playlist=url.searchParams.get('list')||'';
 if(video&&!/^[\w-]{11}$/.test(video))return {error:'Invalid YouTube video ID.'};
 if(playlist&&!/^[\w-]{2,160}$/.test(playlist))playlist='';
 if(!video&&!playlist)return {error:'The YouTube link has no playable video or playlist ID.'};
 const base='https://www.youtube-nocookie.com/embed/';
 // A video URL plays that specific video; a playlist URL plays the playlist.
 const embed=new URL(base+(video?encodeURIComponent(video):'videoseries'));
 if(video){if(loop){embed.searchParams.set('loop','1');embed.searchParams.set('playlist',video)}else if(playlist)embed.searchParams.set('list',playlist)}
 else{embed.searchParams.set('list',playlist);if(loop)embed.searchParams.set('loop','1')}
 embed.searchParams.set('playsinline','1');
 return {url:embed.href};
}
function setupMusic(c,base){
 let wrap=$('music-player');if(!wrap){wrap=document.createElement('section');wrap.id='music-player';wrap.className='music-player';wrap.setAttribute('aria-label','Background music');$('socials').after(wrap)}
 // Reset old media when switching profiles or updating the editor preview.
 wrap.replaceChildren();
 const m=c.music||{};
 if(!m.path||m.showPlayer===false){wrap.hidden=true;return}
 wrap.hidden=false;
 const buttonOnly=m.buttonOnly===true;
 const title=m.title||'Background music';
 const parsed=youtubeEmbed(m.path,m.loop!==false);
 if(parsed){
   if(parsed.error){const error=document.createElement('small');error.textContent=parsed.error;error.setAttribute('role','status');wrap.append(error);return}
   // YouTube requires a visible iframe player; never hide or shrink it into audio-only playback.
   const buildYouTube=()=>{
     const iframe=document.createElement('iframe');iframe.className='music-youtube';iframe.title=title+' — YouTube player';
     const url=new URL(parsed.url);
     if(buttonOnly)url.searchParams.set('autoplay','1'); // User pressed the button first.
     iframe.src=url.href;iframe.loading=buttonOnly?'eager':'lazy';
     iframe.referrerPolicy='strict-origin-when-cross-origin';iframe.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';iframe.allowFullscreen=true;
     wrap.append(iframe);
     const note=document.createElement('small');note.textContent='Use the YouTube controls to play and adjust volume. Some tracks do not allow embedding.';wrap.append(note);
   };
   if(buttonOnly){
     const button=document.createElement('button');button.type='button';button.className='music-play-button';button.textContent='▶ Play music';
     button.setAttribute('aria-label','Play '+title);
     button.addEventListener('click',()=>{button.remove();buildYouTube()},{once:true});wrap.append(button);
   }else{
     const label=document.createElement('span');label.textContent=title;wrap.append(label);buildYouTube();
   }
   return;
 }
 const src=assetURL(m.path,base);
 if(!src){const error=document.createElement('small');error.textContent='Invalid audio URL or path.';wrap.append(error);return}
 const audio=document.createElement('audio');audio.src=src;audio.loop=m.loop!==false;audio.preload='none';audio.volume=number(m.volume,0.35,0,1);audio.setAttribute('aria-label',title);
 if(buttonOnly){
   const button=document.createElement('button');button.type='button';button.className='music-play-button';button.textContent='▶ Play music';
   button.setAttribute('aria-label','Play '+title);
   audio.addEventListener('play',()=>{button.textContent='❚❚ Pause music';button.setAttribute('aria-label','Pause '+title)});
   audio.addEventListener('pause',()=>{button.textContent='▶ Play music';button.setAttribute('aria-label','Play '+title)});
   audio.addEventListener('ended',()=>{button.textContent='▶ Play music'});
   button.addEventListener('click',async()=>{try{if(audio.paused)await audio.play();else audio.pause()}catch{button.textContent='Unable to play music';button.setAttribute('aria-label','Unable to play '+title)}});
   wrap.append(button,audio);
 }else{
   const label=document.createElement('span');label.textContent=title;audio.controls=true;wrap.append(label,audio);
   if(m.autoplay===true){const hint=document.createElement('small');hint.textContent='Press play to listen';wrap.append(hint)}
 }
}

function render(c,base=''){
 if(!c||typeof c!=='object')return;
 applyTheme(c,base);
 $('name').textContent=c.name||'Your Name';$('handle').textContent=c.handle||'@yourhandle';$('bio').textContent=c.bio||'';document.title=(c.name||'My Links')+' · link';
 const av=$('avatar');icon(av,(c.name||'YN').split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase(),(c.assets||{}).avatarPath||c.avatar,base);
 $('links').replaceChildren();(Array.isArray(c.links)?c.links:[]).filter(l=>l&&l.enabled!==false).forEach(l=>{
  const a=document.createElement('a');a.className='link-card';a.href=safeUrl(l.url||'');if(a.href.startsWith('http')){a.target='_blank';a.rel='noopener noreferrer'}
  const ic=document.createElement('span');ic.className='link-icon';icon(ic,l.icon||'↗',l.iconPath||(c.assets||{}).defaultCardIconPath,base);
  const txt=document.createElement('span');txt.className='link-copy';const strong=document.createElement('strong');strong.textContent=l.title||'Untitled link';const small=document.createElement('small');small.textContent=l.subtitle||'';txt.append(strong,small);
  const pic=assetURL(l.imagePath,base);if(pic){const img=document.createElement('img');img.className='card-image';img.src=freshAsset(pic);img.alt='';img.loading='lazy';img.referrerPolicy='no-referrer';a.append(img)}
  const arrow=document.createElement('span');arrow.className='arrow';arrow.textContent='↗';a.append(ic,txt,arrow);
  if(l.stylePath){const css=assetURL(l.stylePath,base);if(css&&/\.css(?:$|\?)/i.test(css)){const key='link-card-'+[...(l.stylePath||'')].reduce((n,ch)=>(n*31+ch.charCodeAt(0))>>>0,7);stylesheet(css,key);a.dataset.variant='custom'}else if(/^[\w-]{1,32}$/.test(l.stylePath))a.dataset.variant=l.stylePath}
  $('links').append(a)
 });
 $('socials').replaceChildren();(Array.isArray(c.socials)?c.socials:[]).filter(Boolean).forEach(s=>{const a=document.createElement('a');a.href=safeUrl(s.url||'');a.title=s.label||'Social link';a.setAttribute('aria-label',s.label||'Social link');icon(a,s.icon||'↗',s.iconPath,base);if(a.href.startsWith('http')){a.target='_blank';a.rel='noopener noreferrer'}$('socials').append(a)});
 const footer = document.getElementById('page-footer');
  if (footer) {
    // Explicitly show only when this profile allows the footer.
    const visible = c.showFooter !== false;
    footer.hidden = !visible;
    footer.style.setProperty('display', visible ? 'block' : 'none', 'important');
  }
 setupMusic(c,base)
}
const validGitHubUser=name=>/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(name)&&!name.includes('--');
async function getJson(url){const response=await fetch(url,{cache:'no-store',headers:{Accept:'application/vnd.github+json'}});if(!response.ok){if([403,429].includes(response.status))throw Error('GitHub API limit reached. Try again later.');if(response.status===404)throw Error('GitHub user or page repository not found.');throw Error('GitHub API request failed ('+response.status+').')}return response.json()}
async function getDefault(){const r=await fetch('config.json',{cache:'no-store'});if(!r.ok)throw Error('Could not load config.json');return r.json()}
function parsePreference(source){const m=source.trim().match(/^(?:const|let|var)\s+preference\s*=\s*([\s\S]*?)\s*;?\s*$/);if(!m)throw Error('Invalid preference.js format.');let json=m[1].trim();if(json.endsWith(';'))json=json.slice(0,-1).trim();let c;try{c=JSON.parse(json)}catch{throw Error('preference.js must contain strict JSON.')}if(!c||typeof c!=='object'||!Array.isArray(c.links)||!Array.isArray(c.socials))throw Error('Missing links or socials.');return c}
async function getGitHubProfile(username){
 if(!validGitHubUser(username))throw Error('Invalid GitHub username.');
 const settings=await fetch('site.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Could not load site.json');return r.json()});const repository=settings.profileRepository||'link';if(!/^[\w.-]{1,100}$/.test(repository))throw Error('Invalid repository name.');
 const api='https://api.github.com';const account=await getJson(`${api}/users/${encodeURIComponent(username)}`);if(account.type!=='User')throw Error('GitHub account must belong to a user.');
 const repo=await getJson(`${api}/repos/${encodeURIComponent(username)}/${encodeURIComponent(repository)}`);if(repo.private||repo.owner?.login?.toLowerCase()!==username.toLowerCase())throw Error('Profile repository must be public.');
 const filename=settings.preferenceFile||'preference.js';if(!/^[\w./-]+$/.test(filename)||filename.split('/').includes('..'))throw Error('Invalid preference file path.');
 const branch=repo.default_branch.split('/').map(encodeURIComponent).join('/');const repoBase=`https://raw.githubusercontent.com/${encodeURIComponent(repo.owner.login)}/${encodeURIComponent(repository)}/${branch}/`;
 const path=filename.split('/').map(encodeURIComponent).join('/');const response=await fetch(repoBase+path,{cache:'no-store'});if(!response.ok)throw Error('preference.js not found in '+repository+' default branch.');
 const contents=await response.text();if(contents.length>500000)throw Error('Preference file too large.');return {profile:parsePreference(contents),repoBase}
}
function showStatus(msg,error=false){const e=$('status');if(e){e.textContent=msg;e.hidden=false;e.classList.toggle('error',error)}}
function clearStatus(){const e=$('status');if(e)e.hidden=true}
// Show the profile only when configuration and its visible images are prepared.
// A bounded wait prevents a broken remote image from leaving a blank page forever.
async function waitForVisibleImages(maxWaitMs = 2800) {
 const imgs = [...document.querySelectorAll('#profile img')];
 if (!imgs.length) return;
 for (const img of imgs) img.loading = 'eager';
 const ready = Promise.all(imgs.map(img => {
   if (img.complete) return Promise.resolve();
   return new Promise(resolve => {
     img.addEventListener('load', resolve, {once:true});
     img.addEventListener('error', resolve, {once:true});
   });
 }));
 await Promise.race([ready, new Promise(resolve => setTimeout(resolve, maxWaitMs))]);
}
async function revealPage() {
  // Keep the initial blank screen in place until the dynamically loaded
  // stylesheet is ready. Otherwise the static HTML placeholders can flash.
  if (window.pageStylesReady) await window.pageStylesReady;
  await waitForVisibleImages();
 // Let the browser lay out the final profile before starting the entrance effect.
 await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
 document.documentElement.classList.remove('page-loading');
 document.documentElement.classList.add('page-ready');
 const shell = document.querySelector('.profile-shell');
 if (shell) shell.setAttribute('aria-busy', 'false');
}
async function start(){
 if(!$('profile')||document.body.dataset.preview==='true')return;
 const shell = document.querySelector('.profile-shell');
 if (shell) shell.setAttribute('aria-busy', 'true');
 const params=new URLSearchParams(location.search);
 const explicitUser=params.has('user');
 let settings={defaultUser:'Jacob7179'};
 try{const r=await fetch('site.json',{cache:'no-store'});if(r.ok)settings=await r.json()}catch{}
 const user=explicitUser?(params.get('user')||'').trim():(settings.defaultUser||'Jacob7179');
 try {
   // Resolve remote preferences before rendering: never flash the bundled profile
   // and replace it moments later with a different user.
   if(user){
     try {
       const {profile,repoBase}=await getGitHubProfile(user);
       // The unqualified homepage uses config.json as the authority for
       // site-owned footer visibility, even when a GitHub profile is loaded.
       // Explicit ?user=... pages continue to honor each user's preference.js.
       if (!explicitUser) {
         try {
           const defaultConfig = await getDefault();
           // Site-owned appearance switches take precedence on the default URL.
           // Explicit ?user=xxx URLs always use that user's preference.js.
           for (const key of ['showFooter', 'avatarFrame']) {
             if (typeof defaultConfig[key] === 'boolean') {
               profile[key] = defaultConfig[key];
             }
           }
           // Site-level interaction setting also controls the unqualified homepage.
           // Without this, remote preference.js can override the editor's exported config.json.
           if (typeof defaultConfig.interactionStyle?.disableDragSelect === 'boolean') {
             profile.interactionStyle = {
               ...(profile.interactionStyle || {}),
               disableDragSelect: defaultConfig.interactionStyle.disableDragSelect
             };
           }
         } catch (error) {
           console.warn('Unable to load local footer setting:', error);
         }
       }
       render(profile,repoBase);
       clearStatus();
       if($('owner-info'))$('owner-info').textContent='GitHub · '+user;
     } catch(err) {
       if(explicitUser){
         clearStatus();
         $('links').replaceChildren();$('socials').replaceChildren();
         $('name').textContent='Profile unavailable';$('handle').textContent='@'+user;
         $('bio').textContent='Open the default page or try another GitHub username.';
         showStatus(err.message,true);
       } else {
         // Default profile still works when GitHub is unavailable.
         try{render(await getDefault());clearStatus();if($('owner-info'))$('owner-info').textContent='GitHub · '+user}
         catch(fallbackError){showStatus(fallbackError.message,true)}
       }
     }
   } else if(explicitUser) {
     $('name').textContent='Profile unavailable';
     $('handle').textContent='';$('bio').textContent='';
     $('links').replaceChildren();$('socials').replaceChildren();
     showStatus('Enter a valid GitHub username.',true);
   } else {
     render(await getDefault());clearStatus();
   }
 } catch(err) {showStatus(err.message||'Unable to load this page.',true)}
 finally {await revealPage()}
}
start().catch(() => {
 document.documentElement.classList.remove('page-loading');
 document.documentElement.classList.add('page-ready');
});

// Android long-press can trigger context menus and text selection without dragstart.
// Cancel those browser defaults only inside the public profile when enabled.
// Do NOT cancel touchstart/touchmove: that would break scrolling and tapping links.
function restrictedProfileTarget(event) {
  return document.body.dataset.disableDragSelect === 'on' &&
    event.target instanceof Element && !!event.target.closest('#profile');
}
for (const eventType of ['dragstart', 'selectstart', 'contextmenu']) {
  document.addEventListener(eventType, event => {
    if (restrictedProfileTarget(event)) event.preventDefault();
  }, {capture:true, passive:false});
}
