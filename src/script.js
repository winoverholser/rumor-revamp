//SANITY

let PROJECT_ID = "1u261ldt";
let DATASET = "production";
let QUERY = encodeURIComponent('*[_type == "iFrameLink"]{thumb,"assetUrl": thumb.asset->url,title}');

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
                container.appendChild(icon);

                // CREATE TITLE
                const title = document.createElement("p");
                title.textContent = iFrameLink?.title;
                container.appendChild(title);

                // ADD TO TRAY
                iconTray.appendChild(container);
            });
        }  
    })
    .catch((err) => console.error(err));