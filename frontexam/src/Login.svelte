<script>
  import { doLogin, doRegister } from './store/session.js'
  let role = 'cliente'
  let email = ''
  let password = ''
  let name = ''
  let error = ''
  let loading = false
  let isRegister = false
  let adminSecret = ''
  async function submit() {
    loading = true
    error = ''
    const r = isRegister && role === 'cliente'
      ? await doRegister({ email, password, name, role: 'cliente' })
      : isRegister && role === 'admin'
      ? await doRegister({ email, password, name, role: 'admin', adminSecret })
      : await doLogin({ email, password, role, name })
    if (!r.ok) error = r.error
    loading = false
  }
</script>

<style>
  .card { border: 1px solid #ddd; padding: 12px; border-radius: 8px; max-width: 420px; margin: 24px auto }
  .row { display: flex; gap: 8px; align-items: center; margin: 8px 0 }
  input, select { padding: 8px; width: 100% }
  button { padding: 8px 12px }
  .error { color: #b00020; margin-top: 8px }
  .spinner { display: inline-block; width: 18px; height: 18px; border: 2px solid #ccc; border-top-color: #222; border-radius: 50%; animation: spin .8s linear infinite }
  @keyframes spin { to { transform: rotate(360deg) } }
</style>

<div class="card" aria-busy={loading}>
  <div class="row">
    <select bind:value={role} disabled={loading}>
      <option value="cliente">Cliente</option>
      <option value="admin">Administrador</option>
    </select>
  </div>
  <div class="row">
    <input placeholder="Email" bind:value={email} disabled={loading} />
  </div>
  <div class="row">
    <input type="password" placeholder="Contraseña" bind:value={password} disabled={loading} />
  </div>
  {#if role === 'cliente'}
    <div class="row">
      <input placeholder="Nombre (opcional)" bind:value={name} disabled={loading} />
    </div>
  {/if}
  <div class="row">
    <button disabled={loading} on:click={submit}>{isRegister ? (role==='admin' ? 'Crear admin' : 'Registrarse') : 'Entrar'}</button>
    {#if loading}
      <span class="spinner" aria-hidden="true"></span>
      <span>{isRegister ? (role==='admin' ? 'Creando admin...' : 'Registrando...') : 'Autenticando...'}</span>
    {/if}
  </div>
  {#if role === 'cliente'}
    <div class="row">
      <label><input type="checkbox" bind:checked={isRegister} disabled={loading} /> Crear cuenta nueva</label>
    </div>
  {/if}
  {#if role === 'admin'}
    <div class="row">
      <label><input type="checkbox" bind:checked={isRegister} disabled={loading} /> Crear admin</label>
    </div>
    {#if isRegister}
      <div class="row">
        <input placeholder="Clave admin" bind:value={adminSecret} disabled={loading} />
      </div>
    {/if}
  {/if}
  {#if error}
    <div class="error">{error}</div>
  {/if}
</div>