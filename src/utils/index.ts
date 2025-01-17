import difference from "lodash/difference";
import { subscribeKey }               from "valtio/utils";
import { BackendState }               from "@/server/schema";
import { TextEvent, TextEventSource } from "@/types";

export function GetArrayDiff(source: string[], target: string[]) {
  const add      = difference(target, source);
  const remove = difference(source, target);
  return {add, remove}
}

export const useBackendUpdate = <Servicekey extends keyof BackendState["services"]>(serviceKey: Servicekey) => {
  return (key: keyof BackendState["services"][Servicekey]["data"], value: any) => window.ApiServer.patchService(serviceKey, s => (s.data as any)[key] = value)
}

// allows to dynamically switch text source
export function serviceSubscibeToSource<Obj extends object>(baseProxy: Obj, key: keyof Obj, fn: (e?: TextEvent) => void) {
  let lastSub = "";
  subscribeKey(baseProxy, key, (e: any) => {
    window.ApiShared.pubsub.unsubscribe(lastSub);
    if (e)
      lastSub = window.ApiShared.pubsub.subscribeText(e, fn)
  });
  lastSub = window.ApiShared.pubsub.subscribeText(baseProxy[key] as any, fn)
}

export function serviceSubscibeToInput<Obj extends object>(baseProxy: Obj, enableKey: keyof Obj, fn: (e?: TextEvent) => void) {
  let lastSub = "";
  subscribeKey(baseProxy, enableKey, (e: any) => {
    window.ApiShared.pubsub.unsubscribe(lastSub);
    if (e)
      lastSub = window.ApiShared.pubsub.subscribeText(TextEventSource.textfield, fn)
  });
  if (baseProxy[enableKey])
    lastSub = window.ApiShared.pubsub.subscribeText(TextEventSource.textfield, fn)
}

export function isEmptyValue(value: any) {
  return value === undefined
  || value === null
  || (typeof value === 'object' && Object.keys(value).length === 0) || (typeof value === 'string' && value.trim().length === 0)
}

//decode by niklasvh
// https://github.com/niklasvh/base64-arraybuffer/blob/master/src/index.ts
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const lookup = typeof Uint8Array === 'undefined' ? [] : new Uint8Array(256);
for (let i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
}

export const decodeB64toArrayBuffer = (base64: string): ArrayBuffer => {
  let bufferLength = base64.length * 0.75,
      len = base64.length,
      i,
      p = 0,
      encoded1,
      encoded2,
      encoded3,
      encoded4;

  if (base64[base64.length - 1] === '=') {
      bufferLength--;
      if (base64[base64.length - 2] === '=') {
          bufferLength--;
      }
  }

  const arraybuffer = new ArrayBuffer(bufferLength),
      bytes = new Uint8Array(arraybuffer);

  for (i = 0; i < len; i += 4) {
      encoded1 = lookup[base64.charCodeAt(i)];
      encoded2 = lookup[base64.charCodeAt(i + 1)];
      encoded3 = lookup[base64.charCodeAt(i + 2)];
      encoded4 = lookup[base64.charCodeAt(i + 3)];

      bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
      bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
      bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
  }

  return arraybuffer;
};
