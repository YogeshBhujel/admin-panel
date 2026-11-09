var NOTE={Dresses:"Cut with a flattering drape that moves with you. Fully lined where needed, with a hidden side zip or easy pull-on shape.",Tops:"A wardrobe staple with a clean neckline and a relaxed, easy fit. Wears well on its own or layered.",Knitwear:"Soft, breathable and warm without bulk. Fully fashioned for a smooth shape that holds after washing.",Bottoms:"Designed with a considered rise and a fit that works from morning to evening. Side pockets included.",Outerwear:"A layer built to last. Reinforced seams, quality hardware and a silhouette that sits well over knitwear.",Men:"A modern, comfortable fit with refined details. Pre-washed for softness and minimal shrinkage.",Shoes:"Handcrafted on a comfortable last with a cushioned insole. Order your usual size; half sizes should size up.",Bags:"Spacious, structured and carefully finished. Inner pocket and secure closure, with reinforced stitching at stress points.",Accessories:"A finishing detail made to be worn every day, finished to the same standard as our clothing."};
var CARE={Dresses:"Machine wash cold on a gentle cycle or dry clean. Line dry. Warm iron.",Tops:"Machine wash cold. Line dry. Cool iron if needed.",Knitwear:"Hand wash cool or use the wool cycle. Dry flat. Do not tumble dry.",Bottoms:"Machine wash cold, inside out. Line dry. Warm iron.",Outerwear:"Spot clean or dry clean. Air out between wears.",Men:"Machine wash cold. Line dry. Warm iron.",Shoes:"Wipe clean with a soft cloth. Use a leather or suede care product. Store with shoe trees.",Bags:"Wipe with a damp cloth. Keep away from prolonged moisture. Store stuffed in the dust bag.",Accessories:"Spot clean only. Store flat and away from direct sunlight."};
/* ===== STORE SETTINGS ===== */
var ST=mtSettings(),FREE=ST.free,VAT=0.2,PAGE=12;
var DELIVERY=[{id:"std",name:"Standard UK (Royal Mail Tracked 48)",sub:"2–4 working days",cost:ST.std},{id:"next",name:"Next working day",sub:"Order by 2pm",cost:ST.next},{id:"click",name:"Click and collect",sub:"12 Linden Street, London E1 6AN. Ready in 2 hours",cost:0}];
/* To take real payments, host a small server that creates a Stripe Checkout Session (currency "gbp") and returns {"url": "..."} then set PAY_ENDPOINT to its address. Leave it empty to use demo mode (no payment is taken). */
var PAY_ENDPOINT="";
var lastOrder=null;
var CAT2=CAT.concat(["Saved"]);
var HOME_TITLE="Maison Tempo – Considered clothing for everyday life";
var IC={heart:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21.2l7.8-7.7 1-1.1a5.5 5.5 0 0 0 0-7.8z"/></svg>'};

/* ===== helpers ===== */
var $=function(i){return document.getElementById(i)};
function qs(s,r){return(r||document).querySelector(s)}
function qsa(s,r){return[].slice.call((r||document).querySelectorAll(s))}
function money(n){return"£"+n.toFixed(2).replace(/\.00$/,"")}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
var load=mtLoad;
var store=mtStore;

/* ===== products ===== */
var P=mtCatalog();
var cart=load("mt_cart",[]),wish=load("mt_wish",[]);
if(!Array.isArray(cart))cart=[];if(!Array.isArray(wish))wish=[];
cart=cart.filter(function(c){return c&&P[c.id]&&!P[c.id].hidden});
function save(){store("mt_cart",cart)}

/* ===== images (with graceful fallbacks) ===== */
function src(p,k,w){var x=p.pool[(p.off+k)%p.pool.length];if(/^(https?:|data:)/.test(x))return x;return"https://images.unsplash.com/"+x+"?auto=format&fit=crop&w="+(w||700)+"&q=75&sig="+p.id}
function ph(name){var s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"><rect width="400" height="500" fill="#d6dad4"/><text x="200" y="260" text-anchor="middle" font-family="Georgia,serif" font-size="26" fill="#6a6f72">'+name.replace(/&/g,"")+'</text></svg>';return"data:image/svg+xml;utf8,"+encodeURIComponent(s)}
function imgTag(p,k,w,eager){return'<img class="pi"'+(eager?'':' loading="lazy"')+' decoding="async" src="'+src(p,k,w)+'" alt="'+esc(p.name)+'" data-p="'+p.id+'" data-k="'+k+'" data-t="0" data-w="'+(w||700)+'" onload="this.classList.add(\'ld\')" onerror="fb(this)">'}
function fb(el){var p=P[el.dataset.p],t=+el.dataset.t+1;el.dataset.t=t;if(t<p.pool.length){el.src=src(p,+el.dataset.k+t,+el.dataset.w)}else{el.onerror=null;el.src=ph(p.name)}}

/* ===== layers: modal / drawer / menu / search (focus trap + restore) ===== */
var layer=null,lastFocus=null;
function openLayer(el,focusEl){
if(layer!==el){if(!layer)lastFocus=document.activeElement;qsa(".layer.on").forEach(function(x){if(x!==el)x.classList.remove("on")})}
layer=el;$("ov").classList.add("on");el.classList.add("on");document.body.classList.add("lock");
$("burger").setAttribute("aria-expanded",el.id==="mnav");
setTimeout(function(){try{(focusEl||el).focus({preventScroll:true})}catch(e){}},40)}
function closeAll(noRestore){
var open=qsa(".layer.on");open.forEach(function(x){x.classList.remove("on")});
$("ov").classList.remove("on");document.body.classList.remove("lock");$("burger").setAttribute("aria-expanded","false");layer=null;
if(open.length&&!noRestore&&lastFocus&&lastFocus.focus){try{lastFocus.focus({preventScroll:true})}catch(e){}}}
document.addEventListener("keydown",function(e){
if(e.key==="Escape"){closeAll();return}
if(e.key==="Tab"&&layer){var f=qsa('a[href],button:not([disabled]):not([tabindex="-1"]),input,select,textarea,summary',layer).filter(function(x){return x.offsetParent!==null});if(!f.length)return;var a=f[0],b=f[f.length-1];
if(e.shiftKey&&(document.activeElement===a||document.activeElement===layer)){e.preventDefault();b.focus()}else if(!e.shiftKey&&document.activeElement===b){e.preventDefault();a.focus()}}
if(layer&&layer.id==="modal"&&cur&&(e.key==="ArrowRight"||e.key==="ArrowLeft")){var n=Math.min(4,cur.pool.length);setImg((gi+(e.key==="ArrowRight"?1:n-1))%n)}});
$("ov").onclick=function(){closeAll()};$("dx").onclick=function(){closeAll()};$("mx2").onclick=function(){closeAll()};$("sx").onclick=function(){closeAll()};

/* ===== wishlist ===== */
function heart(id,name,cls){return'<button class="heart'+(cls?" "+cls:"")+'" data-id="'+id+'" aria-pressed="'+(wish.indexOf(id)>-1)+'" aria-label="Save '+esc(name)+' to wishlist">'+IC.heart+'</button>'}
function updWish(){$("wn").textContent=wish.length;$("wn").classList.toggle("on",wish.length>0);var c=qs('.chip[data-c="Saved"]');if(c)c.textContent="Saved ("+wish.length+")"}
function toggleWish(id){var i=wish.indexOf(id),on=i<0;if(on)wish.push(id);else wish.splice(i,1);store("mt_wish",wish);
qsa('.heart[data-id="'+id+'"]').forEach(function(b){b.setAttribute("aria-pressed",on)});updWish();
toast(on?P[id].name+" saved to your wishlist":"Removed from your wishlist");if(state.cat==="Saved"&&!on)refresh()}

/* ===== toast ===== */
function toast(m){var t=$("toast");t.textContent=m;t.classList.add("on");clearTimeout(toast.h);toast.h=setTimeout(function(){t.classList.remove("on")},2400)}

/* ===== product card, grid, rail ===== */
var state={cat:"All",q:"",sort:"feat",color:"",shown:PAGE};
function card(p,i){
var cols=p.colors.slice(0,4).map(function(c){return'<i style="background:'+COL[c]+'" title="'+c+'"></i>'}).join("")+(p.colors.length>4?'<em>+'+(p.colors.length-4)+'</em>':"");
return'<article class="card" style="--i:'+(i%PAGE)+'"><div class="im"><button class="pvb" data-pv="'+p.id+'" aria-label="View '+esc(p.name)+'">'+imgTag(p,0,600)+'<img class="pi alt" alt="" aria-hidden="true" data-p="'+p.id+'" data-k="1" data-t="0" data-w="600" data-src="'+src(p,1,600)+'" onload="this.classList.add(\'ld\')" onerror="fb(this)"></button>'+(p.badge?'<span class="badge">'+p.badge+'</span>':'')+heart(p.id,p.name)+'<button class="qv" data-pv="'+p.id+'" tabindex="-1" aria-hidden="true">Quick view</button></div><div class="cm"><div class="nm"><button data-pv="'+p.id+'">'+esc(p.name)+'</button></div><div class="row"><span>'+p.cat+'</span><span class="pr">'+money(p.price)+'</span></div><div class="sw">'+cols+'</div></div></article>'}
function list(){var l=P.filter(function(p){
var inCat=state.cat==="Saved"?wish.indexOf(p.id)>-1:(state.cat==="All"||p.cat===state.cat);
return !p.hidden&&inCat&&(!state.color||p.colors.indexOf(state.color)>-1)&&(!state.q||hay(p).indexOf(state.q)>-1)});
if(state.sort==="lo")l.sort(function(a,b){return a.price-b.price});if(state.sort==="hi")l.sort(function(a,b){return b.price-a.price});if(state.sort==="top")l.sort(function(a,b){return b.rating-a.rating});return l}
function hay(p){return(p.name+" "+p.cat+" "+p.fabric+" "+p.colors.join(" ")).toLowerCase()}
function render(append){var l=list(),vis=l.slice(0,state.shown),from=append?state.shown-PAGE:0,grid=$("grid");
$("count").textContent=l.length+" product"+(l.length===1?"":"s")+(l.length>vis.length?" · showing "+vis.length:"");
if(!l.length){grid.innerHTML='<div class="empty">'+(state.cat==="Saved"?"You have not saved anything yet. Tap the heart on any product to keep it here.":"No products match your filters. Try another word, colour or category.")+'</div>'}
else if(append){grid.insertAdjacentHTML("beforeend",l.slice(from,state.shown).map(card).join(""))}
else{grid.innerHTML=vis.map(card).join("")}
var more=$("more");more.hidden=l.length<=vis.length;more.textContent="Show more ("+(l.length-vis.length)+" remaining)"}
function refresh(){state.shown=PAGE;render()}
function setCat(c){state.cat=c;qsa(".chip").forEach(function(x){x.setAttribute("aria-pressed",x.dataset.c===c)});$("shoph").textContent=c==="All"?"Shop all":c==="Saved"?"Saved items":c;refresh()}
function buildShopUI(){
$("chips").innerHTML=CAT2.map(function(c){return'<button class="chip" data-c="'+c+'" aria-pressed="'+(c==="All")+'">'+(c==="Saved"?"Saved ("+wish.length+")":c)+'</button>'}).join("");
$("color").innerHTML='<option value="">All colours</option>'+CN.map(function(c){return'<option>'+c+'</option>'}).join("");
$("shopsub").textContent=P.filter(function(p){return!p.hidden}).length+" pieces. Select any item to see sizes, colours, fabric and care.";
$("chips").onclick=function(e){var b=e.target.closest(".chip");if(b)setCat(b.dataset.c)};
$("q").oninput=function(){state.q=this.value.trim().toLowerCase();refresh()};
$("sort").onchange=function(){state.sort=this.value;refresh()};
$("color").onchange=function(){state.color=this.value;refresh()};
$("more").onclick=function(){state.shown+=PAGE;render(true)};
$("rail").innerHTML=P.filter(function(p){return p.badge&&!p.hidden}).slice(0,12).map(card).join("");
$("railp").onclick=function(){var r=$("rail");r.scrollBy({left:-r.clientWidth*.8,behavior:"smooth"})};
$("railn").onclick=function(){var r=$("rail");r.scrollBy({left:r.clientWidth*.8,behavior:"smooth"})}}
/* load the hover image only when someone hovers or focuses a card */
function hoverImg(e){var im=e.target.closest&&e.target.closest(".im");if(!im)return;var a=im.querySelector("img.alt[data-src]");if(a){a.src=a.dataset.src;a.removeAttribute("data-src")}}
document.addEventListener("mouseover",hoverImg);document.addEventListener("focusin",hoverImg);

/* ===== product modal ===== */
var cur=null,sel={},gi=0;
function sizeLabel(p,s){return p.cat==="Shoes"?"UK "+s+" (EU "+EU[s]+")":s+(SN[s]?" ("+(p.cat==="Men"?SN[s].split(",")[0]:SN[s])+")":"")}
function addWD(d,n){var x=new Date(d);while(n>0){x.setDate(x.getDate()+1);var w=x.getDay();if(w!==0&&w!==6)n--}return x}
function eta(){var f=function(d){return d.toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short"})};return f(addWD(new Date(),2))+" – "+f(addWD(new Date(),4))}
function setImg(k){gi=k;$("main").innerHTML=imgTag(cur,k,1000,true);qsa(".thumbs button").forEach(function(x){x.setAttribute("aria-current",+x.dataset.k===k)})}
function openP(id){var p=P[id];cur=p;gi=0;sel={color:p.colors[0],size:p.sizes.length===1?p.sizes[0]:null,qty:1};
var n=Math.min(4,p.pool.length),one=p.sizes.length===1,thumbs="",i;
for(i=0;i<n;i++)thumbs+='<button data-k="'+i+'" aria-label="View image '+(i+1)+'" aria-current="'+(i===0)+'">'+imgTag(p,i,200)+'</button>';
var rel=[];for(i=1;rel.length<4&&i<P.length;i++){var x=P[(p.id+i)%P.length];if(x.cat===p.cat&&!x.hidden)rel.push(x)}
var sizeGuide=p.cat==="Shoes"?'<tr><th>UK</th><th>EU</th><th>Foot (cm)</th></tr><tr><td>3</td><td>36</td><td>22.8</td></tr><tr><td>5</td><td>38</td><td>24.1</td></tr><tr><td>7</td><td>41</td><td>26.0</td></tr><tr><td>9</td><td>43</td><td>27.3</td></tr>':'<tr><th>Size</th><th>UK</th><th>Chest</th><th>Waist</th><th>Hip</th></tr><tr><td>XS</td><td>6–8</td><td>82</td><td>64</td><td>88</td></tr><tr><td>S</td><td>10</td><td>88</td><td>70</td><td>94</td></tr><tr><td>M</td><td>12</td><td>94</td><td>76</td><td>100</td></tr><tr><td>L</td><td>14</td><td>100</td><td>82</td><td>106</td></tr><tr><td>XL</td><td>16</td><td>106</td><td>88</td><td>112</td></tr><tr><td>XXL</td><td>18</td><td>112</td><td>94</td><td>118</td></tr>';
$("modal").innerHTML='<button class="x" id="mx" aria-label="Close">×</button><div class="mgrid"><div class="gal"><div class="main" id="main">'+imgTag(p,0,1000,true)+'</div><div class="thumbs">'+thumbs+'</div></div>'+
'<div class="info"><div class="cat">'+p.cat+' · SKU '+p.sku+'</div><h2>'+esc(p.name)+'</h2>'+(p.reviews>0?'<div class="rate"><b>★★★★★</b> '+p.rating+' ('+p.reviews+' reviews)</div>':'')+'<div class="price">'+money(p.price)+'</div><p class="desc">'+(p.desc||NOTE[p.cat])+'</p>'+
'<div class="lbl"><span>Colour: <span id="cn">'+sel.color+'</span></span></div><div class="colors" id="colors">'+p.colors.map(function(c,i){return'<button data-c="'+c+'" style="background:'+COL[c]+'" aria-label="'+c+'" aria-pressed="'+(i===0)+'"></button>'}).join("")+'</div>'+
(one?'<div class="lbl"><span>Size: One size</span></div>':'<div class="lbl"><span>Size: <span id="sn">select a size</span></span><button id="sg">Size guide</button></div><div class="sizes" id="sizes">'+p.sizes.map(function(s){var o=p.out.indexOf(s)>-1;return'<button data-s="'+s+'"'+(o?' disabled title="Sold out"':'')+' aria-pressed="false">'+s+'</button>'}).join("")+'</div><div class="guide" id="guide"><table>'+sizeGuide+'</table></div>')+
'<div class="buy"><div class="qty"><button id="qm" aria-label="Decrease">−</button><span id="qv">1</span><button id="qp" aria-label="Increase">+</button></div><button class="btn" id="add">Add to bag</button>'+heart(p.id,p.name,"hb")+'</div><div class="err" id="err" role="alert"></div><div class="stock">In stock · Ships in 1–2 working days</div><div class="eta">Estimated delivery: <b>'+eta()+'</b></div>'+
'<div style="margin-top:20px"><details open><summary>Description</summary><p>'+esc(p.name)+' in '+p.fabric.toLowerCase()+'. '+(p.desc||NOTE[p.cat])+'</p></details><details><summary>Materials and care</summary><ul><li>'+p.fabric+'</li><li>'+CARE[p.cat]+'</li></ul></details><details><summary>Fit and details</summary><ul><li>'+(p.cat==="Shoes"?"True to size, medium width":p.cat==="Bags"||p.cat==="Accessories"?"Dimensions listed on the care card inside the dust bag":"Model is 175 cm and wears size S. Sizes run XS to XXL")+'</li><li>Designed in small runs and made in partner ateliers</li></ul></details><details><summary>Shipping and returns</summary><p>Free standard UK delivery on orders over '+money(FREE)+'. Next-day delivery available at checkout. Free returns within 30 days on unworn items with tags. All prices include VAT.</p></details></div>'+
(rel.length?'<h3 class="relh">Complete the look</h3><div class="relg">'+rel.map(function(r){return'<button class="mini" data-pv="'+r.id+'"><span class="th">'+imgTag(r,0,240)+'</span><b>'+esc(r.name)+'</b><span class="p">'+money(r.price)+'</span></button>'}).join("")+'</div>':"")+
'</div></div>';
openLayer($("modal"),$("mx"));$("modal").scrollTop=0}
$("modal").onclick=function(e){var t=e.target;
if(t.closest&&t.closest(".main")&&matchMedia("(hover:hover)").matches){var m=t.closest(".main");m.classList.toggle("z");return}
var b=t.closest("button");if(!b)return;
if(b.id==="mx")return closeAll();
if(b.closest(".thumbs")){return setImg(+b.dataset.k)}
if(b.closest("#colors")){sel.color=b.dataset.c;$("cn").textContent=sel.color;qsa("#colors button").forEach(function(x){x.setAttribute("aria-pressed",x===b)});return}
if(b.closest("#sizes")&&!b.disabled){sel.size=b.dataset.s;$("sn").textContent=sizeLabel(cur,sel.size);$("err").textContent="";qsa("#sizes button").forEach(function(x){x.setAttribute("aria-pressed",x===b)});return}
if(b.id==="sg")return $("guide").classList.toggle("on");
if(b.id==="qm"&&sel.qty>1)$("qv").textContent=--sel.qty;
if(b.id==="qp"&&sel.qty<10)$("qv").textContent=++sel.qty;
if(b.id==="add"){if(!sel.size){$("err").textContent="Please select a size.";return}
var key=cur.id+"|"+sel.color+"|"+sel.size,f=cart.filter(function(c){return c.key===key})[0];
if(f)f.qty=Math.min(10,f.qty+sel.qty);else cart.push({key:key,id:cur.id,color:sel.color,size:sel.size,qty:sel.qty});
save();updCart();openCart();toast(cur.name+" added to your bag")}};
/* hover zoom on the main product image (mouse devices) */
$("modal").addEventListener("mousemove",function(e){var m=e.target.closest&&e.target.closest(".main");if(!m||!m.classList.contains("z"))return;var r=m.getBoundingClientRect(),im=m.querySelector("img");if(im)im.style.transformOrigin=((e.clientX-r.left)/r.width*100)+"% "+((e.clientY-r.top)/r.height*100)+"%"});
$("modal").addEventListener("mouseleave",function(){var m=qs(".main.z",$("modal"));if(m)m.classList.remove("z")});

/* ===== bag ===== */
function updCart(){var n=0,s=0;cart.forEach(function(c){n+=c.qty;s+=c.qty*P[c.id].price});
$("n").textContent=n;$("n").classList.toggle("on",n>0);$("sub").textContent=money(s);
var left=FREE-s;$("fsp").innerHTML=cart.length?'<p>'+(left>0?"You are <b>"+money(left)+"</b> away from free UK delivery":"<b>You have unlocked free UK delivery</b>")+'</p><div class="bar2"><i style="width:'+Math.min(100,s/FREE*100)+'%"></i></div>':"";
$("items").innerHTML=cart.length?cart.map(function(c,i){var p=P[c.id];return'<div class="it"><div class="th">'+imgTag(p,0,200)+'</div><div><button class="nm2" data-pv="'+p.id+'">'+esc(p.name)+'</button><small>'+c.color+(c.size!=="One size"?" · "+c.size:"")+'</small><div class="q"><button data-a="m" data-i="'+i+'" aria-label="Decrease">−</button><span>'+c.qty+'</span><button data-a="p" data-i="'+i+'" aria-label="Increase">+</button></div><br><button class="rm" data-a="r" data-i="'+i+'">Remove</button></div><div>'+money(p.price*c.qty)+'</div></div>'}).join(""):'<p style="color:var(--mute);padding:30px 0">Your bag is empty. Choose something from the shop.</p>'}
$("items").onclick=function(e){var b=e.target.closest("button");if(!b||b.dataset.a==null)return;var i=+b.dataset.i,a=b.dataset.a;
if(a==="p")cart[i].qty=Math.min(10,cart[i].qty+1);if(a==="m")cart[i].qty--;if(a==="r"||cart[i].qty<1)cart.splice(i,1);save();updCart()};
function openCart(){openLayer($("drawer"),$("dx"))}
$("bagbtn").onclick=openCart;
$("co").onclick=function(){if(!cart.length){toast("Your bag is empty.");return}location.hash="#/checkout"};
$("cont").onclick=function(){closeAll(true);location.hash="#/shop"};

/* ===== search ===== */
function openSearch(){openLayer($("srch"),$("sq"));$("sq").value="";renderRes("")}
function renderRes(v){v=v.trim().toLowerCase();var el=$("res");$("pop").hidden=!!v;
if(!v){el.innerHTML="";return}
var r=P.filter(function(p){return !p.hidden&&hay(p).indexOf(v)>-1});
el.innerHTML=r.length?r.slice(0,6).map(function(p){return'<button class="rs" data-pv="'+p.id+'"><span class="th">'+imgTag(p,0,160)+'</span><span><b>'+esc(p.name)+'</b><small>'+p.cat+' · '+money(p.price)+'</small></span></button>'}).join("")+'<a class="all" href="#/shop" id="seeall">See all '+r.length+' result'+(r.length===1?"":"s")+'</a>':'<p class="none">No results for “'+esc(v)+'”. Try “linen”, “merino” or “coat”.</p>'}
$("sbtn").onclick=openSearch;
$("sq").oninput=function(){renderRes(this.value)};
$("sf").onsubmit=function(e){e.preventDefault();goSearch($("sq").value)};
$("pop").onclick=function(e){var b=e.target.closest("button");if(!b)return;$("sq").value=b.dataset.q;renderRes(b.dataset.q);$("sq").focus()};
function goSearch(v){state.q=v.trim().toLowerCase();$("q").value=v.trim();keepQ=true;closeAll(true);if(location.hash==="#/shop")route();else location.hash="#/shop"}
$("res").addEventListener("click",function(e){if(e.target.id==="seeall"){e.preventDefault();goSearch($("sq").value)}});
$("burger").onclick=function(){openLayer($("mnav"),$("mx2"))};

/* ===== global click handling ===== */
document.addEventListener("click",function(e){
var h=e.target.closest(".heart");if(h){toggleWish(+h.dataset.id);return}
var o=e.target.closest("[data-pv]");if(o){openP(+o.dataset.pv);return}
var a=e.target.closest('a[href^="#/"]');if(!a)return;
if(a.closest(".mega"))$("hdr").classList.add("nomega");
if(a.getAttribute("href")===location.hash){e.preventDefault();route()}});
$("hdr").addEventListener("mouseleave",function(){this.classList.remove("nomega")});

/* ===== header, back-to-top, scroll reveal, announcement ===== */
var tb=$("toTop");
function onScroll(){var y=window.pageYOffset;$("hdr").classList.toggle("stuck",y>40);tb.classList.toggle("on",y>900)}
window.addEventListener("scroll",onScroll,{passive:true});onScroll();
tb.onclick=function(){window.scrollTo({top:0,behavior:"smooth"})};
function initReveal(){var els=qsa(".rv");if(!("IntersectionObserver" in window)){els.forEach(function(x){x.classList.add("in")});return}
var io=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting){x.target.classList.add("in");io.unobserve(x.target)}})},{rootMargin:"0px 0px -8% 0px",threshold:.08});els.forEach(function(x){io.observe(x)})}
(function(){var m=ST.ann,el=$("annin");
el.innerHTML=m.map(function(t,i){return'<span'+(i?'':' class="on"')+'>'+t+'</span>'}).join("");
var s=qsa("span",el),k=0;setInterval(function(){s[k].classList.remove("on");k=(k+1)%s.length;s[k].classList.add("on")},4200)})();

function mtSub(e){var a=mtLoad("mt_subs",[]);if(!Array.isArray(a))a=[];if(a.some(function(x){return x.email.toLowerCase()===e.toLowerCase()}))return;a.unshift({email:e,date:new Date().toISOString()});mtStore("mt_subs",a)}
/* ===== newsletter (demo: connect to Mailchimp, Klaviyo or similar) ===== */
$("nf").onsubmit=function(e){e.preventDefault();var v=this.elements.email.value.trim();
if(!/^\S+@\S+\.\S+$/.test(v)){$("nerr").textContent="Please enter a valid email address.";return}
mtSub(v);this.outerHTML='<p class="nok">Thank you, you are on the list.</p>';$("nerr").textContent=""};

var SHOP={name:"Maison Tempo boutique",addr:"12 Linden Street, London E1 6AN",lat:51.5205,lon:-0.0745,hours:"Monday to Saturday, 10:00 to 18:00",tel:"+44 20 7946 0000"};
function mapBlock(){var d=.012,bb=[SHOP.lon-d*1.6,SHOP.lat-d/2,SHOP.lon+d*1.6,SHOP.lat+d/2].join("%2C"),
src="https://www.openstreetmap.org/export/embed.html?bbox="+bb+"&layer=mapnik&marker="+SHOP.lat+"%2C"+SHOP.lon,
gm="https://www.google.com/maps/search/?api=1&query="+SHOP.lat+"%2C"+SHOP.lon,
fb='<svg class="mapfb" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="800" height="500" fill="#E4E9E2"/><path d="M0 330 C180 290 320 380 520 330 S740 270 800 300 V380 C700 350 560 420 380 400 S120 380 0 400Z" fill="#CBDDE6"/><g stroke="#fff" stroke-width="14" fill="none" stroke-linecap="round"><path d="M-20 140 L820 90"/><path d="M60 -20 L240 520"/><path d="M520 -20 L440 520"/><path d="M-20 260 L820 230"/></g><g stroke="#fff" stroke-width="7" fill="none"><path d="M0 40 L800 20"/><path d="M660 -10 L700 510"/><path d="M-10 460 L810 440"/><path d="M340 -10 L320 510"/></g><rect x="90" y="170" width="120" height="70" fill="#D3DECB"/><rect x="560" y="260" width="110" height="60" fill="#D3DECB"/></svg>';
return'<div class="mapc"><div class="mapbox">'+fb+'<iframe title="Map showing '+SHOP.name+'" src="'+src+'" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe><span class="pin" aria-hidden="true"></span></div><div class="mapinfo"><h3>Visit our boutique</h3><p><b>'+SHOP.addr+'</b></p><p>'+SHOP.hours+'</p><p><a href="tel:'+SHOP.tel.replace(/\s/g,"")+'" style="text-decoration:underline">'+SHOP.tel+'</a></p><div class="mapbtns"><a class="btn" href="'+gm+'" target="_blank" rel="noopener">Get directions</a><a class="btn out" href="'+src.replace("export/embed.html","").replace(/\?bbox.*$/,"")+"?mlat="+SHOP.lat+"&mlon="+SHOP.lon+"#map=17/"+SHOP.lat+"/"+SHOP.lon+'" target="_blank" rel="noopener">View larger map</a></div></div></div>'}
var vm=$("visitmap");if(vm)vm.innerHTML=mapBlock();

var TBL=function(h,rows){return'<div class="tblw"><table class="tbl"><tr>'+h.map(function(x){return'<th>'+x+'</th>'}).join("")+'</tr>'+rows.map(function(r){return'<tr>'+r.map(function(x){return'<td>'+x+'</td>'}).join("")+'</tr>'}).join("")+'</table></div>'};
var CR=function(t){return'<div class="crumb"><a href="#/">Home</a> / '+t+'</div>'};
var PAGES={
about:["About us",function(){return CR("About us")+'<h1>Slow fashion, carefully made.</h1><p class="lead">Maison Tempo began in a small studio with one idea: clothes should be worn for years, not weeks.</p><div class="pcols"><div><p>Every garment starts with the fabric. We work with organic cotton, European linen and responsibly sourced wool, and cut each piece in small batches with partner ateliers we know by name.</p><p style="margin-top:14px">We design for real bodies, which is why our clothing runs from XS to XXL, and we keep patterns simple so each piece works with everything else you own.</p><div class="stats"><div><b>12</b><span>partner ateliers</span></div><div><b>85%</b><span>natural fibres</span></div><div><b>5 yrs</b><span>repair promise</span></div></div></div><div class="pic"><img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=75" alt="Inside the Maison Tempo boutique" onerror="this.onerror=null;this.src=ph(\'Maison Tempo\')"></div></div><div class="vals"><div><h3>Made to last</h3><p>Reinforced seams and quality fabrics, backed by a five-year repair promise.</p></div><div><h3>Responsible</h3><p>Natural and recycled fibres, and small production runs to avoid waste.</p></div><div><h3>Fair</h3><p>We pay our ateliers fairly and publish where each piece is made.</p></div></div><a class="btn" href="#/shop">Shop the collection</a>'}],
checkout:["Checkout",function(){return checkoutHTML()},checkoutInit],
confirmation:["Order confirmed",function(){return confirmHTML()}],
contact:["Contact",function(){return CR("Contact")+'<h1>Get in touch</h1><p class="lead">Questions about sizing, an order or a repair? Send us a message and we will reply within one working day.</p><div class="pcols"><form class="form" id="cf" novalidate><label>Your name<input name="n" required autocomplete="name"></label><label>Email<input name="e" type="email" required autocomplete="email"></label><label>Topic<select name="t"><option>Order and delivery</option><option>Sizing help</option><option>Returns</option><option>Repairs</option><option>Other</option></select></label><label>Message<textarea name="m" required></textarea></label><div class="err" id="cerr"></div><button class="btn" type="submit">Send message</button></form><div class="info2"><div><b>Boutique</b>12 Linden Street, London E1 6AN</div><div><b>Opening hours</b>Monday to Saturday, 10:00 to 18:00</div><div><b>Email</b><a href="mailto:hello@maisontempo.com">hello@maisontempo.com</a></div><div><b>Phone</b><a href="tel:+442079460000">+44 20 7946 0000</a></div><div><b>Help</b><a href="#/shipping">Shipping and returns</a> · <a href="#/size-guide">Size guide</a></div></div></div><div style="margin-top:56px">'+mapBlock()+'</div>'}],
shipping:["Shipping and returns",function(){return CR("Shipping and returns")+'<h1>Shipping and returns</h1><p class="lead">Simple delivery, and easy returns.</p>'+TBL(["Method","Delivery time","Cost"],[["Standard UK (Royal Mail Tracked 48)","2–4 working days",money(ST.std)+" (free over "+money(FREE)+")"],["Next working day (order by 2pm)","1 working day",money(ST.next)],["Click and collect, London E1","Ready in 2 hours","Free"]])+'<h2>Returns</h2><ul><li>Return unworn items with tags within 30 days for a full refund. Your statutory right to cancel within 14 days of receipt under the Consumer Contracts Regulations is unaffected.</li><li>Start a return from the <a href="#/contact" style="text-decoration:underline">Contact</a> page and we will send a free label.</li><li>Refunds reach your original payment method within 5 working days of arrival.</li></ul><h2>Repairs</h2><p>Every garment is covered by our five-year repair promise for seam, zip and button repairs.</p>'}],
"size-guide":["Size guide",function(){return CR("Size guide")+'<h1>Size guide</h1><p class="lead">Measure yourself and compare. If you are between sizes, size up for a relaxed fit.</p><h2>Clothing (centimetres)</h2>'+TBL(["Size","Name","UK size","Chest","Waist","Hip"],[["XS","Extra Small","6–8","82","64","88"],["S","Small","10","88","70","94"],["M","Medium","12","94","76","100"],["L","Large","14","100","82","106"],["XL","Extra Large","16","106","88","112"],["XXL","2X Large","18","112","94","118"]])+'<h2>Shoes</h2>'+TBL(["UK","EU","Foot length (cm)"],[["3","36","22.8"],["4","37","23.5"],["5","38","24.1"],["6","39","24.8"],["7","41","26.0"],["8","42","26.7"],["9","43","27.3"]])+'<a class="btn" href="#/shop">Back to shop</a>'}],
privacy:["Privacy",function(){return CR("Privacy")+'<h1>Privacy policy</h1><p class="lead">Sample text. Replace with your own policy before launch.</p><h2>What we collect</h2><p>Your name, email, delivery address and order history, only to process orders and answer your messages.</p><h2>How we use it</h2><p>We handle your data under UK GDPR and never sell it. You can ask us to view or delete it at any time via the <a href="#/contact" style="text-decoration:underline">Contact</a> page.</p>'}],
terms:["Terms",function(){return CR("Terms")+'<h1>Terms of sale</h1><p class="lead">Sample text. Replace with your own terms before launch.</p><h2>Orders</h2><p>An order is confirmed when we send you a dispatch email. All prices are in pounds sterling and include VAT at 20%.</p><h2>Returns</h2><p>See our <a href="#/shipping" style="text-decoration:underline">shipping and returns</a> page.</p>'}]};

/* ===== checkout ===== */
function cartTotals(d){var sub=0;cart.forEach(function(c){sub+=c.qty*P[c.id].price});var dl=DELIVERY.filter(function(x){return x.id===d})[0]||DELIVERY[0],ship=(dl.id==="std"&&sub>=FREE)?0:dl.cost;return{sub:sub,ship:ship,total:sub+ship,vat:(sub+ship)*VAT/(1+VAT),dl:dl}}
function checkoutHTML(){if(!cart.length)return CR("Checkout")+'<h1>Checkout</h1><p class="lead">Your bag is empty.</p><a class="btn" href="#/shop">Continue shopping</a>';
var t=cartTotals("std");
return CR("Checkout")+'<h1>Checkout</h1><div class="ck"><form class="form" id="ckf" novalidate><h2>Contact</h2><label>Email<input name="email" type="email" autocomplete="email" required></label>'+
'<h2>Delivery address</h2><div class="two"><label>First name<input name="fn" autocomplete="given-name" required></label><label>Last name<input name="ln" autocomplete="family-name" required></label></div><label>Address line 1<input name="a1" autocomplete="address-line1" required></label><label>Address line 2 (optional)<input name="a2" autocomplete="address-line2"></label><div class="two"><label>Town or city<input name="city" autocomplete="address-level2" required></label><label>Postcode<input name="pc" autocomplete="postal-code" placeholder="e.g. E1 6AN" required></label></div><label>Phone (for the courier)<input name="ph" type="tel" autocomplete="tel"></label><label>Country<select name="co"><option>United Kingdom</option></select></label>'+
'<h2>Delivery method</h2><div class="opts" id="dopts">'+DELIVERY.map(function(d,i){return'<label class="opt"><input type="radio" name="dm" value="'+d.id+'"'+(i===0?" checked":"")+'><span><b>'+d.name+'</b><small>'+d.sub+'</small></span><em id="dc-'+d.id+'"></em></label>'}).join("")+'</div>'+
'<h2>Payment</h2><div class="opts"><label class="opt"><input type="radio" name="pm" value="card" checked><span><b>Debit or credit card</b><small>Visa, Mastercard, American Express</small></span></label><label class="opt"><input type="radio" name="pm" value="wallet"><span><b>Apple Pay or Google Pay</b><small>Pay with your saved card</small></span></label><label class="opt"><input type="radio" name="pm" value="paypal"><span><b>PayPal</b><small>Pay with your PayPal account</small></span></label><label class="opt"><input type="radio" name="pm" value="bnpl"><span><b>Pay in 3 with Klarna or Clearpay</b><small>Three interest-free instalments</small></span></label></div>'+
'<p class="note">Card details are entered on the payment provider’s secure page. This site never sees or stores them.</p><label class="chk"><input type="checkbox" name="tc" required> I agree to the <a href="#/terms" target="_blank" rel="noopener">terms</a> and <a href="#/privacy" target="_blank" rel="noopener">privacy policy</a></label><div class="err" id="ckerr"></div><button class="btn" type="submit" id="pay">Pay</button></form>'+
'<aside class="sum"><h2 style="margin-top:0">Order summary</h2>'+cart.map(function(c){var p=P[c.id];return'<div class="sl"><div class="th">'+imgTag(p,0,160)+'</div><div><b>'+p.name+'</b><small>'+c.color+(c.size!=="One size"?" · "+(p.cat==="Shoes"?"UK "+c.size:c.size):"")+' · Qty '+c.qty+'</small></div><span>'+money(p.price*c.qty)+'</span></div>'}).join("")+'<div class="tr"><span>Subtotal</span><span id="s-sub"></span></div><div class="tr"><span>Delivery</span><span id="s-ship"></span></div><div class="tr big"><span>Total</span><span id="s-tot"></span></div><small style="color:var(--mute)" id="s-vat"></small></aside></div>'}
function checkoutInit(){var f=$("ckf");if(!f)return;
function upd(){var d=f.elements.dm.value,t=cartTotals(d);$("s-sub").textContent=money(t.sub);$("s-ship").textContent=t.ship?money(t.ship):"Free";$("s-tot").textContent=money(t.total);$("s-vat").textContent="Includes "+money(+t.vat.toFixed(2))+" VAT";$("pay").textContent="Pay "+money(t.total);
DELIVERY.forEach(function(x){var e=$("dc-"+x.id),c=(x.id==="std"&&t.sub>=FREE)?0:x.cost;e.textContent=c?money(c):"Free"})}
f.addEventListener("change",upd);upd();
f.onsubmit=function(e){e.preventDefault();var d=f.elements,er=$("ckerr");er.textContent="";
if(!/^\S+@\S+\.\S+$/.test(d.email.value)){er.textContent="Please enter a valid email address.";d.email.focus();return}
var click=d.dm.value==="click";
if(!d.fn.value.trim()||!d.ln.value.trim()){er.textContent="Please enter your first and last name.";return}
if(!click&&(!d.a1.value.trim()||!d.city.value.trim())){er.textContent="Please enter your delivery address.";return}
if(!/^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i.test(d.pc.value.trim())){er.textContent="Please enter a valid UK postcode, for example E1 6AN.";d.pc.focus();return}
if(!d.tc.checked){er.textContent="Please accept the terms to continue.";return}
var t=cartTotals(d.dm.value),order={ref:"MT-"+Date.now().toString(36).toUpperCase().slice(-7)+Math.random().toString(36).slice(2,4).toUpperCase(),email:d.email.value,name:d.fn.value.trim(),total:t.total,delivery:t.dl.name,pay:d.pm.value,items:cart.map(function(c){return{name:P[c.id].name,sku:P[c.id].sku,color:c.color,size:c.size,qty:c.qty,unit_amount_pence:Math.round(P[c.id].price*100)}}),shipping_pence:Math.round(t.ship*100),currency:"gbp"};
order.created=new Date().toISOString();order.status="New";order.last=d.ln.value.trim();order.phone=d.ph.value.trim();order.addr={a1:d.a1.value.trim(),a2:d.a2.value.trim(),city:d.city.value.trim(),pc:d.pc.value.trim().toUpperCase()};order.demo=!PAY_ENDPOINT;order.subtotal=t.sub;order.shipping=t.ship;mtPush("mt_orders",order);
var btn=$("pay");btn.disabled=true;btn.textContent="Processing…";
if(PAY_ENDPOINT){fetch(PAY_ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(order)}).then(function(r){return r.json()}).then(function(j){if(j.url){location.href=j.url}else throw 0}).catch(function(){btn.disabled=false;btn.textContent="Pay "+money(t.total);er.textContent="Payment could not be started. Please try again or contact us."});return}
setTimeout(function(){lastOrder=order;cart=[];save();updCart();location.hash="#/confirmation"},900)}}
function confirmHTML(){var o=lastOrder;if(!o)return CR("Order")+'<h1>No recent order</h1><a class="btn" href="#/shop">Continue shopping</a>';
return CR("Order confirmed")+'<h1>Thank you, '+o.name.replace(/[<>&]/g,"")+'.</h1><p class="lead">Your order <b>'+o.ref+'</b> total of '+money(o.total)+' is confirmed. A receipt will be sent to '+o.email.replace(/[<>&]/g,"")+'.</p><div class="ok" style="margin-bottom:26px"><b>Demo mode.</b> No payment was taken. To accept real payments in pounds, connect a payment provider (see the store settings in the page code).</div><p>Delivery: '+o.delivery+'</p><p style="margin:18px 0 26px">Need help? <a href="#/contact" style="text-decoration:underline">Contact us</a>.</p><a class="btn" href="#/shop">Continue shopping</a>'}

/* extras layered on the pages above */
function steps(n){var s=["Bag","Details","Payment","Done"];return'<ol class="steps" aria-label="Checkout progress">'+s.map(function(t,i){return'<li'+(i<n?' class="on"':'')+'><b>'+(i+1)+'</b>'+t+'</li>'}).join("")+'</ol>'}
var TRUST='<div class="trust"><span>🔒 Secure, encrypted checkout</span><span>↩ Free returns within 30 days</span><span>✂ Five-year repair promise</span></div>';
var FAQ='<h2>Frequently asked questions</h2><div class="faq"><details><summary>How do I find my size?</summary><p>Use our <a href="#/size-guide" style="text-decoration:underline">size guide</a>. If you are between sizes, size up for a relaxed fit.</p></details><details><summary>Can I return a sale or gifted item?</summary><p>Yes. Any unworn item with tags can be returned within 30 days for a refund to the original payment method.</p></details><details><summary>What does the repair promise cover?</summary><p>Seam, zip and button repairs on anything you bought from us, for five years from purchase.</p></details><details><summary>Do you deliver outside the UK?</summary><p>Not yet. We currently deliver to UK addresses only.</p></details></div>';
(function(){var c=PAGES.checkout[1],f=PAGES.confirmation[1],s=PAGES.shipping[1];
PAGES.checkout[1]=function(){return steps(2)+c()};
PAGES.checkout[2]=function(){checkoutInit();var m=qs(".sum");if(m)m.insertAdjacentHTML("beforeend",TRUST)};
PAGES.confirmation[1]=function(){return steps(4)+f()};
PAGES.shipping[1]=function(){return s()+FAQ}})();

/* ===== router ===== */
var keepQ=false;
function route(){var h=(location.hash||"#/").slice(2).split("/"),r=h[0]||"home",home=$("v-home"),pg=$("v-page");closeAll(true);
qsa("#nav a").forEach(function(a){a.removeAttribute("aria-current")});
if(r==="home"||r==="shop"){home.hidden=false;pg.hidden=true;
if(!keepQ){state.q="";state.color="";$("q").value="";$("color").value=""}keepQ=false;
if(r==="shop"){var c=decodeURIComponent(h[1]||"All");if(CAT2.indexOf(c)<0)c="All";setCat(c);
document.title=(c==="All"?"Shop all":c==="Saved"?"Saved items":c)+" – Maison Tempo";
var nv=qs('#nav [data-r="'+(c==="Men"?"men":"shop")+'"]');nv&&nv.setAttribute("aria-current","page");
setTimeout(function(){$("shop").scrollIntoView()},30)}
else{document.title=HOME_TITLE;setCat("All");window.scrollTo(0,0)}return}
var pgd=PAGES[r];if(!pgd){location.hash="#/";return}
home.hidden=true;pg.hidden=false;pg.innerHTML='<section class="page"><div class="wrap">'+pgd[1]()+'</div></section>';document.title="Maison Tempo – "+pgd[0];if(pgd[2])pgd[2]();
var a=qs('#nav [data-r="'+r+'"]');a&&a.setAttribute("aria-current","page");window.scrollTo(0,0);
var f=$("cf");if(f)f.onsubmit=function(e){e.preventDefault();var d=f.elements;if(!d.n.value.trim()||!/^\S+@\S+\.\S+$/.test(d.e.value)||!d.m.value.trim()){$("cerr").textContent="Please enter your name, a valid email and a message.";return}
mtPush("mt_messages",{id:"M"+Date.now(),name:d.n.value.trim(),email:d.e.value.trim(),topic:d.t.value,msg:d.m.value.trim(),date:new Date().toISOString(),read:false});f.outerHTML='<div class="ok"><b>Thank you, '+esc(d.n.value.trim())+'.</b><br>We have your message and will reply within one working day.</div>'}}
window.addEventListener("hashchange",route);

/* ===== hero slideshow ===== */
(function(){
var S=ST.slides;
var el=$("hero");if(!el)return;
var D=5500,cur=0,timer=null,pt=null,play=true;
el.style.setProperty("--d",D+"ms");
function pic(s,i){if(/^(https?:|data:)/.test(s.img))return'<img src="'+esc(s.img)+'" alt="" decoding="async"'+(i===0?' fetchpriority="high"':'')+' onerror="this.style.display=\'none\'">';var b="https://images.unsplash.com/"+s.img+"?auto=format&fit=crop&q=80&w=";return'<img src="'+b+'1400" srcset="'+b+'800 800w, '+b+'1400 1400w, '+b+'2000 2000w" sizes="100vw" alt="" decoding="async"'+(i===0?' fetchpriority="high"':'')+' onerror="this.style.display=\'none\'">'}
var chevL='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>',chevR='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';
el.innerHTML=S.map(function(s,i){return'<div class="slide'+(i===0?" on":"")+'" style="background:'+s.bg+'" role="group" aria-roledescription="slide" aria-label="'+(i+1)+' of '+S.length+'">'+pic(s,i)+'<div class="sc"><div class="wrap"><div class="in"><small>'+s.k+'</small>'+(i===0?'<h1>':'<h2>')+s.t+(i===0?'</h1>':'</h2>')+'<p>'+s.d+'</p><a class="btn" href="'+s.l+'">'+s.b+'</a></div></div></div></div>'}).join("")+
'<div class="sctl"><div class="wrap"><div class="dots">'+S.map(function(s,i){return'<button aria-label="Go to slide '+(i+1)+'"'+(i===0?' aria-current="true"':'')+'><i></i></button>'}).join("")+'</div><span class="hc" id="hc" aria-hidden="true">01 / 0'+S.length+'</span><button class="sbtn pp" id="pp" aria-pressed="false" aria-label="Pause slideshow"><svg class="i-pause" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="4" width="5" height="16" rx="1"/><rect x="14" y="4" width="5" height="16" rx="1"/></svg><svg class="i-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4l14 8-14 8z"/></svg></button><button class="sbtn" data-a="prev" aria-label="Previous slide">'+chevL+'</button><button class="sbtn" data-a="next" aria-label="Next slide">'+chevR+'</button></div></div>';
var slides=qsa(".slide",el),dots=qsa(".dots button",el);
function show(n){var old=cur;cur=(n+S.length)%S.length;
if(old!==cur){slides.forEach(function(s){s.classList.remove("prev")});slides[old].classList.add("prev");clearTimeout(pt);pt=setTimeout(function(){slides[old].classList.remove("prev")},1300)}
slides.forEach(function(s,i){s.classList.toggle("on",i===cur);qsa("a",s).forEach(function(a){a.tabIndex=i===cur?0:-1})});
dots.forEach(function(d,i){d.removeAttribute("aria-current");void d.offsetWidth;if(i===cur)d.setAttribute("aria-current","true")});
$("hc").textContent="0"+(cur+1)+" / 0"+S.length;sched()}
function sched(){clearTimeout(timer);el.classList.toggle("auto",play);if(play)timer=setTimeout(function(){show(cur+1)},D)}
el.addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;
if(b.id==="pp"){play=!play;b.setAttribute("aria-pressed",!play);b.setAttribute("aria-label",play?"Pause slideshow":"Play slideshow");sched();return}
var a=b.dataset.a;if(a==="next")show(cur+1);else if(a==="prev")show(cur-1);else{var i=dots.indexOf(b);if(i>-1)show(i)}});
el.addEventListener("keydown",function(e){if(e.key==="ArrowRight")show(cur+1);if(e.key==="ArrowLeft")show(cur-1)});
var x0=null;el.addEventListener("touchstart",function(e){x0=e.touches[0].clientX},{passive:true});
el.addEventListener("touchend",function(e){if(x0===null)return;var dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>50)show(cur+(dx<0?1:-1));x0=null});
document.addEventListener("visibilitychange",function(){if(document.hidden){clearTimeout(timer)}else sched()});
slides.slice(1).forEach(function(s){qsa("a",s).forEach(function(a){a.tabIndex=-1})});
sched();
})();

/* ===== start ===== */
var uf=$("uspfree");if(uf)uf.textContent="Free UK delivery over "+money(FREE);
buildShopUI();updCart();updWish();initReveal();route();
