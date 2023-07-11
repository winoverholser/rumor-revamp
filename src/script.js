//SANITY

let PROJECT_ID = "1u261ldt";
let DATASET = "production";
let QUERY = encodeURIComponent('*[_type == "iFrameLink"]{title,url,thumb,"assetUrl": thumb.asset->url}');

let URL = `https://${PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/${DATASET}?query=${QUERY}`;

// FETCH FROM CONTENT LAKE
fetch(URL)
    .then((res) => res.json())
    .then(({ result }) => {

        const iconTray = document.getElementById("trayContainer");
        iconTray.innerHTML = "";

        if (result.length > 0) {
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

                /* // CREATE TITLE
                const title = document.createElement("p");
                title.textContent = iFrameLink?.title;
                container.appendChild(title); */

                // CLICK EVENT LISTENER
                container.addEventListener("click", () => {
                    const iframe = document.getElementById("backgroundIframe");
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
        /* // bounce on landing
        setTimeout(() => {
            const bounceKeyframes = [
                { transform: `translateY(0px)` },
                { transform: `translateY(5px)` },
                { transform: `translateY(0px)` }
            ];
        tray.animate(bounceKeyframes, {
            duration: 200
        });
        }, 500); */
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

