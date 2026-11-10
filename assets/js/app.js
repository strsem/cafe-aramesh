/* Shared interactions for all pages — no external libraries. */
(() => {
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const money = n => new Intl.NumberFormat('fa-IR').format(n) + ' تومان';
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem('aramesh-cart') || '[]'); } catch (_) { cart = []; }
  const save = () => { try { localStorage.setItem('aramesh-cart', JSON.stringify(cart)); } catch (_) {} updateCartCount(); };
  const updateCartCount = () => $$('.cart-count').forEach(el => el.textContent = new Intl.NumberFormat('fa-IR').format(cart.reduce((s,i)=>s+i.qty,0)));
  let toastTimer;
  const toast = msg => { let el=$('#toast'); if(!el){el=document.createElement('div');el.id='toast';el.className='toast';document.body.append(el)} el.textContent=msg;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2600); };
  const addItem = (item) => { const found=cart.find(x=>x.id===item.id); if(found) found.qty++; else cart.push({...item,qty:1}); save(); toast(`${item.name} به سبد اضافه شد`); renderCart(); };
  const makeShell = () => {
    if (!$('#cartDrawer')) {
      document.body.insertAdjacentHTML('beforeend', `<div class="drawer-backdrop" id="drawerBackdrop"></div><aside class="cart-drawer" id="cartDrawer" aria-label="سبد سفارش"><div class="drawer-head"><h3>سبد سفارش شما</h3><button class="icon-button" id="closeCart" aria-label="بستن">×</button></div><div class="cart-items" id="cartItems"></div><div class="cart-summary"><div class="cart-total"><span>مبلغ کل</span><span id="cartTotal">۰ تومان</span></div><button class="btn btn-gold btn-block" id="copyOrder">کپی متن سفارش</button><p class="muted" style="font-size:.78rem;margin:9px 0 0">این نسخه نمایشی است؛ سفارش آنلاین به سامانه فروشگاه ارسال نمی‌شود.</p></div></aside>`);
    }
  };
  const renderCart = () => {
    makeShell(); const wrap=$('#cartItems'); if(!wrap)return;
    if(!cart.length){wrap.innerHTML='<div class="empty-state">سبد شما هنوز خالی است.<br><a class="text-link" href="menu.html">دیدن منو</a></div>';$('#cartTotal').textContent=money(0);return;}
    wrap.innerHTML=cart.map((i,idx)=>`<div class="cart-line"><div><strong>${i.name}</strong><small>${money(i.price)} × ${new Intl.NumberFormat('fa-IR').format(i.qty)}</small></div><button class="remove-item" data-remove="${idx}">حذف</button></div>`).join('');
    $('#cartTotal').textContent=money(cart.reduce((s,i)=>s+i.price*i.qty,0));
  };
  const openCart = () => { makeShell(); $('#cartDrawer').classList.add('open');$('#drawerBackdrop').classList.add('open');renderCart(); };
  const closeCart = () => { $('#cartDrawer')?.classList.remove('open');$('#drawerBackdrop')?.classList.remove('open'); };
  document.addEventListener('click', e => {
    const add=e.target.closest('[data-add]'); if(add){e.preventDefault();addItem({id:add.dataset.id||add.dataset.add,name:add.dataset.name||'محصول',price:Number(add.dataset.price||0)});return;}
    if(e.target.closest('[data-open-cart]')){e.preventDefault();openCart();return;}
    if(e.target.id==='closeCart'||e.target.id==='drawerBackdrop'){closeCart();return;}
    const remove=e.target.closest('[data-remove]');if(remove){cart.splice(Number(remove.dataset.remove),1);save();renderCart();return;}
    if(e.target.id==='copyOrder'){
      if(!cart.length){toast('سبد سفارش خالی است');return;}
      const lines=['سفارش از کافه آرامش',...cart.map(i=>`${i.name} × ${i.qty} — ${money(i.price*i.qty)}`),`مجموع: ${money(cart.reduce((s,i)=>s+i.price*i.qty,0))}`];
      const txt=lines.join('\n');
      if(navigator.clipboard?.writeText) navigator.clipboard.writeText(txt).then(()=>toast('متن سفارش کپی شد')).catch(()=>toast('امکان کپی خودکار وجود ندارد'));
      else toast('مرورگر شما از کپی خودکار پشتیبانی نمی‌کند');
    }
  });
  const toggle=$('#menuToggle'); if(toggle){toggle.addEventListener('click',()=>{$('#navLinks')?.classList.toggle('open');toggle.setAttribute('aria-expanded',$('#navLinks')?.classList.contains('open')?'true':'false');});}
  // Menu category filters.
  $$('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{
    $$('[data-filter]').forEach(b=>b.classList.remove('active'));btn.classList.add('active');
    const filter=btn.dataset.filter; $$('.menu-card').forEach(card=>card.hidden=!(filter==='all'||card.dataset.category===filter));
  }));
  // Demo forms: validate and show a clear local-only confirmation.
  $$('form[data-demo-form]').forEach(form=>form.addEventListener('submit',e=>{
    e.preventDefault(); if(!form.reportValidity()) return;
    const msg=$('.form-message',form.parentElement)||$('.form-message');
    if(msg){msg.textContent=form.dataset.success||'اطلاعات فرم ثبت نمایشی شد. برای دریافت واقعی اطلاعات، باید فرم به یک سرویس یا سرور متصل شود.';msg.classList.add('show');}
    form.reset();
  }));
  // Gallery lightbox.
  const lightbox=document.createElement('div');lightbox.className='lightbox';lightbox.id='lightbox';lightbox.innerHTML='<button class="icon-button" aria-label="بستن">×</button><img alt="نمای بزرگ تصویر">';document.body.append(lightbox);
  $$('.gallery-item img[data-lightbox]').forEach(img=>img.addEventListener('click',()=>{lightbox.querySelector('img').src=img.src;lightbox.classList.add('open');}));
  lightbox.addEventListener('click',e=>{if(e.target===lightbox||e.target.tagName==='BUTTON')lightbox.classList.remove('open');});
  updateCartCount(); makeShell();
})();
