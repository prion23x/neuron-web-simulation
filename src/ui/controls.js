import { createParticle } from "../simulation/particles.js";
import {
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    MEMBRANE,
    ION_STATS,
    ION_NAMES,
    LEAK_INDICES,
    LEAK_CONFIG,
    ionConfig,
} from "../config/config.js";

const MAX_X = CANVAS_WIDTH;
const MAX_Y = CANVAS_HEIGHT;

const ion_buttons = document.querySelectorAll(".ion-button");
const addButton = document.getElementById("add-button");
const countInput = document.getElementById("particle-count");
const locationRadios = document.querySelectorAll('input[name="location"]');
const customCoordsDiv = document.getElementById("custom-coords");
const coordXInput = document.getElementById("coord-x");
const coordYInput = document.getElementById("coord-y");
const errorMsg = document.getElementById("coord-error");

const statsPanel = document.getElementById("stats-panel");
const controlPanel = document.getElementById("control-panel");
const toggleStatsPanelButton = document.getElementById("toggle-stats-panel");
const toggleControlPanelButton = document.getElementById("toggle-control-panel");
const quickConcentrationList = document.getElementById("quick-concentration-list");
const statsFields = {
    ion: document.getElementById("stat-ion"),
    gradient: document.getElementById("stat-gradient"),
    intraExtra: document.getElementById("stat-intra-extra"),
    intraCount: document.getElementById("stat-intra-count"),
    extraCount: document.getElementById("stat-extra-count"),
    totalCount: document.getElementById("stat-total-count"),
};
const quickConcentrationFields = {};
const quickConcentrationRows = {};

let activeIon = "Na"; // default selected ion type.

if (statsPanel && statsFields.ion) {
    statsFields.ion.textContent = activeIon;
}

if (quickConcentrationList) {
    ION_NAMES.forEach((ion) => {
        const row = document.createElement("div");
        row.className = "quick-concentration-row";
        row.dataset.ion = ion;
        row.innerHTML = `
            <span class="ion-name">${ion}</span>
            <span class="ion-value">0.0 : 0.0</span>
        `;
        quickConcentrationList.appendChild(row);
        quickConcentrationFields[ion] = row.querySelector(".ion-value");
        quickConcentrationRows[ion] = row;
    });
}

function setupPanelToggle(button, panel, panelName) {
    if (!button || !panel) return;

    button.addEventListener("click", () => {
        const isHidden = panel.classList.toggle("panel-hidden");
        button.textContent = `${isHidden ? "Show" : "Hide"} ${panelName}`;
    });
}

setupPanelToggle(toggleStatsPanelButton, statsPanel, "Stats");
setupPanelToggle(toggleControlPanelButton, controlPanel, "Controls");

// Select Ion logic
ion_buttons.forEach(button => {
    button.addEventListener("click", () => {
        ion_buttons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");
        activeIon = button.textContent.trim();
        if (statsFields.ion) {
            statsFields.ion.textContent = activeIon;
        }
    });
});

// Toggle location type logic
locationRadios.forEach(radio => {
    radio.addEventListener("change", (e) => {
        if (e.target.value === "custom") {
            customCoordsDiv.style.display = "flex";
        } else {
            customCoordsDiv.style.display = "none";
            errorMsg.textContent = "";
        }
    });
});

// Add Particles adding logic.
addButton.addEventListener("click", () => {
    if (!activeIon) {
        alert("Please select an ion first.");
        return;
    }

    const count = parseInt(countInput.value, 10);
    if (isNaN(count) || count <= 0) return;

    let spawnX = 400; // Default center X
    let spawnY = 400; // Default center Y

    const locationType = document.querySelector('input[name="location"]:checked').value;

    if (locationType === "top") {
        spawnY = 50;
    } else if (locationType === "bottom") {
        spawnY = MAX_Y - 50;
    } else if (locationType === "left") {
        spawnX = 50;
    } else if (locationType === "right") {
        spawnX = MAX_X - 50;
    }

    if (locationType === "custom") {
        const x = parseFloat(coordXInput.value);
        const y = parseFloat(coordYInput.value);

        if (isNaN(x) || x < 0 || x > MAX_X || isNaN(y) || y < 0 || y > MAX_Y) {
            errorMsg.textContent = `Error: X must be between 0 and ${MAX_X}, Y between 0 and ${MAX_Y}.`;
            return;
        }
        errorMsg.textContent = "";
        spawnX = x;
        spawnY = y;
    }


    for (let i = 0; i < count; i++) {
        // Apply slight random jitter to spawn location so particles don't overlap perfectly
        const jitterX = spawnX + (Math.random() - 0.5) * 40;
        const jitterY = spawnY + (Math.random() - 0.5) * 40;

        const newParticle = createParticle(activeIon, jitterX, jitterY);
        // World.add(world, newParticle);
    }

});


const channelOpenButton = document.getElementById("channel-open-button");
const channelCloseButton = document.getElementById("channel-close-button");
const channelOpenAllButton = document.getElementById("channel-openall-button");
const channelCloseAllButton = document.getElementById("channel-closeall-button");

setInterval(() => {
    const intraCount = Math.round(ION_STATS.INTRA_IONS_COUNT[activeIon] ?? 0);
    const extraCount = Math.round(ION_STATS.EXTRA_IONS_COUNT[activeIon] ?? 0);
    const totalCount = Math.round(ION_STATS.TOTAL_IONS_COUNT[activeIon] ?? 0);

    const intraPct = totalCount > 0 ? (intraCount / totalCount) * 100 : 0;
    const extraPct = totalCount > 0 ? (extraCount / totalCount) * 100 : 0;
    const gradient = totalCount > 0 ? intraCount / totalCount : 0;

    statsFields.gradient.textContent = gradient.toFixed(2);
    statsFields.intraExtra.textContent = `${intraPct.toFixed(1)} : ${extraPct.toFixed(1)}`;
    statsFields.intraCount.textContent = intraCount.toString();
    statsFields.extraCount.textContent = extraCount.toString();
    statsFields.totalCount.textContent = totalCount.toString();

    ION_NAMES.forEach((ion) => {
        const ionIntraCount = Math.round(ION_STATS.INTRA_IONS_COUNT[ion] ?? 0);
        const ionExtraCount = Math.round(ION_STATS.EXTRA_IONS_COUNT[ion] ?? 0);
        const ionTotalCount = Math.round(ION_STATS.TOTAL_IONS_COUNT[ion] ?? 0);
        const ionIntraPct = ionTotalCount > 0 ? (ionIntraCount / ionTotalCount) * 100 : 0;
        const ionExtraPct = ionTotalCount > 0 ? (ionExtraCount / ionTotalCount) * 100 : 0;

        if (quickConcentrationFields[ion]) {
            quickConcentrationFields[ion].textContent = `${ionIntraPct.toFixed(1)} : ${ionExtraPct.toFixed(1)}`;
        }

        if (quickConcentrationRows[ion]) {
            quickConcentrationRows[ion].classList.toggle("active", ion === activeIon);
        }
    });
}, 200)

channelOpenButton.addEventListener("click", () => {
    const cfg = LEAK_CONFIG[activeIon];
    for (const idx of cfg.segment_indices) {
        const segment = MEMBRANE.segments[idx];
        if (segment?.render) {
            segment.render.fillStyle = ionConfig[activeIon].color;
            segment.isSensor = true; // make permeable

        }
    }
});
channelCloseButton.addEventListener("click", () => {
    const cfg = LEAK_CONFIG[activeIon];
    for (const idx of cfg.segment_indices) {
        const segment = MEMBRANE.segments[idx];
        if (segment?.render) {
            segment.render.fillStyle = "#300058"; // Reset channel segments to default color
            segment.isSensor = false; // make impermeable

        }
    }
});

channelOpenAllButton.addEventListener("click", () => {
    for (const ionName of ION_NAMES) {
        const cfg = LEAK_CONFIG[ionName];
        const color = ionConfig[ionName].color;
        for (const idx of cfg.segment_indices) {
            const segment = MEMBRANE.segments[idx];
            if (segment?.render) {
                segment.render.fillStyle = color;
                segment.isSensor = true; // make permeable

            }
        }
    }
});

channelCloseAllButton.addEventListener("click", () => {
    for (const ionName of ION_NAMES) {
        const cfg = LEAK_CONFIG[ionName];
        for (const idx of cfg.segment_indices) {
            const segment = MEMBRANE.segments[idx];
            if (segment?.render) {
                segment.render.fillStyle = "#300058"; // Reset channel segments to default color
                segment.isSensor = false; // make impermeable

            }
        }
    }
});