document.addEventListener("DOMContentLoaded", () => {
  const oddsButtons = document.querySelectorAll(".odd-btn");
  const slipCount = document.getElementById("slip-count");
  const slipSelections = document.getElementById("slip-selections");
  const slipDetails = document.getElementById("slip-details");
  const slipList = document.getElementById("slip-list");
  const stakeInput = document.getElementById("stake");
  const potentialReturn = document.getElementById("potential-return");
  const placeBetButton = document.getElementById("place-bet");
  const betMessage = document.getElementById("bet-message");

  let selection = null;

  oddsButtons.forEach(button => {
    button.addEventListener("click", () => {
      const odds = Number(button.querySelector("strong").textContent);
      const outcome = button.firstChild.textContent.trim();

      oddsButtons.forEach(item => item.classList.remove("selected"));
      button.classList.add("selected");

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
    slipDetails.hidden = false;

    slipList.innerHTML = `
      <div class="slip-selection">
        <strong>${selection.match}</strong>
        <p>${selection.market}: ${selection.outcome}</p>
        <strong>Odds: ${selection.odds.toFixed(2)}</strong>
      </div>
    `;

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

    betMessage.textContent =
      "Demo only: Bet placement is not connected to a real betting service.";
  });
});.addEventListener("DOMContentLoaded", () => {
  console.log("Housebets Sportsbook ready");

  const navLinks = document.querySelectorAll(".nav-item, .mobile-nav a");

  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      navLinks.forEach(item => item.classList.remove("active"));
      link.classList.add("active");
    });
  });

  const oddsButtons = document.querySelectorAll(".odd-btn");

  oddsButtons.forEach(button => {
    button.addEventListener("click", () => {
      button.classList.toggle("selected");
    });
  });
});
