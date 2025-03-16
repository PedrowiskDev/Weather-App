import iconMap from "./iconMap.js";

let cityInput = document.getElementById("city_input"),
  searchButton = document.getElementById("search_button"),
  api_key = "c4d65a67a785993cc96312beef35cdfd",
  currentWeatherShowCase = document.querySelectorAll(".showcase-container")[0],
  fiveDaysForecastContainer = document.querySelector(
    ".weekly-forecast-container"
  );

function getweatherDetails(lat, lon, name, country, state) {
  let FORECAST_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${api_key}&lang=pt_br`,
    WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api_key}&lang=pt_br`,
    days = [
      "Domingo",
      "Segunda",
      "Terça",
      "Quarta",
      "Quinta",
      "Sexta",
      "Sábado",
    ];

  fetch(WEATHER_API_URL)
    .then((res) => res.json())
    .then((data) => {
      console.log("Resposta da API:", data);
      const iconCode = data.weather[0].icon;
      const customIconUrl = iconMap[iconCode];

      function capitalizeFirstLetter(text) {
        return text.charAt(0).toUpperCase() + text.slice(1);
      }

      currentWeatherShowCase.innerHTML = `
        <div class="showcase-text">
              <h2>${data.name}</h2>
              <p>${capitalizeFirstLetter(data.weather[0].description)}</p>
              <p>Chance de Chuva 0%</p>
              <h2>${(data.main.temp - 273.15).toFixed(0)}°</h2>
        </div>
        <div class="weather-icon">
          <img src="${customIconUrl}" alt="${data.weather[0].description}" />
        </div>
      `;
    })
    .catch((error) => {
      console.error("Erro ao obter detalhes do tempo:", error);
      alert("Falha para obter detalhes do tempo");
    });

  fetch(FORECAST_API_URL)
    .then((res) => res.json())
    .then((data) => {
      console.log("Resposta da API:", data);

      let uniqueForecastDays = [];
      let fiveDaysForecast = data.list.filter((forecast) => {
        let forecastDate = new Date(forecast.dt_txt).getDate();
        if (!uniqueForecastDays.includes(forecastDate)) {
          return uniqueForecastDays.push(forecastDate);
        }
      });
      console.log("Forecast for 5 days:", fiveDaysForecast);
      fiveDaysForecastContainer.innerHTML = ``;
      for (let i = 1; i < fiveDaysForecast.length; i++) {
        let date = new Date(fiveDaysForecast[i].dt_txt);

        const iconCode = fiveDaysForecast[i].weather[0].icon;
        const customIconUrl = iconMap[iconCode];

        fiveDaysForecastContainer.innerHTML += `
        <div class="day-weather-item">
          <p>${days[date.getDay()]}</p>
            <img src="${customIconUrl}" alt="" />
          <div>
            <p>${(fiveDaysForecast[i].main.temp_max - 273.15).toFixed(0)}</p>
            <p>${(fiveDaysForecast[i].main.temp_min - 273.15).toFixed(0)}</p>
          </div>
      </div>
        `;
      }
    })
    .catch((error) => {
      console.error("Erro ao obter detalhes do tempo:", error);
      alert("Falha para obter detalhes do tempo");
    });
}
function getCityCoordinates() {
  let cityName = cityInput.value.trim();
  cityInput.value = "";
  if (cityName == "") {
    alert("Insira o nome de uma cidade");
    return;
  }
  if (!cityName) return;
  let GEOCODING_API_URL_ = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${api_key}`;
  console.log(GEOCODING_API_URL_);
  fetch(GEOCODING_API_URL_)
    .then((res) => res.json())
    .then((data) => {
      if (data.length === 0) {
        throw new Error(`Cidade "${cityName}" não encontrada.`);
      }
      let { name, lat, lon, country, state } = data[0];
      getweatherDetails(lat, lon, name, country, state);
    })
    .catch((error) => {
      alert(
        `Falha para obter coordenadas da cidade: ${cityName}\nErro: ${error.message}`
      );
    });
}

searchButton.addEventListener("click", getCityCoordinates);

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
