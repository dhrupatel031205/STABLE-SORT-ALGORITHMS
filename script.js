/* ============================================================
   THEME TOGGLE
============================================================ */
function toggleTheme() {
    const root = document.documentElement;
    const toggle = document.getElementById("themeToggle");
    const theme = toggle.checked ? "dark" : "light";
    root.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
}

// Load saved theme on page load
document.addEventListener("DOMContentLoaded", function() {
    const savedTheme = localStorage.getItem("theme") || "light";
    const toggle = document.getElementById("themeToggle");
    if (toggle) {
        toggle.checked = savedTheme === "dark";
        document.documentElement.setAttribute("data-theme", savedTheme);
    }
});

/* ============================================================
   MODERN ALERT
============================================================ */
function showAlert(msg, title = "Error") {
    document.getElementById("alertTitle").textContent = title;
    document.getElementById("alertMessage").textContent = msg;
    document.getElementById("alertOverlay").style.display = "flex";
}

function closeAlert() {
    document.getElementById("alertOverlay").style.display = "none";
}

/* ============================================================
   LOADING STATES
============================================================ */
function showLoadingState(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--primary);"><div style="font-size: 2rem; margin-bottom: 1rem;">⏳</div><div>Processing algorithm...</div></div>';
    }
}

function showEmptyState(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `<div style="text-align: center; padding: 2rem; opacity: 0.6;"><div style="font-size: 2rem; margin-bottom: 1rem;">📋</div><div>${message}</div></div>`;
    }
}

/* ============================================================
   TABLE CREATION FOR STEPS
============================================================ */
function createStepTable(title, rows) {
    const container = document.createElement("div");
    container.className = "step-container";

    const heading = document.createElement("h3");
    heading.textContent = title;
    container.appendChild(heading);

    const table = document.createElement("table");
    table.className = "step-table";

    const headerRow = document.createElement("tr");
    ["Original Index", "Value", "Compared With", "Decision"].forEach(header => {
        let th = document.createElement("th");
        th.textContent = header;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    rows.forEach(r => {
        const tr = document.createElement("tr");

        ["index", "value", "compare", "decision"].forEach(key => {
            let td = document.createElement("td");
            td.textContent = r[key];
            tr.appendChild(td);
        });

        table.appendChild(tr);
    });

    container.appendChild(table);
    return container;
}

/* ============================================================
   MAIN
============================================================ */
function startStableSort() {
    const input = document.getElementById("userInput").value.trim();

    if (!input) return showAlert("Please enter numbers to sort.", "Input Required");

    let raw = input.split(",");
    let arr = [];

    for (let r of raw) {
        r = r.trim();
        if (r === "") return showAlert("Empty value detected. Please check your input.", "Invalid Input");
        if (isNaN(r)) return showAlert(`"${r}" is not a valid number. Please enter only numbers separated by commas.`, "Invalid Input");
        arr.push(Number(r));
    }

    if (arr.length < 2) {
        return showAlert("Please enter at least 2 numbers to see sorting in action.", "Input Required");
    }

    // Show loading states
    showLoadingState("bubbleSteps");
    showLoadingState("insertionSteps");
    showLoadingState("mergeSteps");
    showLoadingState("comparisonResults");

    // Run all algorithms with slight delay for visual effect
    setTimeout(() => {
        const bubbleSteps = runBubbleSort(arr);
        setTimeout(() => {
            const insertionSteps = runInsertionSort(arr);
            setTimeout(() => {
                const mergeSteps = runMergeSort(arr);
                updateComparisonResults(bubbleSteps, insertionSteps, mergeSteps, arr);
            }, 100);
        }, 100);
    }, 100);
}

/* ============================================================
   COMPARISON RESULTS
============================================================ */
function updateComparisonResults(bubbleSteps, insertionSteps, mergeSteps, originalArr) {
    const resultsDiv = document.getElementById("comparisonResults");
    
    const algorithms = [
        {
            name: "Bubble Sort",
            icon: "🫧",
            steps: bubbleSteps,
            complexity: "O(n²)",
            spaceComplexity: "O(1)",
            stable: true
        },
        {
            name: "Insertion Sort", 
            icon: "📝",
            steps: insertionSteps,
            complexity: "O(n²)",
            spaceComplexity: "O(1)",
            stable: true
        },
        {
            name: "Merge Sort",
            icon: "🔀",
            steps: mergeSteps,
            complexity: "O(n log n)",
            spaceComplexity: "O(n)",
            stable: true
        }
    ];

    let html = '';
    
    algorithms.forEach(algo => {
        const efficiency = algo.steps < 10 ? 'Excellent' : algo.steps < 20 ? 'Good' : algo.steps < 30 ? 'Fair' : 'Poor';
        const efficiencyColor = algo.steps < 10 ? 'var(--secondary)' : algo.steps < 20 ? 'var(--accent)' : algo.steps < 30 ? '#f59e0b' : '#ef4444';
        
        html += `
            <div class="comparison-item">
                <h4>${algo.icon} ${algo.name}</h4>
                <p>Performance on ${originalArr.length} elements</p>
                <div class="comparison-stats">
                    <div class="stat-item">
                        <div class="stat-label">Steps</div>
                        <div class="stat-value">${algo.steps}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Efficiency</div>
                        <div class="stat-value" style="color: ${efficiencyColor}">${efficiency}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Time</div>
                        <div class="stat-value">${algo.complexity}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Space</div>
                        <div class="stat-value">${algo.spaceComplexity}</div>
                    </div>
                </div>
            </div>
        `;
    });

    resultsDiv.innerHTML = html;
}

/* ============================================================
   BUBBLE SORT (FULL STEP TRACE)
============================================================ */
function runBubbleSort(original, targetId = "bubbleSteps") {
    const place = document.getElementById(targetId);
    place.innerHTML = "";

    let arr = original.map((v, i) => ({ value: v, index: i }));

    let step = 1;

    for (let i = 0; i < arr.length - 1; i++) {
        for (let j = 0; j < arr.length - i - 1; j++) {

            let first = arr[j];
            let second = arr[j + 1];

            let decision = first.value > second.value ? "Swap" : "Keep Order";

            if (decision === "Swap") {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            }

            place.appendChild(
                createStepTable(`Bubble Sort – Step ${step}`, [
                    {
                        index: first.index,
                        value: first.value,
                        compare: second.value,
                        decision
                    }
                ])
            );

            step++;
        }
    }
    
    return step - 1; // Return total steps taken
}

/* ============================================================
   INSERTION SORT (FULL STEP TRACE)
============================================================ */
function runInsertionSort(original, targetId = "insertionSteps") {
    const place = document.getElementById(targetId);
    place.innerHTML = "";

    let arr = original.map((v, i) => ({ value: v, index: i }));
    let step = 1;

    for (let i = 1; i < arr.length; i++) {
        let key = arr[i];
        let j = i - 1;

        while (j >= 0 && arr[j].value > key.value) {
            place.appendChild(
                createStepTable(`Insertion Sort – Step ${step}`, [
                    {
                        index: arr[j].index,
                        value: arr[j].value,
                        compare: key.value,
                        decision: "Shift Right"
                    }
                ])
            );

            arr[j + 1] = arr[j];
            j--;
            step++;
        }

        arr[j + 1] = key;
    }
    
    return step - 1; // Return total steps taken
}

/* ============================================================
   MERGE SORT (FULL STEP TRACE)
============================================================ */
let mergeStep = 1;

function runMergeSort(original, targetId = "mergeSteps") {
    mergeStep = 1;
    const place = document.getElementById(targetId);
    place.innerHTML = "";

    let arr = original.map((v, i) => ({ value: v, index: i }));

    function merge(left, right) {
        let result = [];
        let i = 0, j = 0;

        while (i < left.length && j < right.length) {
            let leftVal = left[i].value;
            let rightVal = right[j].value;
            let decision;

            if (leftVal <= rightVal) {
                decision = "Choose Left";
                result.push(left[i]);
                i++;
            } else {
                decision = "Choose Right";
                result.push(right[j]);
                j++;
            }

            place.appendChild(
                createStepTable(`Merge Sort – Step ${mergeStep}`, [
                    {
                        index: result[result.length - 1].index,
                        value: result[result.length - 1].value,
                        compare: right[j] ? right[j].value : "—",
                        decision
                    }
                ])
            );

            mergeStep++;
        }

        return [...result, ...left.slice(i), ...right.slice(j)];
    }

    function mergeSort(arr) {
        if (arr.length <= 1) return arr;

        let mid = Math.floor(arr.length / 2);
        let left = mergeSort(arr.slice(0, mid));
        let right = mergeSort(arr.slice(mid));

        return merge(left, right);
    }

    mergeSort(arr);
    return mergeStep - 1; // Return total steps taken
}
