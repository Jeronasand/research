import type { ReactNode } from "react";

type TableBlock = {
  headers: string[];
  rows: string[][];
};

function splitTableRow(line: string) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isTableSeparator(line: string) {
  return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
}

function renderInline(text: string) {
  const parts: ReactNode[] = [];
  const pattern = /`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[1]) {
      parts.push(
        <code
          key={`${match.index}-code`}
          className="rounded bg-zinc-100 px-1 py-0.5 text-[0.92em] text-zinc-800"
        >
          {match[1]}
        </code>,
      );
    } else if (match[2] && match[3]) {
      parts.push(
        <a
          key={`${match.index}-link`}
          href={match[3]}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-zinc-950 underline decoration-zinc-400 underline-offset-2"
        >
          {match[2]}
        </a>,
      );
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

function renderTable(table: TableBlock, key: string) {
  return (
    <div key={key} className="overflow-x-auto rounded-md border border-zinc-200">
      <table className="min-w-full border-collapse text-left text-sm">
        <thead className="bg-zinc-50 text-zinc-700">
          <tr>
            {table.headers.map((header) => (
              <th key={header} className="border-b border-zinc-200 px-3 py-2 font-semibold">
                {renderInline(header)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, rowIndex) => (
            <tr key={`${key}-${rowIndex}`} className="odd:bg-white even:bg-zinc-50">
              {row.map((cell, cellIndex) => (
                <td key={`${key}-${rowIndex}-${cellIndex}`} className="border-b border-zinc-100 px-3 py-2 align-top">
                  {renderInline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function renderMarkdown(markdown: string) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const nodes: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    if (trimmed.startsWith("|") && index + 1 < lines.length && isTableSeparator(lines[index + 1])) {
      const table: TableBlock = {
        headers: splitTableRow(trimmed),
        rows: [],
      };
      index += 2;
      while (index < lines.length && lines[index].trim().startsWith("|")) {
        table.rows.push(splitTableRow(lines[index]));
        index += 1;
      }
      nodes.push(renderTable(table, `table-${index}`));
      continue;
    }

    if (trimmed.startsWith("- ")) {
      const items: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith("- ")) {
        items.push(lines[index].trim().slice(2));
        index += 1;
      }
      nodes.push(
        <ul key={`ul-${index}`} className="list-disc space-y-1 pl-5 text-sm leading-6 text-zinc-700">
          {items.map((item) => (
            <li key={item}>{renderInline(item)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    const heading = /^(#{1,3})\s+(.+)$/.exec(trimmed);
    if (heading) {
      const level = heading[1].length;
      const text = heading[2];
      if (level === 1) {
        nodes.push(
          <h1 key={`h1-${index}`} className="text-2xl font-semibold text-zinc-950">
            {renderInline(text)}
          </h1>,
        );
      } else if (level === 2) {
        nodes.push(
          <h2 key={`h2-${index}`} className="pt-2 text-lg font-semibold text-zinc-950">
            {renderInline(text)}
          </h2>,
        );
      } else {
        nodes.push(
          <h3 key={`h3-${index}`} className="text-base font-semibold text-zinc-900">
            {renderInline(text)}
          </h3>,
        );
      }
      index += 1;
      continue;
    }

    const paragraph: string[] = [];
    while (
      index < lines.length &&
      lines[index].trim() &&
      !lines[index].trim().startsWith("- ") &&
      !lines[index].trim().startsWith("#") &&
      !lines[index].trim().startsWith("|")
    ) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    nodes.push(
      <p key={`p-${index}`} className="text-sm leading-6 text-zinc-700">
        {renderInline(paragraph.join(" "))}
      </p>,
    );
  }

  return nodes;
}
