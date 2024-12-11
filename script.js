document.addEventListener("DOMContentLoaded", () => {
    const API_BASE = "https://www.el-tiempo.net/api/json/v2";

    const municipioLabel = document.getElementById("municipio-label");
    const todayInfo = document.getElementById("today-info");
    const tomorrowInfo = document.getElementById("tomorrow-info");
    const provinciaSelect = document.getElementById("provincia-select");
    const municipioSelect = document.getElementById("municipio-select");
    const municipioData = document.getElementById("municipio-data");
    const generalInfoSection = document.getElementById("general-info");

    function loadGeneralWeather() {
        fetch(`${API_BASE}/home`)
            .then(response => response.json())
            .then(data => {
                todayInfo.textContent = data.today.p || "No hay datos disponibles.";
                tomorrowInfo.textContent = data.tomorrow.p || "No hay datos disponibles.";

                data.provincias.forEach(provincia => {
                    const option = document.createElement("option");
                    option.value = provincia.CODPROV;
                    option.textContent = provincia.NOMBRE_PROVINCIA;
                    provinciaSelect.appendChild(option);
                });
            })
            .catch(error => {
                todayInfo.textContent = "Error al cargar los datos para hoy.";
                tomorrowInfo.textContent = "Error al cargar los datos para mañana.";
                console.error("Error al cargar la información general:", error);
            });
    }
    function loadWeatherForProvince(provinciaId) {
        fetch(`${API_BASE}/provincias/${provinciaId}`)
            .then(response => response.json())
            .then(data => {
                todayInfo.textContent = data.today.p || "No hay datos disponibles.";
                tomorrowInfo.textContent = data.tomorrow.p || "No hay datos disponibles.";
            })
            .catch(error => {
                todayInfo.textContent = "Error al cargar la previsión para hoy.";
                tomorrowInfo.textContent = "Error al cargar la previsión para mañana.";
                console.error("Error al cargar la previsión para la provincia:", error);
            });
    }

    function loadMunicipiosForProvince(provinciaId) {
        fetch(`${API_BASE}/provincias/${provinciaId}/municipios`)
            .then(response => response.json())
            .then(data => {
                municipioSelect.innerHTML = '<option value="">Selecciona un municipio</option>';
                data.municipios.forEach(municipio => {
                    const option = document.createElement("option");
                    option.value = municipio.CODIGOINE.slice(0, 5);
                    option.textContent = municipio.NOMBRE;
                    municipioSelect.appendChild(option);
                });

                municipioSelect.parentElement.style.display = "block";
            })
            .catch(error => {
                municipioSelect.innerHTML = '<option value="">Error al cargar municipios</option>';
                console.error("Error al cargar los municipios:", error);
            });
    }

    function loadWeatherForMunicipio(provinciaId, municipioId) {
        fetch(`${API_BASE}/provincias/${provinciaId}/municipios/${municipioId}`)
            .then(response => response.json())
            .then(data => {
                todayInfo.innerHTML = `
                    <p>${data.stateSky?.description || "N/A"}
                    ${data.temperatura_actual || "N/A"}°C
                    (max: ${data.temperaturas.max || "N/A"}°C |
                    min: ${data.temperaturas.min || "N/A"}°C)</p>
                `;
                tomorrowInfo.innerHTML = `
                    <p>
                    (max: ${data.proximos_dias[0].temperatura.maxima || "N/A"}°C |
                    min: ${data.proximos_dias[0].temperatura.minima || "N/A"}°C)
                    </p>
                `;
            })
            .catch(error => {
                municipioData.innerHTML = "<p>Error al cargar los datos del municipio.</p>";
                console.error("Error al cargar los datos del municipio:", error);
            });
    }

    loadGeneralWeather();

    provinciaSelect.addEventListener("change", () => {
        const selectedProv = provinciaSelect.value;
        console.log(selectedProv);
        const provinciaName = provinciaSelect.options[provinciaSelect.selectedIndex].text;

        if (selectedProv) {
            loadWeatherForProvince(selectedProv);
            loadMunicipiosForProvince(selectedProv);
            municipioSelect.removeAttribute("style")
            municipioLabel.removeAttribute("style")

            generalInfoSection.querySelector("h2").textContent = `El tiempo en la provincia de ${provinciaName}`;
        } else {
            generalInfoSection.querySelector("h2").textContent = "El Tiempo";
        }
    });

    municipioSelect.addEventListener("change", () => {
        const selectedMun = municipioSelect.value;
        console.log(selectedMun);
        const selectedProv = provinciaSelect.value;

        if (selectedMun) {
            loadWeatherForMunicipio(selectedProv, selectedMun);
        } else {
            municipioInfoSection.style.display = "none";
        }
    });
});
