// Valid 7v7 formations (7 starters + 3 subs = 10 total)
export const presetFormations = [
  '1-3-2-1', // Balanced (GK + 3 Defenders + 2 Midfielders + 1 Forward)
  '1-2-3-1', // Attacking (GK + 2 Defenders + 3 Midfielders + 1 Forward)
  '1-2-2-2', // Balanced Attack (GK + 2 Defenders + 2 Midfielders + 2 Forwards)
  '1-3-1-2', // Defensive (GK + 3 Defenders + 1 Midfielder + 2 Forwards)
  '1-4-1-1'  // Ultra Defensive (GK + 4 Defenders + 1 Midfielder + 1 Forward)
];

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

