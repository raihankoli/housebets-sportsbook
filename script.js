
document.addEventListener("DOMContentLoaded", () => {
  const oddsButtons = [...document.querySelectorAll(".odd-btn")];
  const slipCount = document.getElementById("slip-count");
  const slipToggle = document.getElementById("slip-toggle");
const betSlip = document.getElementById("bet-slip");

slipToggle.addEventListener("click", () => {
  const isExpanded = betSlip.classList.toggle("expanded");

  if (!selection) {
    slipSelections.hidden = !isExpanded;
    slipSelections.style.display = isExpanded ? "block" : "none";
  }
});
  
  const slipSelections = document.getElementById("slip-selections");
  const slipDetails = document.getElementById("slip-details");
  const slipList = document.getElementById("slip-list");
  const oddsChangeMessage = document.getElementById("odds-change-message");
  const stakeInput = document.getElementById("stake");
  const potentialReturn = document.getElementById("potential-return");
  const placeBetButton = document.getElementById("place-bet");
  const betMessage = document.getElementById("bet-message");
  const openBetsList = document.getElementById("open-bets-list");
  const settledBetsList = document.getElementById("settled-bets-list");
  const openBetCount = document.getElementById("open-bet-count");

  let selection = null;
  let placedBets = [];
  let settledBets = [];
  let oddsChanged = false;
  let acceptNewOdds = false;
  let suspended = false;

  // Market tabs
  document.querySelectorAll(".market-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".market-tab").forEach(item =>
        item.classList.remove("active")
      );
      tab.classList.add("active");

      document.querySelectorAll(".market-panel").forEach(panel => {
        panel.hidden =
          panel.dataset.marketPanel !== tab.dataset.marketTab;
      });
    });
  });

  // My Bets tabs
  document.querySelectorAll(".bet-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".bet-tab").forEach(item =>
        item.classList.remove("active")
      );

      tab.classList.add("active");
      openBetsList.hidden = tab.dataset.tab !== "open";
      settledBetsList.hidden = tab.dataset.tab !== "settled";

      if (tab.dataset.tab === "settled") renderSettledBets();
    });
  });

  // Navigation active state
  document.querySelectorAll(".nav-item, .mobile-nav a").forEach(link => {
    link.addEventListener("click", () => {
      document.querySelectorAll(".nav-item, .mobile-nav a")
        .forEach(item => item.classList.remove("active"));
      link.classList.add("active");
    });
  });

 // Read market and outcome from an odds button
function getButtonData(button) {
  const odds = Number(button.querySelector("strong").textContent);
  const outcome = button.childNodes[0].textContent.trim();

  const liveMatch = button.closest(".live-match-row");

  if (liveMatch) {
    const teams = [...liveMatch.querySelectorAll(".live-teams span")]
      .map(team => team.textContent.trim());

    return {
      match: teams.join(" vs "),
      market: liveMatch.querySelector(".live-market > span:first-child")?.textContent.trim() || "Match Result",
      outcome,
      odds
    };
  }

  const card = button.closest(".market-card");
  const rows = card ? [...card.querySelectorAll(".odds-row")] : [];
  const headings = card ? [...card.querySelectorAll("h3")] : [];
  const rowIndex = rows.indexOf(button.closest(".odds-row"));

  return {
    match: [...document.querySelectorAll("#match-details .panel-card .match-teams .team h3")]
      .map(team => team.textContent.trim())
      .join(" vs ") || "Arsenal vs Brighton",
    market: headings[rowIndex]?.textContent.trim() || "Match Winner",
    outcome,
    odds
  };
}

  // Odds selection
  oddsButtons.forEach(button => {
    button.addEventListener("click", () => {
      if (button.dataset.suspended === "true") return;

      const next = getButtonData(button);

      if (
        selection &&
        selection.market === next.market &&
        selection.outcome === next.outcome &&
        selection.odds !== next.odds
      ) {
        oddsChanged = true;
        acceptNewOdds = false;
      } else {
        oddsChanged = false;
        acceptNewOdds = false;
      }

      suspended = false;
      selection = next;

      oddsButtons.forEach(item => item.classList.remove("selected"));
      button.classList.add("selected");

      betMessage.textContent = "";
      updateSlip();
    });
  });

  // Update Bet Slip
  function updateSlip() {
    if (!selection) return;

    slipCount.textContent = "1";
    slipSelections.hidden = true;
    slipSelections.style.display = "none";
    slipDetails.hidden = false;

    let warning = "";

    if (oddsChanged && !acceptNewOdds) {
      warning = `
        <p class="odds-warning">
          Odds have changed. Accept the new odds to continue.
        </p>
        <button type="button" id="accept-odds">
          Accept New Odds (${selection.odds.toFixed(2)})
        </button>
      `;
    }

    if (suspended) {
      warning = `
        <p class="odds-warning">
          This selection is currently suspended.
        </p>
        <button type="button" id="resume-selection">
          Resume Selection
        </button>
      `;
    }

    oddsChangeMessage.innerHTML = warning;
    oddsChangeMessage.style.display = warning ? "block" : "none";

    slipList.innerHTML = `
      <div class="slip-selection">
        <strong>${selection.match}</strong>
        <p>${selection.market}: ${selection.outcome}</p>
        <strong>Odds: ${selection.odds.toFixed(2)}</strong>
        <button id="remove-selection" type="button">✕ Remove</button>
      </div>
    `;

    document.getElementById("remove-selection").addEventListener("click", () => {
      selection = null;
      oddsChanged = false;
      acceptNewOdds = false;
      suspended = false;
      slipCount.textContent = "0";
      slipSelections.hidden = false;
      slipSelections.style.display = "";
      slipDetails.hidden = true;
      stakeInput.value = "";
      potentialReturn.textContent = "0.00 USDT";
      oddsChangeMessage.innerHTML = "";
      oddsChangeMessage.style.display = "none";
      oddsButtons.forEach(item => item.classList.remove("selected"));
    });

    const acceptButton = document.getElementById("accept-odds");
    if (acceptButton) {
      acceptButton.addEventListener("click", () => {
        acceptNewOdds = true;
        oddsChanged = false;
        updateSlip();
        calculateReturn();
      });
    }

    const resumeButton = document.getElementById("resume-selection");
    if (resumeButton) {
      resumeButton.addEventListener("click", () => {
        suspended = false;
        updateSlip();
      });
    }

    calculateReturn();
  }

  // Render Open Bets
  function renderOpenBets() {
    if (placedBets.length === 0) {
      openBetsList.classList.add("empty-state");
      openBetsList.innerHTML = `
        <h3>No open bets yet</h3>
        <p>Your placed bets will appear here.</p>
      `;
    } else {
      openBetsList.classList.remove("empty-state");

      openBetsList.innerHTML = placedBets.map((bet, index) => `
        <div class="slip-selection">
          <strong>${bet.match}</strong>
          <p>${bet.market}: ${bet.outcome}</p>
          <p>Odds: ${bet.odds.toFixed(2)}</p>
          <p>Stake: ${bet.stake.toFixed(2)} USDT</p>
          <strong>Potential Return: ${bet.potentialReturn.toFixed(2)} USDT</strong>
          <button class="settle-bet" data-index="${index}">Settle Demo Bet</button>
          <button class="cashout-bet" data-index="${index}">Cash Out Demo</button>
        </div>
      `).join("");
    }

    openBetCount.textContent = String(placedBets.length);

    document.querySelectorAll(".settle-bet").forEach(button => {
      button.addEventListener("click", () => {
        const bet = placedBets.splice(Number(button.dataset.index), 1)[0];
        if (bet) {
          bet.status = "Settled";
          settledBets.push(bet);
          renderOpenBets();
          renderSettledBets();
        }
      });
    });

    document.querySelectorAll(".cashout-bet").forEach(button => {
      button.addEventListener("click", () => {
        const bet = placedBets.splice(Number(button.dataset.index), 1)[0];
        if (bet) {
          bet.status = "Cashed Out";
          settledBets.push(bet);
          renderOpenBets();
          renderSettledBets();
        }
      });
    });
  }

  // Render Settled Bets
  function renderSettledBets() {
    if (settledBets.length === 0) {
      settledBetsList.innerHTML = `
        <div class="empty-state">
          <h3>No settled bets yet</h3>
          <p>Your settled bets will appear here.</p>
        </div>
      `;
      return;
    }

    settledBetsList.innerHTML = settledBets.map(bet => `
      <div class="slip-selection">
        <strong>${bet.match}</strong>
        <p>${bet.market}: ${bet.outcome}</p>
        <p>Odds: ${bet.odds.toFixed(2)}</p>
        <p>Stake: ${bet.stake.toFixed(2)} USDT</p>
        <p>Potential Return: ${bet.potentialReturn.toFixed(2)} USDT</p>
        <p style="color:#20d98b;">● ${bet.status}</p>
      </div>
    `).join("");
  }

  // Calculate Potential Return
  function calculateReturn() {
    const stake = Number(stakeInput.value);
    const result = selection && stake > 0
      ? (stake * selection.odds).toFixed(2)
      : "0.00";

    potentialReturn.textContent = result + " USDT";
  }

  stakeInput.addEventListener("input", calculateReturn);

  // Place Demo Bet
  placeBetButton.addEventListener("click", () => {
    if (!selection) return;

    const stake = Number(stakeInput.value);

    if (!Number.isFinite(stake) || stake <= 0) {
      betMessage.textContent = "Please enter a valid stake.";
      return;
    }

    if (suspended) {
      betMessage.textContent = "This selection is suspended.";
      return;
    }

    if (oddsChanged && !acceptNewOdds) {
      betMessage.textContent = "Please accept the new odds first.";
      return;
    }

    placedBets.push({
      ...selection,
      stake,
      potentialReturn: stake * selection.odds
    });

    renderOpenBets();
    betMessage.textContent = "Demo bet placed successfully!";

    selection = null;
    betSlip.classList.remove("expanded");
    oddsChanged = false;
    acceptNewOdds = false;
    suspended = false;

    slipCount.textContent = "0";
    slipSelections.hidden = false;
    slipSelections.style.display = "";
    slipDetails.hidden = true;
    slipList.innerHTML = "";
    stakeInput.value = "";
    potentialReturn.textContent = "0.00 USDT";
    oddsChangeMessage.innerHTML = "";
    oddsChangeMessage.style.display = "none";
    oddsButtons.forEach(item => item.classList.remove("selected"));
  });

  // Demo controls for testing odds and suspension
  function addDemoControls() {
    const section = document.getElementById("match-details");
    if (!section) return;

    if (document.getElementById("demo-market-controls")) return;

    const controls = document.createElement("div");
    controls.id = "demo-market-controls";
    controls.className = "market-card";
    controls.innerHTML = `
      <h3>Demo Market Controls</h3>
      <p>Test odds movement and suspended markets.</p>
      <button type="button" id="change-demo-odds">Change Selected Odds</button>
      <button type="button" id="suspend-demo-selection">Suspend Selection</button>
    `;

    section.appendChild(controls);

    document.getElementById("change-demo-odds").addEventListener("click", () => {
      if (!selection) {
        betMessage.textContent = "Select odds first to test odds movement.";
        return;
      }

      const button = oddsButtons.find(item => {
        const data = getButtonData(item);
        return data.market === selection.market &&
          data.outcome === selection.outcome;
      });

      if (!button) return;

      const strong = button.querySelector("strong");
      const oldOdds = Number(strong.textContent);
      const newOdds = Number((oldOdds + 0.10).toFixed(2));

      strong.textContent = newOdds.toFixed(2);
      selection.odds = newOdds;
      oddsChanged = true;
      acceptNewOdds = false;
      updateSlip();
    });

    document.getElementById("suspend-demo-selection").addEventListener("click", () => {
      if (!selection) {
        betMessage.textContent = "Select odds first to test suspension.";
        return;
      }

      suspended = true;
      updateSlip();
    });
  }

    // Football League Filters
const footballFilters = document.querySelectorAll(".football-filter");
const footballCards = document.querySelectorAll("#football .match-card");

footballFilters.forEach(filter => {
  filter.addEventListener("click", () => {
    footballFilters.forEach(item => item.classList.remove("active"));
    filter.classList.add("active");

    const selectedLeague = filter.dataset.filter;

    footballCards.forEach(card => {
      const cardLeague = card.dataset.league;

      card.style.display =
        selectedLeague === "all" || cardLeague === selectedLeague
          ? ""
          : "none";
    });
  });
});


// Live Sport Filters and Search
const liveFilters = document.querySelectorAll("#live-sport-filters button");
const liveCompetitions = document.querySelectorAll("#live .live-competition");
const liveSearch = document.getElementById("live-search");
const startingSoon = document.querySelector("#live .starting-soon");

function filterLiveMatches() {
  const activeFilter = document.querySelector("#live-sport-filters button.active");
  const selectedSport = activeFilter?.dataset.sport || "all";
  const searchText = liveSearch?.value.toLowerCase().trim() || "";

  let visibleCount = 0;

  liveCompetitions.forEach(competition => {
    const sportMatches =
      selectedSport === "all" ||
      competition.dataset.sport === selectedSport;

    const textMatches =
      competition.textContent.toLowerCase().includes(searchText);

    const show = sportMatches && textMatches;

    competition.style.display = show ? "" : "none";

    if (show) visibleCount++;
  });

  if (startingSoon) {
    startingSoon.hidden = visibleCount > 0;
  }
}

liveFilters.forEach(button => {
  button.addEventListener("click", () => {
    liveFilters.forEach(item => item.classList.remove("active"));
    button.classList.add("active");
    filterLiveMatches();
  });
});

if (liveSearch) {
  liveSearch.addEventListener("input", filterLiveMatches);
}

filterLiveMatches();
     
  // Open Match Details
const matchDetails = document.getElementById("match-details");
const footballSection = document.getElementById("football");
const liveSection = document.getElementById("live");

function updateMatchMarkets(team1, team2, matchIndex) {
  const marketPanels = matchDetails.querySelectorAll(".market-panel");

  marketPanels.forEach(panel => {
    panel.querySelectorAll(".odd-btn").forEach(button => {
      const label = button.childNodes[0];

      if (label && label.nodeType === Node.TEXT_NODE) {
        label.textContent = label.textContent
          .replaceAll("Arsenal", team1)
          .replaceAll("Brighton", team2);
      }

      const odds = button.querySelector("strong");

      if (odds) {
        if (!button.dataset.baseOdds) {
          button.dataset.baseOdds = odds.textContent.trim();
        }
 const baseOdds = Number(button.dataset.baseOdds);
        odds.textContent = baseOdds.toFixed(2);
      }
    });
  });
}

function openMatchDetails(matchElement) {
  let team1 = "";
  let team2 = "";
  let badge1 = "";
  let badge2 = "";
  let league = "";
  let isLive = matchElement.classList.contains("live-match-row");

  if (isLive) {
    const teams = matchElement.querySelectorAll(".live-teams span");

    if (teams.length < 2) return;

    team1 = teams[0].textContent.trim();
    team2 = teams[1].textContent.trim();

    badge1 = team1.slice(0, 3).toUpperCase();
    badge2 = team2.slice(0, 3).toUpperCase();

    league = matchElement.closest(".live-competition")
      ?.querySelector(".live-competition-heading span")
      ?.textContent.trim() || "LIVE MATCH";
  } else {
    const teams = matchElement.querySelectorAll(".match-teams .team");

    if (teams.length < 2) return;

    const getTeamName = team => {
      const badge = team.querySelector(".team-badge");
      const name = [...team.querySelectorAll("span")]
        .filter(span => !span.classList.contains("team-badge"))
        .pop();

      return {
        name: name?.textContent.trim() || "",
        badge: badge?.textContent.trim() || ""
      };
    };

    const first = getTeamName(teams[0]);
    const second = getTeamName(teams[1]);

    team1 = first.name;
    team2 = second.name;
    badge1 = first.badge;
    badge2 = second.badge;

    league = matchElement.querySelector(".competition")
      ?.textContent.trim() || "FOOTBALL";
  }

  const detailTeams = matchDetails.querySelectorAll(
    ".panel-card .match-teams .team"
  );

  if (detailTeams.length >= 2) {
    detailTeams[0].querySelector(".team-badge").textContent = badge1;
    detailTeams[0].querySelector("h3").textContent = team1;

    detailTeams[1].querySelector(".team-badge").textContent = badge2;
    detailTeams[1].querySelector("h3").textContent = team2;
  }

  const detailLeague = matchDetails.querySelector(".match-league-badge");

  if (detailLeague) {
    detailLeague.textContent = league;
  }

  const scoreBox = matchDetails.querySelector(".match-score");

  if (scoreBox) {
    const status = scoreBox.querySelector(".match-status");
    const score = scoreBox.querySelector("strong");
    const clock = scoreBox.querySelector(".match-clock");

    if (isLive) {
      const scores = matchElement.querySelectorAll(".live-score span");
      const liveClock = matchElement.querySelector(".live-clock");

      if (status) status.textContent = "LIVE";
      if (score && scores.length >= 2) {
        score.textContent =
          `${scores[0].textContent.trim()} - ${scores[1].textContent.trim()}`;
      }
      if (clock) {
        clock.textContent = liveClock?.textContent.trim() || "LIVE";
      }
    } else {
      if (status) status.textContent = "UPCOMING";
      if (score) score.textContent = "0 - 0";
      if (clock) clock.textContent = "Kick-off: 20:00";
    }
  }

  const allMatches = [
    ...document.querySelectorAll("#live .live-match-row, #football .match-card")
  ];

  const matchIndex = Math.max(0, allMatches.indexOf(matchElement));

  updateMatchMarkets(team1, team2, matchIndex);

  matchDetails.hidden = false;
  addDemoControls();

  document.querySelectorAll(".market-tab").forEach(tab => {
    tab.classList.toggle(
      "active",
      tab.dataset.marketTab === "popular"
    );
  });

  document.querySelectorAll(".market-panel").forEach(panel => {
    panel.hidden = panel.dataset.marketPanel !== "popular";
  });

  matchDetails.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

[footballSection, liveSection].forEach(section => {
  if (!section || !matchDetails) return;

  section.addEventListener("click", event => {

    const matchElement = event.target.closest(
      section.id === "football" ? ".match-card" : ".live-match-row"
    );

    if (!matchElement || !section.contains(matchElement)) return;

    openMatchDetails(matchElement);
  });
});
   }); 
