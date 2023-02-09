
const addData = (current, add) => {
    return { ...current, ...add };
}

let foods = {};

function start() {
    console.log("starting...");
    chrome.storage.local.get(["foods"], storage => {

        // create inputs/buttons
        document.querySelectorAll(".menu-item-name").forEach(x => {

            let el = document.createElement("button");
            let el2 = document.createElement("button");
            el.classList.add("counter-button");
            el2.classList.add("counter-button");
            el.textContent = "+";
            el2.textContent = "-";
            x.parentElement.insertBefore(el2, x.parentElement.firstChild);
            x.parentElement.insertBefore(el, x.parentElement.firstChild);
            /*
            if (storage["foods"][x.textContent]) {
                let food = storage["foods"][x.textContent];
                if (food.calories > 100) {
                    if (food.cholesterol / food.calories <= .1) {
                        let s = document.createElement("span");
                        s.classList.add("low-ratio", "low-ratio-cholesterol");
                        s.textContent = (food.cholesterol / food.calories).toFixed(2) + "mg chol ";
                        x.parentElement.appendChild(s);
                    }
                    if (food.sodium / food.calories <= 1.2) {
                        let s = document.createElement("span");
                        s.classList.add("low-ratio", "low-ratio-sodium");
                        s.textContent = (food.sodium / food.calories).toFixed(2) + "mg sodium ";
                        x.parentElement.appendChild(s);
                    }
                    if (food.carbs / food.calories <= .15) {
                        let s = document.createElement("span");
                        s.classList.add("low-ratio", "low-ratio-carbs");
                        s.textContent = (food.carbs / food.calories).toFixed(2) + "g carbs";
                        x.parentElement.appendChild(s);
                    }
                }
            }
            */
            el.addEventListener("click", (e) => {
                addFood(x.textContent, 1);
            });
            el2.addEventListener("click", (e) => {
                addFood(x.textContent, -.25);
            });
        });
        foods = storage.foods;
        createSearch();
        createFilters();

        const el = document.createElement("div");
        el.id = "tracker-today";
        el.style.cssText = "border: 1px solid #979797; background: #ffffffe6; height: 400px; width: 300px;position: fixed;bottom: 10px; right: 10px;overflow-y:auto;";
        document.body.appendChild(el);
        updateTracker();
    });
}

function createFilters() {
    const container = document.querySelector(".tab-content.editor-content").parentElement;
    let filters = document.createElement("div");
    filters.id = ("tracker-filters");
    filters.innerHTML = '<h2 style="font-weight: bolder;margin-top:24px;">Filters</h2><div class="input-holder"><input type="checkbox" id="calorie-limit"></input><span>Highlight items between</span><input type="number" value="0" id="calorie-limit-low"></input><span>and</span><input type="number" value="1000" id="calorie-limit-high"></input><span>calories</span></div> <div class="input-holder"><input type="checkbox" id="sodium-limit"></input><span>Highlight items between</span><input type="number" value="0" id="sodium-limit-low"></input><span>and</span><input type="number" value="1" id="sodium-limit-high"></input><span>mg sodium per calorie</span></div> <div class="input-holder"><input type="checkbox" id="cholesterol-limit"></input><span>Highlight items between</span><input type="number" value="0" id="cholesterol-limit-low"></input><span>and</span><input type="number" value=".1" id="cholesterol-limit-high"></input><span>mg cholesterol per calorie</span></div> <div class="input-holder"><input type="checkbox" id="carb-limit"></input><span>Highlight items between</span><input type="number" value="0" id="carb-limit-low"></input><span>and</span><input type="number" value=".1" id="carb-limit-high"></input><span>g carbs per calorie</span></div>';
    container.prepend(filters);
    console.log(filters);
    filters.querySelectorAll('input[type="checkbox"').forEach(checkbox => {
        checkbox.addEventListener("change", function () {
            filter();
        });
    });
    filters.querySelectorAll('input[type="number"').forEach(input => {
        input.addEventListener("input", function () {
            filter();
        });
    })
}

function filter() {
    const filters = document.querySelector("#tracker-filters");

    const options = {
        "calorieLimit": filters.querySelector("#calorie-limit").checked,
        "calorieLimitLow": parseInt(filters.querySelector("#calorie-limit-low").value),
        "calorieLimitHigh": parseInt(filters.querySelector("#calorie-limit-high").value),
        "sodiumLimit": filters.querySelector("#sodium-limit").checked,
        "sodiumLimitLow": parseFloat(filters.querySelector("#sodium-limit-low").value),
        "sodiumLimitHigh": parseFloat(filters.querySelector("#sodium-limit-high").value),
        "cholesterolLimit": filters.querySelector("#cholesterol-limit").checked,
        "cholesterolLimitLow": parseFloat(filters.querySelector("#cholesterol-limit-low").value),
        "cholesterolLimitHigh": parseFloat(filters.querySelector("#cholesterol-limit-high").value),
        "carbLimit": filters.querySelector("#carb-limit").checked,
        "carbLimitLow": parseFloat(filters.querySelector("#carb-limit-low").value),
        "carbLimitHigh": parseFloat(filters.querySelector("#carb-limit-high").value),
    }

    chrome.storage.local.get(["foods"], storage => {
        document.querySelectorAll(".menu-item-name").forEach(x => {
            const item = storage["foods"][x.textContent];
            x.style.background = "#FFFF00";
            if (options.calorieLimit && (item.calories > options.calorieLimitHigh || item.calories < options.calorieLimitLow)) {
                x.style.background = "none";
            }
            if (options.sodiumLimit && ((item.sodium / item.calories) > options.sodiumLimitHigh || (item.sodium / item.calories) < options.sodiumLimitLow)) {
                x.style.background = "none";
            }
            if (options.cholesterolLimit && ((item.cholesterol / item.calories) > options.cholesterolLimitHigh || (item.cholesterol / item.calories) < options.cholesterolLimitLow)) {
                x.style.background = "none";
            }
            if (options.carbLimit && ((item.carbs / item.calories) > options.carbLimitHigh || (item.carbs / item.calories) < options.carbLimitLow)) {
                x.style.background = "none";
            }
        });
    });

}

const createSearch = async () => {
    const insert = document.querySelector("#menu").parentElement.parentElement;
    const container = document.createElement("div");
    container.style.borderBottom = "1px solid #eaeaea";
    container.style.paddingBottom = "30px";
    insert.appendChild(container);
    container.innerHTML = '<ul class="nav nav-tabs" role="tablist" style="margin-top:24px"><li class="nav-item"><a id="caloriesearch" class="nav-link active" aria-selected="true">Search</a></li><li class="nav-item"><a id="addcustomitem" class="nav-link" aria-selected="false">Add custom item</a></li></ul><div id="caloriesearchpane"><h2 style="font-weight: bolder;margin-top:24px;">Calorie Search</h2><div style="display: flex; align-items: center;margin: 0 15px;"><input type="text" id="food-search"><button id="search-increase" class="counter-button">+</button><button id="search-decrease" class="counter-button">-</button></div><div id="search-results"></div></div><div id="customitempane" style="display: none"><input type="text" id="custom-name" placeholder="name"></input><input type="number" id="custom-calories" placeholder="calories"></input><input type="text" id="custom-servingsize" placeholder="serving size"></input><input type="number" id="custom-totalfat" placeholder="total fat"></input><input type="number" id="custom-saturatedfat" placeholder="saturated fat"></input><input type="number" id="custom-transfat" placeholder="trans fat"></input><input type="number" id="custom-cholesterol" placeholder="cholesterol"></input><input type="number" id="custom-sodium" placeholder="sodium"></input><input type="number" id="custom-carbs" placeholder="carbs"></input><input type="number" id="custom-sugar" placeholder="sugar"></input><input type="number" id="custom-protein" placeholder="protein"></input><input type="number" id="custom-iron" placeholder="iron"></input><input type="number" id="custom-vitaminc" placeholder="vitamin c"></input><input type="number" id="custom-calcium" placeholder="calcium"></input><input type="number" id="custom-potassium" placeholder="potassium"></input><button id="custom-enter">Add item</button></div>';
    let caloriesearch = document.querySelector("#caloriesearch");
    let customitem = document.querySelector("#addcustomitem");
    let caloriesearchpane = document.querySelector("#caloriesearchpane");
    let customitempane = document.querySelector("#customitempane");
    caloriesearch.addEventListener("click", () => {
        caloriesearch.classList.add("active");
        customitem.classList.remove("active");
        caloriesearchpane.style.display = "block";
        customitempane.style.display = "none";
    });

    customitem.addEventListener("click", () => {
        customitem.classList.add("active");
        caloriesearch.classList.remove("active");
        customitempane.style.display = "block";
        caloriesearchpane.style.display = "none";
    });

    document.querySelector("#custom-enter").addEventListener("click", () => {
        chrome.storage.local.get(["foods"], storage => {
            console.log("NEW DATA");
            let name = document.querySelector("#custom-name").value;
            if (name === "") return;
            chrome.storage.local.set({
                "foods": {
                    ...storage["foods"],
                    [name + " (custom)"]: {
                        "available": true,
                        "calories": document.querySelector("#custom-calories").value,
                        "servingsize": document.querySelector("#custom-servingsize").value,
                        "totalfat": document.querySelector("#custom-totalfat").value,
                        "saturatedfat": document.querySelector("#custom-saturatedfat").value,
                        "transfat": document.querySelector("#custom-transfat").value,
                        "cholesterol": document.querySelector("#custom-cholesterol").value,
                        "sodium": document.querySelector("#custom-sodium").value,
                        "carbs": document.querySelector("#custom-carbs").value,
                        "sugar": document.querySelector("#custom-sugar").value,
                        "protein": document.querySelector("#custom-protein").value,
                        "iron": document.querySelector("#custom-iron").value,
                        "vitaminc": document.querySelector("#custom-vitaminc").value,
                        "calcium": document.querySelector("#custom-calcium").value,
                        "potassium": document.querySelector("#custom-potassium").value,
                    }
                }
            });
        });
    });

    const results = document.querySelector("#search-results");
    document.querySelector("#food-search").addEventListener("input", (e) => {
        let i = 0;
        const filter = Object.keys(foods).filter(word => {
            const match = word.toLowerCase().includes(e.target.value.toLowerCase());
            if (match === true) i++;
            return i < 20 ? match : false;
        });
        results.textContent = "";
        filter.forEach(word => {
            const p = document.createElement("div");
            p.innerHTML = `<p class="search-food">${word} <a href=${foods[word].href} class="search-serving">${foods[word].servingsize}</a></p>`;
            p.addEventListener("click", () => {
                document.querySelector("#food-search").value = word;
            });
            results.appendChild(p);
        });
    });
    document.querySelector("#search-increase").addEventListener("click", () => {
        addFood(document.querySelector("#food-search").value, 1);
    });
    document.querySelector("#search-decrease").addEventListener("click", () => {
        addFood(document.querySelector("#food-search").value, -.25);
    });
}

const updateTracker = () => {
    const el = document.querySelector("#tracker-today");
    el.innerHTML = '<p style="color: #e21833;font-size: 24px;font-weight:700;">Today</p>';
    chrome.storage.local.get(["nutrition"], resp => {
        const date = new Date();
        try {
            const data = resp.nutrition[date.getFullYear()][date.getMonth()][date.getDate()];
            data.forEach(item => {
                const p = document.createElement("p");
                p.textContent += item.quantity + " x " + item.food;
                el.appendChild(p);
            });

        } catch {

        }
    });
}

const addFood = (food = "Apple Filling", quantity = 1) => {
    chrome.storage.local.get(["nutrition"], resp => {
        const date = new Date();
        const year = date.getFullYear() + "";
        const month = date.getMonth() + "";
        const day = date.getDate() + "";

        let updated = JSON.parse(JSON.stringify(resp.nutrition));

        if (!updated[year]) {
            updated[year] = {};
        }
        if (!updated[year][month]) {
            updated[year][month] = {};
        }
        if (!updated[year][month][day]) {
            updated[year][month][day] = [];
        }

        let found = -1;
        for (let i = 0; i < updated[year][month][day].length; i++) {
            if (updated[year][month][day][i]["food"] == food) {
                found = i;
                break;
            }
        }
        if (found === -1) {
            updated[year][month][day].push({ "food": food, "quantity": quantity });
        } else {
            updated[year][month][day][found].quantity += quantity;
            if (updated[year][month][day][found].quantity === 0) {
                updated[year][month][day].splice(found, 1);
            }
        }

        chrome.storage.local.set({ "nutrition": updated }, () => {
            updateTracker();
        });
    })
}


function scanNewItems(newItems) {
    return new Promise(resolve => {
        let done = 0;
        let facts = {};
        for (let i = 0; i < newItems.length; i++) {
            fetch(newItems[i].href)
                .then(resp => resp.text())
                .then(text => {
                    if (text.includes('"labelnotavailable"')) {
                        facts[newItems[i].name] = { "available": false };
                    } else {
                        text = text.replace(" ", "");
                        const calories = text.split("<p>Calories per serving</p>")[1].split("</p>")[0].split("<p>")[1];
                        const servingsize = text.split('<div class="nutfactsservsize">Serving size</div>')[1].split('</div>')[0].split('<div class="nutfactsservsize">')[1];
                        const totalfat = text.split("<b>Total Fat&nbsp;</b>")[1].split("</span>")[0];
                        const saturatedfat = text.split('<span class="nutfactstopnutrient">&nbsp;&nbsp;&nbsp;&nbsp;Saturated Fat&nbsp;')[1].split("</span")[0];
                        const transfat = text.split('<span class="nutfactstopnutrient">&nbsp;&nbsp;&nbsp;&nbsp;<i>Trans</i> Fat&nbsp;')[1].split("</span>")[0];
                        const cholesterol = text.split('<span class="nutfactstopnutrient"><b>Cholesterol&nbsp;</b>')[1].split("</span>")[0];
                        const sodium = text.split('<span class="nutfactstopnutrient"><b>Sodium&nbsp;</b>')[1].split("</span>")[0];
                        const carbs = text.split('<span class="nutfactstopnutrient"><b>Total Carbohydrate.&nbsp;</b>')[1].split("</span>")[0];
                        const sugar = text.split('<span class="nutfactstopnutrient">&nbsp;&nbsp;&nbsp;&nbsp;Total Sugars&nbsp;')[1].split("</span>")[0];
                        const protein = text.split('<span class="nutfactstopnutrient"><b>Protein&nbsp;</b>')[1].split("</span>")[0];
                        const iron = text.split('<span class="nutfactstopnutrient">Iron&nbsp;')[1].split("</span>")[0];
                        const vitaminc = text.split('<span class="nutfactstopnutrient">Vitamin C&nbsp;')[1].split("</span>");
                        const calcium = text.split('<span class="nutfactstopnutrient">Calcium&nbsp;')[1].split("</span>")[0];
                        const potassium = text.split('<span class="nutfactstopnutrient">Potassium&nbsp;')[1].split("</span>")[0];

                        facts[newItems[i].name] = {
                            "available": true,
                            "href": newItems[i].href,
                            "calcium": parseFloat(calcium),
                            "potassium": parseFloat(potassium),
                            "vitaminc": parseFloat(vitaminc),
                            "iron": parseFloat(iron),
                            "calories": parseInt(calories),
                            "servingsize": servingsize,
                            "totalfat": parseFloat(totalfat),
                            "saturatedfat": parseFloat(saturatedfat),
                            "transfat": parseFloat(transfat),
                            "cholesterol": parseFloat(cholesterol),
                            "sodium": parseFloat(sodium),
                            "carbs": parseFloat(carbs),
                            "sugar": parseFloat(sugar),
                            "protein": parseFloat(protein)
                        };

                    }
                }).finally(() => {
                    done++;
                    if (done === newItems.length) {
                        console.log("found new items", facts);
                        resolve(facts);
                    }
                });
        }
        if (newItems.length === 0) {
            console.log("no new items");
            resolve({});
        }
    });
}

function find(old) {

    const items = document.querySelectorAll(".menu-item-name");
    let newItems = [];

    for (let i = 0; i < items.length; i++) {
        const name = items[i].textContent;
        if (!old[name]) newItems.push({ "name": name, "href": items[i].href });
    }

    scanNewItems(newItems).then(result => chrome.storage.local.set(Object.keys(result).length > 0 ? { "foods": { ...old, ...result } } : { "test": true }).then(start()));
}

async function collectInfo() {

    chrome.storage.local.get(["foods", "weight"], storage => {

        if (!storage["foods"]) {
            // new setup
            fetch(chrome.runtime.getURL('js/existing.json'))
                .then((resp) => resp.json())
                .then(result => {
                    chrome.storage.local.set({ "foods": result, "nutrition": {}, "weight": [] }).then(find(result));
                });
        } else {
            find(storage["foods"]);
        }

    });
}




collectInfo();