// ==========================================
// 1. GLOBAL STATE
// ==========================================
let allParts = []; // Will hold the data from parts.json
const currentBuild = {
    CPU: null,
    Motherboard: null,
    GPU: null,
    RAM: null,
    Storage: null,
    PSU: null
};

// ==========================================
// 2. DOM ELEMENTS
// ==========================================
const partsListContainer = document.getElementById("parts-list");
const tabButtons = document.querySelectorAll(".tab-btn");
const totalPriceEl = document.getElementById("total-price");
const wattageTextEl = document.getElementById("wattage-text");
const wattageGaugeEl = document.getElementById("wattage-gauge");
const compatibilityBadge = document.getElementById("compatibility-badge");

// ==========================================
// 3. INITIALIZATION & FETCH
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    fetchParts();
    setupTabListeners();
});

// Load parts from your local parts.json file
async function fetchParts() {
    try {
        const response = await fetch("parts.json");
        if (!response.ok) throw new Error("Failed to load parts.json");
        allParts = await response.json();
        
        // Render CPU category by default on load
        renderParts("CPU");
    } catch (error) {
        console.error("Error loading component database:", error);
        partsListContainer.innerHTML = `<p class="error">Error loading component database.</p>`;
    }
}

// ==========================================
// 4. NAVIGATION & TABS
// ==========================================
function setupTabListeners() {
    tabButtons.forEach(button => {
        button.addEventListener("click", (e) => {
            // Update active tab styling
            tabButtons.forEach(btn => btn.classList.remove("active"));
            e.target.classList.add("active");
            
            // Render parts belonging to clicked category
            const selectedCategory = e.target.getAttribute("data-category");
            renderParts(selectedCategory);
        });
    });
}

// ==========================================
// 5. RENDERING THE MENU (Left Column)
// ==========================================
function renderParts(category) {
    partsListContainer.innerHTML = ""; // Clear existing cards
    
    // Filter parts for the selected category
    const filteredParts = allParts.filter(part => part.category === category);
    
    filteredParts.forEach(part => {
        const card = document.createElement("div");
        card.className = "part-card";
        
        // Determine if this specific part is already selected
        const isSelected = currentBuild[category] && currentBuild[category].id === part.id;
        if (isSelected) {
            card.classList.add("selected");
        }

        // Custom details display depending on the component type
        let specDetail = "";
        if (part.socket) specDetail = `Socket: ${part.socket}`;
        if (part.capacity) specDetail = `Capacity: ${part.capacity}W`;

        card.innerHTML = `
            <div class="part-card-header">
                <h3>${part.name}</h3>
                <span class="part-price">$${part.price}</span>
            </div>
            <div class="part-card-body">
                <span class="part-spec">${specDetail}</span>
                <span class="part-wattage">${part.wattage > 0 ? part.wattage + 'W' : ''}</span>
            </div>
            <button class="select-btn ${isSelected ? 'active' : ''}" onclick="selectComponent('${part.id}')">
                ${isSelected ? "Deselect" : "Select"}
            </button>
        `;
        partsListContainer.appendChild(card);
    });
}

// ==========================================
// 6. COMPONENT SELECTION LOGIC
// ==========================================
window.selectComponent = function(partId) {
    const part = allParts.find(p => p.id === partId);
    if (!part) return;

    const category = part.category;

    // Toggle selection: Deselect if clicked again, otherwise select
    if (currentBuild[category] && currentBuild[category].id === partId) {
        currentBuild[category] = null;
    } else {
        currentBuild[category] = part;
    }

    // Refresh current category list to update buttons
    renderParts(category);
    
    // Update the visual representation & calculation stats
    updateAssemblyBay();
    calculateSystemStats();
};

// ==========================================
// 7. ASSEMBLY BAY UPDATES (Right Column)
// ==========================================
function updateAssemblyBay() {
    const layerMapping = {
        "Motherboard": "slot-motherboard",
        "CPU": "slot-cpu",
        "GPU": "slot-gpu",
        "RAM": "slot-ram",
        "Storage": "slot-ssd",
        "PSU": "slot-psu"
    };

    for (const [category, slotId] of Object.entries(layerMapping)) {
        const imgElement = document.getElementById(slotId);
        const selectedPart = currentBuild[category];

        if (selectedPart) {
            imgElement.src = selectedPart.image;
            imgElement.classList.add("active"); // Fades in the PNG
        } else {
            imgElement.src = "";
            imgElement.classList.remove("active"); // Fades out
        }
    }
}

// ==========================================
// 8. SYSTEM CALCULATIONS & COMPATIBILITY CHECKS
// ==========================================
function calculateSystemStats() {
    let totalPrice = 0;
    let totalWattage = 0;
    let selectedPsuCapacity = 0;
    let compatibilityIssues = [];

    // Base wattage for motherboard, fans, and RGB hubs
    let systemBaselineWattage = 50; 

    // 1. Calculate price and wattage totals
    for (const category in currentBuild) {
        const part = currentBuild[category];
        if (part) {
            totalPrice += part.price;
            totalWattage += part.wattage;
            if (category === "PSU" && part.capacity) {
                selectedPsuCapacity = part.capacity;
            }
        }
    }

    // Add baseline consumption if any major components are added
    if (Object.values(currentBuild).some(v => v !== null)) {
        totalWattage += systemBaselineWattage;
    }

    // 2. Compatibility Check: CPU Socket vs Motherboard Socket
    if (currentBuild["CPU"] && currentBuild["Motherboard"]) {
        const cpuSocket = currentBuild["CPU"].socket;
        const mbSocket = currentBuild["Motherboard"].socket;
        
        if (cpuSocket !== mbSocket) {
            compatibilityIssues.push(`Socket Mismatch: CPU needs ${cpuSocket}, Motherboard has ${mbSocket}.`);
        }
    }

    // 3. Compatibility Check: PSU Wattage Limit
    if (selectedPsuCapacity > 0 && totalWattage > selectedPsuCapacity) {
        compatibilityIssues.push(`Insufficient Power: Selected PSU is ${selectedPsuCapacity}W, build requires at least ${totalWattage}W.`);
    }

    // ==========================================
    // 9. UPDATE THE UI
    // ==========================================
    
    // Update Price
    totalPriceEl.textContent = `$${totalPrice.toFixed(2)}`;

    // Update Wattage Bar
    const limit = selectedPsuCapacity > 0 ? selectedPsuCapacity : 1000;
    const percentage = Math.min((totalWattage / limit) * 100, 100);
    
    wattageTextEl.textContent = `${totalWattage}W / ${limit}W`;
    wattageGaugeEl.style.width = `${percentage}%`;

    // Visual warn styling for the wattage gauge
    wattageGaugeEl.className = "gauge-fill"; // reset
    if (percentage > 85) {
        wattageGaugeEl.classList.add("danger");
    } else if (percentage > 60) {
        wattageGaugeEl.classList.add("warning");
    }

    // Update Compatibility Status Display
    if (compatibilityIssues.length > 0) {
        compatibilityBadge.textContent = `Warning: ${compatibilityIssues[0]}`;
        compatibilityBadge.className = "badge warning";
    } else {
        compatibilityBadge.textContent = "System Compatibility: Cleared";
        compatibilityBadge.className = "badge cleared";
    }
}