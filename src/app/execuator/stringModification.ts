export interface StringModification {
  start: number;
  end: number;
  replaceCode: string;
}

export const modifyString = (source: string) => {
  /** Test if a StringModification is invalid */
  const invalid = ({ start, end }: StringModification) => start < 0 || end < 0 || end < start;
  /** Test if two StringModifications are overlapped */
  const overlap = (a: StringModification, b: StringModification) =>
    a.start <= b.end && b.start <= a.end;
  const mods: StringModification[] = [];
  const result = {
    source,
    insert(start: number, code: string) {
      mods.push({ start, end: start, replaceCode: code });
      return result;
    },
    remove(start: number, end: number) {
      mods.push({ start, end, replaceCode: '' });
      return result;
    },
    replace(start: number, end: number, code: string) {
      mods.push({ start, end, replaceCode: code });
      return result;
    },
    apply() {
      for (let i = 0; i < mods.length; ++i) {
        if (invalid(mods[i])) {
          continue;
        }
        const { start, end, replaceCode } = mods[i];
        source = source.substring(0, start) + replaceCode + source.substring(end);
        // side effect calculation
        // complexity: O(n^2)
        for (let j = i + 1; j < mods.length; ++j) {
          if (invalid(mods[j])) {
            continue;
          }
          // check if mods[j] overlaps mods[i]
          if (overlap(mods[i], mods[j])) {
            throw new Error(
              `StringModification: Mods overlaps [${mods[i].start},${mods[i].start}) and [${mods[j].start},${mods[j].start})`,
            );
          }
          // update mods[j] if necessary
          if (mods[i].end <= mods[j].start) {
            const delta = mods[i].replaceCode.length - (mods[i].end - mods[i].start);
            mods[j].start += delta;
            mods[j].end += delta;
          }
        }
      }
      return source;
    },
  };
  return result;
};

export type StringBuilder = ReturnType<typeof modifyString>;
