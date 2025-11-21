export const presetFormations = ['1-3-2-1', '1-2-3-1', '1-2-2-2', '1-1-3-2'];

export const applyFormationToPlayers = (players, formationString) => {
  if (!formationString) return players;
  const formation = formationString.split('-').map((n) => parseInt(n, 10)).filter(Boolean);
  if (!formation.length) return players;

  const rows = [10, 30, 55, 80];
  const updated = [...players];
  const starters = players.filter((p) => !p.isSubstitute);

  let starterIndex = 0;
  formation.forEach((count, rowIdx) => {
    const spacing = 100 / (count + 1);
    for (let i = 0; i < count; i++) {
      if (starters[starterIndex]) {
        const player = starters[starterIndex];
        const x = spacing * (i + 1);
        const y = rows[rowIdx] ?? rows[rows.length - 1];
        updated[players.indexOf(player)] = { ...player, x, y };
        starterIndex += 1;
      }
    }
  });

  // any remaining starters go to midfield
  for (; starterIndex < starters.length; starterIndex++) {
    const player = starters[starterIndex];
    updated[players.indexOf(player)] = { ...player, x: 50, y: 50 };
  }

  return updated;
};

