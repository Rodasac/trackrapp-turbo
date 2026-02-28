/**
 * Pure CSV utilities. RFC 4180 compliant: generate and parse CSV strings.
 */
function escapeField(value: string): string {
  if (value.includes('"') || value.includes(",") || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function generateCsv(headers: string[], rows: string[][]): string {
  const headerLine = headers.map(escapeField).join(",");
  const dataLines = rows.map((row) => row.map(escapeField).join(","));
  return [headerLine, ...dataLines].join("\n");
}

export interface ParsedCsv {
  headers: string[];
  rows: string[][];
}

/**
 * Parses a CSV string (RFC 4180) into headers and data rows.
 * Handles: quoted fields, embedded commas, doubled quotes, BOM, CRLF, whitespace trim, empty rows.
 */
export function parseCsv(csvString: string): ParsedCsv {
  // Strip UTF-8 BOM
  const input = csvString.startsWith("\uFEFF") ? csvString.slice(1) : csvString;

  // Normalize line endings to LF
  const normalized = input.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  const parseRow = (line: string): string[] => {
    const fields: string[] = [];
    let i = 0;
    while (i < line.length) {
      if (line[i] === '"') {
        // Quoted field
        let field = "";
        i++; // skip opening quote
        while (i < line.length) {
          if (line[i] === '"') {
            if (line[i + 1] === '"') {
              field += '"';
              i += 2;
            } else {
              i++; // skip closing quote
              break;
            }
          } else {
            field += line[i];
            i++;
          }
        }
        fields.push(field);
        // skip comma separator
        if (i < line.length && line[i] === ",") i++;
      } else {
        // Unquoted field — read until next comma
        const end = line.indexOf(",", i);
        if (end === -1) {
          fields.push(line.slice(i).trim());
          break;
        } else {
          fields.push(line.slice(i, end).trim());
          i = end + 1;
          // Handle trailing comma: last field is empty
          if (i === line.length) {
            fields.push("");
            break;
          }
        }
      }
    }
    return fields;
  };

  const lines = normalized.split("\n");
  const nonEmpty = lines.filter((l) => l.trim() !== "");

  if (nonEmpty.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = parseRow(nonEmpty[0]!);
  const rows = nonEmpty.slice(1).map(parseRow);

  return { headers, rows };
}
