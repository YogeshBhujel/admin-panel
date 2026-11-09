/* Maison Tempo – admin panel (works with data.js + script.js in the same browser) */
(function(){"use strict";
var $=function(i){return document.getElementById(i)};
function qsa(s,r){return[].slice.call((r||document).querySelectorAll(s))}
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function money(n){return"£"+(+n||0).toFixed(2).replace(/\.00$/,"")}
function fdate(iso,t){var d=new Date(iso);if(isNaN(d))return"";return d.toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})+(t?" "+d.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"}):"")}
var K={cat:"mt_catalog",ord:"mt_orders",msg:"mt_messages",sub:"mt_subs",set:"mt_settings",auth:"mt_admin_auth",lock:"mt_admin_lock"};
var STATUS=["New","Processing","Shipped","Delivered","Cancelled","Refunded"];
var CATS=CAT.filter(function(c){return c!=="All"});
var BADGES=["","New","Bestseller","Sale"];
function arr(k){var a=mtLoad(k,[]);return Array.isArray(a)?a:[]}
function save(k,v){var ok=mtStore(k,v);if(!ok)toast("Could not save: browser storage is full. Remove large images or old data.",1);return ok}
function sizesFor(c){return c==="Shoes"?SHO:(c==="Bags"||c==="Accessories"?["One size"]:CLO)}
function imgUrl(p,w){var x=p.pool[(p.off||0)%p.pool.length];if(/^(https?:|data:)/.test(x))return x;return"https://images.unsplash.com/"+x+"?auto=format&fit=crop&w="+(w||200)+"&q=70"}
function toast(m,bad){var t=$("toast");t.textContent=m;t.className="on"+(bad?" bad":"");clearTimeout(toast.h);toast.h=setTimeout(function(){t.className=""},bad?4500:2400)}
function csvCell(v){v=String(v==null?"":v);if(/^[=+\-@]/.test(v))v="'"+v;return'"'+v.replace(/"/g,'""')+'"'}
function download(name,text,type){var b=new Blob([text],{type:type||"text/csv;charset=utf-8"}),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},500)}
function readImage(file,maxW,cb){if(!file||!/^image\//.test(file.type)){toast("Please choose an image file.",1);return}
var fr=new FileReader();fr.onload=function(){var im=new Image();im.onload=function(){var s=Math.min(1,maxW/im.width),c=document.createElement("canvas");c.width=Math.round(im.width*s);c.height=Math.round(im.height*s);c.getContext("2d").drawImage(im,0,0,c.width,c.height);cb(c.toDataURL("image/jpeg",.78))};im.onerror=function(){toast("That image could not be read.",1)};im.src=fr.result};fr.readAsDataURL(file)}

/* ---------- auth (client-side only: see notes) ---------- */
function hash(s){var t="mt|"+s;if(window.crypto&&crypto.subtle&&window.TextEncoder)return crypto.subtle.digest("SHA-256",new TextEncoder().encode(t)).then(function(b){return[].map.call(new Uint8Array(b),function(x){return("0"+x.toString(16)).slice(-2)}).join("")});return Promise.resolve("b:"+btoa(unescape(encodeURIComponent(t))))}
function authed(){try{return sessionStorage.getItem("mt_admin_session")==="1"}catch(e){return false}}
function setAuthed(v){try{v?sessionStorage.setItem("mt_admin_session","1"):sessionStorage.removeItem("mt_admin_session")}catch(e){}}
$("lf").onsubmit=function(e){e.preventDefault();var er=$("lerr"),lk=mtLoad(K.lock,{n:0,until:0});
if(Date.now()<lk.until){er.textContent="Too many attempts. Try again in "+Math.ceil((lk.until-Date.now())/1000)+" seconds.";return}
var u=$("lu").value.trim(),p=$("lp").value,cr=mtLoad(K.auth,null);
hash(p).then(function(h){return Promise.all([h,cr?cr.h:hash("admin")])}).then(function(x){var okU=u===(cr?cr.u:"admin");
if(okU&&x[0]===x[1]){mtStore(K.lock,{n:0,until:0});setAuthed(true);$("lp").value="";er.textContent="";start();return}
lk.n=(lk.n||0)+1;if(lk.n>=5){lk.until=Date.now()+30000;lk.n=0;er.textContent="Too many attempts. Locked for 30 seconds."}else er.textContent="Incorrect username or password.";mtStore(K.lock,lk)})};
$("logout").onclick=function(){setAuthed(false);location.hash="";location.reload()};

/* ---------- shell ---------- */
var VIEWS={dashboard:["Dashboard",vDash],orders:["Orders",vOrders],products:["Products",vProducts],messages:["Messages",vMessages],subscribers:["Subscribers",vSubs],settings:["Settings",vSettings]};
var cur="dashboard";
function start(){$("login").hidden=true;$("app").hidden=false;$("today").textContent=new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"});route()}
function badges(){var n=arr(K.ord).filter(function(o){return o.status==="New"}).length,m=arr(K.msg).filter(function(x){return!x.read}).length;
$("b-orders").textContent=n;$("b-orders").hidden=!n;$("b-msg").textContent=m;$("b-msg").hidden=!m}
function route(){var v=(location.hash||"#dashboard").slice(1);if(!VIEWS[v])v="dashboard";cur=v;
qsa("#snav a").forEach(function(a){a.dataset.v===v?a.setAttribute("aria-current","page"):a.removeAttribute("aria-current")});
$("vt").textContent=VIEWS[v][0];document.title="Maison Tempo Admin – "+VIEWS[v][0];closeMenu();badges();
$("banner").innerHTML=mtLoad(K.auth,null)?"":'<div class="note"><b>You are still using the default login (admin / admin).</b> <a href="#settings">Change the password in Settings</a> before you share this panel with anyone.</div>';
VIEWS[v][1]();window.scrollTo(0,0)}
window.addEventListener("hashchange",function(){if(authed())route()});
window.addEventListener("storage",function(){if(!authed())return;badges();if($("modal").hidden&&(cur==="dashboard"||cur==="orders"||cur==="messages"||cur==="subscribers"))VIEWS[cur][1]()});
var sideEl=$("side"),narrow=window.matchMedia("(max-width:960px)");
function menuIsOpen(){return sideEl.classList.contains("on")}
function openMenu(){sideEl.classList.add("on");$("scrim").classList.add("on");document.body.classList.add("noscroll");$("burger").setAttribute("aria-expanded","true");setTimeout(function(){var a=qsa("#snav a")[0];if(a)a.focus()},60)}
function closeMenu(back){var was=menuIsOpen(),inside=sideEl.contains(document.activeElement);sideEl.classList.remove("on");$("scrim").classList.remove("on");document.body.classList.remove("noscroll");$("burger").setAttribute("aria-expanded","false");
if(was&&back===true)$("burger").focus();else if(was&&inside)$("view").focus({preventScroll:true})}
$("burger").onclick=openMenu;$("scrim").onclick=function(){closeMenu(true)};
if(narrow.addEventListener)narrow.addEventListener("change",function(){if(!narrow.matches)closeMenu()});

/* ---------- modal ---------- */
var lastFocus=null;
function openModal(html,wide){var m=$("mbox");lastFocus=document.activeElement;m.className="mbox"+(wide?" wide":"");m.innerHTML=html;var t=m.querySelector("h2");if(t){t.id="mt";m.setAttribute("aria-labelledby","mt")}$("modal").hidden=false;document.body.style.overflow="hidden";setTimeout(function(){m.focus()},20)}
function closeModal(){$("modal").hidden=true;$("mbox").innerHTML="";document.body.style.overflow="";if(lastFocus&&document.body.contains(lastFocus)&&lastFocus.focus)lastFocus.focus({preventScroll:true});lastFocus=null}
var downOnBackdrop=false;
$("modal").addEventListener("mousedown",function(e){var m=$("modal");downOnBackdrop=e.target===m&&e.clientX<m.clientWidth&&e.clientY<m.clientHeight});
$("modal").addEventListener("mouseup",function(e){if(downOnBackdrop&&e.target===$("modal"))closeModal();downOnBackdrop=false});
function trap(e,box){var f=qsa('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled])',box).filter(function(x){return x.offsetParent!==null});if(!f.length)return;var a=f[0],b=f[f.length-1],ae=document.activeElement;
if(e.shiftKey&&(ae===a||ae===box)){e.preventDefault();b.focus()}else if(!e.shiftKey&&ae===b){e.preventDefault();a.focus()}}
document.addEventListener("keydown",function(e){
if(e.key==="Escape"){if(!$("modal").hidden)closeModal();else if(menuIsOpen())closeMenu(true);return}
if(e.key==="Tab"){if(!$("modal").hidden)trap(e,$("mbox"));else if(menuIsOpen()&&narrow.matches)trap(e,sideEl)}});
function mhead(t){return'<div class="mh"><h2>'+t+'</h2><button class="mx" data-act="close" aria-label="Close" type="button">×</button></div>'}

/* ---------- responsive tables: give every cell a data-label (used by the mobile card layout) and keep table semantics ---------- */
function labelTables(root){qsa("table",root).forEach(function(t){var hs=qsa("thead th",t).map(function(h){return h.textContent.trim()});if(!hs.length)return;
t.setAttribute("role","table");qsa("thead,tbody",t).forEach(function(x){x.setAttribute("role","rowgroup")});
qsa("tr",t).forEach(function(r){r.setAttribute("role","row");var i=0;qsa("th,td",r).forEach(function(c){var span=+c.getAttribute("colspan")||1;c.setAttribute("role",c.tagName==="TH"?"columnheader":"cell");if(c.tagName==="TD"&&span===1&&hs[i])c.setAttribute("data-label",hs[i]);i+=span})})})}
if(window.MutationObserver){["view","mbox"].forEach(function(id){new MutationObserver(function(){labelTables($(id))}).observe($(id),{childList:true,subtree:true})})}

/* ---------- order helpers ---------- */
function live(o){return o.status!=="Cancelled"&&o.status!=="Refunded"}
function ocust(o){return((o.name||"")+" "+(o.last||"")).trim()||"Customer"}
function oaddr(o){var a=o.addr||{};return[a.a1,a.a2,a.city,a.pc].filter(Boolean).join(", ")}
function qty(o){return(o.items||[]).reduce(function(n,i){return n+(+i.qty||0)},0)}

/* ---------- dashboard ---------- */
function vDash(){var O=arr(K.ord),P=mtCatalog(),M=arr(K.msg),S=arr(K.sub),lv=O.filter(live);
var rev=lv.reduce(function(s,o){return s+(+o.total||0)},0),avg=lv.length?rev/lv.length:0,hid=P.filter(function(p){return p.hidden}).length,so=P.reduce(function(n,p){return n+((p.out||[]).length)},0);
var days=[],i;for(i=13;i>=0;i--){var d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-i);days.push({d:d,t:0})}
lv.forEach(function(o){var t=new Date(o.created);t.setHours(0,0,0,0);days.forEach(function(x){if(x.d.getTime()===t.getTime())x.t+=+o.total||0})});
var mx=Math.max.apply(null,days.map(function(x){return x.t}).concat([1]));
var sold={};lv.forEach(function(o){(o.items||[]).forEach(function(it){sold[it.name]=(sold[it.name]||0)+(+it.qty||0)})});
var top=Object.keys(sold).sort(function(a,b){return sold[b]-sold[a]}).slice(0,6);
$("view").innerHTML='<div class="kpis"><div class="kpi"><span>Revenue</span><b>'+money(rev)+'</b><small>'+lv.length+' active orders</small></div><div class="kpi"><span>New orders</span><b>'+O.filter(function(o){return o.status==="New"}).length+'</b><small>waiting to be processed</small></div><div class="kpi"><span>Average order</span><b>'+money(avg)+'</b><small>incl. delivery and VAT</small></div><div class="kpi"><span>Unread messages</span><b>'+M.filter(function(m){return!m.read}).length+'</b><small>'+S.length+' newsletter subscribers</small></div></div>'+
'<div class="two"><div class="card"><h2>Last 14 days</h2><p class="sub">Daily revenue from active orders</p>'+(lv.length?'<div class="chart" role="img" aria-label="Bar chart of daily revenue for the last 14 days">'+days.map(function(x){return'<div title="'+x.d.toLocaleDateString("en-GB",{day:"numeric",month:"short"})+': '+money(x.t)+'"><i style="height:'+Math.max(2,x.t/mx*130)+'px"></i>'+x.d.getDate()+'</div>'}).join("")+'</div>':'<div class="empty">No orders yet. Orders placed in the shop appear here. You can load sample orders from Settings to see how this looks.</div>')+'</div>'+
'<div class="card"><h2>Best sellers</h2><p class="sub">By units sold</p>'+(top.length?'<ul class="toplist">'+top.map(function(n){return'<li>'+esc(n)+'<span>'+sold[n]+' sold</span></li>'}).join("")+'</ul>':'<p class="sub">Nothing sold yet.</p>')+'</div></div>'+
'<div class="two"><div class="card"><h2>Recent orders</h2><p class="sub"><a class="link" href="#orders">View all orders</a></p>'+(O.length?'<div class="tw keep"><table><thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead><tbody>'+O.slice(0,6).map(function(o){return'<tr><td><button class="link" data-act="order" data-id="'+esc(o.ref)+'">'+esc(o.ref)+'</button></td><td>'+esc(ocust(o))+'</td><td>'+money(o.total)+'</td><td><span class="badge '+esc(o.status)+'">'+esc(o.status)+'</span></td></tr>'}).join("")+'</tbody></table></div>':'<p class="sub">No orders yet.</p>')+'</div>'+
'<div class="card"><h2>Catalogue</h2><p class="sub"><a class="link" href="#products">Manage products</a></p><ul class="toplist"><li>Live products<span>'+(P.length-hid)+'</span></li><li>Hidden products<span>'+hid+'</span></li><li>Sizes sold out<span>'+so+'</span></li></ul></div></div>';
bindView()}

/* ---------- orders ---------- */
var oq="",ost="";
function vOrders(){$("view").innerHTML='<div class="tb"><input type="search" id="oq" placeholder="Search order number, name or email" aria-label="Search orders" value="'+esc(oq)+'"><select id="ost" aria-label="Filter by status"><option value="">All statuses</option>'+STATUS.map(function(s){return'<option'+(s===ost?" selected":"")+'>'+s+'</option>'}).join("")+'</select><button class="btn ghost sp" data-act="exp-orders" type="button">Export CSV</button></div><div id="olist"></div>';
$("oq").oninput=function(){oq=this.value;olist()};$("ost").onchange=function(){ost=this.value;olist()};olist();bindView()}
function olist(){var q=oq.trim().toLowerCase(),L=arr(K.ord).filter(function(o){return(!ost||o.status===ost)&&(!q||(o.ref+" "+ocust(o)+" "+o.email).toLowerCase().indexOf(q)>-1)});
$("olist").innerHTML=L.length?'<div class="tw"><table><thead><tr><th>Order</th><th>Date</th><th>Customer</th><th class="hm">Items</th><th class="r">Total</th><th class="hm">Payment</th><th>Status</th><th></th></tr></thead><tbody>'+L.map(function(o){return'<tr><td><b>'+esc(o.ref)+'</b>'+(o.sample?' <span class="badge">sample</span>':'')+'</td><td>'+fdate(o.created)+'</td><td>'+esc(ocust(o))+'<br><small style="color:var(--mute)">'+esc(o.email)+'</small></td><td class="hm">'+qty(o)+'</td><td class="r">'+money(o.total)+'</td><td class="hm">'+(o.demo?'<span class="badge warn">Demo, unpaid</span>':esc(o.pay||""))+'</td><td><select class="st" data-act="ostatus" data-id="'+esc(o.ref)+'" aria-label="Status for '+esc(o.ref)+'">'+STATUS.map(function(s){return'<option'+(s===o.status?" selected":"")+'>'+s+'</option>'}).join("")+'</select></td><td class="r"><button class="btn ghost sm" data-act="order" data-id="'+esc(o.ref)+'">View</button></td></tr>'}).join("")+'</tbody></table></div>':'<div class="tw"><div class="empty">'+(arr(K.ord).length?"No orders match your filters.":"No orders yet. When a customer checks out in the shop, the order appears here.")+'</div></div>'}
function findOrder(id){return arr(K.ord).filter(function(o){return o.ref===id})[0]}
function orderModal(id){var o=findOrder(id);if(!o)return;var a=o.addr||{};
openModal(mhead("Order "+esc(o.ref))+'<div class="g2"><div class="card"><h2 style="font-size:22px">Customer</h2><dl class="dl"><dt>Name</dt><dd>'+esc(ocust(o))+'</dd><dt>Email</dt><dd><a class="link" href="mailto:'+esc(o.email)+'">'+esc(o.email)+'</a></dd><dt>Phone</dt><dd>'+esc(o.phone||"–")+'</dd><dt>Address</dt><dd>'+esc(oaddr(o)||(o.delivery&&/collect/i.test(o.delivery)?"Click and collect":"–"))+'</dd></dl></div><div class="card" style="margin:0"><h2 style="font-size:22px">Order</h2><dl class="dl"><dt>Placed</dt><dd>'+fdate(o.created,1)+'</dd><dt>Delivery</dt><dd>'+esc(o.delivery||"")+'</dd><dt>Payment</dt><dd>'+(o.demo?"Demo checkout, no payment taken":esc(o.pay||""))+'</dd><dt>Status</dt><dd><select id="ods">'+STATUS.map(function(s){return'<option'+(s===o.status?" selected":"")+'>'+s+'</option>'}).join("")+'</select></dd></dl></div></div>'+
'<div class="tw keep" style="margin-top:16px"><table><thead><tr><th>Item</th><th>Option</th><th class="r">Qty</th><th class="r">Price</th></tr></thead><tbody>'+(o.items||[]).map(function(i){return'<tr><td>'+esc(i.name)+'<br><small style="color:var(--mute)">'+esc(i.sku)+'</small></td><td>'+esc(i.color)+(i.size&&i.size!=="One size"?" · "+esc(i.size):"")+'</td><td class="r">'+esc(i.qty)+'</td><td class="r">'+money((i.unit_amount_pence||0)/100*i.qty)+'</td></tr>'}).join("")+'<tr><td colspan="3" class="r">Delivery</td><td class="r">'+(o.shipping?money(o.shipping):"Free")+'</td></tr><tr><td colspan="3" class="r"><b>Total (incl. VAT)</b></td><td class="r"><b>'+money(o.total)+'</b></td></tr></tbody></table></div>'+
'<label style="margin-top:14px">Internal note<textarea id="odn" placeholder="Only visible to you">'+esc(o.note||"")+'</textarea></label>'+
'<div class="mf"><button class="btn danger" data-act="odel" data-id="'+esc(o.ref)+'" type="button">Delete order</button><button class="btn ghost" onclick="window.print()" type="button">Print</button><button class="btn" data-act="osave" data-id="'+esc(o.ref)+'" type="button">Save changes</button></div>',1)}
function setOrder(id,fn){var a=arr(K.ord),o=a.filter(function(x){return x.ref===id})[0];if(!o)return false;fn(o);return save(K.ord,a)}

/* ---------- products ---------- */
var pq="",pc="",ps="",pn=15,ed=null;
function vProducts(){$("view").innerHTML='<div class="tb"><input type="search" id="pq" placeholder="Search products" aria-label="Search products" value="'+esc(pq)+'"><select id="pc" aria-label="Category"><option value="">All categories</option>'+CATS.map(function(c){return'<option'+(c===pc?" selected":"")+'>'+c+'</option>'}).join("")+'</select><select id="ps" aria-label="Status"><option value="">Live and hidden</option><option value="live"'+(ps==="live"?" selected":"")+'>Live only</option><option value="hidden"'+(ps==="hidden"?" selected":"")+'>Hidden only</option></select><button class="btn sp" data-act="padd" type="button">+ Add product</button></div><div id="plist"></div>';
$("pq").oninput=function(){pq=this.value;pn=15;plist()};$("pc").onchange=function(){pc=this.value;pn=15;plist()};$("ps").onchange=function(){ps=this.value;pn=15;plist()};plist();bindView()}
function plist(){var q=pq.trim().toLowerCase(),L=mtCatalog().filter(function(p){return(!pc||p.cat===pc)&&(!ps||(ps==="hidden")===!!p.hidden)&&(!q||(p.name+" "+p.cat+" "+p.sku+" "+p.fabric).toLowerCase().indexOf(q)>-1)});
var vis=L.slice(0,pn);
$("plist").innerHTML=L.length?'<div class="tw"><table><thead><tr><th>Product</th><th class="hm">Category</th><th class="r">Price</th><th>Stock</th><th>Status</th><th></th></tr></thead><tbody>'+vis.map(function(p){var o=(p.out||[]).length;return'<tr><td><div class="pn"><img class="thumb" loading="lazy" alt="" src="'+esc(imgUrl(p,120))+'"><div><b>'+esc(p.name)+'</b><small>'+esc(p.sku)+(p.badge?" · "+esc(p.badge):"")+'</small></div></div></td><td class="hm">'+esc(p.cat)+'</td><td class="r">'+money(p.price)+'</td><td>'+(o?'<span class="badge warn">'+o+' size'+(o>1?"s":"")+' sold out</span>':'<span class="badge ok">In stock</span>')+'</td><td><span class="badge '+(p.hidden?"bad":"ok")+'">'+(p.hidden?"Hidden":"Live")+'</span></td><td><div class="acts"><button class="btn ghost sm" data-act="pedit" data-id="'+p.id+'">Edit</button><button class="btn ghost sm" data-act="ptog" data-id="'+p.id+'">'+(p.hidden?"Show":"Hide")+'</button><button class="btn ghost sm" data-act="pdup" data-id="'+p.id+'">Duplicate</button></div></td></tr>'}).join("")+'</tbody></table></div><p class="sub" style="margin-top:10px">Showing '+vis.length+' of '+L.length+'. Hidden products disappear from the shop but are kept here, so old bags and orders still work.</p>'+(L.length>vis.length?'<div class="more"><button class="btn ghost" data-act="pmore" type="button">Show more</button></div>':""):'<div class="tw"><div class="empty">No products match.</div></div>'}
function productModal(id){var all=mtCatalog(),p=id==null?null:all[id];
ed={id:id,colors:p?p.colors.slice():[CN[0]],out:p?(p.out||[]).slice():[],imgs:p&&p.custom?p.pool.slice():[],cat:p?p.cat:"Dresses",prev:p?imgUrl(p,200):null};
openModal(mhead(p?"Edit product":"Add product")+'<form class="form" id="pf" novalidate><div class="g2"><label>Name<input id="f_n" required maxlength="80" value="'+esc(p?p.name:"")+'"></label><label>Category<select id="f_c">'+CATS.map(function(c){return'<option'+(c===ed.cat?" selected":"")+'>'+c+'</option>'}).join("")+'</select></label></div><div class="g3"><label>Price (£, incl. VAT)<input id="f_p" type="number" min="0.01" step="0.01" required value="'+(p?p.price:"")+'"></label><label>Label<select id="f_b">'+BADGES.map(function(b){return'<option value="'+b+'"'+(p&&p.badge===b?" selected":"")+'>'+(b||"None")+'</option>'}).join("")+'</select></label><label>Visibility<select id="f_h"><option value="0">Live in the shop</option><option value="1"'+(p&&p.hidden?" selected":"")+'>Hidden</option></select></label></div><label>Fabric / materials<input id="f_f" maxlength="120" value="'+esc(p?p.fabric:"")+'"></label><label>Description <small>(optional, otherwise a standard category text is shown)</small><textarea id="f_d" maxlength="600">'+esc(p&&p.desc?p.desc:"")+'</textarea></label><fieldset><legend>Colours</legend><div class="sw" id="f_cols"></div></fieldset><fieldset><legend>Sizes: tick any that are sold out</legend><div class="sizes" id="f_sz"></div></fieldset><fieldset><legend>Images</legend><div class="imgs" id="f_im"></div><div class="row"><input id="f_url" type="url" placeholder="Paste an image address (https://…)" aria-label="Image address"><button class="btn ghost" data-act="imgadd" type="button">Add</button></div><div class="row"><label class="chk"><span>Or upload from your computer:</span><input id="f_up" type="file" accept="image/*" multiple></label></div><small style="color:var(--mute)">First image is the main one. Up to 4. Uploaded photos are resized and kept in this browser only; for a live site use hosted image links.</small></fieldset><div class="err" id="f_err" role="alert"></div><div class="mf"><button class="btn ghost" data-act="close" type="button">Cancel</button><button class="btn" type="submit">'+(p?"Save changes":"Add product")+'</button></div></form>',1);
drawCols();drawSizes();drawImgs();
$("f_c").onchange=function(){ed.cat=this.value;ed.out=[];drawSizes()};
$("f_up").onchange=function(){var fs=[].slice.call(this.files);fs.forEach(function(f){if(ed.imgs.length>=4)return;readImage(f,900,function(d){if(ed.imgs.length<4){ed.imgs.push(d);drawImgs()}})});this.value=""};
$("pf").onsubmit=function(e){e.preventDefault();saveProduct()}}
function drawCols(){$("f_cols").innerHTML=CN.map(function(c){return'<button type="button" data-act="col" data-c="'+c+'" aria-pressed="'+(ed.colors.indexOf(c)>-1)+'"><i style="background:'+COL[c]+'"></i>'+c+'</button>'}).join("")}
function drawSizes(){$("f_sz").innerHTML=sizesFor(ed.cat).map(function(s){return'<label class="chk"><input type="checkbox" data-act="sz" value="'+esc(s)+'"'+(ed.out.indexOf(s)>-1?" checked":"")+'>'+esc(s)+'</label>'}).join("")}
function drawImgs(){$("f_im").innerHTML=ed.imgs.length?ed.imgs.map(function(u,i){return'<div class="im"><img alt="" src="'+esc(/^(https?:|data:)/.test(u)?u:"https://images.unsplash.com/"+u+"?auto=format&fit=crop&w=160&q=70")+'"><button type="button" data-act="imgdel" data-i="'+i+'" aria-label="Remove image">×</button></div>'}).join(""):(ed.prev?'<div class="im"><img alt="" src="'+esc(ed.prev)+'"></div><small style="align-self:center;color:var(--mute)">Using the default image for this category.<br>Add your own below to replace it.</small>':'<small style="color:var(--mute)">No images added yet: a default image for the category will be used.</small>')}
function saveProduct(){var er=$("f_err"),n=$("f_n").value.trim(),price=Math.round(parseFloat($("f_p").value)*100)/100;
if(!n){er.textContent="Please enter a product name.";return}
if(!(price>0)){er.textContent="Please enter a price greater than zero.";return}
if(!ed.colors.length){er.textContent="Choose at least one colour.";return}
var all=mtCatalog(),cat=ed.cat,p;
if(ed.id==null){p={id:all.length,sku:"MT-"+(1000+all.length*13),rating:"0",reviews:0,pool:POOL[cat],off:0};all.push(p)}else p=all[ed.id];
var wasCat=p.cat;p.name=n;p.cat=cat;p.price=price;p.fabric=$("f_f").value.trim()||"Natural fabric";p.desc=$("f_d").value.trim();p.badge=$("f_b").value;p.hidden=$("f_h").value==="1";p.colors=ed.colors.slice();p.sizes=sizesFor(cat);p.out=ed.out.filter(function(s){return p.sizes.indexOf(s)>-1});
if(ed.imgs.length){p.pool=ed.imgs.slice();p.off=0;p.custom=true}else if(!p.custom&&(wasCat!==cat||ed.id==null)){p.pool=POOL[cat];p.off=p.id%POOL[cat].length}else if(p.custom&&!ed.imgs.length){p.custom=false;p.pool=POOL[cat];p.off=p.id%POOL[cat].length}
if(save(K.cat,all)){closeModal();toast(ed.id==null?"Product added":"Product saved");vProducts()}}

/* ---------- messages ---------- */
function vMessages(){var M=arr(K.msg);
$("view").innerHTML=M.length?'<div class="tw"><table><thead><tr><th>From</th><th>Topic</th><th>Message</th><th>Received</th><th></th></tr></thead><tbody>'+M.map(function(m){return'<tr class="'+(m.read?"":"unread")+'"><td><b>'+esc(m.name)+'</b><br><small style="color:var(--mute)">'+esc(m.email)+'</small></td><td>'+esc(m.topic)+'</td><td>'+esc((m.msg||"").slice(0,70))+((m.msg||"").length>70?"…":"")+'</td><td>'+fdate(m.date,1)+'</td><td class="r"><button class="btn ghost sm" data-act="msg" data-id="'+esc(m.id)+'">Open</button></td></tr>'}).join("")+'</tbody></table></div>':'<div class="tw"><div class="empty">No messages yet. Messages sent through the Contact page appear here.</div></div>';bindView()}
function msgModal(id){var a=arr(K.msg),m=a.filter(function(x){return x.id===id})[0];if(!m)return;if(!m.read){m.read=true;save(K.msg,a);badges()}
openModal(mhead("Message from "+esc(m.name))+'<dl class="dl" style="margin-bottom:14px"><dt>Email</dt><dd>'+esc(m.email)+'</dd><dt>Topic</dt><dd>'+esc(m.topic)+'</dd><dt>Received</dt><dd>'+fdate(m.date,1)+'</dd></dl><div class="msg">'+esc(m.msg)+'</div><div class="mf"><button class="btn danger" data-act="mdel" data-id="'+esc(m.id)+'" type="button">Delete</button><a class="btn" href="mailto:'+esc(m.email)+'?subject='+encodeURIComponent("Re: "+m.topic+" – Maison Tempo")+'">Reply by email</a></div>');vMessages()}

/* ---------- subscribers ---------- */
var sq="";
function vSubs(){$("view").innerHTML='<div class="tb"><input type="search" id="sq" placeholder="Search emails" aria-label="Search subscribers" value="'+esc(sq)+'"><button class="btn ghost sp" data-act="sub-copy" type="button">Copy all emails</button><button class="btn" data-act="sub-exp" type="button">Export CSV</button></div><div id="slist"></div>';$("sq").oninput=function(){sq=this.value;slist()};slist();bindView()}
function slist(){var q=sq.trim().toLowerCase(),L=arr(K.sub).filter(function(s){return!q||s.email.toLowerCase().indexOf(q)>-1});
$("slist").innerHTML=L.length?'<div class="tw"><table><thead><tr><th>Email</th><th>Subscribed</th><th></th></tr></thead><tbody>'+L.map(function(s){return'<tr><td>'+esc(s.email)+'</td><td>'+fdate(s.date,1)+'</td><td class="r"><button class="btn ghost sm" data-act="sub-del" data-e="'+esc(s.email)+'">Remove</button></td></tr>'}).join("")+'</tbody></table></div><p class="sub" style="margin-top:10px">'+L.length+' subscriber'+(L.length===1?"":"s")+'. Import the CSV into Mailchimp, Klaviyo or similar to send emails.</p>':'<div class="tw"><div class="empty">No subscribers yet.</div></div>'}

/* ---------- settings ---------- */
var drafts=null;
function slideLinks(){var o=[["#/shop","All products"]].concat(CATS.map(function(c){return["#/shop/"+c,c==="Men"?"Menswear":c]})).concat([["#/about","About us"]]);return o}
function slideCard(s,i){return'<div class="slide" data-i="'+i+'"><h3>Slide '+(i+1)+'<button class="btn ghost sm" data-act="sl-del" data-i="'+i+'" type="button">Remove</button></h3><div class="g2"><label>Small heading<input class="s-k" maxlength="40" value="'+esc(s.k)+'"></label><label>Headline<input class="s-t" maxlength="60" value="'+esc(s.t)+'"></label></div><label>Text<input class="s-d" maxlength="160" value="'+esc(s.d)+'"></label><div class="g3"><label>Button text<input class="s-b" maxlength="30" value="'+esc(s.b)+'"></label><label>Button links to<select class="s-l">'+slideLinks().map(function(l){return'<option value="'+l[0]+'"'+(l[0]===s.l?" selected":"")+'>'+l[1]+'</option>'}).join("")+'</select></label><label>Fallback colour<input class="s-g" type="color" value="'+esc(/^#[0-9a-f]{6}$/i.test(s.bg)?s.bg:"#2c3440")+'" style="padding:2px;height:40px"></label></div><label>Image <small>(address https://… or an Unsplash photo id)</small><input class="s-i" value="'+esc(/^data:/.test(s.img)?"":s.img)+'" placeholder="'+(/^data:/.test(s.img)?"Uploaded image in use":"")+'"></label><label class="chk"><span>Or upload:</span><input type="file" accept="image/*" data-act="sl-up" data-i="'+i+'"></label>'+(/^data:/.test(s.img)?'<small style="color:var(--mute)">An uploaded image is in use. Typing an address above replaces it.</small>':'')+'</div>'}
function captureSlides(){if(!drafts)return;qsa(".slide[data-i]").forEach(function(c){var i=+c.dataset.i,s=drafts[i];if(!s)return;s.k=c.querySelector(".s-k").value;s.t=c.querySelector(".s-t").value;s.d=c.querySelector(".s-d").value;s.b=c.querySelector(".s-b").value;s.l=c.querySelector(".s-l").value;s.bg=c.querySelector(".s-g").value;var v=c.querySelector(".s-i").value.trim();if(v)s.img=v})}
function vSettings(){var st=mtSettings();if(!drafts)drafts=st.slides.map(function(s){return JSON.parse(JSON.stringify(s))});
$("view").innerHTML='<div class="card"><h2>Delivery</h2><p class="sub">Changes apply across the shop, bag and checkout.</p><div class="g3"><label>Free delivery over (£)<input id="s_free" type="number" min="0" step="1" value="'+st.free+'"></label><label>Standard delivery (£)<input id="s_std" type="number" min="0" step="0.05" value="'+st.std+'"></label><label>Next-day delivery (£)<input id="s_next" type="number" min="0" step="0.05" value="'+st.next+'"></label></div><div class="mf"><button class="btn" data-act="set-del" type="button">Save delivery</button></div></div>'+
'<div class="card"><h2>Announcement bar</h2><p class="sub">One message per line. They rotate across the top of the shop.</p><textarea id="s_ann">'+esc(st.ann.join("\n"))+'</textarea><div class="mf"><button class="btn" data-act="set-ann" type="button">Save announcements</button></div></div>'+
'<div class="card"><h2>Homepage slideshow</h2><p class="sub">Up to 6 slides. Use a wide, landscape photo for each.</p><div id="slides">'+drafts.map(slideCard).join("")+'</div><div class="mf"><button class="btn ghost" data-act="sl-add" type="button"'+(drafts.length>=6?" disabled":"")+'>+ Add slide</button><button class="btn ghost" data-act="sl-reset" type="button">Restore defaults</button><button class="btn" data-act="sl-save" type="button">Save slideshow</button></div></div>'+
'<div class="card"><h2>Admin login</h2><p class="sub">Choose your own username and a strong password (at least 8 characters).</p><form class="form" id="af" autocomplete="off"><div class="g3"><label>Current password<input id="a_old" type="password" autocomplete="current-password"></label><label>New username<input id="a_u" autocomplete="username" value="'+esc((mtLoad(K.auth,null)||{u:"admin"}).u)+'"></label><label>New password<input id="a_p" type="password" autocomplete="new-password"></label></div><div class="err" id="a_err" role="alert"></div><div class="mf"><button class="btn" type="submit">Update login</button></div></form></div>'+
'<div class="card"><h2>Data</h2><p class="sub">Everything is stored in this browser. Back it up regularly.</p><div class="mf" style="justify-content:flex-start"><button class="btn" data-act="bk-exp" type="button">Download backup</button><label class="btn ghost" style="display:inline-flex;cursor:pointer">Restore backup<input id="bk_in" type="file" accept="application/json" hidden></label><button class="btn ghost" data-act="demo" type="button">Load sample orders</button><button class="btn ghost" data-act="demo-del" type="button">Remove sample orders</button></div><div class="mf" style="justify-content:flex-start"><button class="btn danger" data-act="reset-cat" type="button">Reset products to defaults</button><button class="btn danger" data-act="clear-all" type="button">Clear orders, messages and subscribers</button></div></div>'+
'<div class="card"><h2>Before you go live</h2><ol class="cl"><li><b>This panel only works in the browser where customers placed their orders.</b> The shop and admin share data through that browser. To receive orders from real customers on any device, you need a small server and database (see the notes I gave you).</li><li><b>Admin login is not secure on its own.</b> Anyone who can open <code>admin.html</code> can read the files. Real protection has to come from a server.</li><li><b>Take real payments:</b> set up Stripe, then fill in <code>PAY_ENDPOINT</code> in <code>script.js</code>.</li><li><b>Replace the sample text</b> in Privacy and Terms, and the sample testimonials, with your real content.</li><li><b>Product photos:</b> the demo uses stock images. Add your own photos in Products.</li></ol></div>';
$("a_old").value="";$("af").onsubmit=function(e){e.preventDefault();changeLogin()};
var bi=$("bk_in");if(bi)bi.onchange=function(){restore(this.files[0]);this.value=""};
bindView()}
function changeLogin(){var er=$("a_err"),old=$("a_old").value,u=$("a_u").value.trim(),p=$("a_p").value,cr=mtLoad(K.auth,null);
if(!u||p.length<8){er.textContent="Enter a username and a new password of at least 8 characters.";return}
if(p==="admin"||p===u){er.textContent="Please choose a password that is not 'admin' or your username.";return}
Promise.all([hash(old),cr?cr.h:hash("admin")]).then(function(x){if(x[0]!==x[1]){er.textContent="Current password is incorrect.";return}
return hash(p).then(function(h){if(save(K.auth,{u:u,h:h})){toast("Login updated");route()}})})}
function backupObj(){return{app:"maison-tempo",version:1,exported:new Date().toISOString(),catalog:mtLoad(K.cat,null),orders:arr(K.ord),messages:arr(K.msg),subscribers:arr(K.sub),settings:mtLoad(K.set,{})}}
function restore(f){if(!f)return;var fr=new FileReader();fr.onload=function(){var b;try{b=JSON.parse(fr.result)}catch(e){toast("That file is not a valid backup.",1);return}
if(!b||b.app!=="maison-tempo"||!Array.isArray(b.orders)){toast("That file is not a Maison Tempo backup.",1);return}
if(b.catalog&&!(Array.isArray(b.catalog)&&b.catalog.length&&b.catalog.every(function(p){return p&&typeof p.name==="string"&&POOL[p.cat]&&+p.price>=0&&Array.isArray(p.colors)&&Array.isArray(p.sizes)&&Array.isArray(p.pool)&&p.pool.length}))){toast("That backup has a damaged product list, so nothing was changed.",1);return}
if(!confirm("Replace the current products, orders, messages, subscribers and settings with this backup?"))return;
if(b.catalog)save(K.cat,b.catalog);else localStorage.removeItem(K.cat);save(K.ord,b.orders);save(K.msg,b.messages||[]);save(K.sub,b.subscribers||[]);save(K.set,b.settings||{});drafts=null;toast("Backup restored");route()};fr.readAsText(f)}
function demoOrders(){var P=mtCatalog().filter(function(p){return!p.hidden}),N=[["Amelia","Reed","Bristol","BS1 4DJ"],["James","Turner","Leeds","LS1 5AB"],["Priya","Shah","London","E1 6AN"],["Oliver","Hughes","Manchester","M1 2WD"],["Sophie","Clarke","Edinburgh","EH1 1YZ"],["Noah","Patel","Birmingham","B2 4QA"],["Grace","Evans","Cardiff","CF10 1EP"]],out=[],i;
for(i=0;i<12;i++){var n=N[i%N.length],its=[],k=1+i%3,j,sub=0;for(j=0;j<k;j++){var p=P[(i*5+j*7)%P.length],sz=p.sizes[0]==="One size"?"One size":p.sizes[(i+j)%p.sizes.length];if(p.out&&p.out.indexOf(sz)>-1)sz=p.sizes[p.sizes.length-1];var q=1+(j===0&&i%4===0?1:0);its.push({name:p.name,sku:p.sku,color:p.colors[0],size:sz,qty:q,unit_amount_pence:Math.round(p.price*100)});sub+=p.price*q}
var ship=sub>=mtSettings().free?0:mtSettings().std,d=new Date();d.setDate(d.getDate()-Math.floor(i*1.2));d.setHours(9+i%9,(i*17)%60);
out.push({ref:"MT-S"+(9000+i),created:d.toISOString(),email:n[0].toLowerCase()+"@example.com",name:n[0],last:n[1],phone:"07700 900"+(100+i),addr:{a1:(10+i)+" Sample Road",a2:"",city:n[2],pc:n[3]},total:sub+ship,subtotal:sub,shipping:ship,delivery:"Standard UK (Royal Mail Tracked 48)",pay:"card",items:its,status:i<3?"New":(i<6?"Processing":(i<9?"Shipped":"Delivered")),sample:true,demo:false,currency:"gbp"})}
return out}

/* ---------- delegated events ---------- */
function bindView(){}
document.addEventListener("click",function(e){var t=e.target.closest("[data-act]");if(!t||!authed())return;var a=t.dataset.act,id=t.dataset.id;
if(t.tagName==="SELECT"||t.tagName==="INPUT"&&t.type!=="checkbox")return;
switch(a){
case"close":closeModal();break;
case"order":orderModal(id);break;
case"osave":{var st=$("ods").value,nt=$("odn").value.trim();if(setOrder(id,function(o){o.status=st;o.note=nt})){closeModal();toast("Order updated");badges();VIEWS[cur][1]()}break}
case"odel":if(confirm("Delete order "+id+"? This cannot be undone.")){save(K.ord,arr(K.ord).filter(function(o){return o.ref!==id}));closeModal();toast("Order deleted");badges();VIEWS[cur][1]()}break;
case"exp-orders":{var rows=[["Order","Date","Name","Email","Phone","Address","Delivery","Payment","Items","Total GBP","Status"]];arr(K.ord).forEach(function(o){rows.push([o.ref,o.created,ocust(o),o.email,o.phone||"",oaddr(o),o.delivery,o.demo?"demo":o.pay,(o.items||[]).map(function(i){return i.qty+" x "+i.name+" ("+i.color+(i.size?" "+i.size:"")+")"}).join("; "),(+o.total).toFixed(2),o.status])});download("orders.csv",rows.map(function(r){return r.map(csvCell).join(",")}).join("\r\n"));break}
case"padd":productModal(null);break;
case"pedit":productModal(+id);break;
case"pmore":pn+=15;plist();break;
case"ptog":{var c=mtCatalog();c[+id].hidden=!c[+id].hidden;if(save(K.cat,c)){toast(c[+id].hidden?"Product hidden":"Product is live");plist()}break}
case"pdup":{var c2=mtCatalog(),s=JSON.parse(JSON.stringify(c2[+id]));s.id=c2.length;s.name+=" (copy)";s.sku="MT-"+(1000+s.id*13);s.hidden=true;s.reviews=0;s.rating="0";c2.push(s);if(save(K.cat,c2)){toast("Duplicated as a hidden product");plist()}break}
case"col":{var cn=t.dataset.c,ix=ed.colors.indexOf(cn);if(ix>-1)ed.colors.splice(ix,1);else ed.colors.push(cn);drawCols();break}
case"imgadd":{var u=$("f_url").value.trim();if(!/^https?:\/\/\S+$/i.test(u)){toast("Enter a full image address starting with https://",1);break}if(ed.imgs.length>=4){toast("You can add up to 4 images.",1);break}ed.imgs.push(u);$("f_url").value="";drawImgs();break}
case"imgdel":ed.imgs.splice(+t.dataset.i,1);drawImgs();break;
case"msg":msgModal(id);break;
case"mdel":if(confirm("Delete this message?")){save(K.msg,arr(K.msg).filter(function(m){return m.id!==id}));closeModal();toast("Message deleted");badges();vMessages()}break;
case"sub-copy":{var em=arr(K.sub).map(function(s){return s.email}).join(", ");if(!em){toast("No subscribers yet",1);break}if(navigator.clipboard)navigator.clipboard.writeText(em).then(function(){toast("Emails copied")},function(){toast("Copy failed",1)});break}
case"sub-exp":{var r2=[["Email","Subscribed"]].concat(arr(K.sub).map(function(s){return[s.email,s.date]}));download("subscribers.csv",r2.map(function(r){return r.map(csvCell).join(",")}).join("\r\n"));break}
case"sub-del":save(K.sub,arr(K.sub).filter(function(s){return s.email!==t.dataset.e}));slist();toast("Subscriber removed");break;
case"set-del":{var f=parseFloat($("s_free").value),s1=parseFloat($("s_std").value),n=parseFloat($("s_next").value);if([f,s1,n].some(function(x){return isNaN(x)||x<0})){toast("Enter valid amounts (0 or more).",1);break}var o=mtLoad(K.set,{});o.free=f;o.std=s1;o.next=n;if(save(K.set,o))toast("Delivery saved");break}
case"set-ann":{var l=$("s_ann").value.split("\n").map(function(x){return x.trim()}).filter(Boolean).slice(0,6);var o2=mtLoad(K.set,{});o2.ann=l;if(save(K.set,o2))toast("Announcements saved");break}
case"sl-add":captureSlides();if(drafts.length<6){drafts.push({img:"photo-1441986300917-64674bd600d8",bg:"#2c3440",k:"New",t:"New headline",d:"Describe this slide.",l:"#/shop",b:"Shop now"});vSettings()}break;
case"sl-del":captureSlides();if(drafts.length<=1){toast("Keep at least one slide.",1);break}drafts.splice(+t.dataset.i,1);vSettings();break;
case"sl-reset":if(confirm("Restore the original four slides?")){drafts=null;var o3=mtLoad(K.set,{});delete o3.slides;save(K.set,o3);vSettings();toast("Slides restored")}break;
case"sl-save":{captureSlides();var bad=drafts.some(function(s){return!s.t.trim()});if(bad){toast("Every slide needs a headline.",1);break}var o4=mtLoad(K.set,{});o4.slides=drafts;if(save(K.set,o4))toast("Slideshow saved");break}
case"bk-exp":download("maison-tempo-backup-"+new Date().toISOString().slice(0,10)+".json",JSON.stringify(backupObj(),null,1),"application/json");break;
case"demo":{var cur2=arr(K.ord).filter(function(o){return!o.sample});if(save(K.ord,demoOrders().concat(cur2))){toast("Sample orders added");badges();vSettings()}break}
case"demo-del":save(K.ord,arr(K.ord).filter(function(o){return!o.sample}));toast("Sample orders removed");badges();break;
case"reset-cat":if(confirm("Discard all product changes and go back to the original catalogue?")){localStorage.removeItem(K.cat);toast("Products reset")}break;
case"clear-all":if(confirm("Delete ALL orders, messages and subscribers? This cannot be undone.")){save(K.ord,[]);save(K.msg,[]);save(K.sub,[]);toast("Cleared");badges()}break;
}});
document.addEventListener("change",function(e){var t=e.target;if(!authed())return;
if(t.dataset.act==="ostatus"){if(setOrder(t.dataset.id,function(o){o.status=t.value})){toast("Status updated to "+t.value);badges()}}
else if(t.dataset.act==="sz"){var v=t.value,i=ed.out.indexOf(v);if(t.checked&&i<0)ed.out.push(v);if(!t.checked&&i>-1)ed.out.splice(i,1)}
else if(t.dataset.act==="sl-up"){var ix=+t.dataset.i;captureSlides();readImage(t.files[0],1600,function(d){drafts[ix].img=d;vSettings();toast("Image added. Remember to save the slideshow.")})}});

/* ---------- boot ---------- */
if(authed())start();
})();
