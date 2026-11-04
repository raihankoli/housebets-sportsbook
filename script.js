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
  const openBetCount = document.getElementById("open-bet-count");
  let selection = null;

  document.querySelectorAll(".nav-item, .mobile-nav a").forEach(link => {
    link.addEventListener("click", () => {
      document.querySelectorAll(".nav-item, .mobile-nav a")
        .forEach(item => item.classList.remove("active"));
      link.classList.add("active");
    });
  });

  oddsButtons.forEach(button => {
    button.addEventListener("click", () => {
      const odds = Number(button.querySelector("strong").textContent);
      const previousOdds = selection ? selection.odds : null;

if (previousOdds !== null && previousOdds !== odds) {
  oddsChangeMessage.style.display = "block";
  oddsChangeMessage.textContent =
    `Odds changed from ${previousOdds.toFixed(2)} to ${odds.toFixed(2)}.`;
}
      const outcome = button.firstChild.textContent.trim();

      oddsButtons.forEach(item => item.classList.remove("selected"));
      button.classList.add("selected");

   if (previousOdds !== null && previousOdds !== odds) {
  betMessage.textContent = "";
    }  
      selection = {
        match: "Arsenal vs Brighton",
        market: "Match Winner",
        outcome,
        odds
      };

      updateSlip();
    });
  });

  function updateSlip() {
    if (!selection) return;

    slipCount.textContent = "1";
    slipSelections.hidden = true;
    slipSelections.style.display = "none";
    slipDetails.hidden = false;
    oddsChangeMessage.style.display = "none";
oddsChangeMessage.textContent = "";

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

  function calculateReturn() {
    const stake = Number(stakeInput.value);
    const result = selection && stake > 0
      ? (stake * selection.odds).toFixed(2)
      : "0.00";

    potentialReturn.textContent = result + " USDT";
  }

  stakeInput.addEventListener("input", calculateReturn);

  placeBetButton.addEventListener("click", () => {
    if (!selection) return;

    const stake = Number(stakeInput.value);

    if (!Number.isFinite(stake) || stake <= 0) {
      betMessage.textContent = "Please enter a valid stake.";
      return;
    }

    openBetsList.classList.remove("empty-state");

openBetsList.innerHTML = `
  <div class="slip-selection">
    <strong>${selection.match}</strong>
    <p>${selection.market}: ${selection.outcome}</p>
    <p>Odds: ${selection.odds.toFixed(2)}</p>
    <p>Stake: ${stake.toFixed(2)} USDT</p>
    <strong>Potential Return: ${(stake * selection.odds).toFixed(2)} USDT</strong>
    <p style="color:#20d98b;">● Open</p>
  </div>
`;

openBetCount.textContent = "1";

betMessage.textContent = "Demo bet placed successfully!";
  });
});
