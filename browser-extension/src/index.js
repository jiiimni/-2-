import axios from 'axios';

// Form fields
const form = document.querySelector('.form-data');
const regionInputs = [
    document.getElementById('region1'),
    document.getElementById('region2'),
    document.getElementById('region3')
];
const apiKeyInput = document.getElementById('api');

// Loading and error elements
const loading = document.querySelector('.loading');
const errors = document.querySelector('.errors');
const clearBtn = document.querySelector('.clear-btn');

// Result containers for each region
const resultContainers = [
    document.getElementById('result1'),
    document.getElementById('result2'),
    document.getElementById('result3')
];

// Calculate color based on CO2 level
const calculateColor = (value) => {
    const co2Scale = [0, 150, 600, 750, 800];
    const colors = ['#2AA364', '#F5EB4D', '#9E4229', '#381D02', '#381D02'];
    const closestNum = co2Scale.find(num => value <= num) || co2Scale[co2Scale.length - 1];
    const scaleIndex = co2Scale.indexOf(closestNum);
    const closestColor = colors[scaleIndex];
    chrome.runtime.sendMessage({ action: 'updateIcon', value: { color: closestColor } });
};

// Display carbon usage for each region
const displayCarbonUsage = async (apiKey, region, resultContainer) => {
    const usage = resultContainer.querySelector('.carbon-usage');
    const fossilfuel = resultContainer.querySelector('.fossil-fuel');
    const myregion = resultContainer.querySelector('.my-region');

    try {
        const response = await axios.get('https://api.co2signal.com/v1/latest', {
            params: { countryCode: region },
            headers: { 'auth-token': apiKey },
        });

        let CO2 = Math.floor(response.data.data.carbonIntensity);
        calculateColor(CO2);

        // Update the UI with the results for this specific region
        myregion.textContent = region;
        usage.textContent = `${Math.round(CO2)} grams (grams CO2 emitted per kilowatt hour)`;
        fossilfuel.textContent = `${response.data.data.fossilFuelPercentage.toFixed(2)}% (percentage of fossil fuels used to generate electricity)`;
        resultContainer.style.display = 'block';
    } catch (error) {
        console.error(error);
        errors.textContent = `Sorry, we have no data for region: ${region}`;
    }
};

// Set up and submit user data for each region
function setUpUser(apiKey, regions) {
    loading.style.display = 'block';
    errors.textContent = '';
    resultContainers.forEach(container => (container.style.display = 'none'));

    // Fetch and display data for each region asynchronously
    const fetchPromises = regions.map((region, index) => {
        if (region) {
            return displayCarbonUsage(apiKey, region, resultContainers[index]);
        }
    });

    // Wait until all requests finish, then hide loading and form
    Promise.all(fetchPromises).then(() => {
        loading.style.display = 'none';
        form.style.display = 'none';  // Hide the form section after displaying results
        clearBtn.style.display = 'block'; // Show the clear button
    });
}

// Handle form submission
function handleSubmit(e) {
    e.preventDefault();
    const apiKey = apiKeyInput.value;
    const regions = regionInputs.map(input => input.value.trim());
    setUpUser(apiKey, regions);
}

// Initialize the app
function init() {
    const storedApiKey = localStorage.getItem('apiKey');
    const storedRegions = [
        localStorage.getItem('region1'),
        localStorage.getItem('region2'),
        localStorage.getItem('region3')
    ];

    chrome.runtime.sendMessage({ action: 'updateIcon', value: { color: 'green' } });

    if (!storedApiKey || !storedRegions.some(region => region)) {
        form.style.display = 'block';
        resultContainers.forEach(container => container.style.display = 'none');
    } else {
        setUpUser(storedApiKey, storedRegions);
        form.style.display = 'none';
    }
}

// Reset all fields and local storage
function reset(e) {
    e.preventDefault();
    form.reset();
    localStorage.clear();
    form.style.display = 'block';
    resultContainers.forEach(container => container.style.display = 'none');
    clearBtn.style.display = 'none';
}

// Event listeners
form.addEventListener('submit', handleSubmit);
clearBtn.addEventListener('click', reset);

// Initialize the app
init();
