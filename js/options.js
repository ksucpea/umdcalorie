let year, month, day;

document.addEventListener("DOMContentLoaded", () => {
    const date = new Date();
    year = date.getFullYear();
    month = date.getMonth();
    day = date.getDate();
    document.querySelector("#weight-enter").addEventListener("click", () => {
        chrome.storage.local.get(["weight"], storage => {
            let entry = [{ "lbs": parseFloat(document.querySelector("#lbs").value), "time": new Date().getTime() }]
            let data = storage["weight"] ? storage["weight"].concat(entry) : entry;
            chrome.storage.local.set({ "weight": data });
        });
    });

    document.querySelector("#ymd").textContent = (month + 1) + "/" + day + "/" + year;

    document.querySelector("#date-back").addEventListener("click", () => {
        let adjustedDate = new Date(document.querySelector("#ymd").textContent);
        console.log(adjustedDate.getTime());
        let newDate = new Date(adjustedDate.getTime() - 86400000);
        year = newDate.getFullYear();
        month = newDate.getMonth();
        day = newDate.getDate();
        document.querySelector("#ymd").textContent = (month + 1) + "/" + day + "/" + year;
        start();
    });

    document.querySelector("#date-forward").addEventListener("click", () => {
        let adjustedDate = new Date(document.querySelector("#ymd").textContent);
        console.log(adjustedDate.getTime());
        let newDate = new Date(adjustedDate.getTime() + 86400000);
        year = newDate.getFullYear();
        month = newDate.getMonth();
        day = newDate.getDate();
        document.querySelector("#ymd").textContent = (month + 1) + "/" + day + "/" + year;
        console.log(month, day, year);
        start();
    });
    start();
});

const start = async () => {
    const el = document.querySelector(".table");
    el.textContent = "";

    const el2 = document.querySelector(".weight-graph");
    el2.textContent = "";

    chrome.storage.local.get(["foods", "nutrition", "weight"], resp => {

        if (resp["weight"]) {
            /*
            for(let i = resp["weight"].length - 1; i >= Math.max(0, resp["weight"].length - 10); i--) {
                el2.textContent += resp["weight"][i].lbs + ", ";
            }
            */
            let high = 0;
            let low = 1000;
            for (let i = 0; i < resp["weight"].length; i++) {
                if (resp["weight"][i].lbs > high) high = resp["weight"][i].lbs + 1;
                if (resp["weight"][i].lbs < low) low = resp["weight"][i].lbs - 1;
            }

            let lbsRange = 300 / (high - low);
            let timePeriod = resp["weight"][resp["weight"].length - 1].time - resp["weight"][0].time;
            let spacePerDay = 500 / timePeriod;
            document.querySelector("#top").textContent = high + "lbs";
            document.querySelector("#bottom").textContent = low + "lbs";

            for (let i = 0; i < resp["weight"].length; i++) {
                let elapsed = resp["weight"][i].time - resp["weight"][0].time;
                let point = document.createElement("div");
                point.classList.add("weight-point");
                point.style.bottom = ((resp["weight"][i].lbs - low) * lbsRange) + "px";
                point.style.left = (elapsed * spacePerDay) + "px";
                el2.appendChild(point);
            }
        }


        const facts = resp["foods"];
        if (!resp.nutrition[year] || !resp.nutrition[year][month] || !resp.nutrition[year][month][day]) {
            el.textContent = "No data for this day";
            return;
        }
        const data = resp.nutrition[year][month][day];
        const x = document.createElement("div");
        x.style.cssText = "display: flex;font-weight:bold;";
        x.innerHTML = '<div style="width: 60px; text-align: center;">Quantity</div><div style="width: 200px">Food</div><div style="width: 100px">Calories</div><div style="width: 100px">Total fat</div><div style="width: 100px">Saturated fat</div><div style="width: 100px">Trans fat</div><div style="width: 100px">Cholesterol</div><div style="width: 100px">Sodium</div><div style="width: 100px">Carbs</div><div style="width: 100px">Sugar</div><div style="width: 100px">Protein</div><div style="width: 100px">Calcium</div><div style="width: 100px">Potassium</div><div style="width: 100px">Vitamin C</div><div style="width: 100px">Iron</div>';
        el.appendChild(x);
        let calorieTotal = 0, totalfatTotal = 0, saturatedfatTotal = 0, transfatTotal = 0, cholesterolTotal = 0, sodiumTotal = 0, carbsTotal = 0, sugarTotal = 0, proteinTotal = 0, calciumTotal = 0, potassiumTotal = 0, vitamincTotal = 0, ironTotal = 0;
        data.forEach(item => {
            try {
                const div = document.createElement("div");
                div.style.cssText = "display: flex;";
                const quant = item.quantity;
                div.innerHTML = `<div style="width: 60px; text-align: center;border-bottom: 1px solid #000">${quant}</div><div style="width: 200px;height:16px;overflow:hidden;border-bottom: 1px solid #000">${item.food}</div><div style="width: 100px;border-bottom: 1px solid #000">${quant * facts[item.food].calories}</div><div style="width: 100px;border-bottom: 1px solid #000">${(quant * facts[item.food].totalfat).toFixed(1)}g</div><div style="width: 100px;border-bottom: 1px solid #000">${(quant * facts[item.food].saturatedfat).toFixed(1)}g</div><div style="width: 100px;border-bottom: 1px solid #000">${(quant * facts[item.food].transfat).toFixed(1)}g</div><div style="width: 100px;border-bottom: 1px solid #000">${(quant * facts[item.food].cholesterol).toFixed(1)}g</div><div style="width: 100px;border-bottom: 1px solid #000">${(quant * facts[item.food].sodium).toFixed(1)}g</div><div style="width: 100px;border-bottom: 1px solid #000">${(quant * facts[item.food].carbs).toFixed(1)}g</div><div style="width: 100px;border-bottom: 1px solid #000">${(quant * facts[item.food].sugar).toFixed(1)}g</div><div style="width: 100px;border-bottom: 1px solid #000">${(quant * facts[item.food].protein).toFixed(1)}g</div><div style="width: 100px;border-bottom: 1px solid #000">${(quant * facts[item.food].calcium).toFixed(1)}g</div><div style="width: 100px;border-bottom: 1px solid #000">${(quant * facts[item.food].potassium).toFixed(1)}g</div><div style="width: 100px;border-bottom: 1px solid #000">${(quant * facts[item.food].vitaminc).toFixed(1)}g</div><div style="width: 100px;border-bottom: 1px solid #000">${(quant * facts[item.food].iron).toFixed(1)}g</div>`;
                calorieTotal += quant * facts[item.food].calories;
                totalfatTotal += quant * facts[item.food].totalfat;
                saturatedfatTotal += quant * facts[item.food].saturatedfat;
                transfatTotal += quant * facts[item.food].transfat;
                cholesterolTotal += quant * facts[item.food].cholesterol;
                sodiumTotal += quant * facts[item.food].sodium;
                carbsTotal += quant * facts[item.food].carbs;
                sugarTotal += quant * facts[item.food].sugar;
                proteinTotal += quant * facts[item.food].protein;
                calciumTotal += quant * facts[item.food].calcium;
                potassiumTotal += quant * facts[item.food].potassium;
                vitamincTotal += quant * facts[item.food].vitaminc;
                ironTotal += quant * facts[item.food].iron;

                el.appendChild(div);
            } catch {
                console.log("ERROR!", item);
            }
        });

        const overCalorie = calorieTotal - 2300;
        const overFat = totalfatTotal - 97;
        const overSaturated = saturatedfatTotal - 23;
        const overSodium = sodiumTotal - 2300;
        const overCholesterol = cholesterolTotal - 300;
        const overCarbs = carbsTotal - 400;
        const overSugar = sugarTotal - 35;
        const overProtein = proteinTotal - 200;
        const overTrans = transfatTotal;
        const overCalcium = calciumTotal - 1000;
        const overPotassium = potassiumTotal - 4000;
        const overVitaminc = vitamincTotal - 90;
        const overIron = ironTotal - 8.7;
        const y = document.createElement("div");
        y.style.cssText = "display: flex; font-weight:bold;";
        y.innerHTML = `<div style="width: 60px"></div><div style="width: 200px"><p>Total</p></div><div style="width: 100px"><p>${Math.round(calorieTotal)} cal</p><p style="background:${overCalorie > 0 ? "#ff4f67" : "#08dd08"}">${(overCalorie > 0 ? "+" : "") + overCalorie}<br>(< 2300 cal)</p></div><div style="width: 100px"><p>${totalfatTotal.toFixed(1)}g</p><p style="background:${overFat > 0 ? "#ff4f67" : "#08dd08"}">${(overFat > 0 ? "+" : "") + overFat.toFixed(1)}g<br>(< 97g)</p></div><div style="width: 100px"><p>${saturatedfatTotal.toFixed(1)}g</p><p style="background:${overSaturated > 0 ? "#ff4f67" : "#08dd08"}">${(overSaturated > 0 ? "+" : "") + overSaturated.toFixed(1)}g<br>(< 23g)</p></div><div style="width: 100px"><p>${transfatTotal.toFixed(1)}g</p><p style="background:${overTrans > 0 ? "#ff4f67" : "#08dd08"}">${(overTrans > 0 ? "+" : "") + overTrans.toFixed(1)}<br>(0g)</p></div><div style="width: 100px"><p>${cholesterolTotal.toFixed(1)}g</p><p style="background:${overCholesterol > 0 ? "#ff4f67" : "#08dd08"}">${(overCholesterol > 0 ? "+" : "") + overCholesterol.toFixed(1)}g<br>(< 300g)</p></div><div style="width: 100px"><p>${sodiumTotal.toFixed(1)}mg</p><p style="background:${overSodium > 0 ? "#ff4f67" : "#08dd08"}">${overSodium.toFixed(1)}mg<br>(< 2300mg)</p></div><div style="width: 100px"><p>${carbsTotal.toFixed(1)}g</p><p style="background:${overCarbs > 0 ? "#ff4f67" : "#08dd08"}">${overCarbs.toFixed(1)}g<br>(< 400g)</p></div><div style="width: 100px"><p>${sugarTotal.toFixed(1)}g</p><p style="background:${overSugar > 0 ? "#ff4f67" : "#08dd08"}">${overSugar.toFixed(1)}g<br>(< 35g)</p></div><div style="width: 100px"><p>${proteinTotal.toFixed(1)}g</p><p style="background:${overProtein < 0 ? "#ff4f67" : "#08dd08"}">${overProtein.toFixed(1)}g<br>(> 200g)</p></div><div style="width: 100px"><p>${calciumTotal.toFixed(1)}mg</p><p style="background:${overCalcium < 0 ? "#ff4f67" : "#08dd08"}">${overCalcium.toFixed(1)}mg<br>(> 1000mg)</p></div><div style="width: 100px"><p>${potassiumTotal.toFixed(1)}mg</p><p style="background:${overPotassium < 0 ? "#ff4f67" : "#08dd08"}">${overPotassium.toFixed(1)}<br>(> 4000mg)</p></div><div style="width: 100px"><p>${vitamincTotal.toFixed(1)}mg</p><p style="background:${overVitaminc < 0 ? "#ff4f67" : "#08dd08"}">${overVitaminc.toFixed(1)}mg<br>(> 90mg)</p></div><div style="width: 100px"><p>${ironTotal.toFixed(1)}mg</p><p style="background:${overIron < 0 ? "#ff4f67" : "#08dd08"}">${overIron.toFixed(1)}mg<br>(8.7mg)</p></div>`;
        el.appendChild(y);
        /*
    "carbs": 5.3,
    "sugar": 1.4,
    "protein": 13.2
        */
    });
}