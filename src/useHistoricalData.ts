import { useEffect, useState } from "react";
import {
  loadMilitaryStatistics,
  loadRegionStatistics,
  loadSources,
} from "./dataRepository";
import type {
  MilitaryStatistic,
  Source,
  StatisticFields,
  StatisticRecord,
} from "./types";

interface LoadState<T> {
  data: T;
  loading: boolean;
  error: Error | null;
}

function useLoadedData<K, T>(
  key: K,
  loader: (key: K) => Promise<T>,
  initialValue: T,
): LoadState<T> {
  const [state, setState] = useState<LoadState<T>>({
    data: initialValue,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let current = true;
    setState({ data: initialValue, loading: true, error: null });
    loader(key).then(
      (data) => current && setState({ data, loading: false, error: null }),
      (error: unknown) => current && setState({
        data: initialValue,
        loading: false,
        error: error instanceof Error ? error : new Error("Historical data load failed"),
      }),
    );
    return () => {
      current = false;
    };
  }, [initialValue, key, loader]);

  return state;
}

const emptySources: Source[] = [];
const emptyStatistics: StatisticRecord[] = [];
const emptyStatisticFields: StatisticFields[] = [];
const emptyMilitaryStatistics: MilitaryStatistic[] = [];
const sourceLoader = () => loadSources();
const militaryStatisticsLoader = () => loadMilitaryStatistics();
const regionStatisticsLoader = (regionId: string) =>
  loadRegionStatistics(regionId) as Promise<StatisticRecord[]>;
const statisticLoader = (regionId: string | null) =>
  loadRegionStatistics(regionId) as Promise<StatisticFields[]>;

export function useSources() {
  return useLoadedData("sources", sourceLoader, emptySources);
}

export function useRegionStatistics(regionId: string) {
  return useLoadedData(regionId, regionStatisticsLoader, emptyStatistics);
}

export function useStatistics(regionId: string | null) {
  return useLoadedData(regionId, statisticLoader, emptyStatisticFields);
}

export function useMilitaryStatistics() {
  return useLoadedData("military", militaryStatisticsLoader, emptyMilitaryStatistics);
}
