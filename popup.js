function handleResults(results) {
    document.getElementById('title').innerText = results[0].result.title;
    document.getElementById('metaDescription').innerText = results[0].result.metaDescription;
    let h1s = document.getElementById('h1s');
    results[0].result.h1s.forEach(h1 => {
        let li = document.createElement('li');
        li.innerText = h1;
        h1s.appendChild(li);
    });
    let h2s = document.getElementById('h2s');
    results[0].result.h2s.forEach(h2 => {
        let li = document.createElement('li');
        li.innerText = h2;
        h2s.appendChild(li);
    });
}

function inContent() {
    let title = document.querySelector("title").innerText;
    let metaDescription = document.querySelector("meta[name='description']")
        ? document.querySelector("meta[name='description']").getAttribute('content')
        : 'Brak opisu';
    let headers = [];
    let headersCount = {};

    for (let i = 1; i <= 6; i++) {
        let headerElements = Array.from(document.getElementsByTagName(`H${i}`));
        headersCount[`H${i}`] = headerElements.length;
        let headerContent = headerElements.map(h => ({
            type: `H${i}`,
            text: h.innerText
        }));
        headers = headers.concat(headerContent);
    }

    let canonicalTag = document.querySelector("link[rel='canonical']")
        ? document.querySelector("link[rel='canonical']").getAttribute('href')
        : 'Brak znacznika kanonicznego';
    let hasGoogleAnalytics = !!document.querySelector("script[src*='google-analytics.com']");
    let hasGoogleTagManager = !!document.querySelector("script[src*='googletagmanager.com']");
    let hasHttps = window.location.protocol === "https:";

    let images = Array.from(document.getElementsByTagName('img'));
    let totalImages = images.length;
    let imagesWithAlt = images.filter(img => img.hasAttribute('alt')).length;
    let imagesWithoutAlt = totalImages - imagesWithAlt;
    let imagesWithoutAltPercentage = totalImages > 0 ? (imagesWithoutAlt / totalImages * 100).toFixed(2) : 0;

    let hreflangs = Array.from(document.querySelectorAll("link[rel='alternate']"))
        .filter(link => link.hasAttribute('hreflang'))
        .map(link => ({ lang: link.getAttribute('hreflang'), url: link.getAttribute('href') }));


    return { title, metaDescription, headers, headersCount, canonicalTag, hasGoogleAnalytics, hasGoogleTagManager, hasHttps, totalImages, imagesWithAlt, imagesWithoutAlt, imagesWithoutAltPercentage, hreflangs };
}

function updateContent(analysis) {
    document.getElementById('title').textContent = `Title - ${analysis.title.length} znaków`;
    document.getElementById('titleContent').textContent = analysis.title;
    document.getElementById('metaDescription').textContent = `Meta Description - ${analysis.metaDescription.length} znaków`;
    document.getElementById('metaDescriptionContent').textContent = analysis.metaDescription;
    document.getElementById('totalImages').textContent = `Total images: ${analysis.totalImages}`;
    document.getElementById('imagesWithAlt').textContent = `Images with 'alt': ${analysis.imagesWithAlt}`;
    document.getElementById('imagesWithoutAlt').textContent = `Images without 'alt': ${analysis.imagesWithoutAlt} (${analysis.imagesWithoutAltPercentage}%)`;

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

    let headersSummaryDiv = document.getElementById('headersSummary');
    headersSummaryDiv.innerHTML = '';
    Object.keys(analysis.headersCount).forEach(headerType => {
        let headerCount = analysis.headersCount[headerType];
        if (headerCount > 0) {
            let listItem = document.createElement('li');
            listItem.textContent = `${headerType}: ${headerCount}`;
            headersSummaryDiv.appendChild(listItem);
        }
    });

    let headersListDiv = document.getElementById('headersList');
    headersListDiv.innerHTML = '';
    analysis.headers.forEach(header => {
        let listItem = document.createElement('li');
        listItem.textContent = `${header.type}: ${header.text}`;
        headersListDiv.appendChild(listItem);
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
    let headersListDiv = document.getElementById('headersList');
    let headersText = headersListDiv.innerText;
    navigator.clipboard.writeText(headersText)
        .then(() => alert('Skopiowano nagłówki do schowka!'))
        .catch(err => console.error('Błąd kopiowania', err));
}

let copyHeadersButton = document.getElementById('copyHeaders');
copyHeadersButton.addEventListener('click', copyHeadersToClipboard);
