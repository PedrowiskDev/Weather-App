import iconMap from "./iconMap.js";

let cityInput = document.getElementById("city_input"),
  searchButton = document.getElementById("search_button"),
  api_key = "c4d65a67a785993cc96312beef35cdfd",
  currentWeatherShowCase = document.querySelectorAll(".showcase-container ")[0],
  currentWeatherDetails = document.querySelector(".weather-details-container"),
  fiveDaysForecastContainer = document.querySelector(
    ".weekly-forecast-container"
  ),
  hourlyForecastContainer = document.querySelector(
    ".hourly-forecast-container"
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

  let popChance = 0;

  fetch(FORECAST_API_URL)
    .then((res) => res.json())
    .then((forecastData) => {
      console.log("Resposta da API de Previsão:", forecastData);

      let now = new Date();
      let closestForecast = forecastData.list.reduce((prev, curr) => {
        return Math.abs(new Date(curr.dt_txt) - now) <
          Math.abs(new Date(prev.dt_txt) - now)
          ? curr
          : prev;
      });

      popChance = (closestForecast.pop * 100).toFixed(0);
    })
    .catch((error) => {
      console.error("Erro ao obter previsão do tempo:", error);
      alert("Falha para obter previsão do tempo");
    })
    .finally(() => {
      fetch(WEATHER_API_URL)
        .then((res) => res.json())
        .then((data) => {
          console.log("Resposta da API do Clima Atual:", data);
          const iconCode = data.weather[0].icon;
          const customIconUrl = iconMap[iconCode];
          const windSpeedKmh = (data.wind.speed * 3.6).toFixed(1);
          const visibility = data.visibility / 1000;

          function capitalizeFirstLetter(text) {
            return text.charAt(0).toUpperCase() + text.slice(1);
          }

          currentWeatherShowCase.innerHTML = `
          <div class="showcase-text">
                <h2>${data.name}</h2>
                <p>${capitalizeFirstLetter(data.weather[0].description)}</p>
                <h2>${(data.main.temp - 273.15).toFixed(0)}°</h2>
          </div>
          <div class="weather-icon">
            <img src="${customIconUrl}" alt="${data.weather[0].description}" />
          </div>

          `;
          currentWeatherDetails.innerHTML = `

          <div class="weather-details-item">
            <p>Sensação Térmica</p>
            <div>
              <img src="./images/temperature.svg" alt="temperatura" />
              <p>${(data.main.feels_like - 273.15).toFixed(0)}°</p>
            </div>
          </div>
          <div class="weather-details-item">
            <p>Chance de Chuva</p>
            <div>
              <img src="./images/water-drop.svg" alt="chance de chuva" />
              <p>${popChance}%</p>
            </div>
          </div>
          <div class="weather-details-item">
            <p>Vento</p>
            <div>
              <img src="./images/wind.svg" alt="vento" />
              <p>${windSpeedKmh}<span>km/h</span></p>
            </div>
          </div>
          <div class="weather-details-item">
            <p>Pressão Atmosférica</p>
            <div>
              <img src="./images/pressure.svg" alt="Pressão Atmosférica" />
              <p>${data.main.pressure}<span>hPa</span></p>
            </div>
          </div>
          <div class="weather-details-item">
            <p>Humidade</p>
            <div>
              <img src="./images/humidity.svg" alt="Humidade" />
              <p>${data.main.humidity}%</p>
            </div>
          </div>
          <div class="weather-details-item">
            <p>Visibilidade</p>
            <div>
              <img src="./images/visibility.svg" alt="Visibilidade" />
              <p>${visibility}<span>Km</span></p>
            </div>
          </div>
        `;
        })
        .catch((error) => {
          console.error("Erro ao obter detalhes do tempo:", error);
          alert("Falha para obter detalhes do tempo");
        });
    });

  fetch(FORECAST_API_URL)
    .then((res) => res.json())
    .then((data) => {
      console.log("Resposta da API:", data);
      let hourlyForecast = data.list;

      let dailyForecasts = {};

      hourlyForecastContainer.innerHTML = ``;
      for (let i = 0; i < 7; i++) {
        const iconCode = hourlyForecast[i].weather[0].icon;
        const customIconUrl = iconMap[iconCode];
        let hrForecastDate = new Date(hourlyForecast[i].dt_txt);
        let hr = hrForecastDate.getHours();
        let a = "PM";
        if (hr < 12) a = "AM";
        if (hr == 0) hr = 12;
        if (hr > 12) hr = hr - 12;
        hourlyForecastContainer.innerHTML += `
        <div class="hour-weather-item">
            <p>${hr}:00 ${a}</p>
            <img src="${customIconUrl}" alt="sol com nuvem" />
            <p>${(hourlyForecast[i].main.temp - 273.15).toFixed(0)}°</p>
        </div>
        `;
      }
      data.list.forEach((forecast) => {
        let [year, month, day] = forecast.dt_txt.split(" ")[0].split("-");
        let dateKey = `${year}-${month}-${day}`;

        let tempMin = forecast.main.temp_min - 273.15;
        let tempMax = forecast.main.temp_max - 273.15;
        let iconCode = forecast.weather[0].icon;

        if (!dailyForecasts[dateKey]) {
          dailyForecasts[dateKey] = {
            min: tempMin,
            max: tempMax,
            icon: iconCode,
            middayTimestamp: forecast.dt,
          };
        } else {
          dailyForecasts[dateKey].min = Math.min(
            dailyForecasts[dateKey].min,
            tempMin
          );
          dailyForecasts[dateKey].max = Math.max(
            dailyForecasts[dateKey].max,
            tempMax
          );

          if (
            Math.abs((forecast.dt % 86400) - 43200) <
            Math.abs((dailyForecasts[dateKey].middayTimestamp % 86400) - 43200)
          ) {
            dailyForecasts[dateKey].icon = iconCode;
            dailyForecasts[dateKey].middayTimestamp = forecast.dt;
          }
        }
      });

      console.log("Temperaturas diárias:", dailyForecasts);

      fiveDaysForecastContainer.innerHTML = ``;
      let dates = Object.keys(dailyForecasts).slice(0, 5);

      dates.forEach((dateStr) => {
        let [year, month, day] = dateStr.split("-");
        let dateObj = new Date(Date.UTC(year, month - 1, day));
        let dayName = days[dateObj.getUTCDay()];

        let minTemp = dailyForecasts[dateStr].min.toFixed(0);
        let maxTemp = dailyForecasts[dateStr].max.toFixed(0);
        let customIconUrl = iconMap[dailyForecasts[dateStr].icon];

        fiveDaysForecastContainer.innerHTML += `
          <div class="day-weather-item">
            <p>${dayName}</p>
            <img src="${customIconUrl}" alt="" />
            <div>
              <p> ${maxTemp}°</p>
              <p> ${minTemp}°</p>
            </div>
          </div>
        `;
      });
    })
    .catch((error) => {
      console.error("Erro ao obter previsão:", error);
      alert("Falha ao obter previsão do tempo");
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
