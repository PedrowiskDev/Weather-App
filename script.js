document.addEventListener("DOMContentLoaded", function () {
  const container = document.querySelector(".hourly-forecast-container");
  let scrollAmount = 1; // Velocidade da rolagem
  let direction = 1; // 1 = direita, -1 = esquerda

  function autoScroll() {
    if (container.scrollLeft + container.clientWidth >= container.scrollWidth) {
      direction = -1; // Inverte a direção se atingir o final
    } else if (container.scrollLeft <= 0) {
      direction = 1; // Retorna ao início
    }

    container.scrollLeft += scrollAmount * direction; // Move a tabela
  }

  let scrollInterval = setInterval(autoScroll, 95); // Ajuste a velocidade
});
