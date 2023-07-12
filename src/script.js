// SANITY PROJECT

let PROJECT_ID = "1u261ldt";
let DATASET = "production";

let queryTicker = encodeURIComponent('*[_type == "ticker"]{tickerText}');
let urlTicker = `https://${PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/${DATASET}?query=${queryTicker}`;

let queryIcon = encodeURIComponent('*[_type == "iFrameLink"]{title,url,thumb,"assetUrl": thumb.asset->url}');
let urlIcon = `https://${PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/${DATASET}?query=${queryIcon}`;

// SHUFFLE

function shuffleArray(array) {
    // Fisher-Yates shuffle algorithm
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// ***** TICKER *****

fetch(urlTicker)
    .then((res) => res.json())
    .then(({ result }) => {

        const tickerTray = document.getElementById("feed");
        tickerTray.innerHTML = "";
        let tickerWidth = 0;

        if (result.length > 0) {
            result = shuffleArray(result);
            result.forEach((ticker) => {
                // CREATE SPAN
                const container = document.createElement("span");
                container.className = "feedItem";
                // ADD TEXT
                const rumor = document.createElement("p");
                rumor.innerText = ticker?.tickerText
                container.appendChild(rumor);
                tickerTray.appendChild(container);
                // ADD UP LENGTH
                tickerWidth += container.offsetWidth;
            })
            // TRANSLATE LEFT
            tickerTray.style.width = `${tickerWidth}px`;
            const duration = tickerWidth * .008;
            tickerTray.style.animationDuration = `${duration}s`;
        }
    })
    .catch((err) => console.error(err));
  

// ***** ICONS *****

fetch(urlIcon)
    .then((res) => res.json())
    .then(({ result }) => {

        const iconTray = document.getElementById("trayContainer");
        iconTray.innerHTML = "";

        if (result.length > 0) {
            result = shuffleArray(result);
            result.forEach((iFrameLink) => {
                // CREATE DIV
                const container = document.createElement("div");
                container.className = "trayMenu";

                // CREATE ICON
                const icon = document.createElement("img");
                const imageUrl = iFrameLink?.assetUrl;
                if (imageUrl) {
                    const resizedImageUrl = `${imageUrl}?w=250`;
                    icon.src = resizedImageUrl;
                }
                icon.alt = iFrameLink?.title;
                icon.className = "menuIcon";
                container.appendChild(icon);

                /*
                    // CREATE TITLE
                    const title = document.createElement("p");
                    title.textContent = iFrameLink?.title;
                    container.appendChild(title);
                */

                // CLICK EVENT LISTENER
                container.addEventListener("click", () => {
                    const iframe = document.getElementById("backgroundIframe");
                    const loadingScreen = document.getElementById("loadingScreen");
                    // loading screen
                    loadingScreen.style.display = "flex";
                    iframe.onload = () => {
                        loadingScreen.style.display = "none";
                    };
                    iframe.src = iFrameLink?.url;
                    toggleTray();
                });

                // ADD TO TRAY
                iconTray.appendChild(container);
            });
        }
        setTimeout(iconMagic, 100);  
    })
    .catch((err) => console.error(err));

// SCALE ICONS
window.addEventListener("resize", iconMagic);

function iconMagic() {
    // get height for resize
    const title = document.getElementById("titleText");
    const titleHeight = window.getComputedStyle(title).height;
    const titleRatio = 15 / 11.9525;
    const iconSize = parseFloat(titleHeight) * titleRatio + "px";

    // resize
    const icons = document.querySelectorAll(".trayMenu");
    icons.forEach((icon) => {
        icon.style.height = iconSize;
        icon.style.width = iconSize;
        icon.style.display = "flex";
    });
}

iconMagic();



// ***** TRAY *****

// RETRACT TRAY
function toggleTray() {
    const tray = document.getElementById("tray");
    tray.classList.toggle("retracted");

    const trayTickerHeight = document.getElementById("trayTicker").offsetHeight;
    const trayTitleHeight = document.getElementById("trayTitle").offsetHeight;
    const windowHeight = window.innerHeight;
    const translateHeight = windowHeight - trayTickerHeight - (trayTitleHeight / 2);

    if (tray.classList.contains("retracted")) {
        tray.style.transform = `translateY(${translateHeight}px)`;
    } else {
        tray.style.transform = "translateY(0)";
        /*
            // bounce on landing
            setTimeout(() => {
                const bounceKeyframes = [
                    { transform: `translateY(0px)` },
                    { transform: `translateY(5px)` },
                    { transform: `translateY(0px)` }
                ];
            tray.animate(bounceKeyframes, {
                duration: 200
            });
            }, 500);
        */
    }
}

// RETRACT STABILITY ON WINDOW RESIZE
window.addEventListener("resize", function() {
    const tray = document.getElementById("tray");
    const isRetracted = tray.classList.contains("retracted");
    
    const trayTickerHeight = document.getElementById("trayTicker").offsetHeight;
    const trayTitleHeight = document.getElementById("trayTitle").offsetHeight;
    const windowHeight = window.innerHeight;
    const translateHeight = windowHeight - trayTickerHeight - (trayTitleHeight / 2);

    if (isRetracted) {
        tray.style.transform = `translateY(${translateHeight}px)`;
    }
});