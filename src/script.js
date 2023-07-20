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
                container.dataset.url = iFrameLink?.url || "";

                // CREATE ICON
                const icon = document.createElement("img");
                const imageUrl = iFrameLink?.assetUrl || "";
                if (imageUrl) {
                    const resizedImageUrl = `${imageUrl}?w=250`;
                    icon.src = resizedImageUrl;
                }
                icon.alt = iFrameLink?.title || "";
                container.appendChild(icon);

                // CREATE TITLE
                const title = document.createElement("p");
                title.textContent = iFrameLink?.title || "";
                container.appendChild(title);

                // CLICK EVENT LISTENER
                container.addEventListener("mousedown", iconDragStart);

                // ADD TO TRAY
                iconTray.appendChild(container);
            });
        }
        setTimeout(iconMagic, 100);
    })
    .catch((err) => console.error(err));

// IDLE CYCLE TITLES
function cycleTitle() {
    const iconTray = document.getElementById("menu");
    const icons = iconTray.getElementsByClassName("menuItem");
    let i = 0;

    function nextTitle() {
        // loop around
        if (i >= icons.length) {
            i = 0;
        }
        // pick titles
        const currentIcon = icons[i];
        const r = Math.floor(Math.random() * icons.length);
        const randomIcon = icons[r];
        const currentTitle = currentIcon.querySelector("p");
        const randomTitle = randomIcon.querySelector("p");
        // show title for a while
        currentTitle.style.display = "flex";
        randomTitle.style.display = "flex";
        setTimeout(() => {
            currentTitle.style.display = "none";
            randomTitle.style.display = "none";
            i++;
            nextTitle();
        }, 1000);
    }
    nextTitle();
}

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

// DRAG ICONS
document.addEventListener("mousemove", iconDragMove);
document.addEventListener("mouseup", iconDragEnd);

let isDragging = false;
let dragStartPos = { x: 0, y: 0 };
let dragStartTime = null;
let currentIcon = null;
let scheduledAnimationFrame = false;

    // start dragging
function iconDragStart(event) {
    console.log("Drag started");
    isDragging = true;
    dragStartPos = { x: event.clientX, y: event.clientY };
    dragStartTime = new Date().getTime();
    currentIcon = event.currentTarget;

    const currentTransform = currentIcon.style.transform.match(/translate\(([^)]+)\)/);
    if (currentTransform && currentTransform[1]) {
        const parts = currentTransform[1].split(",");
        currentIcon.initialTranslate = { 
            x: parseFloat(parts[0]), 
            y: parseFloat(parts[1])
        };
    } else {
        currentIcon.initialTranslate = { x: 0, y: 0 };
    }
    
    event.preventDefault();
    event.stopPropagation(); 
}
// during dragging
function iconDragMove(event) {
    if (!isDragging || !currentIcon) return;
    console.log("Dragging!");
// location & translation
    const dx = event.clientX - dragStartPos.x;
    const dy = event.clientY - dragStartPos.y;
    const currentTransform = currentIcon.style.transform.match(/translate\(([^)]+)\)/);
    let currentTranslate = { x: 0, y: 0 };
    if (currentTransform && currentTransform[1]) {
        const parts = currentTransform[1].split(", ");
        currentTranslate.x = parseFloat(parts[0]);
        currentTranslate.y = parseFloat(parts[1]);
    }
    let newTranslateX = currentTranslate.x + dx;
    let newTranslateY = currentTranslate.y + dy;
// areas
    const iconTray = document.getElementById("menu");
    const containerWidth = iconTray.offsetWidth;
    const containerHeight = iconTray.offsetHeight;
    const iconWidth = currentIcon.offsetWidth;
    const iconHeight = currentIcon.offsetHeight;
// boundary definition
    const boundaryTop = 0 - currentTranslate.y;
    const boundaryBottom = containerHeight - iconHeight - currentTranslate.y;
    const boundaryLeft = 0 - currentTranslate.x;
    const boundaryRight = containerWidth - iconWidth - currentTranslate.x;
// boundary check
    if (newTranslateY < boundaryTop || newTranslateY > boundaryBottom || newTranslateX < boundaryLeft || newTranslateX > boundaryRight) {
        dragStartPos = { x: event.clientX, y: event.clientY };
        return;
    }
// clamp to boundary
    const clampedTranslateX = Math.min(Math.max(newTranslateX, boundaryLeft), boundaryRight);
    const clampedTranslateY = Math.min(Math.max(newTranslateY, boundaryTop), boundaryBottom);
// animate smoothly
    scheduledAnimationFrame = true;
    requestAnimationFrame(() => {
        currentIcon.style.transform = `translate(${clampedTranslateX}px, ${clampedTranslateY}px)`;
        dragStartPos = { x: event.clientX, y: event.clientY };
        scheduledAnimationFrame = false;
    });
}

    // end dragging
function iconDragEnd(event) {
    if (!isDragging || !currentIcon) return;

    console.log("Drag ended");
    const dragEndTime = new Date().getTime();
    const duration = dragEndTime - dragStartTime;

    if (duration < 200) {
        const iframe = document.getElementById("backgroundIframe");
        const loadingScreen = document.getElementById("loadingScreen");
        loadingScreen.style.display = "flex";
        iframe.src = currentIcon.dataset.url;
        iframe.onload = () => {
            loadingScreen.style.display = "none";
        };
        toggleTray();
    }

    if (currentIcon) currentIcon.initialTranslate = null;
    isDragging = false;
    currentIcon = null;
    
}

// DO THE ABOVE
window.addEventListener("resize", debounce(iconMagic, 300));
function iconMagic() {
    cycleTitle();
    iconResize();
    iconTravel();
    // iconConnect();
}

document.addEventListener("DOMContentLoaded", () => {
    iconMagic();
});



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