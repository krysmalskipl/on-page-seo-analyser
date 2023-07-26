function analyzeKeywords() {
    // Get all the text on the page
    let text = document.body.innerText;

    // Split the text into words
    let words = text.split(/\s+/);
    console.log(words);
    // Create an object to hold the n-gram counts
    let nGramCounts = {};

    // List of stop words to ignore
    let stopWords = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'the', 'and', 'to', 'of', 'it', 'in', 'you', 'that', 'he', 'was', 'for', 'on', 'are', 'with', 'as', 'I', 'his', 'they', 'be', 'at', 'one', 'have', 'this', 'from', 'or', 'had', 'by', 'hot', 'but', 'some', 'what', 'there', 'we', 'can', 'out', 'other', 'were', 'all', 'your', 'when', 'up', 'use', 'word', 'how', 'said', 'an', 'each', 'she', 'which', 'do', 'their', 'time', 'if', 'will', 'way', 'about', 'many', 'then', 'them', 'would', 'write', 'like', 'so', 'these', 'her', 'long', 'make', 'see', 'him', 'two', 'has', 'look', 'more', 'day', 'could', 'go', 'come', 'did', 'my', 'no', 'most', 'number', 'who', 'over', 'know', 'water', 'than', 'call', 'first', 'may', 'down', 'side', 'been', 'now', 'find', 'contact', 'us', 'is a',
        // Polish 
        'i', 'oraz', 'do', 'z', 'to', 'w', 'ty', 'że', 'on', 'był', 'dla', 'na', 'są', 'z', 'jak', 'ja', 'jego', 'oni', 'być', 'przy', 'jeden', 'mieć', 'ten', 'od', 'lub', 'miał', 'przez', 'gorący', 'ale', 'jakiś', 'co', 'tam', 'my', 'może', 'na zewnątrz', 'inny', 'byli', 'wszystko', 'twój', 'kiedy', 'w górę', 'używać', 'słowo', 'jak', 'powiedział', 'jeden', 'każdy', 'ona', 'który', 'robić', 'ich', 'czas', 'jeśli', 'będzie', 'droga', 'o', 'wiele', 'potem', 'oni', 'chciałby', 'pisać', 'lubić', 'tak', 'te', 'jej', 'długi', 'robić', 'zobaczyć', 'jego', 'dwa', 'ma', 'patrzeć', 'więcej', 'dzień', 'mógł', 'iść', 'przyjść', 'zrobił', 'mój', 'brak', 'większość', 'numer', 'kto', 'ponad', 'znać', 'woda', 'niż', 'zadzwonić', 'pierwszy', 'może', 'w dół', 'bok', 'był', 'teraz', 'znaleźć', 'kontakt', 'nas', 'jest', 'a', 'naprawdę', 'czytaj', 'aby', 'się', 'ile', 'jak', 'możesz'];


    // Remove stop words from the list of words
    words = words.filter(word => !stopWords.includes(word.toLowerCase()));

    // Generate bigrams and trigrams
    let bigrams = [];
    let trigrams = [];
    for (let i = 0; i < words.length; i++) {
        if (i < words.length - 1) {
            let bigram = (words[i] + ' ' + words[i + 1]).toLowerCase();
            bigram = bigram.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]+$/g, "").trim();
            bigrams.push(bigram);
        }
        if (i < words.length - 2) {
            let trigram = (words[i] + ' ' + words[i + 1] + ' ' + words[i + 2]).toLowerCase();
            trigram = trigram.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]+$/g, "").trim();
            trigrams.push(trigram);
        }
    }


    // Count the occurrences of each bigram and trigram
    [...bigrams, ...trigrams].forEach(nGram => {
        nGramCounts[nGram] = (nGramCounts[nGram] || 0) + 1;
    });

    // Filter out n-grams that only occur once
    for (let nGram in nGramCounts) {
        if (nGramCounts[nGram] < 2) {
            delete nGramCounts[nGram];
        }
    }

    // Calculate the total number of n-grams
    let totalNGrams = bigrams.length + trigrams.length;

    // Create an object to hold the n-gram frequencies
    let nGramFrequencies = {};

    // Calculate the frequency of each n-gram
    // Calculate the frequency of each n-gram
    for (let nGram in nGramCounts) {
        nGramFrequencies[nGram] = {
            count: nGramCounts[nGram],
            frequency: (nGramCounts[nGram] / totalNGrams * 100).toFixed(2) + '%'
        };
    }

    // Convert the nGramFrequencies object to an array of [nGram, data] pairs
    let nGramArray = Object.entries(nGramFrequencies);

    // Sort the array by the count property of the data object
    nGramArray.sort((a, b) => Number(b[1].count) - Number(a[1].count));

    // Take only the first 15 elements
    nGramArray = nGramArray.slice(0, 20);

    // Convert the array back to an object
    let topNGrams = Object.fromEntries(nGramArray);

    return topNGrams;
}

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.scripting.executeScript(
        {
            target: { tabId: tabs[0].id },
            function: analyzeKeywords,
        },
        function (results) {
            if (chrome.runtime.lastError || !results || !results.length) {
                console.error('Error executing script:', chrome.runtime.lastError, results);
                return;
            }

            let result = results[0].result;

            // Display the results
            let keywordAnalysisElement = document.getElementById('keywordAnalysis');
            let ol = document.createElement('ol');

            // Convert the result object back to an array and sort it
            let sortedResult = Object.entries(result).sort((a, b) => Number(b[1].count) - Number(a[1].count));

            // Display the sorted results
            sortedResult.forEach(([nGram, data]) => {
                let li = document.createElement('li');
                li.textContent = `${nGram}: ${data.count} (${data.frequency})`;
                ol.appendChild(li);
            });

            keywordAnalysisElement.textContent = '';
            keywordAnalysisElement.appendChild(ol);
        }
    );
});
