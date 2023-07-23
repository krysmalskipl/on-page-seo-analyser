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
    let hasGoogleAnalytics = !!document.querySelector("script[src*='google-analytics.com']");
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

    return { title, metaDescription, headers, canonicalTag, hasGoogleAnalytics, hasGoogleTagManager, hasHttps, totalImages, imagesWithAlt, imagesWithoutAlt, imagesWithoutAltPercentage, hreflangs, charCount, wordCount };
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
    document.getElementById('title').textContent = `Title - ${analysis.title.length} znaków`;
    document.getElementById('titleContent').textContent = analysis.title;
    document.getElementById('metaDescription').textContent = `Meta Description - ${analysis.metaDescription.length} znaków`;
    document.getElementById('metaDescriptionContent').textContent = analysis.metaDescription;
    document.getElementById('totalImages').textContent = `Total images: ${analysis.totalImages}`;
    document.getElementById('imagesWithAlt').textContent = `Images with 'alt': ${analysis.imagesWithAlt}`;
    document.getElementById('imagesWithoutAlt').textContent = `Images without or with empty 'alt': ${analysis.imagesWithoutAlt} (${analysis.imagesWithoutAltPercentage}%)`;
    document.getElementById('wordCount').textContent = `Ilość słów: ${analysis.wordCount}`;
    document.getElementById('charCount').textContent = `Ilość znaków: ${analysis.charCount}`;

    document.getElementById('canonical').textContent = analysis.canonicalTag || 'Brak';

    document.getElementById('analytics').textContent = analysis.hasGoogleAnalytics
        ? 'Strona posiada wdrożony kod Google Analytics.'
        : 'Strona nie posiada wdrożonego kodu Google Analytics.';

    document.getElementById('tagManager').textContent = analysis.hasGoogleTagManager
        ? 'Strona posiada wdrożony kod Google Tag Manager.'
        : 'Strona nie posiada wdrożonego kodu Google Tag Manager.';

    let hreflangsDiv = document.getElementById('hreflangs');
    hreflangsDiv.innerHTML = '';
    if (analysis.hreflangs.length > 0) {
        analysis.hreflangs.forEach(hreflang => {
            let p = document.createElement('p');
            p.textContent = `Language: ${hreflang.lang}, URL: ${hreflang.url}`;
            hreflangsDiv.appendChild(p);
        });
    } else {
        hreflangsDiv.textContent = 'Brak zaimplementowanych Hreflangów';
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


