import { ref } from 'vue';



export async function parseTeamsCSV(csvUrl) {
    const response = await fetch(csvUrl);
    const csvData = await response.text();

    // Split CSV into rows and map over them (skipping the header row)
    return csvData.split('\n').slice(1).map((row, index) => {
        // Destructure relevant columns from CSV
        const [team_name, conference_short, school_athletic_url, conference_name, division] = row.split(',');

        return {
            id: index + 1,               // Use index as a team ID
            team_name: team_name.trim(),  // Clean up the team name
            conference: conference_short.trim(),  // Short form of the conference
            school_url: school_athletic_url.trim(), // Athletic URL
            conference_full: conference_name.trim(), // Full conference name
            division: division.trim()    // Division information
        };
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




