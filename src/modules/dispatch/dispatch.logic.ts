import { RequestPriority, AmbulanceStatus, RequestStatus, AmbulanceType } from '@prisma/client';

export const PRIORITY_WEIGHTS: Record<RequestPriority, number> = {
  CRITICAL: 1,
  HIGH: 2,
  MEDIUM: 3,
  LOW: 4,
};

export const ALLOWED_TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  [RequestStatus.REQUESTED]: [RequestStatus.PRIORITY_ASSIGNED, RequestStatus.CANCELLED],
  [RequestStatus.PRIORITY_ASSIGNED]: [RequestStatus.AMBULANCE_ASSIGNED, RequestStatus.CANCELLED],
  [RequestStatus.AMBULANCE_ASSIGNED]: [RequestStatus.DRIVER_ACCEPTED, RequestStatus.CANCELLED],
  [RequestStatus.DRIVER_ACCEPTED]: [RequestStatus.EN_ROUTE, RequestStatus.CANCELLED],
  [RequestStatus.EN_ROUTE]: [RequestStatus.PATIENT_PICKED_UP, RequestStatus.CANCELLED],
  [RequestStatus.PATIENT_PICKED_UP]: [RequestStatus.TO_HOSPITAL, RequestStatus.CANCELLED],
  [RequestStatus.TO_HOSPITAL]: [RequestStatus.ARRIVED, RequestStatus.CANCELLED],
  [RequestStatus.ARRIVED]: [RequestStatus.COMPLETED],
  [RequestStatus.COMPLETED]: [],
  [RequestStatus.CANCELLED]: [],
  [RequestStatus.FAILED]: [],
};

export const isValidTransition = (from: RequestStatus, to: RequestStatus): boolean => {
  return (ALLOWED_TRANSITIONS[from] || []).includes(to);
};

export const haversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export interface AmbulanceCandidate {
  id: string;
  locationLat: number;
  locationLng: number;
  status: AmbulanceStatus;
  type: AmbulanceType;
  distanceKm?: number;
}

export const selectNearestAvailable = <
  T extends { id: string; locationLat: number; locationLng: number; status: AmbulanceStatus; type: AmbulanceType },
>(
  ambulances: T[],
  pickupLat: number,
  pickupLng: number,
  priority: RequestPriority
): (T & { distanceKm: number }) | null => {
  const available = ambulances.filter((a) => a.status === AmbulanceStatus.AVAILABLE);
  if (available.length === 0) return null;

  let best: (T & { distanceKm: number, score: number }) | null = null;

  for (const amb of available) {
    const distanceKm = haversineDistance(
      pickupLat,
      pickupLng,
      amb.locationLat,
      amb.locationLng,
    );

    let score = distanceKm;

    if (priority === RequestPriority.CRITICAL) {
      if (amb.type === AmbulanceType.ICU || amb.type === AmbulanceType.CARDIAC) {
        score -= 5;
      } else {
        score += 10;
      }
    } else if (priority === RequestPriority.HIGH) {
      if (amb.type === AmbulanceType.ICU || amb.type === AmbulanceType.CARDIAC) {
        score -= 2;
      }
    }

    if (!best || score < best.score) {
      best = { ...amb, distanceKm, score };
    }
  }

  if (!best) return null;
  const { score, ...result } = best;
  return result as (T & { distanceKm: number });
};

export const comparePriorityThenAge = (
  a: { priority: RequestPriority; createdAt: Date },
  b: { priority: RequestPriority; createdAt: Date },
): number => {
  const priorityDiff = PRIORITY_WEIGHTS[a.priority] - PRIORITY_WEIGHTS[b.priority];
  if (priorityDiff !== 0) return priorityDiff;
  return a.createdAt.getTime() - b.createdAt.getTime();
};
