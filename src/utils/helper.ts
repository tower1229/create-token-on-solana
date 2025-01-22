export const getQueryParams = (key: string, url?: string) => {
  const search = url || location.hash.split("?")[1] || location.search;
  const params = new URLSearchParams(search).get(key);
  return params ? decodeURIComponent(params) : undefined;
};

export const validTwitterUrl = (url: string) => {
  const regex = /^https:\/\/(twitter|x)\.com\/.+\/status\/(\d+)/;
  const result = url.match(regex);
  return result ? result[2] : null;
};

// deep copy a js object
export function deepCopy<T>(obj: T): T {
  if (obj === null || (typeof obj !== "object" && typeof obj !== "function")) {
    return obj as T;
  }

  const copy: T = Array.isArray(obj)
    ? ([] as unknown as T)
    : ({ ...obj } as unknown as T);

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      (copy as any)[key] = deepCopy((obj as any)[key]);
    }
  }

  return copy;
}
export function shortString(
  str: string,
  pre: number = 10,
  after: number = 8
): string {
  if (str.length > pre + after) {
    return `${str.slice(0, pre)}...${str.slice(-after)}`;
  }
  return str;
}

export const fixJSON = (data: unknown, stringType?: boolean) => {
  const result = JSON.stringify(
    data,
    (_key, value) => (typeof value === "bigint" ? value.toString() : value) // return everything else unchanged
  );
  return stringType ? result : JSON.parse(result);
};

export const tweet = ({ text, url }: { text?: string; url?: string }) => {
  const search = new URLSearchParams();
  if (text) {
    search.append("text", text);
  }

  if (url) {
    search.append("url", url);
  }

  window.open(`https://twitter.com/intent/tweet?${search.toString()}`);
};
