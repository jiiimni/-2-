const API_KEY = "f908f5ffa0b04d23ac1aa75123c55278";

document.getElementById("get-weather").addEventListener("click", () => {
  console.log("Button clicked!"); // 버튼 클릭 로그
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(getWeather, showError);
  } else {
    alert("Geolocation is not supported by your browser.");
  }
});

function getWeather(position) {
  const { latitude, longitude } = position.coords; // 위치 데이터 가져오기
  console.log(`Latitude: ${latitude}, Longitude: ${longitude}`); // 위치 로그
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;

  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Weather data received:", data); // 날씨 데이터 로그
      displayWeather(data);
      displayProductivityTips(data.weather[0].main);
    })
    .catch((error) => console.error("Error fetching weather data:", error));
}

function showError(error) {
  console.error("Geolocation error:", error);
  alert(`위치 정보를 가져오는데 실패했습니다: ${error.message}`);
}

function displayWeather(data) {
  // OpenWeatherMap의 날씨 아이콘 URL 가져오기
  const iconCode = data.weather[0].icon; // 아이콘 코드
  const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

  const weatherInfo = `
    <img src="${iconUrl}" alt="Weather Icon" id="weather-icon" style="width: 80px; height: 80px; display: block; margin: 10px auto;">
    <h3>${data.name}</h3>
    <p>Temperature: ${data.main.temp}°C</p>
    <p>Condition: ${data.weather[0].description}</p>
  `;
  document.getElementById("weather-info").innerHTML = weatherInfo;
}

function displayProductivityTips(condition) {
  let tip = "생산성을 유지하세요!";
  if (condition === "Rain") {
    tip = "비가 오는 날입니다. 독서나 계획과 같은 실내 활동에 적합한 날이에요.";
  } else if (condition === "Clear") {
    tip = "맑은 날입니다. 창의력을 높이기 위해 잠깐 산책을 해보세요.";
  } else if (condition === "Clouds") {
    tip = "구름이 많은 날입니다. 깊은 사고나 브레인스토밍에 집중해보세요.";
  }
  document.getElementById("productivity-tips").innerText = tip;
}
