function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function boldHighlights(submitText: string, highlights: string[] = []): string {
  if (!submitText || !highlights?.length) return submitText;

  const sorted = [...highlights].filter(Boolean).sort((a, b) => b.length - a.length);

  let out = submitText;
  const used: Array<[number, number]> = [];

  for (const h of sorted) {
    const re = new RegExp(escapeRegExp(h), 'gi');
    out = out.replace(re, (m, offset: number) => {
      const end = offset + m.length;
      const overlap = used.some(([s, e]) => !(end <= s || offset >= e));
      if (overlap) return m;

      used.push([offset, end]);

      return `<b>${m}</b>`;
    });
  }

  return out;
}
