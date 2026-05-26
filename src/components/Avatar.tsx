import { PEOPLE } from "../types";

export function Avatar({ id, size = 24 }: { id: string | null; size?: number }) {
  if (!id || !PEOPLE[id]) {
    return (
      <span
        title="Sem responsável"
        className="inline-grid shrink-0 place-items-center rounded-full border border-dashed border-line text-fg-muted"
        style={{ width: size, height: size, fontSize: size * 0.42 }}
      >
        ?
      </span>
    );
  }

  const person = PEOPLE[id];
  const initials = person.name
    .split(" ")
    .map((part) => part[0])
    .join("");

  return (
    <span
      title={person.name}
      className="inline-grid shrink-0 place-items-center rounded-full font-semibold text-white ring-2 ring-surface"
      style={{ width: size, height: size, fontSize: size * 0.4, background: person.color }}
    >
      {initials}
    </span>
  );
}
