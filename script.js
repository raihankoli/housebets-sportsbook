document.addEventListener("DOMContentLoaded", () => {
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
