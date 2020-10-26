import { parse } from 'querystring';
import { camelizeKeys } from 'humps';

export function parseData<T> (body: string): T {
  const data = parse(body);

  return camelizeKeys(data) as T;
}