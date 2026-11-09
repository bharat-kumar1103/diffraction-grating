
const linesInput = document.getElementById("lines");
const orderInput = document.getElementById("order");
const angleInput = document.getElementById("angle");

const result = document.getElementById("result");
const observations = document.getElementById("observations");

const spectrumElement = document.getElementById("spectrumElement");
const spectrum = document.getElementById("spectrum");
const legend = document.getElementById("legend");

// Reference spectral wavelengths in nanometres
const spectra = {

  mercury: {
    name: "Mercury",
    symbol: "Hg",
    lines: [
      { colour: "Violet", wavelength: 404.7 },
      { colour: "Blue", wavelength: 435.8 },
      { colour: "Green", wavelength: 546.1 },
      { colour: "Yellow", wavelength: 577.0 },
      { colour: "Yellow", wavelength: 579.1 }
    ]
  },

  sodium: {
    name: "Sodium",
    symbol: "Na",
    lines: [
      { colour: "Yellow", wavelength: 589.0 },
      { colour: "Yellow", wavelength: 589.6 }
    ]
  },

  hydrogen: {
    name: "Hydrogen",
    symbol: "H",
    lines: [
      { colour: "Violet", wavelength: 410.2 },
      { colour: "Blue-violet", wavelength: 434.0 },
      { colour: "Blue-green", wavelength: 486.1 },
      { colour: "Red", wavelength: 656.3 }
    ]
  },

  neon: {
    name: "Neon",
    symbol: "Ne",
    lines: [
      { colour: "Yellow", wavelength: 585.2 },
      { colour: "Orange", wavelength: 594.5 },
      { colour: "Orange", wavelength: 603.0 },
      { colour: "Orange", wavelength: 614.3 },
      { colour: "Red", wavelength: 640.2 },
      { colour: "Red", wavelength: 650.7 },
      { colour: "Red", wavelength: 659.9 },
      { colour: "Red", wavelength: 692.9 }
    ]
  }

};

let records = [];


// Convert wavelength into approximate visible colour
function wavelengthToColor(wavelength) {

  if (wavelength < 420) return "#a78bfa";
  if (wavelength < 450) return "#6366f1";
  if (wavelength < 485) return "#3985ff";
  if (wavelength < 500) return "#22d3ee";
  if (wavelength < 565) return "#36d399";
  if (wavelength < 590) return "#d9e65b";
  if (wavelength < 625) return "#ffe45c";
  if (wavelength < 645) return "#ffad42";

  return "#ff4545";
}


// Display selected element's emission spectrum
function renderSpectrum() {

  const selected = spectra[spectrumElement.value];

  spectrum.innerHTML = "";
  legend.innerHTML = "";

  selected.lines.forEach(line => {

    const color = wavelengthToColor(line.wavelength);

    // Position based on wavelength
    const position =
      ((line.wavelength - 380) / (700 - 380)) * 100;

    // Create spectral line
    const spectralLine = document.createElement("div");

    spectralLine.className = "spectral-line";

    spectralLine.style.left = `${position}%`;
    spectralLine.style.background = color;

    spectralLine.style.boxShadow =
      `0 0 10px 3px ${color},
       0 0 30px 8px ${color}88`;

    spectrum.appendChild(spectralLine);

    // Create legend item
    const item = document.createElement("div");

    const dot = document.createElement("i");

    dot.className = "dot";
    dot.style.background = color;

    item.appendChild(dot);

    item.appendChild(
      document.createTextNode(
        `${line.colour} — ${line.wavelength} nm`
      )
    );

    legend.appendChild(item);

  });

  spectrum.setAttribute(
    "aria-label",
    `${selected.name} emission spectrum`
  );

}


// Calculate wavelength using grating equation
function calculateWavelength() {

  const linesPerMM = Number(linesInput.value);
  const order = Number(orderInput.value);
  const angle = Number(angleInput.value);

  // Validate inputs
  if (
    !Number.isFinite(linesPerMM) ||
    linesPerMM <= 0 ||

    !Number.isFinite(angle) ||
    angle <= 0 ||
    angle >= 90 ||

    !Number.isFinite(order) ||
    order < 1
  ) {

    result.textContent =
      "Please enter a positive grating density and an angle between 0° and 90°.";

    return;
  }

  const selected = spectra[spectrumElement.value];

  // Grating spacing in metres
  const d = 1 / (linesPerMM * 1000);

  // Convert degrees into radians
  const radians = angle * Math.PI / 180;

  // Diffraction grating equation
  // nλ = d sin θ

  const wavelengthMetres =
    (d * Math.sin(radians)) / order;

  // Convert metres into nanometres
  const wavelengthNM = wavelengthMetres * 1e9;

  // Find nearest reference spectral line
  const nearest = selected.lines.reduce((best, line) => {

    return Math.abs(line.wavelength - wavelengthNM) <
      Math.abs(best.wavelength - wavelengthNM)
      ? line
      : best;

  }, selected.lines[0]);

  // Calculate difference
  const difference =
    Math.abs(nearest.wavelength - wavelengthNM);

  // Calculate relative difference
  const percentError =
    (difference / nearest.wavelength) * 100;

  // Display result
  result.innerHTML = `

    <strong>Selected element:</strong>
    ${selected.name} (${selected.symbol})<br>

    <strong>Calculated wavelength:</strong><br>
    λ = ${wavelengthNM.toFixed(2)} nm<br>

    <strong>Grating spacing:</strong>
    ${(d * 1e6).toFixed(4)} μm<br>

    <strong>Nearest reference line:</strong>
    ${nearest.colour} (${nearest.wavelength} nm)<br>

    <strong>Difference:</strong>
    ${difference.toFixed(2)} nm<br>

    <strong>Relative difference:</strong>
    ${percentError.toFixed(2)}%

  `;

  // Save observation
  records.push({

    element: selected.name,
    colour: nearest.colour,
    angle: angle,
    order: order,
    wavelength: wavelengthNM,
    reference: nearest.wavelength

  });

  renderTable();

}


// Display observation table
function renderTable() {

  if (records.length === 0) {

    observations.innerHTML = `
      <tr>
        <td colspan="6">
          No observations recorded yet.
        </td>
      </tr>
    `;

    return;
  }

  observations.innerHTML = records.map(record => `

    <tr>

      <td>${record.element}</td>

      <td>${record.colour}</td>

      <td>${record.angle.toFixed(2)}°</td>

      <td>${record.order}</td>

      <td>${record.wavelength.toFixed(2)} nm</td>

      <td>${record.reference.toFixed(1)} nm</td>

    </tr>

  `).join("");

}


// Change spectrum when element changes
spectrumElement.addEventListener("change", () => {

  renderSpectrum();

  result.textContent =
    `${spectra[spectrumElement.value].name} spectrum selected. Enter your observations and calculate.`;

});


// Calculate button
document.getElementById("calculate").addEventListener(
  "click",
  calculateWavelength
);


// Clear observations
document.getElementById("clear").addEventListener("click", () => {

  records = [];

  renderTable();

  result.textContent =
    "Observations cleared. Enter new measurements.";

});


// Initial display
renderSpectrum();
renderTable();
