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

        const iconTray = document.getElementById("menu");
        iconTray.innerHTML = "";

        if (result.length > 0) {
            result = shuffleArray(result);
            result.forEach((iFrameLink) => {

                // CREATE DIV
                const container = document.createElement("div");
                container.className = "menuItem";

                // CREATE ICON
                const icon = document.createElement("img");
                const imageUrl = iFrameLink?.assetUrl;
                if (imageUrl) {
                    const resizedImageUrl = `${imageUrl}?w=250`;
                    icon.src = resizedImageUrl;
                }
                icon.alt = iFrameLink?.title;
                container.appendChild(icon);

                // CREATE TITLE
                const title = document.createElement("p");
                title.textContent = iFrameLink?.title;
                container.appendChild(title);

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
function iconResize() {
    // get height for resize
    const title = document.getElementById("titleText");
    const titleHeight = window.getComputedStyle(title).height;
    const titleRatio = 15 / 11.9525;
    const iconSize = parseFloat(titleHeight) * titleRatio + "px";

    // resize
    const icons = document.querySelectorAll(".menuItem");
    icons.forEach((icon) => {
        icon.style.height = iconSize;
        icon.style.width = iconSize;
        icon.style.display = "flex";
    });
}

// RANDOMLY LOCATE ICONS
function iconTravel() {
    const iconTray = document.getElementById("menu");
    const icons = iconTray.getElementsByClassName("menuItem");
    // relocation boundary
    const parentWidth = iconTray.offsetWidth;
    const parentHeight = iconTray.offsetHeight;
    // overlap boundaries
    const iconSize = icons[0].offsetWidth;
    const buffer = 20;
    const maxAttempts = 100;
    let attempts = 0;
    // relocate each icon
    for (let i = 0; i < icons.length; i++) {
        let isOverlapping = false;
        do {
            // pick random location
            const randomTop = Math.floor(Math.random() * (parentHeight - iconSize));
            const randomLeft = Math.floor(Math.random() * (parentWidth - iconSize));
            isOverlapping = false;
            // locate previous icons
            for (let j = 0; j < i; j++) {
                const prevIcon = icons[j];
                const prevTop = parseFloat(prevIcon.style.top);
                const prevLeft = parseFloat(prevIcon.style.left);
                // check overlap
                if (
                    randomTop + iconSize + buffer > prevTop &&
                    randomTop < prevTop + iconSize + buffer &&
                    randomLeft + iconSize + buffer > prevLeft &&
                    randomLeft < prevLeft + iconSize + buffer
                ) {
                    isOverlapping = true;
                    break;
                }
            }
            // fix position
            if (!isOverlapping || attempts >= maxAttempts) {
                const container = icons[i];
                container.style.position = "absolute";
                container.style.top = `${randomTop}px`;
                container.style.left = `${randomLeft}px`;
            }
            attempts++;
        } while (isOverlapping && attempts < maxAttempts);
    }
}

// CONNECT ICONS LIKE A CONSPIRACY CHART
    // this breaks a lot of stuff on resizing
function iconConnect() {
    const iconTray = document.getElementById("menu");
    const icons = iconTray.getElementsByClassName("menuItem");

    const canvas = document.createElement("canvas");
    iconTray.appendChild(canvas);
    canvas.width = iconTray.offsetWidth;
    canvas.height = iconTray.offsetHeight;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const shuffledIcons = Array.from(icons).sort(() => Math.random() - 0.5);

    // draw lines between icons
    for (let i = 0; i < shuffledIcons.length; i++) {
        const iconA = icons[i];
        const maxConnections = 2;
    
        // pick two icons
        const connectedIcons = [];
        while (connectedIcons.length < maxConnections) {
            const randomIndex = Math.floor(Math.random() * icons.length);
            const iconB = icons[randomIndex];

            if (iconA !== iconB && !connectedIcons.includes(iconB)) {
                connectedIcons.push(iconB);

                // draw line
                const iconAX = parseFloat(iconA.style.left) + iconA.offsetWidth / 2;
                const iconAY = parseFloat(iconA.style.top) + iconA.offsetHeight / 2;
                const iconBX = parseFloat(iconB.style.left) + iconB.offsetWidth / 2;
                const iconBY = parseFloat(iconB.style.top) + iconB.offsetHeight / 2;
                // line definition
                ctx.beginPath();
                ctx.moveTo(iconAX, iconAY);
                ctx.lineTo(iconBX, iconBY);
                ctx.strokeStyle = "black";
                ctx.lineWidth = 3;
                ctx.stroke();
            }
        }
    }
}

// DEBOUNCE FUNCTION
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// DO THE ABOVE
window.addEventListener("resize", debounce(iconMagic, 300));
function iconMagic() {
    iconResize();
    iconTravel();
    // iconConnect();
}

iconMagic();



// ***** TRAY *****


// RETRACT TRAY
function toggleTray() {
    var currentFrame = document.getElementById("backgroundIframe").src;
    if(currentFrame == `${location.href}default.html`) {
        return;
    };

    const tray = document.getElementById("tray");
    const trayTitle = document.getElementById("trayTitle");
    tray.classList.toggle("retracted");

    const trayTickerHeight = document.getElementById("trayTicker").offsetHeight;
    const trayTitleHeight = document.getElementById("trayTitle").offsetHeight;
    const windowHeight = window.innerHeight;
    const translateHeight = windowHeight - trayTickerHeight - (trayTitleHeight / 2);

    if (tray.classList.contains("retracted")) {
        trayTitle.classList.remove("unflipTitle");
        void trayTitle.offsetWidth;
        trayTitle.classList.add("flipTitle");
        tray.style.transform = `translateY(${translateHeight}px)`;
    } else {
        trayTitle.classList.remove("flipTitle");
        void trayTitle.offsetWidth;
        trayTitle.classList.add("unflipTitle");
        tray.style.transform = "translateY(0)";
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