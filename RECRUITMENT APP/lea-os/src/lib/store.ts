// Đồng bộ state React với cơ sở dữ liệu artifact (db) – mỗi bản ghi là một document.
// Setter giữ đúng chữ ký useState nên các phân hệ LEA-OS không phải sửa.
import { useCallback, useEffect, useRef, useState } from 'react';
import { caps } from './runtime';

type Any = any;
type SetState<T> = (u: T | ((p: T) => T)) => void;

const safeId = (id: string) => String(id).replace(/[^A-Za-z0-9_\-.~:@+]/g, '_').slice(0, 200) || 'x';
const clean = (o: Any) => JSON.parse(JSON.stringify(o ?? null));

// Hàng đợi ghi theo từng document để không ghi chồng
const chains = new Map<string, Promise<Any>>();
function queue(path: string, fn: () => Promise<Any>) {
  const p = (chains.get(path) || Promise.resolve()).then(fn).catch((e) => console.warn('db', path, e?.code || e));
  chains.set(path, p);
  return p;
}

export function useCollection<T extends { id: string }>(
  name: string,
  opts: { toModel?: (d: Any) => T; fromModel?: (t: T) => Any; order?: (a: T, b: T) => number; limit?: number } = {}
): [T[], SetState<T[]>, boolean] {
  const [items, setItems] = useState<T[]>([]);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<T[]>([]);
  const o = useRef(opts);

  useEffect(() => {
    let off: Any;
    let dead = false;
    caps.db.then((db: Any) => {
      if (!db || dead) return setLoaded(true);
      let q = db.collection(name);
      if (o.current.limit) q = q.limit(o.current.limit);
      off = q.onSnapshot(
        (s: Any) => {
          let list: T[] = s.docs.map((d: Any) => {
            const raw = { ...d.data() };
            const id = raw._id || d.id;
            delete raw._id;
            const m = { ...raw, id } as T;
            return o.current.toModel ? o.current.toModel(m) : m;
          });
          if (o.current.order) list = list.sort(o.current.order);
          ref.current = list;
          setItems(list);
          setLoaded(true);
        },
        () => setLoaded(true)
      );
    });
    return () => {
      dead = true;
      off && off();
    };
  }, [name]);

  const set: SetState<T[]> = useCallback(
    (u) => {
      const prev = ref.current;
      const next = typeof u === 'function' ? (u as Any)(prev) : u;
      ref.current = next;
      setItems(next);
      caps.db.then((db: Any) => {
        if (!db) return;
        const before = new Map(prev.map((x: Any) => [x.id, JSON.stringify(x)]));
        const ids = new Set(next.map((x: Any) => x.id));
        for (const it of next) {
          if (before.get(it.id) === JSON.stringify(it)) continue;
          const data = clean(o.current.fromModel ? o.current.fromModel(it) : it);
          delete data.id;
          data._id = it.id;
          const path = `${name}/${safeId(it.id)}`;
          queue(path, () => db.doc(path).set(data));
        }
        for (const id of before.keys())
          if (!ids.has(id)) {
            const path = `${name}/${safeId(id)}`;
            queue(path, () => db.doc(path).delete());
          }
      });
    },
    [name]
  );

  return [items, set, loaded];
}

export function useDoc<T>(path: string, initial: T, merge?: (stored: Any, init: T) => T): [T, SetState<T>, boolean] {
  const [val, setVal] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<T>(initial);
  const timer = useRef<Any>(null);

  useEffect(() => {
    let off: Any;
    caps.db.then((db: Any) => {
      if (!db) return setLoaded(true);
      off = db.doc(path).onSnapshot(
        (s: Any) => {
          if (s.exists) {
            const v = merge ? merge(s.data(), initial) : ({ ...initial, ...s.data() } as T);
            ref.current = v;
            setVal(v);
          }
          setLoaded(true);
        },
        () => setLoaded(true)
      );
    });
    return () => off && off();
  }, [path]);

  const set: SetState<T> = useCallback(
    (u) => {
      const next = typeof u === 'function' ? (u as Any)(ref.current) : u;
      ref.current = next;
      setVal(next);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        caps.db.then((db: Any) => db && queue(path, () => db.doc(path).set(clean(ref.current))));
      }, 500);
    },
    [path]
  );

  return [val, set, loaded];
}
