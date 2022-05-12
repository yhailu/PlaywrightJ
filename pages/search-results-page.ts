import { expect, Locator, Page } from "@playwright/test";
import { writeToPath } from '@fast-csv/format';


export class AmazonSearchResultsPage {
    readonly page: Page;
    readonly resultList: Locator;
    readonly searchBarButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.resultList = page.locator('//*[@id="search"]'); //deprecated for now
    }

    async scrapeProductNameAndPrice() {
        /*
            This function will wait for results from search to be returned, then scrape pertinent fields that we care about
            e.g. Name of Product, Price, URL    

            TODO: waits for 20th search result to be visible, this can be enchanced to be more dynamic
            based on size of results returned
        */
        
        await this.page.locator('css=[data-cel-widget="search_result_20"]').waitFor();
        const csvList = [];

        //will get a relative size of pages search results
        const searchResultsSize = await this.page.$$('css=[data-component-type="s-search-result"]');
        for(var i =1; i<=searchResultsSize.length; i++){
            //objet data structure we want to store our scraped data
            const productMap = {
                title: '',
                price: '',
                url: '',
                date: ''
            }

            //result selects the div based on loop iterator i - this is going through each result and grabbing the name, price, and url
            const result = await this.page.$('css=[data-cel-widget="search_result_'+ i +'"]');
            const productName = await result.$$eval('div.a-section.a-spacing-none.s-padding-right-small.s-title-instructions-style > h2 > a > span', nodes => nodes.map(n => n.innerHTML));
            const productPrice = await result.$$eval('div > div.a-section.a-spacing-none.a-spacing-top-small.s-price-instructions-style > div > a > span:nth-child(1) > span.a-offscreen', nodes => nodes.map(n => n.innerHTML));
            const productURL = await result.$$eval('div > div.a-section.a-spacing-none.s-padding-right-small.s-title-instructions-style > h2 > a', nodes => nodes.map(n => n.getAttribute("href")));

            if (productPrice.toString() == '' || productName.toString() ==''){
                console.log('skipping since price/name is empty');
                continue;
            }

            productMap.title = productName.toString();
            productMap.price = productPrice.toString().replace(/[^a-z\d\s]+/gi, "");
            productMap.url = 'https://www.amazon.com' + productURL.toString();
            productMap.date = new Date().toISOString().slice(0, 10)
            csvList.push(productMap)
        }

        //sort our productMap in desc order based on price
        let sortDescList = csvList.sort((c1, c2) => (parseFloat(c1.price) < parseFloat(c2.price)) ? 1 : (parseFloat(c1.price) > parseFloat(c2.price)) ? -1 : 0);
        //console.log(JSON.stringify(sortDescList, null, 4));

        //from our sorted list give us the last 3 items which should be the best price
        console.log(sortDescList.slice(-3));
        return sortDescList.slice(-3);
        
    }

    async writeToCSV(listObj, filename){
        //write to csv 
        const path = `${__dirname}/`+filename +`.csv`;
        const options = { headers: true, quoteColumns: true };

        writeToPath(path, listObj, options)
            .on('error', err => console.error(err))
            .on('finish', () => console.log('Done writing.'));
    }
}

