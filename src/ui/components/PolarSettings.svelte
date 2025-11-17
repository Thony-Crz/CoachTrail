<script lang="ts">
  import type { SavePolarCredentialsUseCase } from '../../domain/use-cases/SavePolarCredentialsUseCase';
  import type { GetPolarCredentialsUseCase } from '../../domain/use-cases/GetPolarCredentialsUseCase';
  import type { SyncPolarActivitiesUseCase } from '../../domain/use-cases/SyncPolarActivitiesUseCase';
  import type { PolarCredentials } from '../../domain/entities/PolarCredentials';
  import { PolarOAuthService } from '../../domain/services/PolarOAuthService';
  import { onMount } from 'svelte';
  
  interface Props {
    savePolarCredentialsUseCase: SavePolarCredentialsUseCase;
    getPolarCredentialsUseCase: GetPolarCredentialsUseCase;
    syncPolarActivitiesUseCase: SyncPolarActivitiesUseCase;
    onSyncComplete: () => void;
  }
  
  let { 
    savePolarCredentialsUseCase, 
    getPolarCredentialsUseCase,
    syncPolarActivitiesUseCase,
    onSyncComplete 
  }: Props = $props();
  
  const oauthService = new PolarOAuthService();
  
  let clientId = $state('');
  let clientSecret = $state('');
  let accessToken = $state('');
  let userId = $state('');
  let isExpanded = $state(false);
  let isSaving = $state(false);
  let isSyncing = $state(false);
  let isConnecting = $state(false);
  let hasCredentials = $state(false);
  let isConnected = $state(false);
  let syncMessage = $state('');
  
  // Get redirect URI for OAuth callback
  function getRedirectUri(): string {
    const url = new URL(window.location.href);
    return `${url.origin}${url.pathname}`;
  }
  
  // Load existing credentials on mount
  onMount(async () => {
    await loadCredentials();
    await handleOAuthCallback();
  });
  
  async function loadCredentials() {
    const creds = await getPolarCredentialsUseCase.execute();
    if (creds) {
      clientId = creds.clientId || '';
      clientSecret = creds.clientSecret || '';
      accessToken = creds.accessToken || '';
      userId = creds.userId || '';
      hasCredentials = !!(creds.clientId && creds.clientSecret);
      isConnected = !!(creds.accessToken && creds.userId);
    }
  }
  
  async function handleOAuthCallback() {
    try {
      const params = oauthService.parseCallbackParams(window.location.href);
      if (!params) return; // Not a callback
      
      isConnecting = true;
      syncMessage = 'Completing authorization...';
      
      // Get stored credentials
      const creds = await getPolarCredentialsUseCase.execute();
      if (!creds || !creds.clientId || !creds.clientSecret) {
        throw new Error('Client credentials not found. Please save your Client ID and Secret first.');
      }
      
      // Exchange code for token
      const tokenData = await oauthService.exchangeCodeForToken(
        params.code,
        params.state,
        creds.clientId,
        creds.clientSecret,
        getRedirectUri()
      );
      
      // Register user and get user ID
      const userData = await oauthService.registerUser(tokenData.accessToken);
      
      // Save the complete credentials
      const updatedCreds: PolarCredentials = {
        clientId: creds.clientId,
        clientSecret: creds.clientSecret,
        accessToken: tokenData.accessToken,
        userId: userData.userId,
      };
      
      await savePolarCredentialsUseCase.execute(updatedCreds);
      
      // Update state
      accessToken = tokenData.accessToken;
      userId = userData.userId;
      isConnected = true;
      syncMessage = 'Successfully connected to Polar! You can now sync your activities.';
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
    } catch (error) {
      console.error('OAuth callback error:', error);
      syncMessage = `Authorization failed: ${error}`;
      // Clean up URL even on error
      window.history.replaceState({}, document.title, window.location.pathname);
    } finally {
      isConnecting = false;
    }
  }
  
  async function handleSave(e: Event) {
    e.preventDefault();
    
    if (!clientId || !clientSecret) return;
    
    isSaving = true;
    try {
      // Trim whitespace from credentials to prevent OAuth errors
      const trimmedClientId = clientId.trim();
      const trimmedClientSecret = clientSecret.trim();
      
      const credentials: PolarCredentials = {
        clientId: trimmedClientId,
        clientSecret: trimmedClientSecret,
        accessToken: accessToken || undefined,
        userId: userId || undefined,
      };
      
      await savePolarCredentialsUseCase.execute(credentials);
      
      // Update UI state with trimmed values
      clientId = trimmedClientId;
      clientSecret = trimmedClientSecret;
      
      hasCredentials = true;
      syncMessage = 'Credentials saved successfully! Click "Connect with Polar" to authorize.';
      setTimeout(() => syncMessage = '', 3000);
    } catch (error) {
      console.error('Failed to save credentials:', error);
      syncMessage = 'Failed to save credentials. Please try again.';
    } finally {
      isSaving = false;
    }
  }
  
  async function handleConnect() {
    if (!hasCredentials) {
      syncMessage = 'Please save your Client ID and Client Secret first.';
      return;
    }
    
    try {
      isConnecting = true;
      await oauthService.initiateAuthorization(clientId, getRedirectUri());
    } catch (error) {
      console.error('Failed to initiate authorization:', error);
      syncMessage = `Failed to connect: ${error}`;
      isConnecting = false;
    }
  }
  
  async function handleDisconnect() {
    try {
      const credentials: PolarCredentials = {
        clientId,
        clientSecret,
        accessToken: undefined,
        userId: undefined,
      };
      
      await savePolarCredentialsUseCase.execute(credentials);
      accessToken = '';
      userId = '';
      isConnected = false;
      syncMessage = 'Disconnected from Polar.';
      setTimeout(() => syncMessage = '', 3000);
    } catch (error) {
      console.error('Failed to disconnect:', error);
      syncMessage = 'Failed to disconnect. Please try again.';
    }
  }
  
  async function handleSync() {
    if (!isConnected) {
      syncMessage = 'Please connect to Polar first.';
      return;
    }
    
    isSyncing = true;
    syncMessage = 'Syncing activities from Polar Flow...';
    
    try {
      const result = await syncPolarActivitiesUseCase.execute();
      
      if (result.errors.length > 0) {
        syncMessage = `Sync completed with errors. Imported: ${result.imported}, Skipped: ${result.skipped}. Errors: ${result.errors.join(', ')}`;
      } else {
        syncMessage = `Sync completed! Imported: ${result.imported} runs, Skipped: ${result.skipped} runs.`;
      }
      
      if (result.imported > 0) {
        onSyncComplete();
      }
    } catch (error) {
      console.error('Sync failed:', error);
      syncMessage = `Sync failed: ${error}`;
    } finally {
      isSyncing = false;
    }
  }
  
  function toggleExpanded() {
    isExpanded = !isExpanded;
  }
</script>

<div class="polar-settings">
  <div class="header" onclick={toggleExpanded} onkeydown={(e) => e.key === 'Enter' && toggleExpanded()} role="button" tabindex="0">
    <h3>⚡ Polar Flow Integration {isConnected ? '✓' : ''}</h3>
    <button type="button" class="toggle-btn" aria-label={isExpanded ? 'Collapse' : 'Expand'}>
      {isExpanded ? '▼' : '▶'}
    </button>
  </div>
  
  {#if isExpanded}
    <div class="content">
      <div class="info">
        <p>
          Connect your Polar Flow account to automatically import your trail running activities.
        </p>
        
        {#if isConnected}
          <div class="connection-status connected">
            ✓ Connected to Polar Flow
          </div>
        {:else}
          <div class="connection-status disconnected">
            Not connected
          </div>
        {/if}
        
        <details>
          <summary>How to set up the integration</summary>
          <ol>
            <li>Visit <a href="https://admin.polaraccesslink.com/" target="_blank" rel="noopener">Polar AccessLink Admin</a></li>
            <li>Create a new OAuth2 client application</li>
            <li>Set the redirect URL to: <code>{getRedirectUri()}</code></li>
            <li>Copy your Client ID and Client Secret below</li>
            <li>Click "Save Credentials", then "Connect with Polar"</li>
          </ol>
        </details>
      </div>
      
      <form onsubmit={handleSave}>
        <div class="form-group">
          <label for="polar-client-id">Client ID *</label>
          <input
            id="polar-client-id"
            type="text"
            bind:value={clientId}
            placeholder="Enter your Polar Client ID"
            required
            disabled={isSaving || isConnecting}
          />
        </div>
        
        <div class="form-group">
          <label for="polar-client-secret">Client Secret *</label>
          <input
            id="polar-client-secret"
            type="password"
            bind:value={clientSecret}
            placeholder="Enter your Polar Client Secret"
            required
            disabled={isSaving || isConnecting}
          />
        </div>
        
        <div class="button-group">
          <button type="submit" class="save-btn" disabled={isSaving || isConnecting}>
            {isSaving ? 'Saving...' : 'Save Credentials'}
          </button>
          
          {#if !isConnected}
            <button 
              type="button" 
              class="connect-btn" 
              onclick={handleConnect}
              disabled={!hasCredentials || isConnecting}
            >
              {isConnecting ? 'Connecting...' : '🔗 Connect with Polar'}
            </button>
          {:else}
            <button 
              type="button" 
              class="disconnect-btn" 
              onclick={handleDisconnect}
            >
              Disconnect
            </button>
            
            <button 
              type="button" 
              class="sync-btn" 
              onclick={handleSync}
              disabled={isSyncing}
            >
              {isSyncing ? 'Syncing...' : '🔄 Sync Activities'}
            </button>
          {/if}
        </div>
      </form>
      
      {#if syncMessage}
        <div class="message" class:error={syncMessage.includes('failed') || syncMessage.includes('error') || syncMessage.includes('Failed')}>
          {syncMessage}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .polar-settings {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin-bottom: 1.5rem;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    user-select: none;
  }
  
  h3 {
    margin: 0;
    color: #333;
    font-size: 1.25rem;
  }
  
  .toggle-btn {
    background: none;
    border: none;
    font-size: 1rem;
    cursor: pointer;
    padding: 0.5rem;
    color: #666;
  }
  
  .content {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #eee;
  }
  
  .info {
    margin-bottom: 1.5rem;
    color: #666;
    font-size: 0.9rem;
  }
  
  .info p {
    margin: 0 0 0.5rem 0;
  }
  
  .connection-status {
    padding: 0.5rem 1rem;
    border-radius: 4px;
    font-weight: 500;
    margin: 0.75rem 0;
  }
  
  .connection-status.connected {
    background-color: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  }
  
  .connection-status.disconnected {
    background-color: #f8f9fa;
    color: #6c757d;
    border: 1px solid #dee2e6;
  }
  
  details {
    margin-top: 0.5rem;
  }
  
  summary {
    cursor: pointer;
    color: #4a90e2;
    font-weight: 500;
  }
  
  details ol {
    margin: 0.5rem 0 0 1.5rem;
    padding: 0;
  }
  
  details li {
    margin: 0.25rem 0;
  }
  
  details a {
    color: #4a90e2;
    text-decoration: none;
  }
  
  details a:hover {
    text-decoration: underline;
  }
  
  details code {
    background-color: #f5f5f5;
    padding: 2px 6px;
    border-radius: 3px;
    font-family: monospace;
    font-size: 0.85rem;
  }
  
  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  label {
    font-weight: 500;
    color: #555;
    font-size: 0.9rem;
  }
  
  input {
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
    transition: border-color 0.2s;
  }
  
  input:focus {
    outline: none;
    border-color: #4a90e2;
  }
  
  input:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
  
  .button-group {
    display: flex;
    gap: 1rem;
    margin-top: 0.5rem;
  }
  
  button {
    padding: 0.875rem 1.5rem;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .save-btn {
    flex: 1;
    background-color: #4a90e2;
    color: white;
  }
  
  .save-btn:hover:not(:disabled) {
    background-color: #357abd;
  }
  
  .connect-btn {
    flex: 1;
    background-color: #28a745;
    color: white;
  }
  
  .connect-btn:hover:not(:disabled) {
    background-color: #218838;
  }
  
  .disconnect-btn {
    flex: 0.5;
    background-color: #6c757d;
    color: white;
  }
  
  .disconnect-btn:hover:not(:disabled) {
    background-color: #5a6268;
  }
  
  .sync-btn {
    flex: 1;
    background-color: #5cb85c;
    color: white;
  }
  
  .sync-btn:hover:not(:disabled) {
    background-color: #4cae4c;
  }
  
  button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
  
  .message {
    margin-top: 1rem;
    padding: 0.75rem;
    border-radius: 4px;
    background-color: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  }
  
  .message.error {
    background-color: #f8d7da;
    color: #721c24;
    border-color: #f5c6cb;
  }
  
  @media (max-width: 640px) {
    .polar-settings {
      padding: 1rem;
    }
    
    h3 {
      font-size: 1.1rem;
    }
    
    .button-group {
      flex-direction: column;
    }
  }
</style>
