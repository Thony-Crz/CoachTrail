export interface PolarActivity {
  id: string;
  date: string; // ISO date string
  sport: string;
  distanceMeters?: number;
  ascentMeters?: number;
  duration?: string; // ISO 8601 duration
}

export function isPolarActivityTrailRun(activity: PolarActivity): boolean {
  // Consider activities that are running-related sports
  const trailRunSports = [
    'RUNNING',
    'TRAIL_RUNNING',
    'MOUNTAIN_RUNNING',
    'FELL_RUNNING',
    'ORIENTEERING'
  ];
  
  return trailRunSports.some(sport => 
    activity.sport.toUpperCase().includes(sport)
  );
}

export function polarActivityToTrailRunData(activity: PolarActivity): {
  date: string;
  distanceKm: number;
  elevationGainM: number;
} {
  return {
    date: activity.date.split('T')[0], // Extract date part
    distanceKm: (activity.distanceMeters || 0) / 1000,
    elevationGainM: activity.ascentMeters || 0,
  };
}
