
document.addEventListener("DOMContentLoaded", () => {
  const oddsButtons = [...document.querySelectorAll(".odd-btn")];
  const slipCount = document.getElementById("slip-count");
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
    const card = button.closest(".market-card");
    const rows = card ? [...card.querySelectorAll(".odds-row")] : [];
    const headings = card ? [...card.querySelectorAll("h3")] : [];
    const rowIndex = rows.indexOf(button.closest(".odds-row"));

    return {
      match: "Arsenal vs Brighton",
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

  addDemoControls();
});
