<script>
  import { getItems, createItem, createOrder, getOrders, getMyOrders } from './api.js'
  import Login from './Login.svelte'
  import { session, doLogout } from './store/session.js'
  let tab = 'cliente'
  $: user = $session
  $: if (user) { tab = user.role === 'admin' ? 'vendedor' : 'cliente' }
  let items = []
  let orders = []
  let myOrders = []
  let loadingItems = false
  let loadingOrders = false
  let loadingMyOrders = false
  let toasts = []
  let name = ''
  let price = ''
  let stock = ''
  let loading = false
  let error = ''

  let customer = { name: '', address: '', phone: '' }
  let selectedItemId = ''
  let quantity = 1
  let selectedItem
  let orderTotal = 0
  $: selectedItem = items.find(x => x.id === selectedItemId)
  $: orderTotal = selectedItem ? selectedItem.price * quantity : 0
  let itemsById = {}
  $: itemsById = Object.fromEntries(items.map(i => [i.id, i]))
  function fmt(n) {
    try { return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n || 0) } catch { return '$' + (n || 0) }
  }
  let showMyOrders = false
  async function loadMyOrders() {
    loadingMyOrders = true
    try { myOrders = await getMyOrders() } catch (e) { error = e.message; pushToast(e.message, 'error') }
    loadingMyOrders = false
  }
  function openMyOrders() { showMyOrders = true; loadMyOrders() }
  function closeMyOrders() { showMyOrders = false }
  function pushToast(text, type = 'success') {
    const id = Date.now() + Math.random()
    toasts = [...toasts, { id, text, type }]
    setTimeout(() => { toasts = toasts.filter(t => t.id !== id) }, 3000)
  }

  async function loadItems() {
    loadingItems = true
    error = ''
    try { items = await getItems() } catch (e) { error = e.message; pushToast(e.message, 'error') }
    loadingItems = false
  }

  async function loadOrders() {
    loadingOrders = true
    error = ''
    try { orders = await getOrders() } catch (e) { error = e.message; pushToast(e.message, 'error') }
    loadingOrders = false
  }

  async function addItem() {
    loading = true
    error = ''
    try {
      const p = Number(price)
      const s = Number(stock)
      const i = await createItem({ name, price: p, stock: s })
      items = [...items, i]
      name = ''
      price = ''
      stock = ''
      pushToast('Artículo agregado')
    } catch (e) { error = e.message }
    loading = false
  }

  async function makeOrder() {
    loading = true
    error = ''
    try {
      if (!user || user.role !== 'cliente') { throw new Error('No autorizado: inicia sesión como cliente') }
      await createOrder({ itemId: selectedItemId, quantity, customer })
      customer = { name: '', address: '', phone: '' }
      quantity = 1
      selectedItemId = ''
      await loadItems()
      if (user && user.role === 'admin') { await loadOrders() }
      tab = 'cliente'
      pushToast('Pedido realizado')
    } catch (e) { error = e.message }
    loading = false
  }

  $: if (tab === 'cliente') loadItems()
  $: if (tab === 'vendedor') { loadItems(); loadOrders() }
</script>

<style>
  .container { max-width: 1100px; margin: 0 auto; padding: 12px }
  .tabs { display: flex; gap: 8px; margin-bottom: 16px }
  .tab { padding: 8px 12px; border: 1px solid #ccc; cursor: pointer }
  .active { background: #222; color: #fff }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px }
  .card { border: 1px solid #ddd; padding: 16px; border-radius: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.06); background: #fff }
  .row { display: flex; gap: 8px; align-items: center }
  .error { color: #b00020; margin: 8px 0 }
  button { padding: 8px 12px }
  input { padding: 6px; width: 100% }
  .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px }
  .section-title { margin: 12px 0; font-weight: 600 }
  select { padding: 6px; width: 100% }
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000 }
  .modal { background: #fff; border-radius: 12px; padding: 16px; max-width: 720px; width: 92% }
  .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px }
  .toast-container { position: fixed; top: 16px; right: 16px; display: flex; flex-direction: column; gap: 8px; z-index: 2000 }
  .toast { background: #fff; border-radius: 8px; padding: 10px 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.14); border-left: 4px solid #2e7d32 }
  .toast.error { border-left-color: #c62828 }
  .spinner { display: inline-block; width: 18px; height: 18px; border: 2px solid #ccc; border-top-color: #222; border-radius: 50%; animation: spin .8s linear infinite }
  @keyframes spin { to { transform: rotate(360deg) } }
</style>

<div class="container">
  {#if !user}
    <Login />
  {:else}
    <div class="header">
      <div>Sesión: {user.name || user.email} ({user.role})</div>
      <div class="row">
        {#if user.role === 'cliente'}
          <button on:click={openMyOrders}>🧾 Mis pedidos</button>
        {/if}
        <button on:click={() => { doLogout(); items = []; orders = []; tab = 'cliente' }}>Cerrar sesión</button>
      </div>
    </div>
    <div class="tabs" role="tablist">
      <button type="button" class="tab {tab==='cliente'?'active':''}" role="tab" aria-selected={tab==='cliente'} on:click={() => tab = 'cliente'}>Cliente</button>
      {#if user.role === 'admin'}
        <button type="button" class="tab {tab==='vendedor'?'active':''}" role="tab" aria-selected={tab==='vendedor'} on:click={() => tab = 'vendedor'}>Vendedor</button>
      {/if}
    </div>
  {/if}

{#if error}
  <div class="error">{error}</div>
{/if}

{#if user && tab === 'cliente'}
  <div class="card" style="margin-bottom:16px">
    <div class="section-title">Hacer pedido</div>
    <div class="row">
      <select bind:value={selectedItemId}>
        <option value="">Selecciona artículo</option>
        {#each items as ii}
          <option value={ii.id}>{ii.name} ({fmt(ii.price)}) · Stock {ii.stock}</option>
        {/each}
      </select>
      <input type="number" min="1" bind:value={quantity} />
    </div>
    <div class="row" style="margin-top:8px">
      <input placeholder="Nombre" bind:value={customer.name} />
    </div>
    <div class="row">
      <input placeholder="Dirección" bind:value={customer.address} />
    </div>
    <div class="row">
      <input placeholder="Teléfono" bind:value={customer.phone} />
    </div>
    <div class="row" style="margin-top:8px; justify-content: space-between">
      <div>Total: {fmt(orderTotal)}</div>
      <button disabled={loading || (user && user.role !== 'cliente') || !selectedItemId} on:click={makeOrder}>Pedir</button>
    </div>
  </div>
  <div class="section-title">Artículos</div>
  {#if loadingItems}
    <div class="row"><span class="spinner"></span> Cargando artículos...</div>
  {/if}
  <div class="grid">
    {#each items as i}
      <div class="card">
        <div style="font-weight:600">{i.name}</div>
        <div>Precio: {fmt(i.price)}</div>
        <div>Stock: {i.stock}</div>
      </div>
    {/each}
  </div>
{/if}

{#if user && tab === 'vendedor' && user.role === 'admin'}
  <div class="card" style="margin-bottom:16px">
    <div class="row">
      <input placeholder="Nombre" bind:value={name} />
      <input placeholder="Precio" type="number" bind:value={price} />
      <input placeholder="Stock" type="number" bind:value={stock} />
      <button disabled={loading} on:click={addItem}>Agregar</button>
    </div>
  </div>
  <h3>Artículos</h3>
  <div class="grid">
    {#each items as i}
      <div class="card">
        <div><strong>{i.name}</strong></div>
        <div>Precio: ${i.price}</div>
        <div>Stock: {i.stock}</div>
      </div>
    {/each}
  </div>
  <h3 style="margin-top:16px">Pedidos</h3>
  {#if loadingOrders}
    <div class="row"><span class="spinner"></span> Cargando pedidos...</div>
  {/if}
  <div class="grid">
    {#each orders as o}
      <div class="card">
        <div>Artículo: {itemsById[o.itemId]?.name || o.itemId}</div>
        <div>Cantidad: {o.quantity}</div>
        <div>Total: {fmt(o.total)}</div>
        <div>Cliente: {o.customerName}</div>
        <div>Dirección: {o.customerAddress}</div>
        <div>Teléfono: {o.customerPhone}</div>
        <div>Fecha: {new Date(o.createdAt).toLocaleString()}</div>
      </div>
    {/each}
  </div>
{:else if tab === 'vendedor'}
  <div class="error">No autorizado</div>
{/if}

{#if showMyOrders}
  <div class="modal-overlay" role="button" tabindex="0" aria-label="Cerrar modal" on:click={closeMyOrders} on:keydown={(e) => { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') closeMyOrders() }}>
  <div class="modal" role="dialog" aria-modal="true" on:pointerdown|stopPropagation>
    <div class="modal-header">
      <div class="section-title" style="margin:0">Mis pedidos</div>
      <button on:click={closeMyOrders}>Cerrar</button>
    </div>
    {#if loadingMyOrders}
      <div class="row"><span class="spinner"></span> Cargando...</div>
    {/if}
    <div class="grid">
      {#each myOrders as o}
        <div class="card">
          <div><strong>{o.item?.name || o.itemId}</strong></div>
          <div>Cantidad: {o.quantity}</div>
          <div>Total: {fmt(o.total)}</div>
          <div>Fecha: {new Date(o.createdAt).toLocaleString()}</div>
        </div>
      {/each}
    </div>
  </div>
  </div>
{/if}

</div>

<div class="toast-container">
  {#each toasts as t}
    <div class="toast {t.type}">{t.text}</div>
  {/each}
</div>