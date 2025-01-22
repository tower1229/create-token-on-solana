import { makeAutoObservable, runInAction } from "mobx";
import type { FetchFunctions } from "./fetchFunctions.ts";

// 类型定义
type FetchKey = keyof FetchFunctions;
type FetchResult<K extends FetchKey> = Awaited<ReturnType<FetchFunctions[K]>>;

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expireTime: number;
  loading: boolean;
  error: Error | null;
}

type FetchFunction<T> = (...args: any[]) => Promise<T>;

export default class DataStore {
  private cache: Map<string, CacheItem<any>> = new Map();
  private fetchMap: Map<string, FetchFunction<any>> = new Map();

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  /**
   * 注册单个数据获取函数
   */
  register<T>(key: string, fetchFn: FetchFunction<T>) {
    this.fetchMap.set(key, fetchFn);
  }

  /**
   * 批量注册数据获取函数
   */
  registerAll(fetchMap: Record<string, FetchFunction<any>>) {
    Object.entries(fetchMap).forEach(([key, fn]) => {
      this.register(key, fn);
    });
  }

  /**
   * 获取数据，支持缓存
   */
  async get<K extends FetchKey>(
    key: K,
    expireTime: number = 60 * 60 * 1000,
    ...args: Parameters<FetchFunctions[K]>
  ): Promise<FetchResult<K>> {
    const cacheKey = this.generateCacheKey(key, args);
    const fetchFn = this.fetchMap.get(key);

    if (!fetchFn) {
      throw new Error(`No fetch function registered for key: ${key}`);
    }

    const cached = this.cache.get(cacheKey);
    const now = Date.now();

    // 返回有效缓存
    if (
      cached &&
      !cached.loading &&
      now - cached.timestamp < cached.expireTime
    ) {
      return cached.data;
    }

    // 如果正在加载，等待现有请求
    if (cached?.loading) {
      return new Promise<FetchResult<K>>((resolve, reject) => {
        const checkCache = () => {
          const current = this.cache.get(cacheKey);
          if (!current?.loading) {
            if (current?.error) {
              reject(current.error);
            } else {
              resolve(current?.data);
            }
          } else {
            setTimeout(checkCache, 100);
          }
        };
        checkCache();
      });
    }

    // 设置加载状态
    runInAction(() => {
      this.cache.set(cacheKey, {
        data: cached?.data ?? null,
        timestamp: cached?.timestamp ?? 0,
        expireTime,
        loading: true,
        error: null,
      });
    });

    try {
      const data = await fetchFn(...args);

      runInAction(() => {
        this.cache.set(cacheKey, {
          data,
          timestamp: now,
          expireTime,
          loading: false,
          error: null,
        });
      });

      return data;
    } catch (error) {
      runInAction(() => {
        this.cache.set(cacheKey, {
          data: cached?.data ?? null,
          timestamp: cached?.timestamp ?? 0,
          expireTime,
          loading: false,
          error: error as Error,
        });
      });
      throw error;
    }
  }

  /**
   * 同步获取缓存数据
   */
  getCached<K extends FetchKey>(
    key: K,
    ...args: Parameters<FetchFunctions[K]>
  ): FetchResult<K> | null {
    const cacheKey = this.generateCacheKey(key, args);
    const cached = this.cache.get(cacheKey);
    const now = Date.now();

    if (cached && now - cached.timestamp < cached.expireTime) {
      return cached.data;
    }
    return null;
  }

  /**
   * 检查是否有有效缓存
   */
  hasValidCache<K extends FetchKey>(
    key: K,
    ...args: Parameters<FetchFunctions[K]>
  ): boolean {
    const cacheKey = this.generateCacheKey(key, args);
    const cached = this.cache.get(cacheKey);
    if (!cached) return false;

    return Date.now() - cached.timestamp < cached.expireTime;
  }

  /**
   * 获取加载状态
   */
  isLoading<K extends FetchKey>(
    key: K,
    ...args: Parameters<FetchFunctions[K]>
  ): boolean {
    const cacheKey = this.generateCacheKey(key, args);
    return this.cache.get(cacheKey)?.loading ?? false;
  }

  /**
   * 获取错误状态
   */
  getError<K extends FetchKey>(
    key: K,
    ...args: Parameters<FetchFunctions[K]>
  ): Error | null {
    const cacheKey = this.generateCacheKey(key, args);
    return this.cache.get(cacheKey)?.error ?? null;
  }

  /**
   * 强制刷新数据
   */
  async refresh<K extends FetchKey>(
    key: K,
    ...args: Parameters<FetchFunctions[K]>
  ): Promise<FetchResult<K>> {
    const cacheKey = this.generateCacheKey(key, args);
    this.cache.delete(cacheKey);
    return this.get(key, undefined, ...args);
  }

  /**
   * 预加载数据
   */
  preload<K extends FetchKey>(
    key: K,
    ...args: Parameters<FetchFunctions[K]>
  ): void {
    this.get(key, undefined, ...args).catch(console.error);
  }

  /**
   * 批量预加载
   */
  preloadAll(keys: FetchKey[]): void {
    keys.forEach((key) => this.preload(key));
  }

  /**
   * 清除指定键值的缓存
   */
  clear<K extends FetchKey>(
    key: K,
    ...args: Parameters<FetchFunctions[K]>
  ): void {
    const cacheKey = this.generateCacheKey(key, args);
    this.cache.delete(cacheKey);
  }

  /**
   * 清除所有缓存
   */
  clearAll(): void {
    this.cache.clear();
  }

  /**
   * 生成缓存键值
   */
  private generateCacheKey(key: string, args: any[]): string {
    return args.length > 0 ? `${key}:${JSON.stringify(args)}` : key;
  }
}
