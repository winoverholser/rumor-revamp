// SANITY PROJECT (HEADLESS CMS FOR ICONS & TICKER)

let PROJECT_ID = "1u261ldt";
let DATASET = "production";

let queryTicker = encodeURIComponent('*[_type == "ticker"]{tickerText}');
let urlTicker = `https://${PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/${DATASET}?query=${queryTicker}`;

let queryIcon = encodeURIComponent('*[_type == "iFrameLink"]{title,url,thumb,"assetUrl": thumb.asset->url}');
let urlIcon = `https://${PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/${DATASET}?query=${queryIcon}`;

// SHUFFLE IMPORTED DATA

function shuffleArray(array) {
    // Fisher-Yates shuffle algorithm
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// ***** TICKER *****

// GET DATA
fetch(urlTicker)
    .then((res) => res.json())
    .then(({ result }) => {
        // TICKER LOCATION
        const tickerTray = document.getElementById("feed");
        tickerTray.innerHTML = "";
        let tickerWidth = 0;
        // SHUFFLE DATA & POPULATE LOCATION
        if (result.length > 0) {
            result = shuffleArray(result);
            result.forEach((ticker) => {
                // CREATE SPAN
                const container = document.createElement("span");
                container.className = "feedItem";
                // ADD TEXT TO SPAN
                const rumor = document.createElement("p");
                rumor.innerText = ticker?.tickerText
                container.appendChild(rumor);
                tickerTray.appendChild(container);
                // ADD UP LENGTH FOR ANIMATION
                tickerWidth += container.offsetWidth;
            })
            // ANIMATE TICKER LEFT
            tickerTray.style.width = `${tickerWidth}px`;
            const duration = tickerWidth * .008;
            tickerTray.style.animationDuration = `${duration}s`;
        }
    })
    .catch((err) => console.error(err));
  

// ***** ICONS *****

// EXTEND TRAY ON DEFAULT PAGE
let defaultPage = true;
function defaultReset() {
    defaultPage = true;
}

// GET DATA
fetch(urlIcon)
    .then((res) => res.json())
    .then(({ result }) => {
        // ICON LOCATION
        const iconTray = document.getElementById("menu");
        iconTray.innerHTML = "";
        // SHUFFLE DATA & POPULATE LOCATION
        if (result.length > 0) {
            result = shuffleArray(result);
            result.forEach((iFrameLink) => {
                // CREATE DIV FOR MENU ITEMS
                const container = document.createElement("div");
                container.className = "menuItem";
                // CREATE ICONS
                const icon = document.createElement("img");
                const imageUrl = iFrameLink?.assetUrl;
                if (imageUrl) {
                    const resizedImageUrl = `${imageUrl}?w=200`;
                    icon.src = resizedImageUrl;
                }
                icon.alt = iFrameLink?.title;
                container.appendChild(icon);
                // CREATE TITLES
                const title = document.createElement("p");
                title.textContent = iFrameLink?.title;
                container.appendChild(title);
                // CLICK EVENT LISTENER
                container.addEventListener("click", () => {
                    const iframe = document.getElementById("backgroundIframe");
                    const loadingScreen = document.getElementById("loadingScreen");
                    // SHOW LOADING SCREEN
                    loadingScreen.style.display = "flex";
                    iframe.onload = () => {
                        loadingScreen.style.display = "none";
                    };
                    iframe.src = iFrameLink?.url;
                    defaultPage = false;
                    toggleTray();
                });
                // ADD ALL TO TRAY
                iconTray.appendChild(container);
            });
        }
        setTimeout(iconMagic, 100);
    })
    .catch((err) => console.error(err));

// IDLE CYCLE TITLES (TIMER)
let cycleTimeout = null;
function cycleTitle() {
    if (cycleTimeout) {
        clearTimeout(cycleTimeout);
    }
    const iconTray = document.getElementById("menu");
    const icons = iconTray.getElementsByClassName("menuItem");
    let i = 0;
    // LOOP
    function nextTitle() {
        // loop around title list
        if (i >= icons.length) {
            i = 0;
        }
        // pick titles to show
        const currentIcon = icons[i];
        const r = Math.floor(Math.random() * icons.length);
        const randomIcon = icons[r];
        const currentTitle = currentIcon.querySelector("p");
        const randomTitle = randomIcon.querySelector("p");
        // show title for a while
        currentTitle.style.display = "flex";
        randomTitle.style.display = "flex";
        cycleTimeout = setTimeout(() => {
            currentTitle.style.display = "none";
            randomTitle.style.display = "none";
            i++;
            nextTitle();
        }, 1000);
        // BOUNCE RETRACTED TRAY
        const trayTitle = document.getElementById("trayTitle");
        if (document.getElementById("tray").classList.contains("retracted") && (i == 0 || r == 0)) {
            trayTitle.classList.remove("flipTitle");
            trayTitle.classList.remove("peekTitle");
            void trayTitle.offsetWidth;
            trayTitle.classList.add("peekTitle");
        }
    }
    nextTitle();
}

// SCALE ICONS
function iconResize() {
    // get height for resize
    const title = document.getElementById("titleText");
    const titleHeight = window.getComputedStyle(title).height;
    const titleRatio = 15 / 11.9525;
    const calculatedWidth = parseFloat(titleHeight) * titleRatio;
    const iconWidth = calculatedWidth + "px";
    // resize
    const icons = document.querySelectorAll(".menuItem");
    icons.forEach((icon) => {
        icon.style.width = iconWidth;
        icon.style.display = "block";
    });
}

// RANDOMLY LOCATE ICONS
function iconTravel() {
    const iconTray = document.getElementById("menu");
    const icons = iconTray.getElementsByClassName("menuItem");
    // relocation boundary
    const parentWidth = iconTray.offsetWidth;
    const parentHeight = iconTray.offsetHeight;
    const buffer = 10;
    const maxAttempts = 200; // this limits how long the operation has to succeed
    // relocate each icon
    for (let i = 0; i < icons.length; i++) {
        const currentIcon = icons[i];
        const iconWidth = currentIcon.offsetWidth;
        const iconHeight = currentIcon.offsetHeight;
        // reset attempt counter
        let attempts = 0;
        let isOverlapping = false;
        do {
            // pick random location
            const randomTop = Math.floor(Math.random() * (parentHeight - iconHeight - buffer));
            const randomLeft = Math.floor(Math.random() * (parentWidth - iconWidth - buffer));
            isOverlapping = false;
            // locate previous icons
            for (let j = 0; j < i; j++) {
                const prevIcon = icons[j];
                const prevTop = parseFloat(prevIcon.style.top);
                const prevLeft = parseFloat(prevIcon.style.left);
                // check for overlap between random and previous locations
                if (
                    randomTop + iconHeight + buffer > prevTop &&
                    randomTop < prevTop + iconHeight + buffer &&
                    randomLeft + iconWidth + buffer > prevLeft &&
                    randomLeft < prevLeft + iconWidth + buffer
                ) {
                    isOverlapping = true;
                    break;
                }
            }
            // fix position
            if (!isOverlapping || attempts >= maxAttempts) {
                currentIcon.style.position = "absolute";
                currentIcon.style.top = `${randomTop}px`;
                currentIcon.style.left = `${randomLeft}px`;
            }
            attempts++;
        } while (isOverlapping && attempts < maxAttempts);
    }
}

// DEBOUNCE FUNCTION (TO PREVENT JANKY MOVEMENT)
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

// DO ALL THE ABOVE
window.addEventListener("resize", debounce(iconMagic, 300));
function iconMagic() {
    cycleTitle();
    iconResize();
    iconTravel();
}
// RUN EVERYTHING ONCE PAGE LOADS
document.addEventListener('DOMContentLoaded', function() {
    iconMagic();
})


// ***** TRAY *****
const tray = document.getElementById("tray");

// SHUFFLE ICONS ON TITLE CLICK
document.getElementById("trayTitle").addEventListener("click", shuffleIcons);
function shuffleIcons() {
    if (tray.classList.contains("retracted")) {
        toggleTray();
    } else {
        iconMagic();
    }
}

// SWIPE FOR TRAY RETRACTION
let startY;
let endY;
const thresholdY = 30;
// GET SWIPE DIRECTION
function getSwipeDirection(start, end) {
    return start < end ? 'down' : 'up' ;
};
// SWIPE START
function onStart(event) {
    const y = (event.touches && event.touches[0].clientY) || event.clientY;
    startY = y;
    endY = y;
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchmove', onMove);
    document.addEventListener('touchend', onEnd);
};
// SWIPE ITSELF
function onMove(event) {
    const y = (event.touches && event.touches[0].clientY) || event.clientY;
    endY = y;
};
// END OF SWIPE
function onEnd() {
    const deltaY = Math.abs(endY - startY);
    // WAS THE SWIPE LONG ENOUGH?
    if (deltaY > thresholdY) {
        const direction = getSwipeDirection(startY, endY);
        const tray = document.getElementById('tray');
        const isRetracted = tray.classList.contains('retracted');
        // TOGGLE BASED ON SWIPE DIRECTION
        if ((direction === 'up' && isRetracted) || (direction === 'down' && !isRetracted)) {
            toggleTray();
        }
    }
    // RESET SWIPE DATA
    startY = null;
    endY = null;
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onEnd);
    document.removeEventListener('touchmove', onMove);
    document.removeEventListener('touchend', onEnd);
}
// SWIPE LISTENERS
tray.addEventListener('mousedown', onStart);
tray.addEventListener('touchstart', onStart);

// RETRACT TRAY
function toggleTray() {
    var currentFrame = document.getElementById("backgroundIframe").src;
    const tray = document.getElementById("tray");
    const trayTitle = document.getElementById("trayTitle");
    // NO RETRACTION ON DEFAULT PAGE, NOR IF ALREADY RETRACTED
    if(defaultPage == true && !tray.classList.contains("retracted")) {
        return;
    };
    // RETRACT
    tray.classList.toggle("retracted");
    // RETRACT DISTANCE
    const trayTickerHeight = document.getElementById("trayTicker").offsetHeight;
    const trayTitleHeight = document.getElementById("trayTitle").offsetHeight;
    const windowHeight = window.innerHeight;
    const translateHeight = windowHeight - trayTickerHeight - (trayTitleHeight / 2);
    // REMOVE IDLE RETRACTED ANIMATION
    trayTitle.classList.remove("peekTitle");
    // RETRACTION ANIMATION TOGGLE
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
        // bounce on landing (totally unnecessary)
            setTimeout(() => {
                const bounceKeyframes = [
                    { transform: `translateY(0px)` },
                    { transform: `translateY(5px)` },
                    { transform: `translateY(0px)` }
                ];
            tray.animate(bounceKeyframes, {
                duration: 200
            });
            iconMagic();
            }, 500);
        
    }
}

// RETRACT STABILITY ON WINDOW RESIZE
window.addEventListener("resize", function() {
    const tray = document.getElementById("tray");
    const isRetracted = tray.classList.contains("retracted");
    // DUPLICATE CODE FOR RETRACTION DISTANCE...
    const trayTickerHeight = document.getElementById("trayTicker").offsetHeight;
    const trayTitleHeight = document.getElementById("trayTitle").offsetHeight;
    const windowHeight = window.innerHeight;
    const translateHeight = windowHeight - trayTickerHeight - (trayTitleHeight / 2);
    // FIX DISTANCE ON RESIZE
    if (isRetracted) {
        tray.style.transform = `translateY(${translateHeight}px)`;
    }
});