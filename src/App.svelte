<script lang="ts">
  import TrailRunForm from './ui/components/TrailRunForm.svelte';
  import WeeklyStatsView from './ui/components/WeeklyStatsView.svelte';
  import PolarSettings from './ui/components/PolarSettings.svelte';
  import { LocalStorageTrailRunRepository } from './adapters/repositories/LocalStorageTrailRunRepository';
  import { LocalStoragePolarCredentialsRepository } from './adapters/repositories/LocalStoragePolarCredentialsRepository';
  import { PolarAccessLinkService } from './adapters/api/PolarAccessLinkService';
  import { AddTrailRunUseCase } from './domain/use-cases/AddTrailRunUseCase';
  import { GetWeeklyStatsUseCase } from './domain/use-cases/GetWeeklyStatsUseCase';
  import { DeleteWeekUseCase } from './domain/use-cases/DeleteWeekUseCase';
  import { SavePolarCredentialsUseCase } from './domain/use-cases/SavePolarCredentialsUseCase';
  import { GetPolarCredentialsUseCase } from './domain/use-cases/GetPolarCredentialsUseCase';
  import { SyncPolarActivitiesUseCase } from './domain/use-cases/SyncPolarActivitiesUseCase';

  // Initialize dependencies
  const repository = new LocalStorageTrailRunRepository();
  const addRunUseCase = new AddTrailRunUseCase(repository);
  const getWeeklyStatsUseCase = new GetWeeklyStatsUseCase(repository);
  const deleteWeekUseCase = new DeleteWeekUseCase(repository);

  // Polar integration dependencies
  const polarCredentialsRepo = new LocalStoragePolarCredentialsRepository();
  const polarApiService = new PolarAccessLinkService();
  const savePolarCredentialsUseCase = new SavePolarCredentialsUseCase(polarCredentialsRepo);
  const getPolarCredentialsUseCase = new GetPolarCredentialsUseCase(polarCredentialsRepo);
  const syncPolarActivitiesUseCase = new SyncPolarActivitiesUseCase(
    polarApiService,
    polarCredentialsRepo,
    repository
  );

  let refreshTrigger = $state(0);

  function handleRunAdded() {
    refreshTrigger++;
  }

  function handleSyncComplete() {
    refreshTrigger++;
  }
</script>

<main>
  <div class="container">
    <header>
      <div class="logo">
        <img src="mountain-logo.svg" alt="CoachTrail Mountain Logo" class="logo-img" />
      </div>
      <h1>CoachTrail</h1>
      <p>Track your trail running progress</p>
    </header>

    <div class="content">
      <div class="section">
        <PolarSettings 
          {savePolarCredentialsUseCase}
          {getPolarCredentialsUseCase}
          {syncPolarActivitiesUseCase}
          onSyncComplete={handleSyncComplete}
        />
        <TrailRunForm {addRunUseCase} onRunAdded={handleRunAdded} />
      </div>

      <div class="section">
        <WeeklyStatsView {getWeeklyStatsUseCase} {deleteWeekUseCase} {refreshTrigger} />
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
    background: linear-gradient(to bottom, #87CEEB 0%, #B0D8F0 40%, #E0F6FF 70%, #f0f8ff 100%);
    min-height: 100vh;
    position: relative;
    overflow-x: hidden;
  }

  :global(body::before) {
    content: '';
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100%;
    background-image: 
      /* Front mountain - left */
      linear-gradient(125deg, transparent 45%, #3d4552 45%, #3d4552 50%, transparent 50%),
      linear-gradient(55deg, transparent 45%, #4a5568 45%, #4a5568 50%, transparent 50%),
      /* Front mountain - right */
      linear-gradient(130deg, transparent 48%, #4a5568 48%, #4a5568 52%, transparent 52%),
      linear-gradient(50deg, transparent 48%, #3d4552 48%, #3d4552 52%, transparent 52%),
      /* Middle mountain - left */
      linear-gradient(120deg, transparent 52%, #5a6778 52%, #5a6778 56%, transparent 56%),
      linear-gradient(60deg, transparent 52%, #6b7280 52%, #6b7280 56%, transparent 56%),
      /* Middle mountain - center */
      linear-gradient(125deg, transparent 55%, #6b7280 55%, #6b7280 58%, transparent 58%),
      linear-gradient(55deg, transparent 55%, #7a8290 55%, #7a8290 58%, transparent 58%),
      /* Back mountain - right */
      linear-gradient(115deg, transparent 60%, #8b92a0 60%, #8b92a0 63%, transparent 63%),
      linear-gradient(65deg, transparent 60%, #9ca3af 60%, #9ca3af 63%, transparent 63%);
    background-position: 
      5% 100%, 15% 100%,
      25% 100%, 35% 100%,
      45% 100%, 55% 100%,
      60% 100%, 70% 100%,
      80% 100%, 90% 100%;
    background-size: 
      15% 50%, 15% 50%,
      15% 45%, 15% 45%,
      20% 40%, 20% 40%,
      18% 38%, 18% 38%,
      20% 35%, 20% 35%;
    background-repeat: no-repeat;
    z-index: 0;
    pointer-events: none;
  }

  main {
    padding: 2rem 1rem;
    min-height: 100vh;
    position: relative;
    z-index: 1;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
  }

  header {
    text-align: center;
    margin-bottom: 2rem;
    color: #2d3748;
  }

  .logo {
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
  }

  .logo-img {
    width: 120px;
    height: 120px;
    filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
  }

  h1 {
    font-size: 2.5rem;
    margin: 0 0 0.5rem 0;
    font-weight: 700;
    color: #1a202c;
    text-shadow: 2px 2px 4px rgba(255, 255, 255, 0.8);
  }

  header p {
    margin: 0;
    font-size: 1.125rem;
    color: #4a5568;
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
