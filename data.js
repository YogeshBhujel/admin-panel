/* Maison Tempo – shared catalogue and settings (used by the shop and the admin panel) */
var POOL={
Dresses:["photo-1496747611176-843222e1e57c","photo-1539109136881-3be0616acf4b","photo-1515886657613-9f3515b0c78f","photo-1490481651871-ab68de25d43d","photo-1469334031218-e382a71b716b"],
Tops:["photo-1434389677669-e08b4cac3105","photo-1512436991641-6745cdb1723f","photo-1445205170230-053b83016050","photo-1483985988355-763728e1935b"],
Knitwear:["photo-1544441893-675973e31985","photo-1434056886845-dac89ffe9b56","photo-1523381210434-271e8be1f52b","photo-1558769132-cb1aea458c5e"],
Bottoms:["photo-1558769132-cb1aea458c5e","photo-1434389677669-e08b4cac3105","photo-1445205170230-053b83016050","photo-1441986300917-64674bd600d8"],
Outerwear:["photo-1591047139829-d91aecb6caea","photo-1551028719-00167b16eac5","photo-1539109136881-3be0616acf4b","photo-1445205170230-053b83016050"],
Men:["photo-1507679799987-c73779587ccf","photo-1489987707025-afc232f7ea0f","photo-1556905055-8f358a7a47b2","photo-1576566588028-4147f3842f27","photo-1503342217505-b0a15ec3261c"],
Shoes:["photo-1542291026-7eec264c27ff","photo-1491553895911-0055eca6402d","photo-1441986300917-64674bd600d8"],
Bags:["photo-1584917865442-de89df76afd3","photo-1548036328-c9fa89d128fa","photo-1553062407-98eeb64c6a62"],
Accessories:["photo-1523275335684-37898b6baf30","photo-1572635196237-14b3f281503f","photo-1483985988355-763728e1935b","photo-1441986300917-64674bd600d8"]};
var COL={Stone:"#CFC8BB",Ivory:"#EDE8DC",Black:"#1B1D1F",Charcoal:"#44484B",Navy:"#1F2D44",Olive:"#6B6F4B",Sage:"#A5B5A2",Camel:"#B58A5A",Sand:"#D9C7A6",Rust:"#A65A3C",Blush:"#E6C5BC",White:"#F7F7F5",Sky:"#A9C0D6",Forest:"#2A4A3E"};
var CN=Object.keys(COL);
// name, category, price, fabric
var RAW=[
["Linen Wrap Dress","Dresses",168,"100% European linen"],["Silk Slip Dress","Dresses",245,"100% mulberry silk"],["Poplin Shirt Dress","Dresses",154,"100% organic cotton poplin"],["Pleated Midi Dress","Dresses",198,"Recycled polyester crepe"],["Knit Column Dress","Dresses",212,"Merino wool blend"],["Cotton Tiered Dress","Dresses",136,"100% organic cotton"],
["Cotton Poplin Shirt","Tops",96,"100% organic cotton poplin"],["Ribbed Tank","Tops",42,"Stretch organic cotton rib"],["Silk Camisole","Tops",118,"100% mulberry silk"],["Linen Button Blouse","Tops",104,"100% European linen"],["Boxy Organic Tee","Tops",48,"Heavyweight organic cotton jersey"],["Puff-Sleeve Blouse","Tops",112,"Cotton voile"],
["Merino Crew Sweater","Knitwear",138,"100% extra-fine merino wool"],["Cashmere Cardigan","Knitwear",290,"100% Grade-A cashmere"],["Chunky Cable Knit","Knitwear",176,"Merino and recycled wool"],["Alpaca Turtleneck","Knitwear",158,"Baby alpaca blend"],["Ribbed Knit Vest","Knitwear",98,"Cotton and merino blend"],
["High-Rise Wide Trouser","Bottoms",132,"Wool-blend suiting"],["Pleated Midi Skirt","Bottoms",116,"Recycled satin"],["Linen Drawstring Pant","Bottoms",108,"100% European linen"],["Straight Denim","Bottoms",124,"Organic cotton denim"],["Tailored Shorts","Bottoms",88,"Cotton twill"],
["Wool Wrap Coat","Outerwear",320,"90% wool, 10% cashmere"],["Classic Trench Coat","Outerwear",298,"Water-resistant cotton gabardine"],["Quilted Liner Jacket","Outerwear",186,"Recycled nylon shell"],["Linen Overshirt","Outerwear",148,"100% European linen"],["Suede Bomber","Outerwear",420,"Italian goat suede"],["Longline Blazer","Outerwear",234,"Virgin wool twill"],["Shearling Gilet","Outerwear",260,"Faux shearling, recycled"],
["Oxford Shirt","Men",92,"100% organic cotton oxford"],["Heavyweight Tee","Men",44,"260gsm organic cotton"],["Linen Camp Shirt","Men",98,"100% European linen"],["Merino Polo","Men",118,"100% merino wool"],["Relaxed Chino","Men",102,"Brushed cotton twill"],["Pleated Wool Trouser","Men",168,"Virgin wool flannel"],["Selvedge Denim","Men",148,"14oz Japanese selvedge"],["Waxed Field Jacket","Men",285,"Waxed organic cotton"],["Crewneck Sweatshirt","Men",86,"Loopback organic cotton"],["Fleece Zip Hoodie","Men",110,"Recycled polyester fleece"],
["Leather Court Sneaker","Shoes",165,"Full-grain leather upper"],["Suede Loafer","Shoes",190,"Italian suede, leather sole"],["Chelsea Boot","Shoes",245,"Polished calf leather"],["Canvas Trainer","Shoes",78,"Organic cotton canvas"],["Leather Sandal","Shoes",128,"Vegetable-tanned leather"],["Ballet Flat","Shoes",142,"Nappa leather"],
["Leather Tote","Bags",265,"Vegetable-tanned leather"],["Mini Crossbody","Bags",178,"Pebbled leather"],["Canvas Weekender","Bags",155,"Waxed canvas, leather trim"],["Everyday Backpack","Bags",138,"Recycled nylon"],["Suede Bucket Bag","Bags",212,"Italian suede"],
["Wool Scarf","Accessories",68,"100% lambswool"],["Leather Belt","Accessories",64,"Full-grain leather"],["Wayfarer Sunglasses","Accessories",110,"Bio-acetate frame, UV400"],["Minimal Watch","Accessories",195,"Stainless steel, sapphire glass"],["Merino Beanie","Accessories",42,"100% merino wool"],["Silk Neck Scarf","Accessories",58,"100% silk twill"]];
var CAT=["All","Dresses","Tops","Knitwear","Bottoms","Outerwear","Men","Shoes","Bags","Accessories"];
var SN={XS:"Extra Small, UK 6–8",S:"Small, UK 10",M:"Medium, UK 12",L:"Large, UK 14",XL:"Extra Large, UK 16",XXL:"2X Large, UK 18"},EU={"3":"36","4":"37","5":"38","6":"39","7":"41","8":"42","9":"43"};var CLO=["XS","S","M","L","XL","XXL"],SHO=["3","4","5","6","7","8","9"];

function mtLoad(k,d){try{var v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}}
function mtStore(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}}
function mtPush(k,item){var a=mtLoad(k,[]);if(!Array.isArray(a))a=[];a.unshift(item);mtStore(k,a.slice(0,500))}
function mtBase(){return RAW.map(function(r,i){var cat=r[1],pool=POOL[cat],n=3+(i%3),cs=[];for(var k=0;k<n;k++){var c=CN[(i*3+k*5)%CN.length];if(cs.indexOf(c)<0)cs.push(c)}
var sz=cat==="Shoes"?SHO:(cat==="Bags"||cat==="Accessories"?["One size"]:CLO);
var out=[];if(sz.length>1&&i%4===0)out.push(sz[sz.length-1]);if(sz.length>2&&i%7===0)out.push(sz[0]);
return{id:i,name:r[0],cat:cat,price:Math.round(r[2]*0.8),fabric:r[3],colors:cs,sizes:sz,out:out,rating:(4+((i*7)%10)/10).toFixed(1),reviews:12+((i*37)%190),sku:"MT-"+(1000+i*13),badge:i%9===0?"New":(i%11===0?"Bestseller":""),pool:pool,off:i%pool.length}})}
function mtCatalog(){var c=mtLoad("mt_catalog",null);if(Array.isArray(c)&&c.length){c.forEach(function(p,i){p.id=i});return c}return mtBase()}
var MT_SLIDES=[
{img:"photo-1469334031218-e382a71b716b",bg:"#3b4a43",k:"Autumn collection",t:"Clothing made to be lived in.",d:"Timeless pieces in natural fabrics, designed in small runs and made to outlast the season.",l:"#/shop/Dresses",b:"Shop dresses"},
{img:"photo-1445205170230-053b83016050",bg:"#4a4038",k:"New in outerwear",t:"Layers that last.",d:"Wool coats, trenches and tailored jackets in warm, natural fabrics.",l:"#/shop/Outerwear",b:"Shop outerwear"},
{img:"photo-1507679799987-c73779587ccf",bg:"#2c3440",k:"Menswear",t:"Quiet confidence.",d:"Oxford shirts, wool trousers and everyday knits, cut for a modern fit.",l:"#/shop/Men",b:"Shop menswear"},
{img:"photo-1441986300917-64674bd600d8",bg:"#3d4540",k:"Finishing touches",t:"Details that matter.",d:"Leather bags, silk scarves and accessories made to be worn every day.",l:"#/shop/Accessories",b:"Shop accessories"}];
var MT_DEFAULTS={free:100,std:3.95,next:6.95,ann:["Free UK delivery over £100","30-day easy returns","Five-year repair promise"],slides:MT_SLIDES};
function mtSettings(){var s=mtLoad("mt_settings",{}),o={};for(var k in MT_DEFAULTS)o[k]=MT_DEFAULTS[k];if(s&&typeof s==="object")for(var k2 in s){if(s[k2]!=null&&s[k2]!=="")o[k2]=s[k2]}
o.free=+o.free;o.std=+o.std;o.next=+o.next;if(!Array.isArray(o.ann)||!o.ann.length)o.ann=MT_DEFAULTS.ann;if(!Array.isArray(o.slides)||!o.slides.length)o.slides=MT_SLIDES;return o}
