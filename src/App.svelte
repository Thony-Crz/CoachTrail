<script lang="ts">
  import TrailRunForm from './ui/components/TrailRunForm.svelte';
  import WeeklyStatsView from './ui/components/WeeklyStatsView.svelte';
  import { LocalStorageTrailRunRepository } from './adapters/repositories/LocalStorageTrailRunRepository';
  import { AddTrailRunUseCase } from './domain/use-cases/AddTrailRunUseCase';
  import { GetWeeklyStatsUseCase } from './domain/use-cases/GetWeeklyStatsUseCase';

  // Initialize dependencies
  const repository = new LocalStorageTrailRunRepository();
  const addRunUseCase = new AddTrailRunUseCase(repository);
  const getWeeklyStatsUseCase = new GetWeeklyStatsUseCase(repository);

  let refreshTrigger = $state(0);

  function handleRunAdded() {
    refreshTrigger++;
  }
</script>

<main>
  <div class="container">
    <header>
      <h1>🏔️ CoachTrail</h1>
      <p>Track your trail running progress</p>
    </header>

    <div class="content">
      <div class="section">
        <TrailRunForm {addRunUseCase} onRunAdded={handleRunAdded} />
      </div>

      <div class="section">
        <WeeklyStatsView {getWeeklyStatsUseCase} {refreshTrigger} />
      </div>
    </div>
  </div>
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
  }

  main {
    padding: 2rem 1rem;
    min-height: 100vh;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
  }

  header {
    text-align: center;
    margin-bottom: 2rem;
    color: white;
  }

  h1 {
    font-size: 2.5rem;
    margin: 0 0 0.5rem 0;
    font-weight: 700;
  }

  header p {
    margin: 0;
    font-size: 1.125rem;
    opacity: 0.9;
  }

  .content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }

  .section {
    display: flex;
    flex-direction: column;
  }

  @media (max-width: 768px) {
    main {
      padding: 1rem 0.5rem;
    }

    h1 {
      font-size: 2rem;
    }

    header p {
      font-size: 1rem;
    }

    .content {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
  }
</style>
