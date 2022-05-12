import { test, expect } from '@playwright/test';
import { AmazonHomePage } from '../pages/home-page';
import { AmazonSearchResultsPage } from '../pages/search-results-page';


test.describe('Janus Health', () => {
  test('Search Amazon for Graphics Cards', async ({ page }) => {

      const test_inputs =['nvidia 3060', 'nvidia 3070', 'nvidia 3080']
      const amazonHomePage = new AmazonHomePage(page);
      await amazonHomePage.navigate();

      for(var input of test_inputs){
        console.log(input);
        await amazonHomePage.typeAndSearch(input);
        const amazonSearchResultsPage = new AmazonSearchResultsPage(page);
        const productsToWrite = await amazonSearchResultsPage.scrapeProductNameAndPrice();
        await amazonSearchResultsPage.writeToCSV(productsToWrite, input)
      }

    });
});