<script lang="ts">
  import type { GetWeeklyStatsUseCase, WeeklyStats } from '../../domain/use-cases/GetWeeklyStatsUseCase';
  import type { DeleteWeekUseCase } from '../../domain/use-cases/DeleteWeekUseCase';
  
  interface Props {
    getWeeklyStatsUseCase: GetWeeklyStatsUseCase;
    deleteWeekUseCase: DeleteWeekUseCase;
    refreshTrigger: number;
  }
  
  let { getWeeklyStatsUseCase, deleteWeekUseCase, refreshTrigger }: Props = $props();
  
  let stats = $state<WeeklyStats[]>([]);
  let isLoading = $state(false);
  let deletingWeek = $state<string | null>(null);
  
  async function loadStats() {
    isLoading = true;
    try {
      stats = await getWeeklyStatsUseCase.execute();
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      isLoading = false;
    }
  }
  
  async function handleDeleteWeek(weekKey: string) {
    if (!confirm(`Delete all runs for ${weekKey}?`)) {
      return;
    }
    
    deletingWeek = weekKey;
    try {
      await deleteWeekUseCase.execute(weekKey);
      await loadStats(); // Reload stats after deletion
    } catch (error) {
      console.error('Failed to delete week:', error);
      alert('Failed to delete week. Please try again.');
    } finally {
      deletingWeek = null;
    }
  }
  
  $effect(() => {
    // React to refreshTrigger changes
    void refreshTrigger;
    loadStats();
  });
</script>

<div class="stats-container">
  <h2>Weekly Stats</h2>
  
  {#if isLoading}
    <p class="loading">Loading...</p>
  {:else if stats.length === 0}
    <p class="empty">No runs recorded yet. Add your first trail run!</p>
  {:else}
    <div class="stats-list">
      {#each stats as stat}
        <div class="stat-card">
          <div class="stat-week">{stat.week}</div>
          <div class="stat-points">
            <span class="points-value">{stat.totalPoints}</span>
            <span class="points-label">points</span>
          </div>
          <div class="stat-runs">{stat.runCount} run{stat.runCount !== 1 ? 's' : ''}</div>
          <button 
            class="delete-btn" 
            onclick={() => handleDeleteWeek(stat.week)}
            disabled={deletingWeek === stat.week}
            aria-label="Delete week {stat.week}"
          >
            {deletingWeek === stat.week ? '...' : '🗑️'}
          </button>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .stats-container {
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
  
  .loading,
  .empty {
    text-align: center;
    color: #666;
    padding: 2rem 1rem;
  }
  
  .stats-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .stat-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: #f9f9f9;
    border-radius: 6px;
    border: 1px solid #eee;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  
  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .stat-week {
    font-weight: 600;
    color: #333;
    font-size: 1rem;
  }
  
  .stat-points {
    display: flex;
    align-items: baseline;
    gap: 0.25rem;
  }
  
  .points-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #4a90e2;
  }
  
  .points-label {
    font-size: 0.875rem;
    color: #666;
  }
  
  .stat-runs {
    font-size: 0.875rem;
    color: #666;
  }
  
  .delete-btn {
    background: none;
    border: none;
    font-size: 1.25rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 4px;
    transition: background-color 0.2s, transform 0.1s;
    line-height: 1;
  }
  
  .delete-btn:hover:not(:disabled) {
    background-color: #ffe0e0;
    transform: scale(1.1);
  }
  
  .delete-btn:active:not(:disabled) {
    transform: scale(0.95);
  }
  
  .delete-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  @media (max-width: 640px) {
    .stats-container {
      padding: 1rem;
    }
    
    h2 {
      font-size: 1.25rem;
    }
    
    .stat-card {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }
    
    .points-value {
      font-size: 1.25rem;
    }
  }
</style>
