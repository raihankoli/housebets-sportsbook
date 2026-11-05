
document.addEventListener("DOMContentLoaded", () => {
  const oddsButtons = document.querySelectorAll(".odd-btn");
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

  // Market tabs
  document.querySelectorAll(".market-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".market-tab").forEach(item => {
        item.classList.remove("active");
      });

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
      document.querySelectorAll(".bet-tab").forEach(item => {
        item.classList.remove("active");
      });

      tab.classList.add("active");

      if (tab.dataset.tab === "open") {
        openBetsList.hidden = false;
        settledBetsList.hidden = true;
      } else {
        openBetsList.hidden = true;
        settledBetsList.hidden = false;
        renderSettledBets();
      }
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

  // Odds selection
  oddsButtons.forEach(button => {
    button.addEventListener("click", () => {
      const odds = Number(button.querySelector("strong").textContent);
      const outcome = button.childNodes[0].textContent.trim();

      const marketCard = button.closest(".market-card");
      let market = "Match Winner";

      if (marketCard) {
        const rows = [...marketCard.querySelectorAll(".odds-row")];
        const headings = [...marketCard.querySelectorAll("h3")];
        const rowIndex = rows.indexOf(button.closest(".odds-row"));

        market = headings[rowIndex]
          ? headings[rowIndex].textContent.trim()
          : "Match Market";
      }

      oddsButtons.forEach(item => item.classList.remove("selected"));
      button.classList.add("selected");

      selection = {
        match: "Arsenal vs Brighton",
        market,
        outcome,
        odds
      };

      betMessage.textContent = "";
      oddsChangeMessage.textContent = "";
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

    slipList.innerHTML = `
      <div class="slip-selection">
        <strong>${selection.match}</strong>
        <p>${selection.market}: ${selection.outcome}</p>
        <strong>Odds: ${selection.odds.toFixed(2)}</strong>
        <button id="remove-selection" type="button">
          ✕ Remove
        </button>
      </div>
    `;

    document.getElementById("remove-selection")
      .addEventListener("click", () => {
        selection = null;
        slipCount.textContent = "0";
        slipSelections.hidden = false;
        slipSelections.style.display = "";
        slipDetails.hidden = true;
        stakeInput.value = "";
        potentialReturn.textContent = "0.00 USDT";
        betMessage.textContent = "";

        oddsButtons.forEach(item => item.classList.remove("selected"));
      });

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
          <button class="settle-bet" data-index="${index}">
            Settle Demo Bet
          </button>
          <button class="cashout-bet" data-index="${index}">
            Cash Out Demo
          </button>
        </div>
      `).join("");
    }

    openBetCount.textContent = String(placedBets.length);

    document.querySelectorAll(".settle-bet").forEach(button => {
      button.addEventListener("click", () => {
        const index = Number(button.dataset.index);
        const bet = placedBets.splice(index, 1)[0];

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
        const index = Number(button.dataset.index);
        const bet = placedBets.splice(index, 1)[0];

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

    placedBets.push({
      match: selection.match,
      market: selection.market,
      outcome: selection.outcome,
      odds: selection.odds,
      stake,
      potentialReturn: stake * selection.odds
    });

    renderOpenBets();

    betMessage.textContent = "Demo bet placed successfully!";

    selection = null;
    slipCount.textContent = "0";
    slipSelections.hidden = false;
    slipSelections.style.display = "";
    slipDetails.hidden = true;
    slipList.innerHTML = "";
    stakeInput.value = "";
    potentialReturn.textContent = "0.00 USDT";
    oddsChangeMessage.textContent = "";

    oddsButtons.forEach(item => item.classList.remove("selected"));
  });
});
