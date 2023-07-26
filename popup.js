
function inContent() {
    let title = document.querySelector("title").innerText;
    let metaDescription = document.querySelector("meta[name='description']")
        ? document.querySelector("meta[name='description']").getAttribute('content')
        : 'Brak opisu';

    let headers = [];
    let allHeaders = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
    allHeaders.forEach(header => {
        headers.push({ type: header.tagName, text: header.innerText });
    });

    let canonicalTag = document.querySelector("link[rel='canonical']")
        ? document.querySelector("link[rel='canonical']").getAttribute('href')
        : 'Brak znacznika kanonicznego';
    let hasGoogleAnalytics = !!document.querySelector("script[src*='google-analytics.com']") || Array.from(document.scripts).some(script => script.textContent.includes('gtag('));

    let hasGoogleTagManager = !!document.querySelector("script[src*='googletagmanager.com']");
    let hasHttps = window.location.protocol === "https:";

    let images = Array.from(document.getElementsByTagName('img'));
    let totalImages = images.length;
    let imagesWithoutAlt = images.filter(img => !img.alt || img.alt.trim() === "").length;
    let imagesWithAlt = totalImages - imagesWithoutAlt;
    let imagesWithoutAltPercentage = totalImages > 0 ? (imagesWithoutAlt / totalImages * 100).toFixed(2) : 0;


    let hreflangs = Array.from(document.querySelectorAll("link[rel='alternate']"))
        .filter(link => link.hasAttribute('hreflang'))
        .map(link => ({ lang: link.getAttribute('hreflang'), url: link.getAttribute('href') }));

    let text = document.body.innerText;
    let charCount = text.length;
    let wordCount = text.split(/\s+/).length;


    let noIndexMetaTag = Array.from(document.getElementsByTagName('meta')).find(
        meta => meta.getAttribute('name') === 'robots' && meta.getAttribute('content').includes('noindex')
    );
    let hasNoIndexMetaTag = noIndexMetaTag ? 'Tag noindex found: ' + noIndexMetaTag.outerHTML : 'No meta robots noindex found.';

    return { title, metaDescription, headers, canonicalTag, hasGoogleAnalytics, hasGoogleTagManager, hasHttps, totalImages, imagesWithAlt, imagesWithoutAlt, imagesWithoutAltPercentage, hreflangs, charCount, wordCount, hasNoIndexMetaTag };
}

let goToAhrefs = document.getElementById("goToAhrefs");

goToAhrefs.addEventListener("click", function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        let activeTab = tabs[0]
        console.log(activeTab.url);
        let modifiedUrl = activeTab.url
        console.log(modifiedUrl);
        // let encodedModifiedUrl = encodeURIComponent(modifiedUrl);
        let finalUrl = `https://app.ahrefs.com/v2-site-explorer/overview?mode=prefix&target=${modifiedUrl}`;
        window.open(finalUrl, '_blank');

    })
})

let goToPagespeed = document.getElementById("goToPagespeed");

goToPagespeed.addEventListener("click", function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        let activeTab = tabs[0]
        console.log(activeTab.url);
        let modifiedUrl = activeTab.url
        console.log(modifiedUrl);
        let finalUrl = `https://developers.google.com/speed/pagespeed/insights/?url=${modifiedUrl}`;
        window.open(finalUrl, '_blank');

    })
})
let goToSchema = document.getElementById("goToSchema");

goToSchema.addEventListener("click", function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        let activeTab = tabs[0]
        console.log(activeTab.url);
        let modifiedUrl = activeTab.url
        console.log(modifiedUrl);
        let finalUrl = `https://search.google.com/test/rich-results?url=${modifiedUrl}`;
        window.open(finalUrl, '_blank');

    })
})

function updateContent(analysis) {
    document.getElementById('metaRobots').textContent = analysis.hasNoIndexMetaTag;


    document.getElementById('title').textContent = `Title - ${analysis.title.length} chars`;
    document.getElementById('titleContent').textContent = analysis.title;
    document.getElementById('metaDescription').textContent = `Meta Description - ${analysis.metaDescription.length} chars`;
    document.getElementById('metaDescriptionContent').textContent = analysis.metaDescription;
    document.getElementById('totalImages').textContent = `Total images: ${analysis.totalImages}`;
    document.getElementById('imagesWithAlt').textContent = `Images with 'alt': ${analysis.imagesWithAlt}`;
    document.getElementById('imagesWithoutAlt').textContent = `Images without or with empty 'alt': ${analysis.imagesWithoutAlt} (${analysis.imagesWithoutAltPercentage}%)`;
    document.getElementById('wordCount').textContent = `Words: ${analysis.wordCount}`;
    document.getElementById('charCount').textContent = `Characters: ${analysis.charCount}`;

    document.getElementById('canonical').textContent = analysis.canonicalTag || 'Brak';

    document.getElementById('analytics').textContent = analysis.hasGoogleAnalytics
        ? 'Google Analytics tag is implemented.'
        : 'Google Analytics tag is not implemented.';

    document.getElementById('tagManager').textContent = analysis.hasGoogleTagManager
        ? 'Google Tag Manager tag is implemented.'
        : 'Google Tag Manager tag is not implemented.';

    let hreflangsDiv = document.getElementById('hreflangs');
    hreflangsDiv.innerHTML = '';
    if (analysis.hreflangs.length > 0) {
        analysis.hreflangs.forEach(hreflang => {
            let p = document.createElement('p');
            p.textContent = `Language: ${hreflang.lang}, URL: ${hreflang.url}`;
            hreflangsDiv.appendChild(p);
        });
    } else {
        hreflangsDiv.textContent = 'Hreflang Tag is not implemented';
    }

    let headersSummary = document.getElementById('headersSummary');
    headersSummary.innerHTML = '';
    let headerCounts = analysis.headers.reduce((counts, header) => {
        counts[header.type] = (counts[header.type] || 0) + 1;
        return counts;
    }, {});
    Object.keys(headerCounts).forEach(headerType => {
        let p = document.createElement('p');
        p.textContent = `${headerType} - ${headerCounts[headerType]}`;
        headersSummary.appendChild(p);
    });

    let headersList = document.getElementById('headersList');
    headersList.innerHTML = '';
    analysis.headers.forEach(header => {
        let listItem = document.createElement('li');
        listItem.textContent = `${header.type}: ${header.text}`;
        listItem.classList.add(`header-${header.type}`);
        headersList.appendChild(listItem);
    });
}


chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.scripting.executeScript(
        {
            target: { tabId: tabs[0].id },
            function: inContent,
        },
        function (result) {
            updateContent(result[0].result);
        }
    );
});

function copyHeadersToClipboard() {
    let headersList = document.getElementById('headersList');
    let headersText = headersList.innerText;
    navigator.clipboard.writeText(headersText)
        .then(() => alert('Skopiowano nagłówki do schowka!'))
        .catch(err => console.error('Błąd kopiowania', err));
}

let copyHeadersButton = document.getElementById('copyHeaders');
copyHeadersButton.addEventListener('click', copyHeadersToClipboard);


document.addEventListener('DOMContentLoaded', function () {
    let links = document.getElementsByClassName('external-link');
    for (let i = 0; i < links.length; i++) {
        (function () {
            let ln = links[i];
            let location = ln.href;
            ln.onclick = function () {
                chrome.tabs.create({ active: true, url: location });
            };
        })();
    }
});

// Robots 

// receive data from background.js start 
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.runtime.sendMessage(
        { action: "getNoindexInfo", url: tabs[0].url },
        function (response) {
            if (chrome.runtime.lastError) {
                document.getElementById('xRobotsNoindex').textContent = 'Error: ' + chrome.runtime.lastError.message;
            } else {
                document.getElementById('xRobotsNoindex').textContent = response.noindexInfo || 'No X-Robots-Tag noindex found.';
            }
        }
    );
});


// receive data from background.js end 


function checkMetaRobots() {
    let metaTags = document.getElementsByTagName('meta');
    for (let i = 0; i < metaTags.length; i++) {
        if (metaTags[i].getAttribute('name') === 'robots') {
            return metaTags[i].outerHTML;
        }
    }
    return 'Meta-Robots Tag is not implemented.';
}


window.onload = function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.scripting.executeScript(
            {
                target: { tabId: tabs[0].id },
                function: checkMetaRobots,
            },
            function (result) {
                let metaRobotsElement = document.getElementById('metaRobots');
                let ul = document.createElement('ul');

                // Add meta robots info
                let li = document.createElement('li');
                li.textContent = result[0].result;
                ul.appendChild(li);

                metaRobotsElement.textContent = '';
                metaRobotsElement.appendChild(ul);
            }
        );
    });

};




chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.runtime.sendMessage(
        { action: "getNoindexInfo", url: tabs[0].url },
        function (response) {
            if (chrome.runtime.lastError) {
                document.getElementById('xRobotsNoindex').textContent = 'Error: ' + chrome.runtime.lastError.message;
            } else {
                document.getElementById('xRobotsNoindex').textContent = response.noindexInfo || ' X-Robots-Tag has not been found.';
            }
        }
    );
});



// Opening the tabs 

document.addEventListener('DOMContentLoaded', function () {
    let defaultOpen = document.getElementById('defaultOpen');
    let tab2 = document.getElementById('tab2');
    let tab3 = document.getElementById('tab3');
    let tab4 = document.getElementById('tab4');

    defaultOpen.addEventListener('click', function (event) {
        openTab(event, 'Tab1');
    });

    tab2.addEventListener('click', function (event) {
        openTab(event, 'Tab2');
    });
    tab3.addEventListener('click', function (event) {
        openTab(event, 'Tab3');
    });

    tab4.addEventListener('click', function (event) {
        openTab(event, 'Tab4');
    });

});


function openTab(evt, tabName) {
    let i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById("defaultOpen").click();
});
