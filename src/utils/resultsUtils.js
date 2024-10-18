import { ref } from 'vue';

export const teamsData = ref([]);

export async function extractTeamsFromCSV(csvUrl) {
  const response = await fetch(csvUrl);
  const csvData = await response.text();
  return csvData.split('\n').slice(1).map(row => {
    const [id, name, conference] = row.split(',');
    return { id, name, conference };
  });
}

export function filterRows(allTeamRows, matchIndex, selectedConference, selectedTeam) {
  return allTeamRows.filter(row => {
    const match = row[matchIndex];
    const conferenceMatch = !selectedConference || teamsData.value.some(team => 
      team.conference === selectedConference && match.includes(team.name)
    );
    const teamMatch = !selectedTeam || match.includes(selectedTeam);
    return conferenceMatch && teamMatch;
  });
}

function formatMatch(match, results) {
  const setWins = results.match(/\[(\d+)-(\d+)\]/); // Extract set wins like [3-0] or [2-3]
  if (!setWins) return { winner: "", matchHTML: match }; // If results are not formatted as expected, return the match as is

  const team1SetWins = parseInt(setWins[1]);
  const team2SetWins = parseInt(setWins[2]);

  const [team1, team2] = match.split(" vs "); // Split the teams

  let winner, matchHTML;

  if (team1SetWins > team2SetWins) {
      // Team 1 is the winner
      winner = team1.trim();
      matchHTML = `<strong class="text-info" style="--bs-text-opacity: .75;">${team1.trim()}</strong> vs ${team2.trim()}`;
  } else {
      // Team 2 is the winner
      winner = team2.trim();
      matchHTML = `${team1.trim()} vs <strong class="text-info" style="--bs-text-opacity: .75;">${team2.trim()}</strong>`;
  }

  return { winner, matchHTML };
}

export function splitLine(line) {
  const result = [];
  let currentField = "";
  let inQuotes = false;

  for (let char of line) {
      if (char === '"') {
          inQuotes = !inQuotes; // Toggle quote state
      } else if (char === "," && !inQuotes) {
          result.push(currentField.trim()); // Push field and reset
          currentField = "";
      } else {
          currentField += char; // Accumulate characters in current field
      }
  }

  result.push(currentField.trim()); // Push the last field
  return result;
}


export async function fetchResultsData(url) {
  const response = await fetch(url);
  const csvData = await response.text();
  const rows = csvData.split("\n").filter((row) => row.trim() !== "");
  
  return rows.slice(1).map(row => {
    const rowData = splitLine(row);
    if (rowData && rowData.length >= 4) {
      const [date, match, results, boxScoreUrl] = rowData.map(item => item.trim());
      const { matchHTML } = formatMatch(match, results);
      return {
        date,
        match: matchHTML,
        results,
        boxScoreUrl
      };
    }
    return null;
  }).filter(row => row !== null);
}