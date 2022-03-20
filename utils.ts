import { parse } from 'querystring';
import { camelizeKeys } from 'humps';

export function parseData<T> (body: string): T {
  const data = parse(body);

  return camelizeKeys(data) as T;
}

export function chunkString(input: string, perPage: number = 800): string[] {
  if (perPage < 2) {
    return [];
  }
  const chunks = input.split(/[\r\n]+/);
  const pages = [];
  let currentLength = 0;
  let drafts = [];
  while (chunks.length > 0) {
    if (currentLength >= perPage) {
      pages.push(drafts.join("\n"));
      drafts = [];
      currentLength = 0;
      continue;
    }
    const chunk = chunks.shift();
    if (chunk == null || chunk === "") {
      continue;
    }
    if (currentLength + chunk.length >= perPage) {
      const rooms = perPage - currentLength;
      // find a proper cut-off point from the current chunk
      const tokens = chunk.split(/(\s+)/);
      let boundary = 0;
      let trimmed = false;
      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (boundary + token.length > rooms) {
          if (token.length >= perPage) {
            boundary += rooms - boundary;
            trimmed = true;
          }
          break;
        }
        boundary += token.length;
      }
      // flush out drafts to a page
      const nextBoundary = trimmed ? boundary - 1 : boundary;
      const leading = chunk.slice(0, nextBoundary);
      pages.push([...drafts, trimmed ? `${leading}-` : leading].join("\n"));
      // push the remainder of the text back to chunks list
      const trailing = chunk.slice(nextBoundary);
      chunks.unshift(trailing);
      drafts = [];
      currentLength = 0;
    } else {
      drafts.push(chunk);
      // plus one for padding a line-feed character correctly
      currentLength += chunk.length + 1;
    }
  }
  // append uncompleted drafts to pages
  if (drafts.length > 0) {
    pages.push(drafts.join("\n"));
  }
  return pages;
}

export const wait = async (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(null);
    }, ms)
  })
}