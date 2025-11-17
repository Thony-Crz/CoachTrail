<script lang="ts">
  import type { AddTrailRunUseCase } from '../../domain/use-cases/AddTrailRunUseCase';
  
  interface Props {
    addRunUseCase: AddTrailRunUseCase;
    onRunAdded: () => void;
  }
  
  let { addRunUseCase, onRunAdded }: Props = $props();
  
  let date = $state('');
  let distanceKm = $state('');
  let elevationGainM = $state('');
  let isSubmitting = $state(false);
  
  async function handleSubmit(e: Event) {
    e.preventDefault();
    
    if (!date || !distanceKm || !elevationGainM) return;
    
    isSubmitting = true;
    try {
      await addRunUseCase.execute({
        date,
        distanceKm: parseFloat(distanceKm),
        elevationGainM: parseFloat(elevationGainM),
      });
      
      // Reset form
      date = '';
      distanceKm = '';
      elevationGainM = '';
      
      onRunAdded();
    } catch (error) {
      console.error('Failed to add run:', error);
      alert('Failed to add run. Please try again.');
    } finally {
      isSubmitting = false;
    }
  }
</script>

<div class="form-container">
  <h2>Add Trail Run</h2>
  <form onsubmit={handleSubmit}>
    <div class="form-group">
      <label for="date">Date</label>
      <input
        id="date"
        type="date"
        bind:value={date}
        required
        disabled={isSubmitting}
      />
    </div>
    
    <div class="form-group">
      <label for="distance">Distance (km)</label>
      <input
        id="distance"
        type="number"
        step="0.1"
        min="0"
        bind:value={distanceKm}
        placeholder="e.g., 10.5"
        required
        disabled={isSubmitting}
      />
    </div>
    
    <div class="form-group">
      <label for="elevation">Elevation Gain (m)</label>
      <input
        id="elevation"
        type="number"
        step="1"
        min="0"
        bind:value={elevationGainM}
        placeholder="e.g., 500"
        required
        disabled={isSubmitting}
      />
    </div>
    
    <button type="submit" disabled={isSubmitting}>
      {isSubmitting ? 'Adding...' : 'Add Run'}
    </button>
  </form>
</div>

<style>
  .form-container {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  h2 {
    margin-top: 0;
    margin-bottom: 1.5rem;
    color: #333;
    font-size: 1.5rem;
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
  
  button {
    padding: 0.875rem 1.5rem;
    background-color: #4a90e2;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
    margin-top: 0.5rem;
  }
  
  button:hover:not(:disabled) {
    background-color: #357abd;
  }
  
  button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
  
  @media (max-width: 640px) {
    .form-container {
      padding: 1rem;
    }
    
    h2 {
      font-size: 1.25rem;
    }
  }
</style>
