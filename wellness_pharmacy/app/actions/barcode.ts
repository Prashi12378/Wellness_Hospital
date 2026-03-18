'use server';

import * as cheerio from 'cheerio';

export async function fetchMedicineDetailsFromBarcode(barcode: string) {
    if (!barcode || barcode.length < 4) return { error: 'Invalid barcode' };

    try {
        // Search duckduckgo html version
        const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(barcode + ' medicine india')}`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5'
            },
            next: { revalidate: 3600 } // Cache results for an hour
        });

        if (!response.ok) {
            return { error: 'Search service unavailable' };
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // DuckDuckGo result titles have class .result__a
        let possibleName = '';

        $('.result__a').each((i, element) => {
            if (i >= 3) return false; // Only check top 3 results
            const text = $(element).text();

            // Try to extract a medicine name (usually appearing before words like 'Tablet', 'Syrup', 'Price', 'mg', 'buy')
            // This is a naive heuristic but works well for basic Indian pharmacy site titles like Apollo/1mg

            // Clean up common suffix noise from titles
            const clean = text.split('|')[0]
                .replace(/Buy /gi, '')
                .replace(/Online at Best Price.*/gi, '')
                .replace(/Uses, Side Effects, Price.*/gi, '')
                .trim();

            if (clean && clean.length > 5 && !possibleName) {
                possibleName = clean;
            }
        });

        if (possibleName) {
            // Further clean up: "Dolo 650 Tablet" -> "Dolo 650 Tablet"
            // Usually titles are like "Dolo 650 Tablet - Uses, Dosage, Side Effects"
            const dashSplit = possibleName.split(' - ')[0];
            return { data: { name: dashSplit.trim(), barcode } };
        }

        return { error: 'No definitive match found online' };

    } catch (error) {
        console.error('Barcode lookup error:', error);
        return { error: 'Search failed' };
    }
}
