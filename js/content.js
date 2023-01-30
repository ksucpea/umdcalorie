
const addData = (current, add) => {
    return { ...current, ...add };
}

const start = async () => {

    chrome.storage.local.get(["nutrition"], resp => {
        if (!resp.nutrition) {
            chrome.storage.local.set({ "nutrition": {} });
        }
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

    createSearch();
}

const createSearch = async () => {
    const insert = document.querySelector("#menu").parentElement;
    const container = document.createElement("div");
    container.style.margin = "0 15px";
    container.style.borderBottom = "1px solid #eaeaea";
    container.style.paddingBottom = "30px";
    insert.appendChild(container);
    const nutrition = chrome.runtime.getURL("js/nutrition.json");
    const info = await fetch(nutrition);
    facts = await info.json();
    container.innerHTML = '<h2 style="font-weight: bolder">Calorie Search</h2><div style="display: flex; align-items: center;"><input type="text" id="food-search"><button id="search-increase" class="counter-button">+</button><button id="search-decrease" class="counter-button">-</button></div><div id="search-results"></div>';
    const results = document.querySelector("#search-results");
    document.querySelector("#food-search").addEventListener("input", (e) => {
        let i = 0;
        const filter = Object.keys(facts).filter(word => {
            const match = word.toLowerCase().includes(e.target.value.toLowerCase());
            if (match === true) i++;
            return i < 20 ? match : false;
        });
        results.textContent = "";
        filter.forEach(word => {
            const p = document.createElement("div");
            p.innerHTML = `<p class="search-food">${word} <a href=${facts[word].href} class="search-serving">${facts[word].servingsize}</a></p>`;
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
            console.log(updated[year][month][day][i]["food"], food);
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
    console.log("*****STARTING*****");
    const nutrition = chrome.runtime.getURL("js/nutrition.json");
    const info = await fetch(nutrition);
    const existing = await info.json();


    let sortable = [];
    for (const key in existing) {
        sortable.push([key, ((existing[key].calories > 100 ? Math.pow(existing[key].calories, 2) : 0) / existing[key].sodium)]);
    }

    sortable.sort(function (a, b) {
        return a[1] - b[1];
    });

    console.log(sortable);

    let i = 0;
    let facts = {};
    const items = document.querySelectorAll(".menu-item-name");
    const getInfo = async () => {
        //console.log(i);
        if (existing[items[i].textContent] !== undefined) {
            i++;
            if (i < items.length) {
                getInfo()
            } else {
                console.log("********FINISHED**********");
                console.log(`-> Checked ${i} items`);
            }
            return;
        }
        const data = await (await fetch(items[i].href)).text();
        const text = data.replace(" ", "");
        try {
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

            //console.log(calories, servingsize, totalfat, saturatedfat, transfat, cholesterol, sodium, carbs, sugar, protein);
            facts[items[i].textContent] = { "href": items[i].href, "calcium": parseFloat(calcium), "potassium": parseFloat(potassium), "vitaminc": parseFloat(vitaminc), "iron": parseFloat(iron), "calories": parseInt(calories), "servingsize": servingsize, "totalfat": parseFloat(totalfat), "saturatedfat": parseFloat(saturatedfat), "transfat": parseFloat(transfat), "cholesterol": parseFloat(cholesterol), "sodium": parseFloat(sodium), "carbs": parseFloat(carbs), "sugar": parseFloat(sugar), "protein": parseFloat(protein) };
            console.log("NEW NUTRITION INFO GATHERED: ");
            console.log(facts);
        } catch (err) {
            console.log(items[i].textContent + " couldnt get the data");
        } finally {
            i++;
            if (i < items.length) {
                getInfo()
            } else {
                console.log("*********FINISHED*********");
                console.log(`-> Checked ${i} items`);
            }
        }
    }
    getInfo();
}

start();

collectInfo();