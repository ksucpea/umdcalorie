
const addData = (current, add) => {
    return { ...current, ...add };
}

let foods = {};

const start = async () => {

    chrome.storage.local.get(["foods"], storage => {
        console.log(storage);
        foods = storage.foods;
        collectInfo();
        createSearch();
    });
    document.querySelectorAll(".menu-item-name").forEach(x => {
        let el = document.createElement("button");
        let el2 = document.createElement("button");
        el.classList.add("counter-button");
        el2.classList.add("counter-button");
        el.textContent = "+";
        el2.textContent = "-";
        x.parentElement.insertBefore(el2, x.parentElement.firstChild);
        x.parentElement.insertBefore(el, x.parentElement.firstChild);
        el.addEventListener("click", (e) => {
            addFood(x.textContent, 1);
        });
        el2.addEventListener("click", (e) => {
            addFood(x.textContent, -.25);
        });
    });

    const el = document.createElement("div");
    el.id = "tracker-today";
    el.style.cssText = "border: 1px solid #979797; background: #ffffffe6; height: 400px; width: 300px;position: fixed;bottom: 10px; right: 10px;overflow-y:auto;";
    document.body.appendChild(el);
    updateTracker();
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

        console.log(updated);

        chrome.storage.local.set({ "nutrition": updated }, () => {
            updateTracker();
        });
    })
}

const collectInfo = async () => {
    const existing = foods;

    let facts = {};
    const items = document.querySelectorAll(".menu-item-name");
    for (let i = 0; i < items.length; i++) {
        try {
            const name = items[i].textContent;
            if (existing[name]) continue;
            let item = await (await fetch(items[i].href)).text();
            if (item.includes('"labelnotavailable"')) {
                facts[name] = { "available": false };
            } else {
                let text = item.replace(" ", "");
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

                facts[name] = {
                    "available": true,
                    "href": items[i].href,
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

        } catch (e) {
            console.log(e);
            console.log("couldnt get data for " + items[i].textContent);
        }
    }

    chrome.storage.local.get(["foods"], storage => {
        console.log("NEW DATA", facts);
        chrome.storage.local.set({ "foods": { ...storage["foods"], ...facts } });
    });
}

start();
